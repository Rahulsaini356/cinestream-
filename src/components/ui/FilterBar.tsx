"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

export default function FilterBar({ 
  type, 
  genres = [] 
}: { 
  type: "movies" | "tv" | "watchlist"; 
  genres?: { id: number; name: string }[] 
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const currentGenre = searchParams.get("genre") || "";
  const currentYear = searchParams.get("year") || "";
  const currentSort = searchParams.get("sort") || (type === "watchlist" ? "desc" : "popularity.desc");
  const currentType = searchParams.get("type") || "";

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1"); 
    router.push(`${pathname}?${params.toString()}`);
  };

  const years = Array.from({ length: 30 }, (_, i) => (new Date().getFullYear() - i).toString());

  return (
    <div className="flex flex-wrap items-center gap-3 mb-8 bg-zinc-900/40 backdrop-blur-md p-4 rounded-2xl border border-white/5 shadow-2xl">
      {/* Type Filter (Watchlist Only) */}
      {type === "watchlist" && (
        <select
          value={currentType}
          onChange={(e) => updateFilters("type", e.target.value)}
          className="bg-zinc-800/60 hover:bg-zinc-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer backdrop-blur-md transition-all"
        >
          <option value="">All Types</option>
          <option value="movie">Movies</option>
          <option value="tv">TV Shows</option>
        </select>
      )}

      {/* Genre Filter (Movies / TV Only) */}
      {(type === "movies" || type === "tv") && (
        <select
          value={currentGenre}
          onChange={(e) => updateFilters("genre", e.target.value)}
          className="bg-zinc-800/60 hover:bg-zinc-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer backdrop-blur-md transition-all"
        >
          <option value="">All Genres</option>
          {genres.map((g) => (
            <option key={g.id} value={g.id.toString()}>{g.name}</option>
          ))}
        </select>
      )}

      {/* Year Filter (Movies / TV Only) */}
      {(type === "movies" || type === "tv") && (
        <select
          value={currentYear}
          onChange={(e) => updateFilters("year", e.target.value)}
          className="bg-zinc-800/60 hover:bg-zinc-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer backdrop-blur-md transition-all"
        >
          <option value="">All Years</option>
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      )}

      {/* Sort Filter */}
      <select
        value={currentSort}
        onChange={(e) => updateFilters("sort", e.target.value)}
        className="bg-zinc-800/60 hover:bg-zinc-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer backdrop-blur-md transition-all sm:ml-auto"
      >
        {type === "watchlist" ? (
          <>
            <option value="desc">Newest Added</option>
            <option value="asc">Oldest Added</option>
          </>
        ) : (
          <>
            <option value="popularity.desc">Most Popular</option>
            <option value="vote_average.desc">Top Rated</option>
            <option value="primary_release_date.desc">Newest Releases</option>
          </>
        )}
      </select>
    </div>
  );
}
