import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tmdbId = searchParams.get("tmdbId");
  const type = searchParams.get("type");

  if (!tmdbId || !type) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }

  try {
    const reviews = await prisma.review.findMany({
      where: { tmdbId, type },
      include: {
        user: { select: { id: true, name: true, image: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Fetch Reviews Error:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { tmdbId, type, rating, content } = body;

    if (!tmdbId || !type || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // Upsert the review (Create if not exist, Update if it does)
    const review = await prisma.review.upsert({
      where: {
        userId_tmdbId_type: {
          userId: session.user.id,
          tmdbId,
          type
        }
      },
      update: {
        rating,
        content: content || null
      },
      create: {
        userId: session.user.id,
        tmdbId,
        type,
        rating,
        content: content || null
      }
    });

    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error("Save Review Error:", error);
    return NextResponse.json({ error: "Failed to save review" }, { status: 500 });
  }
}
