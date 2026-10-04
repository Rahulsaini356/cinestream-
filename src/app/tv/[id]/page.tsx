import Image from "next/image";
import { fetchTMDB, getImageUrl, getProviders } from "@/lib/tmdb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import WatchlistButton from "@/components/ui/WatchlistButton";
import MovieCard from "@/components/ui/MovieCard";
import Link from "next/link";
import { Star, Calendar, ExternalLink, PlayCircle } from "lucide-react";
import WatchProviders from "@/components/movies/WatchProviders";
import ReviewSection from "@/components/reviews/ReviewSection";
import StreamPlayer from "@/components/movies/StreamPlayer";
import { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const tv = await fetchTMDB(`/tv/${resolvedParams.id}`, {
      append_to_response: "videos,credits,similar,watch/providers,external_ids",
    });
    
    if (!tv || tv.success === false || !tv.name) {
      return { title: 'TV Show - CineStream' };
    }

    const title = `${tv.name} - Watch TV Show Online | CineStream`;
    const description = tv.overview || `Watch ${tv.name} online on CineStream. Discover movies and TV shows.`;
    const imageUrl = getImageUrl(tv.backdrop_path || tv.poster_path, "w1280");

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "video.tv_show",
        images: imageUrl ? [{ url: imageUrl }] : [],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: imageUrl ? [imageUrl] : [],
      },
    };
  } catch {
    return { title: 'TV Show - CineStream' };
  }
}

