import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return new NextResponse("Missing token or password", { status: 400 });
    }

    // Find user with valid reset token
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return new NextResponse("Invalid or expired reset token", { status: 400 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordTokenExpiry: null,
      },
    });

    return NextResponse.json({
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("[RESET_PASSWORD_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
