import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        points: "desc",
      },
      select: {
        id: true,
        name: true,
        image: true,
        points: true,
        watchTime: true,
        createdAt: true,
      },
      take: 50, // Limit to top 50 users
    });

    return NextResponse.json({ success: true, leaderboard: users });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}
