import { NextResponse } from "next/server";
import { generateBackendPrompt } from "@/lib/ai/generate-prompt";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/prisma";
import { USAGE_LIMITS } from "@/lib/subscription/check-usage";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { prompt, additionalPrompt } = await req.json();

    if (!prompt || !additionalPrompt) {
      return new NextResponse("Missing prompts. Both initial UI and additional pages prompts are required.", { status: 400 });
    }

    // Check current usage first
    const [usageCount, subscription] = await Promise.all([
      prisma.usageCount.findUnique({
        where: { userId: session.user.id },
      }),
      prisma.subscription.findUnique({
        where: { userId: session.user.id },
      }),
    ]);

    const limit = USAGE_LIMITS[subscription?.plan === "PRO" ? "PRO" : "FREE"];
    
    if (usageCount && usageCount.count >= limit) {
      return new NextResponse(
        JSON.stringify({
          error: "Usage limit exceeded",
          canUpgrade: subscription?.plan !== "PRO",
        }),
        { 
          status: 402,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Only increment usage if we haven't exceeded the limit
    await prisma.usageCount.upsert({
      where: { userId: session.user.id },
      create: { userId: session.user.id, count: 1 },
      update: { count: { increment: 1 } },
    });

    const generatedPrompt = await generateBackendPrompt(prompt, additionalPrompt);

    return NextResponse.json({ prompt: generatedPrompt });
  } catch (error) {
    console.error("[GENERATE_BACKEND_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
