import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; 
import bcrypt from "bcryptjs";
import { checkRateLimit } from "@/lib/rate-limit";
import { handleApiError } from "@/lib/errors";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const limiter = checkRateLimit(`register_${ip}`, 5, 60000); // 5 attempts per min
    if (!limiter.success) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please wait 1 minute." },
        { status: 429 }
      );
    }

    const { name, email, password, otp } = await req.json();

    if (!email || !password || !otp) {
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

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    // Delete OTP records for this email
    await prisma.oTP.deleteMany({ where: { email } });

    return NextResponse.json({ message: "User registered successfully" });
  } catch (error) {
    return handleApiError("Registration", error, "Failed to register account.");
  }
}
