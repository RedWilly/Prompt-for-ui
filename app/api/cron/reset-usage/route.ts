import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfMonth } from "date-fns";

export async function POST(req: Request) {
  try {
    // Verify cron secret to ensure this is a legitimate cron job
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Reset usage counts for all users at the start of each month
    await prisma.usageCount.updateMany({
      data: {
        count: 0,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to reset usage counts:", error);
    return NextResponse.json(
      { error: "Failed to reset usage counts" },
      { status: 500 }
    );
  }
}