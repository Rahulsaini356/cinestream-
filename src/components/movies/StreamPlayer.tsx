"use client";

import { useState, useEffect, useCallback } from "react";
import { Play, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface StreamPlayerProps {
  id: string; // tmdb id
  imdbId?: string; // imdb id
  type: "movie" | "tv";
  title?: string;
  seasonsData?: { season_number: number; episode_count: number }[];
}

export default function StreamPlayer({ id, type, title, seasonsData }: StreamPlayerProps) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Ping watch time tracker every minute
    fetch("/api/user/ping-watch", { method: "POST" }).catch((err) => console.error("Ping error:", err));

    const interval = setInterval(() => {
      fetch("/api/user/ping-watch", { method: "POST" }).catch((err) => console.error("Ping error:", err));
    }, 60000);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Reset loading & error on route or episode change
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
  }, [season, episode, id, type]);

  // Secure postMessage event listener with origin and payload validation
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate origin strictly against Vidy.st
      if (event.origin !== "https://vidy.st" && event.origin !== "https://www.vidy.st") {
        return;
      }

      let payload: any = null;
      if (typeof event.data === "string") {
        try {
          payload = JSON.parse(event.data);
        } catch {
          return;
        }
      } else if (typeof event.data === "object" && event.data !== null) {
        payload = event.data;
      } else {
        return;
      }

      if (!payload || typeof payload !== "object") return;

      if (payload.event === "play" || payload.event === "timeupdate") {
        setIsLoading(false);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const currentSeasonData = seasonsData?.find((s) => s.season_number === season);
  const maxEpisodes = currentSeasonData?.episode_count || 1;

  const getEmbedUrl = useCallback(() => {
    const color = "e50914"; // CineStream red brand accent
    const params = new URLSearchParams();
    params.set("color", color);

    if (type === "tv") {
      params.set("nextEpisode", "true");
      params.set("episodeSelector", "true");
      params.set("autoplayNextEpisode", "true");
      return `https://vidy.st/tv/${encodeURIComponent(id)}/${season}/${episode}?${params.toString()}`;
    }

    return `https://vidy.st/movie/${encodeURIComponent(id)}?${params.toString()}`;
  }, [id, type, season, episode]);

  if (!session) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/login"
          prefetch={false}
          className="flex items-center gap-2 px-7 py-3 rounded-full bg-white text-black font-extrabold text-sm hover:bg-zinc-200 hover:scale-105 active:scale-95 transition-all shadow-xl"
        >
          <Play className="w-4 h-4 fill-black text-black ml-0.5" />
          <span>Login to Play</span>
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Trigger Button (ShuttleTV Style Play Pill) */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => {
            setIsOpen(true);
            setIsLoading(true);
            setHasError(false);
          }}
          className="flex items-center gap-2 px-7 py-3 rounded-full bg-white text-black font-extrabold text-sm hover:bg-zinc-200 hover:scale-105 active:scale-95 transition-all shadow-xl cursor-pointer"
        >
          <Play className="w-4 h-4 fill-black text-black ml-0.5" />
          <span>Play</span>
        </button>
      </div>

      {/* Video Player Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-2 sm:p-4 md:p-6 animate-fade-in">
          <div className="w-full max-w-5xl bg-[#090912] rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.95)] flex flex-col max-h-[95vh]">

            {/* Top Bar */}
            <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-3.5 border-b border-white/8 bg-[#0c0c16]">
              {/* Title & Live indicator */}
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-2 h-2 rounded-full bg-[#e50914] animate-pulse shrink-0" />
                <span className="font-bold text-white text-sm sm:text-base truncate max-w-[200px] sm:max-w-md">
                  {title || "Now Playing"}
                </span>
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md bg-white/[0.08] text-zinc-300 border border-white/10 shrink-0">
                  {type === "tv" ? "TV Series" : "Movie"}
                </span>
              </div>

              <div className="flex items-center gap-2.5 sm:gap-3">
                {/* TV Season / Episode Switchers */}
                {type === "tv" && (
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-zinc-400 font-medium hidden sm:inline">Season</span>
                      <select
                        value={season}
                        onChange={(e) => {
                          setSeason(Number(e.target.value));
                          setEpisode(1);
                        }}
                        className="bg-black/90 border border-white/15 rounded-lg px-2.5 py-1 text-xs sm:text-sm text-white font-medium focus:outline-none focus:border-[#e50914] transition-colors cursor-pointer"
                      >
                        {seasonsData && seasonsData.length > 0
                          ? seasonsData
                              .filter((s) => s.season_number > 0)
                              .map((s) => (
                                <option key={s.season_number} value={s.season_number}>
                                  Season {s.season_number}
                                </option>
                              ))
                          : [...Array(20)].map((_, i) => (
                              <option key={i + 1} value={i + 1}>
                                Season {i + 1}
                              </option>
                            ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-zinc-400 font-medium hidden sm:inline">Episode</span>
                      <select
                        value={episode}
                        onChange={(e) => setEpisode(Number(e.target.value))}
                        className="bg-black/90 border border-white/15 rounded-lg px-2.5 py-1 text-xs sm:text-sm text-white font-medium focus:outline-none focus:border-[#e50914] transition-colors cursor-pointer"
                      >
                        {[...Array(maxEpisodes)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>
                            Episode {i + 1}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Close Button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 sm:p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.15] text-zinc-400 hover:text-white transition-all cursor-pointer ml-1"
                  title="Close Player"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* 16:9 Video Player Container */}
            <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
              {/* Loading Indicator */}
              {isLoading && !hasError && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/95 text-center p-4">
                  <div className="relative mb-3">
                    <div className="w-12 h-12 rounded-full border-2 border-white/10 border-t-[#e50914] animate-spin" />
                  </div>
                  <p className="text-sm font-semibold text-white">Loading Video Stream...</p>
                  <p className="text-xs text-zinc-400 mt-1">Connecting to Vidy high-speed player</p>
                </div>
              )}

              {/* Error Fallback */}
              {hasError && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#090912] p-6 text-center">
                  <AlertCircle className="w-12 h-12 text-amber-400 mb-3" />
                  <h3 className="text-base font-bold text-white mb-1">Stream Temporarily Unavailable</h3>
                  <p className="text-xs text-zinc-400 max-w-md mb-4">
                    Could not connect to the stream for this title. Please try refreshing or check back in a moment.
                  </p>
                  <button
                    onClick={() => {
                      setHasError(false);
                      setIsLoading(true);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-xl bg-[#e50914] text-white hover:bg-[#b80710] transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Retry Player
                  </button>
                </div>
              )}

              {/* Vidy Embedded Iframe Player */}
              <iframe
                key={getEmbedUrl()}
                src={getEmbedUrl()}
                width="100%"
                height="100%"
                className="w-full h-full border-0"
                allowFullScreen
                allow="encrypted-media; autoplay *; fullscreen *"
                referrerPolicy="origin"
                title={title ? `${title} - Vidy Player` : "Vidy Player"}
                frameBorder={0}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setIsLoading(false);
                  setHasError(true);
                }}
              />
            </div>

          </div>
        </div>
      )}
    </>
  );
}
