import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendOTP } from "@/lib/email";

const ipMap = new Map<string, number>();

export async function POST(req: Request) {
  try {
    const { email, type } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // IP-based Rate Limiting (1 request per minute per IP)
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();
    if (ip !== "unknown") {
      const lastRequest = ipMap.get(ip);
      if (lastRequest && now - lastRequest < 60000) {
        return NextResponse.json({ error: "Too many requests. Please wait 1 minute." }, { status: 429 });
      }
      ipMap.set(ip, now);
    }

    // Email-based Rate Limiting (1 request per minute per email)
    const recentOtp = await prisma.oTP.findFirst({
      where: {
        email,
        createdAt: { gt: new Date(Date.now() - 60000) }, // created within last 60 seconds
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
    console.error("OTP Error:", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
