import { fetchTMDB } from "@/lib/tmdb";
import MovieCard from "@/components/ui/MovieCard";
import HeroSlider from "@/components/ui/HeroSlider";

export default async function Home() {
  const [trendingData, topRatedData, tvData] = await Promise.all([
    fetchTMDB("/trending/all/week"),
    fetchTMDB("/movie/top_rated"),
    fetchTMDB("/tv/top_rated"),
  ]);

  const trending = trendingData.results || [];
  const topRated = topRatedData.results || [];
  const tvShows = tvData.results || [];

  const renderRow = (title: string, movies: any[]) => (
    <div className="mb-12">
      <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent tracking-tight mb-6 px-4 sm:px-6 lg:px-8">
        {title}
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide px-4 sm:px-6 lg:px-8 snap-x snap-mandatory">
        {movies.map((item: any) => (
          <MovieCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );

  return (
    <main className="min-h-screen pb-20 bg-black">
      {/* Hero Section */}
      <HeroSlider movies={trending.slice(0, 5)} />

      {/* Rows */}
      <div className="relative z-10 mt-4 md:-mt-8">
        {renderRow("Trending Now", trending)}
        {renderRow("Top Rated Movies", topRated)}
        {renderRow("Popular TV Shows", tvShows)}
      </div>
    </main>
  );
}
