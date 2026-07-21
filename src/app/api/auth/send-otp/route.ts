import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendOTP } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";
import { handleApiError } from "@/lib/errors";

export async function POST(req: Request) {
  try {
    const { email, type } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const ip = req.headers.get("x-forwarded-for") || "unknown";

    // For forgot-password OTP, limit to 3 requests per hour
    // For registration OTP, limit to 5 requests per hour
    const limit = type === "forgot-password" ? 3 : 5;
    const limiter = checkRateLimit(`send_otp_${type}_${ip}`, limit, 3600000);

    if (!limiter.success) {
      return NextResponse.json(
        { error: `Too many OTP requests. Please wait 1 hour before trying again.` },
        { status: 429 }
      );
    }

    // Email-based Rate Limiting (1 request per minute per email)
    const recentOtp = await prisma.oTP.findFirst({
      where: {
        email,
        createdAt: { gt: new Date(Date.now() - 60000) },
      },
    });

    if (recentOtp) {
      return NextResponse.json({ error: "Please wait 1 minute before requesting another OTP." }, { status: 429 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    
    if (type === "forgot-password") {
      if (!existingUser) {
        return NextResponse.json({ error: "No account found with this email" }, { status: 404 });
      }
    } else {
      if (existingUser) {
        return NextResponse.json({ error: "Email already registered" }, { status: 400 });
      }
    }

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    // Clear old OTPs for this email
    await prisma.oTP.deleteMany({ where: { email } });

    // Save new OTP
    await prisma.oTP.create({
      data: {
        email,
        code,
        expiresAt,
      },
    });

    // Send email
    await sendOTP(email, code);

    return NextResponse.json({ message: "OTP sent successfully" });
  } catch (error) {
    return handleApiError("SendOTP", error, "Failed to send OTP.");
  }
}
