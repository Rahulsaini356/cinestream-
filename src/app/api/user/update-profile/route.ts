import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limiter = checkRateLimit(`update_profile_${session.user.id}`, 10, 60000);
  if (!limiter.success) {
    return NextResponse.json(
      { error: "Too many profile updates. Please wait 1 minute." },
      { status: 429 }
    );
  }

  try {
    const { name, image } = await request.json();

    const dataToUpdate: any = {};
    if (name !== undefined) {
      if (name.trim().length === 0) {
        return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
      }
      dataToUpdate.name = name.trim();
    }
    
    if (image !== undefined) {
      dataToUpdate.image = image;
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: dataToUpdate,
    });

    const sanitizedUser = { ...updatedUser } as any;
    delete sanitizedUser.password;

    return NextResponse.json({ success: true, user: sanitizedUser });
  } catch (error) {
    console.error("Update profile API error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
