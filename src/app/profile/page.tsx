import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProfileClient from "@/components/profile/ProfileClient";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [user, watchlistCount, reviewCount, topUser] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
    }),
    prisma.watchlist.count({
      where: { userId: session.user.id },
    }),
    prisma.review.count({
      where: { userId: session.user.id },
    }),
    prisma.user.findFirst({
      orderBy: { points: "desc" },
      select: { id: true },
    }),
  ]);

  if (!user) {
    // If the database user doesn't exist anymore, redirect to login
    redirect("/login");
  }

  const isKing = topUser?.id === session.user.id;

  return (
    <main className="min-h-screen pt-24 pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <ProfileClient
        user={{
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          createdAt: user.createdAt ? user.createdAt.toISOString() : null,
          points: user.points || 0,
          watchTime: user.watchTime || 0,
          isKing,
        }}
        stats={{ watchlistCount, reviewCount }}
      />
    </main>
  );
}
