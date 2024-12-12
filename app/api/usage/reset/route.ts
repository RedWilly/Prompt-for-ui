import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resetUsage } from "@/lib/subscription/check-usage";

export async function POST() {
  try {
    // Get all users with subscriptions
    const users = await prisma.subscription.findMany({
      select: {
        userId: true,
      },
    });

    // Check and reset usage for each user if needed
    for (const user of users) {
      await resetUsage(user.userId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error resetting usage:", error);
    return NextResponse.json({ error: "Failed to reset usage" }, { status: 500 });
  }
}
