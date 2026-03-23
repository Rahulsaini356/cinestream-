import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Play } from "lucide-react";
import { getImageUrl } from "@/lib/tmdb";
import FilterBar from "@/components/ui/FilterBar";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function WatchlistPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const sp = await searchParams;
  const type = typeof sp.type === "string" ? sp.type : undefined;
  const sort = typeof sp.sort === "string" ? sp.sort : "desc";

  const whereClause: any = { userId: session.user.id };
  if (type) {
    whereClause.type = type;
  }

  const items = await prisma.watchlist.findMany({
    where: whereClause,
    orderBy: { createdAt: sort as "asc" | "desc" }
  });

  return (
    <main className="min-h-screen pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-black">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent tracking-tight">My Watchlist</h1>
      </div>

      <FilterBar type="watchlist" />

      {items.length === 0 ? (
        <div className="text-center py-20 text-zinc-500 border border-white/10 rounded-2xl bg-zinc-900/50">
          <p className="text-xl mb-6">Your watchlist is empty.</p>
          <Link href="/" className="inline-flex px-8 py-3 bg-accent text-white font-bold rounded-xl hover:bg-accent-hover hover:scale-105 active:scale-95 transition-all shadow-xl">
            Explore Content
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/${item.type}/${item.movieId}`}
              className="group relative flex flex-col gap-3"
            >
              <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-zinc-900 shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_20px_40px_-15px_rgba(229,9,20,0.3)] group-hover:ring-2 ring-accent">
                {item.poster ? (
                  <img
                    src={getImageUrl(item.poster, "w500")}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-500">
                    No Image
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                  <Play className="w-14 h-14 text-white drop-shadow-2xl" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-zinc-100 truncate group-hover:text-white transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mt-1">{item.type === "tv" ? "TV Show" : "Movie"}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
