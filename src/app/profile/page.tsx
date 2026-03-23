import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma"; import { redirect } from "next/navigation";
import ProfileClient from "@/components/profile/ProfileClient";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  const watchlistCount = await prisma.watchlist.count({
    where: { userId: session.user.id },
  });

  return (
    <main className="min-h-screen pt-24 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-white tracking-tight mb-8">My Profile</h1>
      <ProfileClient
        user={{
          id: user?.id,
          name: user?.name,
          email: user?.email,
        }}
        stats={{ watchlistCount }}
      />
    </main>
  );
}
