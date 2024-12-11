import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth-options";
import { generatePrompt } from "@/lib/ai/generate-prompt";
import { checkUserUsage, incrementUsage } from "@/lib/subscription/check-usage";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check usage limits
    try {
      await checkUserUsage(session.user.id);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Usage check failed" },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const image = formData.get("image") as File;
    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const prompt = await generatePrompt(image);
    await incrementUsage(session.user.id);

    return NextResponse.json({ prompt });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate prompt" },
      { status: 500 }
    );
  }
}