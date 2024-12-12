import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendResetPasswordEmail } from "@/lib/email";

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

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token to user
    await prisma.user.update({
      where: { email },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordTokenExpiry: resetTokenExpiry,
      },
    });

    // Send reset password email
    await sendResetPasswordEmail(email, resetToken);

    return NextResponse.json({
      message: "Reset password email sent",
    });
  } catch (error) {
    console.error("[FORGOT_PASSWORD_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
