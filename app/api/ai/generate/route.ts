import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth-options";
import { generatePrompt } from "@/lib/ai/generate-prompt";
import { prisma } from "@/lib/prisma";
import { USAGE_LIMITS } from "@/lib/subscription/check-usage";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await req.formData();
    const image = formData.get("image") as File | null;
    const existingPrompt = formData.get("existingPrompt") as string | null;

    if (!image && !existingPrompt) {
      return new NextResponse("Missing image or existing prompt", { status: 400 });
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

    const prompt = await generatePrompt(image, existingPrompt || undefined);

    return NextResponse.json({ prompt });
  } catch (error) {
    console.error("[GENERATE_PROMPT_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
