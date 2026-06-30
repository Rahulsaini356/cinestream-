import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        watchTime: { increment: 1 },
        points: { increment: 1 }, // 1 point per minute of active watching
      },
      select: {
        points: true,
        watchTime: true,
      }
    });

    return NextResponse.json({ success: true, points: updatedUser.points, watchTime: updatedUser.watchTime });
  } catch (error) {
    console.error("Error updating watch time:", error);
    return NextResponse.json({ error: "Failed to update watch time" }, { status: 500 });
  }
}
