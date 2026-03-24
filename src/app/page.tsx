import { fetchTMDB } from "@/lib/tmdb";
import MovieCard from "@/components/ui/MovieCard";
import HeroSlider from "@/components/ui/HeroSlider";
import Link from "next/link";
import { TrendingUp, Sparkles, Star, Tv, Zap, ArrowRight } from "lucide-react";

interface RowProps {
  title: string;
  icon: React.ReactNode;
  movies: any[];
  viewAllHref?: string;
  accent?: "default" | "free";
}

function MovieRow({ title, icon, movies, viewAllHref, accent = "default" }: RowProps) {
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-5 px-4 sm:px-6 lg:px-8">
        <h2 className="flex items-center gap-2.5 text-xl md:text-2xl font-bold text-white tracking-tight">
          <span className={accent === "free" ? "text-green-400" : "text-[#e50914]"}>{icon}</span>
          {accent === "free" ? (
            <span className="gradient-white-text">{title}</span>
          ) : (
            title
          )}
          {accent === "free" && (
            <span className="badge badge-free ml-1">Free</span>
          )}
        </h2>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors font-medium group"
          >
            See all
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-4 sm:px-6 lg:px-8 snap-x snap-mandatory">
        {movies.map((item: any) => (
          <MovieCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

export default async function Home() {
  const [trendingData, newReleasesData, topRatedData, tvData, freeData] = await Promise.all([
    fetchTMDB("/trending/all/week"),
    fetchTMDB("/movie/now_playing"),
    fetchTMDB("/movie/top_rated"),
    fetchTMDB("/tv/popular"),
    fetchTMDB("/discover/movie", {
      with_watch_monetization_types: "free",
      watch_region: "US",
      sort_by: "popularity.desc",
    }),
  ]);

  const trending = trendingData.results?.slice(0, 20) || [];
  const newReleases = newReleasesData.results?.slice(0, 20) || [];
  const topRated = topRatedData.results?.slice(0, 20) || [];
  const tvShows = tvData.results?.slice(0, 20) || [];
  const freeMovies = freeData.results?.slice(0, 20) || [];

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
          title="Top Rated"
          icon={<Star className="w-5 h-5" />}
          movies={topRated}
          viewAllHref="/movies?sort=vote_average.desc"
        />
        <MovieRow
          title="Popular TV Shows"
          icon={<Tv className="w-5 h-5" />}
          movies={tvShows}
          viewAllHref="/tv"
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
    </main>
  );
}