export default async function TVDetail({ params }: { params: Promise<{ id: string }> }): Promise<React.JSX.Element> {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const tv = await fetchTMDB(`/tv/${id}`, {
    append_to_response: "videos,credits,similar,watch/providers,external_ids",
  });

  if (!tv || tv.success === false || !tv.name) {
    notFound();
  }

  const session = await getServerSession(authOptions);
  let inWatchlist = false;

  if (session?.user?.id) {
    const existing = await prisma.watchlist.findUnique({
      where: {
        userId_movieId_type: {
          userId: session.user.id,
          movieId: id,
          type: "tv",
        },
      },
    });
    inWatchlist = !!existing;
  }

  // Get Trailer
  const trailer = tv.videos?.results?.find(
    (v: any) => v.type === "Trailer" && v.site === "YouTube"
  );

  // Get Providers
  const providers = await getProviders("tv", id, tv);

  // Schema.org Structured Data
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "TVSeries",
    "name": tv.name,
    "image": getImageUrl(tv.poster_path, "w500"),
    "description": tv.overview,
    "startDate": tv.first_air_date,
    "numberOfSeasons": tv.number_of_seasons,
    "numberOfEpisodes": tv.number_of_episodes,
    "aggregateRating": tv.vote_average ? {
      "@type": "AggregateRating",
      "ratingValue": tv.vote_average,
      "bestRating": "10",
      "worstRating": "1",
      "ratingCount": tv.vote_count || 1
    } : undefined,
    "creator": tv.created_by?.slice(0, 3).map((c: any) => ({
      "@type": "Person",
      "name": c.name
    })),
    "actor": tv.credits?.cast?.slice(0, 3).map((a: any) => ({
      "@type": "Person",
      "name": a.name
    }))
  };

  return (
    <main className="min-h-screen bg-[#060608] pt-24 sm:pt-28 pb-20 px-3 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      {/* Main Center Floating Card (ShuttleTV Style) */}
      <div className="max-w-5xl mx-auto rounded-[28px] sm:rounded-[36px] overflow-hidden bg-[#0a0a14] border border-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.95)]">
        
        {/* Backdrop Top Banner */}
        <div className="relative min-h-[420px] sm:min-h-[480px] md:min-h-[540px] w-full flex flex-col justify-end p-6 sm:p-10 md:p-12 overflow-hidden">
          {/* Backdrop Image */}
          {tv.backdrop_path && (
            <Image
              src={getImageUrl(tv.backdrop_path, "w1280")}
              alt={tv.name || "Backdrop"}
              fill
              priority
              className="object-cover object-center opacity-65"
              sizes="(max-width: 1024px) 100vw, 1024px"
            />
          )}

          {/* Gradients blending into card background */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a14] via-[#0a0a14]/60 via-40% to-transparent z-[1]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a14]/90 via-[#0a0a14]/40 to-transparent z-[1]" />

          {/* Foreground Title & Meta inside Hero Banner */}
          <div className="relative z-10 max-w-2xl">
            {/* Spaced Title (ShuttleTV Style) */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-[0.15em] uppercase font-serif drop-shadow-2xl mb-2.5">
              {tv.name}
            </h1>

            {/* Genres subtitle */}
            {tv.genres?.length > 0 && (
              <p className="text-xs sm:text-sm text-zinc-300 font-semibold mb-3 tracking-wide">
                {tv.genres.map((g: any) => g.name).join(" • ")}
              </p>
            )}

            {/* Ratings & Technical Specs Row */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs sm:text-sm text-zinc-300 mb-6">
              {tv.vote_average > 0 && (
                <span className="flex items-center gap-1 font-bold text-amber-300 bg-black/60 px-2.5 py-1 rounded-md border border-white/10">
                  <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                  <span>{tv.vote_average.toFixed(1)}/10</span>
                </span>
              )}

              {tv.external_ids?.imdb_id && (
                <span className="font-black text-black bg-[#f5c518] px-2 py-0.5 rounded text-[11px] tracking-wider">
                  IMDb {tv.vote_average ? tv.vote_average.toFixed(1) : "N/A"}
                </span>
              )}

              {tv.first_air_date && (
                <span className="font-semibold text-white">
                  {tv.first_air_date.substring(0, 4)}
                </span>
              )}

              {tv.number_of_seasons > 0 && (
                <>
                  <span className="text-zinc-500">•</span>
                  <span className="font-medium text-zinc-300">
                    {tv.number_of_seasons} {tv.number_of_seasons === 1 ? "Season" : "Seasons"}
                  </span>
                </>
              )}

              <span className="text-zinc-500">•</span>
              <span className="text-[11px] font-black tracking-wider px-1.5 py-0.5 rounded bg-white/10 text-zinc-300 border border-white/10">
                TV-MA
              </span>
            </div>

            {/* Action Buttons Row */}
            <div className="flex flex-wrap items-center gap-3">
              <StreamPlayer id={id} imdbId={tv.external_ids?.imdb_id} type="tv" title={tv.name} seasonsData={tv.seasons} />

              {trailer && (
                <a
                  href="#trailer-section"
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-black/50 hover:bg-white/15 text-white font-bold text-sm border border-white/20 backdrop-blur-md transition-all shadow-lg cursor-pointer"
                >
                  <PlayCircle className="w-4 h-4" />
                  <span>Trailer</span>
                </a>
              )}

              <WatchlistButton
                movieId={id}
                title={tv.name}
                poster={tv.poster_path}
                type="tv"
                initialState={inWatchlist}
                variant="circle"
              />

              {tv.external_ids?.imdb_id && (
                <a
                  href={`https://www.imdb.com/title/${tv.external_ids.imdb_id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-11 h-11 rounded-full bg-black/50 hover:bg-[#f5c518] hover:text-black border border-white/20 text-[#f5c518] flex items-center justify-center transition-all shadow-lg"
                  title="View on IMDb"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Card Body Content */}
        <div className="p-6 sm:p-10 md:p-12 pt-4 sm:pt-6 space-y-10 sm:space-y-12">
          {/* Synopsis */}
          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-3xl font-normal">
            {tv.overview}
          </p>

          {/* Cast Section (ShuttleTV Style) */}
          {tv.credits?.cast?.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                Cast
              </h2>
              <div className="flex overflow-x-auto gap-3 sm:gap-4 pb-4 scrollbar-hide snap-x snap-mandatory">
                {tv.credits.cast.slice(0, 10).map((person: any) => (
                  <Link
                    key={person.id}
                    href={`/person/${person.id}`}
                    prefetch={false}
                    className="min-w-[110px] sm:min-w-[125px] w-[110px] sm:w-[125px] snap-start group rounded-2xl overflow-hidden bg-[#111120] border border-white/5 hover:border-white/20 transition-all flex-shrink-0"
                  >
                    <div className="aspect-[3/4] w-full bg-[#181828] relative overflow-hidden">
                      {person.profile_path ? (
                        <Image
                          src={getImageUrl(person.profile_path, "w500")}
                          alt={person.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          fill
                          sizes="125px"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs">
                          No Photo
                        </div>
                      )}
                    </div>
                    <div className="p-2.5">
                      <p className="font-bold text-white text-xs truncate group-hover:text-red-400 transition-colors">
                        {person.name}
                      </p>
                      <p className="text-[10px] text-zinc-400 truncate mt-0.5">
                        {person.character}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Official Trailer & Providers */}
          <div id="trailer-section" className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start pt-4 border-t border-white/10">
            {/* Trailer */}
            <div className="lg:col-span-2 space-y-3">
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <PlayCircle className="w-4 h-4 text-red-500" />
                <span>Trailer</span>
              </h3>
              {trailer ? (
                <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-white/10 shadow-xl">
                  <iframe
                    className="w-full h-full border-0"
                    src={`https://www.youtube.com/embed/${trailer.key}`}
                    title={`${tv.name} Trailer`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="aspect-video w-full rounded-2xl bg-black/40 flex items-center justify-center text-zinc-500 text-xs border border-white/10">
                  No trailer available
                </div>
              )}
            </div>

            {/* Providers */}
            <div className="space-y-3">
              <WatchProviders providers={providers} title={tv.name} />
            </div>
          </div>

          {/* Similar Recommendations */}
          {tv.similar?.results?.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-white/10">
              <h2 className="text-lg sm:text-xl font-bold text-white">
                More Like This
              </h2>
              <div className="flex gap-3.5 sm:gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
                {tv.similar.results.slice(0, 10).map((item: any) => (
                  <MovieCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}

          {/* Community Reviews */}
          <div className="pt-4 border-t border-white/10">
            <ReviewSection tmdbId={id} type="tv" />
          </div>
        </div>
      </div>
    </main>
  );
}
