import { fetchTMDB } from "@/lib/tmdb";
import MovieCard from "@/components/ui/MovieCard";
import HeroSlider from "@/components/ui/HeroSlider";
import Link from "next/link";
import { TrendingUp, Sparkles, Star, Tv, Zap, ArrowRight } from "lucide-react";
import TelegramSection from "@/components/ui/TelegramSection";

export const revalidate = 3600; // Cache homepage for 1 hour

interface RowProps {
  title: string;
  icon: React.ReactNode;
  movies: any[];
  viewAllHref?: string;
  accent?: "default" | "free";
}

function MovieRow({ title, icon, movies, viewAllHref, accent = "default" }: RowProps) {
  const isFree = accent === "free";

  return (
    <div className="mb-12 md:mb-14">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          {/* Subtle vertical indicator bar */}
          <span
            className={`w-1 h-5 rounded-full ${
              isFree
                ? "bg-gradient-to-b from-emerald-400 to-green-500 shadow-[0_0_10px_rgba(52,211,153,0.5)]"
                : "bg-gradient-to-b from-[#e50914] to-[#ff414d] shadow-[0_0_10px_rgba(229,9,20,0.5)]"
            }`}
          />
          <h2 className="flex items-center gap-2 text-xl md:text-2xl font-bold text-white tracking-tight">
            <span className={isFree ? "text-emerald-400" : "text-[#e50914]"}>{icon}</span>
            <span>{title}</span>
            {isFree && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 ml-1 uppercase tracking-wider">
                Free
              </span>
            )}
          </h2>
        </div>

        {viewAllHref && (
          <Link
            href={viewAllHref}
            prefetch={false}
            className="group flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-zinc-400 hover:text-white transition-all px-3 py-1.5 rounded-lg hover:bg-white/[0.06] border border-transparent hover:border-white/10"
          >
            <span>See all</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        )}
      </div>

      {/* Horizontal Carousel Rail */}
      <div className="flex gap-3.5 sm:gap-4 md:gap-5 overflow-x-auto pb-4 pt-1 scrollbar-hide px-4 sm:px-6 lg:px-8 snap-x snap-mandatory">
        {movies.map((item: any) => (
          <MovieCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

export default async function Home() {
  const [trendingData, newReleasesData, topRatedData, tvData, indianTvData, freeData] = await Promise.all([
    fetchTMDB("/trending/all/week"),
    fetchTMDB("/movie/now_playing"),
    fetchTMDB("/movie/top_rated"),
    fetchTMDB("/tv/popular"),
    fetchTMDB("/discover/tv", {
      with_original_language: "hi",
      sort_by: "popularity.desc",
    }),
    fetchTMDB("/discover/movie", {
      with_watch_monetization_types: "free",
      watch_region: "US",
      sort_by: "popularity.desc",
    }),
  ]);

  // Fallback mock dataset to ensure Homepage/Hero loads cleanly even if TMDB API is offline/timeouts
  const fallbackMovies = [
    {
      id: "1083381",
      title: "Backrooms",
      media_type: "movie",
      backdrop_path: null,
      poster_path: null,
      vote_average: 8.5,
      release_date: "2026-01-01",
      overview: "A group of friends explore the mysterious and endless hallways of the Backrooms.",
    },
    {
      id: "550",
      title: "Fight Club",
      media_type: "movie",
      backdrop_path: null,
      poster_path: null,
      vote_average: 8.8,
      release_date: "1999-10-15",
      overview: "An insomniac office worker and a devil-may-care soapmaker form an underground fight club.",
    }
  ];

  const trending = trendingData.results?.length ? trendingData.results.slice(0, 12) : fallbackMovies;
  const newReleases = newReleasesData.results?.length ? newReleasesData.results.slice(0, 12) : fallbackMovies;
  const topRated = topRatedData.results?.length ? topRatedData.results.slice(0, 12) : fallbackMovies;
  const tvShows = tvData.results?.length ? tvData.results.slice(0, 12) : fallbackMovies;
  const indianShows = indianTvData.results?.length ? indianTvData.results.slice(0, 12) : [];
  const freeMovies = freeData.results?.length ? freeData.results.slice(0, 12) : fallbackMovies;

  return (
    <main className="min-h-screen bg-[#060608]">
      {/* Hero */}
      <HeroSlider movies={trending.slice(0, 6)} />

      {/* Content rows */}
      <div className="relative z-10 -mt-16 pt-4">
        <MovieRow
          title="Trending This Week"
          icon={<TrendingUp className="w-5 h-5" />}
          movies={trending}
          viewAllHref="/movies"
        />
        <MovieRow
          title="New Releases"
          icon={<Sparkles className="w-5 h-5" />}
          movies={newReleases}
          viewAllHref="/movies"
        />
        <MovieRow
          title="Popular TV Shows"
          icon={<Tv className="w-5 h-5" />}
          movies={tvShows}
          viewAllHref="/tv"
        />
        <MovieRow
          title="Top Rated"
          icon={<Star className="w-5 h-5" />}
          movies={topRated}
          viewAllHref="/movies?sort=vote_average.desc"
        />
        {freeMovies.length > 0 && (
          <MovieRow
            title="Free to Watch"
            icon={<Zap className="w-5 h-5" />}
            movies={freeMovies}
            viewAllHref="/movies?free=true"
            accent="free"
          />
        )}
      </div>

      {/* Telegram Channel Section */}
      <TelegramSection />
    </main>
  );
}
