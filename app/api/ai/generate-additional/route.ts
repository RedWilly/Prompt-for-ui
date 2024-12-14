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

    // Ensure request has proper Content-Type header
    const contentType = req.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return new NextResponse("Invalid content type. Expected application/json", { 
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    let body;
    try {
      body = await req.json();
    } catch (error) {
      return new NextResponse(
        JSON.stringify({ error: "Invalid JSON in request body" }), 
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const { prompt } = body;

    if (!prompt) {
      return new NextResponse(
        JSON.stringify({ error: "Missing existing prompt" }), 
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
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

    const generatedPrompt = await generatePrompt(null, prompt);

    return NextResponse.json({ prompt: generatedPrompt });
  } catch (error) {
    console.error("[GENERATE_ADDITIONAL_ERROR]", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
