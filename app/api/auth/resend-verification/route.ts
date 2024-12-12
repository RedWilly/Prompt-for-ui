import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return new NextResponse("Email is required", { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    if (user.emailVerified) {
      return new NextResponse("Email is already verified", { status: 400 });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Update user with new token
    await prisma.user.update({
      where: { email },
      data: {
        verificationToken,
      },
    });

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    return NextResponse.json({
      message: "Verification email sent",
    });
  } catch (error) {
    console.error("Resend verification error:", error instanceof Error ? error.message : error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
