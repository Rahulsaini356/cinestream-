import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

interface PingWatchCache {
  timestamp: number;
  points: number;
  watchTime: number;
}

const pingCache = new Map<string, PingWatchCache>();

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const now = Date.now();

  // 1. Check in-memory cache to bypass DB operations entirely during cooldown
  const cached = pingCache.get(userId);
  if (cached && now - cached.timestamp < 45000) {
    return NextResponse.json({
      success: true,
      points: cached.points,
      watchTime: cached.watchTime,
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { updatedAt: true, points: true, watchTime: true }
    });

    if (user) {
      const dbTimestamp = user.updatedAt.getTime();
      const timeDiff = now - dbTimestamp;
      // 2. Cooldown check based on last DB write
      if (timeDiff < 45000) {
        pingCache.set(userId, {
          timestamp: dbTimestamp,
          points: user.points,
          watchTime: user.watchTime,
        });
        return NextResponse.json({ success: true, points: user.points, watchTime: user.watchTime });
      }
    }

    // 3. Perform write
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        watchTime: { increment: 1 },
        points: { increment: 1 },
      },
      select: {
        points: true,
        watchTime: true,
        updatedAt: true,
      }
    });

    // 4. Update the in-memory cache with new values
    pingCache.set(userId, {
      timestamp: updatedUser.updatedAt.getTime(),
      points: updatedUser.points,
      watchTime: updatedUser.watchTime,
    });

    return NextResponse.json({ success: true, points: updatedUser.points, watchTime: updatedUser.watchTime });
  } catch (error) {
    console.error("Error updating watch time:", error);
    return NextResponse.json({ error: "Failed to update watch time" }, { status: 500 });
  }
}
