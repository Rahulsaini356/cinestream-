import { fetchTMDB } from "@/lib/tmdb";
import MovieCard from "@/components/ui/MovieCard";
import FilterBar from "@/components/ui/FilterBar";
import { Film } from "lucide-react";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function MoviesPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const genre = typeof sp.genre === "string" ? sp.genre : undefined;
  const year = typeof sp.year === "string" ? sp.year : undefined;
  const sort = typeof sp.sort === "string" ? sp.sort : "popularity.desc";
  const free = sp.free === "true";

  const pageParams: Record<string, string> = {
    page: "1",
    include_adult: "false",
    sort_by: sort,
  };

  if (genre) pageParams.with_genres = genre;
  if (year) pageParams.primary_release_year = year;
  if (free) {
    pageParams.with_watch_monetization_types = "free";
    pageParams.watch_region = "US";
  }

  const [data, genreData] = await Promise.all([
    fetchTMDB("/discover/movie", pageParams),
    fetchTMDB("/genre/movie/list"),
  ]);

  const movies = data.results || [];
  const genres = genreData.genres || [];

  return (
    <main className="min-h-screen bg-[#060608] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center flex-shrink-0">
            <Film className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Movies</h1>
            <p className="text-sm text-zinc-500 mt-0.5">{movies.length} titles{free ? " · Free to Watch" : ""}</p>
          </div>
        </div>

        <FilterBar type="movies" genres={genres} />

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {movies.map((item: any, i: number) => (
            <div
              key={item.id}
              style={{ animationDelay: `${i * 40}ms` }}
              className="animate-fade-up"
            >
              <MovieCard item={item} className="w-full" />
            </div>
          ))}
        </div>

        {movies.length === 0 && (
          <div className="text-center py-32 text-zinc-500">
            <Film className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-xl font-semibold">No movies found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </main>
  );
}
