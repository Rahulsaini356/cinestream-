import { fetchTMDB, getImageUrl, getProviders } from "@/lib/tmdb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import WatchlistButton from "@/components/ui/WatchlistButton";
import Link from "next/link";
import { Star, Clock, Calendar, ExternalLink, PlayCircle } from "lucide-react";
import WatchProviders from "@/components/movies/WatchProviders";
import ReviewSection from "@/components/reviews/ReviewSection";
import StreamPlayer from "@/components/movies/StreamPlayer";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const tv = await fetchTMDB(`/tv/${resolvedParams.id}`);
  
  if (!tv || tv.success === false) {
    return { title: 'TV Show Not Found - CineStream' };
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
}

export default async function TVDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const tv = await fetchTMDB(`/tv/${id}`, {
    append_to_response: "videos,credits,similar,watch/providers,external_ids",
  });

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
  const providers = await getProviders("tv", id);

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
    <main className="min-h-screen bg-black pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      {/* Hero Backdrop */}
      <div className="relative min-h-[60vh] md:min-h-[75vh] h-auto w-full flex items-center">
        <div
          className="absolute inset-0 z-0 opacity-60"
          style={{
            backgroundImage: `url('${getImageUrl(tv.backdrop_path, "w1280")}')`,
            backgroundSize: "cover",
            backgroundPosition: "center 20%",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-[1]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-[1]" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-32 pb-12">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            {/* Poster */}
            <div className="hidden md:block w-64 lg:w-[320px] shrink-0 rounded-2xl overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] ring-1 ring-white/10 bg-zinc-900 transform lg:-translate-y-8">
              <img src={getImageUrl(tv.poster_path, "w500")} alt={tv.name} className="w-full object-cover" />
            </div>

            {/* Details */}
            <div className="flex-1 lg:pl-8">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 tracking-tighter leading-[1.1] drop-shadow-2xl font-serif">
                {tv.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs tracking-wider uppercase font-bold text-white/70 mb-8">
                <span className="flex items-center gap-1.5 text-accent bg-accent/10 px-3 py-1.5 rounded-full border border-accent/20">
                  <Star className="w-4 h-4 fill-accent" /> {tv.vote_average?.toFixed(1)}
                </span>
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
                  <Calendar className="w-4 h-4" /> {tv.first_air_date}
                </span>
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
                   {tv.number_of_seasons} Seasons
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                {tv.genres?.map((g: any) => (
                  <Link key={g.id} href={`/tv?genre=${g.id}`} className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm transition-colors backdrop-blur-md">
                    {g.name}
                  </Link>
                ))}
              </div>

              <p className="text-lg text-zinc-300 max-w-3xl leading-relaxed mb-8 drop-shadow-md">{tv.overview}</p>

              <div className="flex flex-wrap items-center gap-4">
                <StreamPlayer id={id} type="tv" title={tv.name} seasonsData={tv.seasons} />
                <WatchlistButton
                  movieId={id}
                  title={tv.name}
                  poster={tv.poster_path}
                  type="tv"
                  initialState={inWatchlist}
                />
                {tv.external_ids?.imdb_id && (
                  <a href={`https://www.imdb.com/title/${tv.external_ids.imdb_id}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-6 py-3 font-semibold rounded-xl bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30 transition-colors">
                    <ExternalLink className="w-5 h-5" /> IMDb
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 md:mt-32 space-y-16">

        {/* Watch Providers & Trailer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2"><PlayCircle /> Trailer</h2>
            {trailer ? (
              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-zinc-900 shadow-xl border border-white/5">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${trailer.key}`}
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            ) : (
              <div className="aspect-video w-full rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-500 border border-white/5">
                No trailer available
              </div>
            )}
          </div>

          {/* Watch Providers */}
          <WatchProviders providers={providers} title={tv.name} />
        </div>

        {/* Cast */}
        {tv.credits?.cast?.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Top Cast</h2>
            <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
              {tv.credits.cast.slice(0, 10).map((person: any) => (
                <Link key={person.id} href={`/person/${person.id}`} className="min-w-[140px] w-[140px] group bg-zinc-900/50 rounded-xl overflow-hidden hover:bg-zinc-800 transition-colors border border-white/5">
                  <div className="aspect-[2/3] w-full bg-zinc-800 relative overflow-hidden">
                    {person.profile_path ? (
                      <img src={getImageUrl(person.profile_path, "w500")} alt={person.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600">No Image</div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-white text-sm truncate group-hover:text-accent transition-colors">{person.name}</p>
                    <p className="text-xs text-zinc-400 truncate mt-1">{person.character}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Similar */}
        {tv.similar?.results?.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Similar Shows</h2>
            <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory">
              {tv.similar.results.map((item: any) => (
                <Link 
                  key={item.id} 
                  href={`/tv/${item.id}`} 
                  className="min-w-[160px] sm:min-w-[200px] md:min-w-[220px] snap-start group relative flex flex-col gap-2 "
                >
                  <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-zinc-900 border border-white/5 shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_20px_40px_-15px_rgba(229,9,20,0.3)] ring-accent hover-glow">
                    {item.poster_path ? (
                      <img src={getImageUrl(item.poster_path, "w500")} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-500 bg-zinc-800">No Image</div>
                    )}
                  </div>
                  <h3 className="font-medium text-sm text-zinc-100 truncate mt-1 group-hover:text-white transition-colors">{item.name}</h3>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <ReviewSection tmdbId={id} type="tv" />

      </div>
    </main>
  );
}
