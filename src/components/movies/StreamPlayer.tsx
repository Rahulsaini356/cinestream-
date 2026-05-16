"use client";

import { useState } from "react";
import { Play, Download } from "lucide-react";

interface StreamPlayerProps {
  id: string;
  type: "movie" | "tv";
  title?: string;
  seasonsData?: { season_number: number; episode_count: number }[];
}

export default function StreamPlayer({ id, type, title, seasonsData }: StreamPlayerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [server, setServer] = useState("vidlink");

  const servers = [
    { label: "Server 1 (VidLink - Fast)", value: "vidlink" },
    { label: "Server 2 (Vidsrc.cc)", value: "vidsrc.cc" },
    { label: "Server 3 (AutoEmbed)", value: "autoembed" },
    { label: "Server 4 (Vidsrc.pm)", value: "vidsrc.pm" },
    { label: "Server 5 (2Embed)", value: "2embed" },
    { label: "Server 6 (MoviesAPI)", value: "moviesapi" },
  ];

  const currentSeasonData = seasonsData?.find((s) => s.season_number === season);
  const maxEpisodes = currentSeasonData?.episode_count || 1;

  const getEmbedUrl = () => {
    if (server === "vidlink") {
      if (type === "movie") return `https://vidlink.pro/movie/${id}`;
      return `https://vidlink.pro/tv/${id}/${season}/${episode}`;
    }
    if (server === "autoembed") {
      if (type === "movie") return `https://autoembed.co/movie/tmdb/${id}`;
      return `https://autoembed.co/tv/tmdb/${id}-${season}-${episode}`;
    }
    if (server === "2embed") {
      if (type === "movie") return `https://www.2embed.cc/embed/${id}`;
      return `https://www.2embed.cc/embedtv/${id}&s=${season}&e=${episode}`;
    }
    if (server === "vidsrc.cc") {
      if (type === "movie") return `https://vidsrc.cc/v2/embed/movie/${id}`;
      return `https://vidsrc.cc/v2/embed/tv/${id}/${season}/${episode}`;
    }
    if (server === "vidsrc.pm") {
      if (type === "movie") return `https://vidsrc.pm/embed/movie/${id}`;
      return `https://vidsrc.pm/embed/tv/${id}/${season}/${episode}`;
    }
    if (server === "moviesapi") {
      if (type === "movie") return `https://moviesapi.club/movie/${id}`;
      return `https://moviesapi.club/tv/${id}-${season}-${episode}`;
    }
    return `https://vidlink.pro/movie/${id}`; // fallback
  };

  const handleDownload = () => {
    // We use vidsrc.cc opened in a new tab because it is unblocked and has a native download button.
    // If we try to use a direct download API, it gets blocked by ISPs.
    const url = type === "movie" 
      ? `https://vidsrc.cc/v2/embed/movie/${id}` 
      : `https://vidsrc.cc/v2/embed/tv/${id}/${season}/${episode}`;
      
    window.open(url, "_blank");
    
    // Fallback: If they still complain, we can also provide an 'Index of' Google Search which is 100% unblockable.
    // const query = type === "tv" 
    //   ? `Index of "${title}" S${season.toString().padStart(2, "0")}E${episode.toString().padStart(2, "0")} (mp4|mkv)`
    //   : `Index of "${title}" 1080p (mp4|mkv)`;
    // window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, "_blank");
  };

  return (
    <>
      {/* Trigger Buttons */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-6 py-3 font-semibold rounded-xl bg-gradient-to-r from-[#e50914] to-[#ff6b35] text-white hover:scale-105 hover:shadow-[0_0_30px_rgba(229,9,20,0.5)] transition-all duration-300"
        >
          <Play className="w-5 h-5 fill-current" /> Watch Now
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-6 py-3 font-semibold rounded-xl bg-white/10 hover:bg-white/20 text-white hover:scale-105 transition-all duration-300 border border-white/10"
        >
          <Download className="w-5 h-5" /> Download
        </button>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-5xl bg-zinc-950 rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex flex-col">

            {/* Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-white/5 bg-zinc-900/50">

              {/* Title */}
              <div className="flex items-center gap-2">
                <span className="font-bold text-white truncate max-w-xs">{title || "Streaming"}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-zinc-400 capitalize">{type}</span>
              </div>

              <div className="flex items-center gap-3 flex-wrap">

                {/* TV Season/Episode */}
                {type === "tv" && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-zinc-400">Season</span>
                      <select
                        value={season}
                        onChange={(e) => { setSeason(Number(e.target.value)); setEpisode(1); }}
                        className="bg-black border border-white/10 rounded-md px-2 py-1 text-sm text-white focus:outline-none"
                      >
                        {seasonsData && seasonsData.length > 0
                          ? seasonsData.filter((s) => s.season_number > 0).map((s) => (
                              <option key={s.season_number} value={s.season_number}>{s.season_number}</option>
                            ))
                          : [...Array(20)].map((_, i) => (
                              <option key={i + 1} value={i + 1}>{i + 1}</option>
                            ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-zinc-400">Episode</span>
                      <select
                        value={episode}
                        onChange={(e) => setEpisode(Number(e.target.value))}
                        className="bg-black border border-white/10 rounded-md px-2 py-1 text-sm text-white focus:outline-none"
                      >
                        {[...Array(maxEpisodes)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>{i + 1}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Server Selector */}
                <div className="flex items-center gap-1.5 border-l border-white/10 pl-3">
                  <span className="text-xs text-zinc-400">Server</span>
                  <select
                    value={server}
                    onChange={(e) => setServer(e.target.value)}
                    className="bg-black border border-white/10 rounded-md px-2 py-1 text-sm text-white focus:outline-none"
                  >
                    {servers.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

              </div>

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                title="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Video Player */}
            <div className="aspect-video w-full bg-black">
              <iframe
                key={getEmbedUrl()} // Re-mount iframe on URL change
                src={getEmbedUrl()}
                className="w-full h-full"
                allowFullScreen
                allow="autoplay; encrypted-media"
                title="Movie Player"
                frameBorder="0"
              />
            </div>

            {/* Bottom Banner */}
            <div className="p-3 text-center bg-zinc-900/50 border-t border-white/5 space-y-1">
              <p className="text-[10px] text-zinc-500">
                Disclaimer: Video stream is provided by highly trusted third-party servers. We do not host any content.{" "}
                <span className="text-red-400">Please use an adblocker for safe browsing.</span>
              </p>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
