import { fetchTMDB } from "@/lib/tmdb";
import Link from "next/link";
import { Play, Star } from "lucide-react";
import MovieCard from "@/components/ui/MovieCard";
import FilterBar from "@/components/ui/FilterBar";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function MoviesPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const genre = typeof sp.genre === "string" ? sp.genre : undefined;
  const year = typeof sp.year === "string" ? sp.year : undefined;
  const sort = typeof sp.sort === "string" ? sp.sort : "popularity.desc";

  const pageParams: Record<string, string> = {
    page: "1",
    include_adult: "false",
    sort_by: sort,
  };
  
  if (genre) pageParams.with_genres = genre;
  if (year) pageParams.primary_release_year = year;

  const data = await fetchTMDB("/discover/movie", pageParams);
  const movies = data.results || [];

  const genreData = await fetchTMDB("/genre/movie/list");
  const genres = genreData.genres || [];

  return (
    <main className="min-h-screen pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-black">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent tracking-tight">Movies</h1>
      </div>

      <FilterBar type="movies" genres={genres} />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-10">
        {movies.map((item: any) => (
          <MovieCard key={item.id} item={item} className="min-w-0" />
        ))}
      </div>
    </main>
  );
}
