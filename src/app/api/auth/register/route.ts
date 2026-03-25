import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; 
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
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
    const user = await prisma.user.create({
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
    console.error("Registration Error:", error);
    return NextResponse.json({ error: "Failed to register" }, { status: 500 });
  }
}
