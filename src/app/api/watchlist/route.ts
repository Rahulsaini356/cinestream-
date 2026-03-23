import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { movieId, title, poster, type } = await req.json();

    if (!movieId) {
      return NextResponse.json({ error: "Missing movieId" }, { status: 400 });
    }

    // Pre-flight check: ensure user exists in the database
    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!userExists) {
      return NextResponse.json(
        { error: "User profile not found in current database. Please register/signup again." },
        { status: 400 }
      );
    }

    // Check if already in watchlist
    const existing = await prisma.watchlist.findUnique({
      where: {
        userId_movieId_type: {
          userId: session.user.id,
          movieId: String(movieId),
          type,
        },
      },
    });

    if (existing) {
      // Remove from watchlist
      await prisma.watchlist.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ message: "Removed from watchlist", added: false });
    } else {
      // Add to watchlist
      await prisma.watchlist.create({
        data: {
          userId: session.user.id,
          movieId: String(movieId),
          title,
          poster,
          type,
        },
      });
      return NextResponse.json({ message: "Added to watchlist", added: true });
    }
  } catch (error) {
    console.error("Watchlist API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
