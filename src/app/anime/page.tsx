import { fetchTMDB } from "@/lib/tmdb";
import MovieCard from "@/components/ui/MovieCard";
import FilterBar from "@/components/ui/FilterBar";
import { Sparkles } from "lucide-react";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function AnimePage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const genre = typeof sp.genre === "string" ? sp.genre : undefined;
  const year = typeof sp.year === "string" ? sp.year : undefined;
  const sort = typeof sp.sort === "string" ? sp.sort : "popularity.desc";

  const pageParams: Record<string, string> = {
    page: "1",
    include_adult: "false",
    sort_by: sort,
    with_original_language: "ja",
    with_genres: genre ? `16,${genre}` : "16", // 16 is TMDB Animation genre ID
  };

  if (year) pageParams.first_air_date_year = year;

  const [data, genreData] = await Promise.all([
    fetchTMDB("/discover/tv", pageParams),
    fetchTMDB("/genre/tv/list"),
  ]);

  const shows = data.results || [];
  // Filter out Animation (16) from genres list since we are already in Anime section
  const genres = (genreData.genres || []).filter((g: any) => g.id !== 16);

  return (
    <main className="min-h-screen bg-[#060608] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-pink-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Anime</h1>
            <p className="text-sm text-zinc-500 mt-0.5">{shows.length} series</p>
          </div>
        </div>

        <FilterBar type="tv" genres={genres} />

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {shows.map((item: any, i: number) => (
            <div
              key={item.id}
              style={{ animationDelay: `${i * 40}ms` }}
              className="animate-fade-up"
            >
              <MovieCard item={item} className="w-full" />
            </div>
          ))}
        </div>

        {shows.length === 0 && (
          <div className="text-center py-32 text-zinc-500">
            <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-xl font-semibold">No anime found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </main>
  );
}
