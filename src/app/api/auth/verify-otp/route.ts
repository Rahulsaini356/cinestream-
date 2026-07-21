import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { handleApiError } from "@/lib/errors";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const limiter = checkRateLimit(`verify_otp_${ip}`, 5, 60000); // 5 attempts per min
    if (!limiter.success) {
      return NextResponse.json(
        { error: "Too many verification attempts. Please wait 1 minute." },
        { status: 429 }
      );
    }

    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
    }

    // Validate OTP exists and not expired
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

    return NextResponse.json({ message: "OTP verified" });
  } catch (error) {
    return handleApiError("VerifyOTP", error, "Verification failed.");
  }
}
