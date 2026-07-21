import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { checkRateLimit } from "@/lib/rate-limit";
import { handleApiError } from "@/lib/errors";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const limiter = checkRateLimit(`reset_pass_${ip}`, 3, 3600000); // 3 attempts per hour
    if (!limiter.success) {
      return NextResponse.json(
        { error: "Too many password reset attempts. Please wait 1 hour." },
        { status: 429 }
      );
    }

    const { email, otp, password } = await req.json();

    if (!email || !otp || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify OTP
    const validOtp = await prisma.oTP.findFirst({
      where: {
        email,
        code: otp,
        expiresAt: { gt: new Date() },
      },
    });

    if (!validOtp) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user password
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    // Delete OTP records for this email
    await prisma.oTP.deleteMany({ where: { email } });

    return NextResponse.json({ message: "Password reset successful" });
  } catch (error) {
    return handleApiError("ResetPassword", error, "Failed to reset password.");
  }
}
