"use client";

import { useState } from "react";
import { Play, X } from "lucide-react";

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
  const [server, setServer] = useState("vidsrc.to");

  const servers = [
    { label: "Server 1 (Default)", value: "vidsrc.to" },
    { label: "Server 2 (Backup)", value: "vidsrc.me" },
    { label: "Server 3 (Vidsrc.xyz)", value: "vidsrc.xyz" },
  ];

  // Get total episodes for the currently selected season
  const currentSeasonData = seasonsData?.find((s) => s.season_number === season);
  const maxEpisodes = currentSeasonData?.episode_count || 1;

  // API endpoints
  const getEmbedUrl = () => {
    if (type === "movie") {
      return `https://${server}/embed/movie/${id}`;
    } else {
      return `https://${server}/embed/tv/${id}/${season}/${episode}`;
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-6 py-3 font-semibold rounded-xl bg-gradient-to-r from-[#e50914] to-[#ff6b35] text-white hover:scale-105 hover:shadow-[0_0_30px_rgba(229,9,20,0.5)] transition-all duration-300"
      >
        <Play className="w-5 h-5 fill-current" /> Watch Now
      </button>

      {/* Modal Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-5xl bg-zinc-950 rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative flex flex-col">
            
            {/* Header / Controls for TV */}
            <div className="flex flex-wrap items-center justify-between p-4 border-b border-white/5 bg-zinc-900/50">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white truncate max-w-xs">{title || "Streaming"}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-zinc-400 capitalize">{type}</span>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                {/* TV Selectors */}
                {type === "tv" && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-zinc-400">Season</span>
                      <select 
                        value={season} 
                        onChange={(e) => {
                          setSeason(Number(e.target.value));
                          setEpisode(1); // Reset episode when season changes
                        }}
                        className="bg-black border border-white/10 rounded-md px-2 py-1 text-sm text-white focus:outline-none focus:border-accent"
                      >
                        {seasonsData && seasonsData.length > 0 ? (
                          seasonsData.filter(s => s.season_number > 0).map((s) => (
                            <option key={s.season_number} value={s.season_number}>{s.season_number}</option>
                          ))
                        ) : (
                          [...Array(20)].map((_, i) => (
                            <option key={i+1} value={i+1}>{i+1}</option>
                          ))
                        )}
                      </select>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-zinc-400">Episode</span>
                      <select 
                        value={episode} 
                        onChange={(e) => setEpisode(Number(e.target.value))}
                        className="bg-black border border-white/10 rounded-md px-2 py-1 text-sm text-white focus:outline-none focus:border-accent"
                      >
                        {[...Array(maxEpisodes)].map((_, i) => (
                          <option key={i+1} value={i+1}>{i+1}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Server Selector */}
                <div className="flex items-center gap-1.5 md:border-l md:border-white/10 md:pl-3">
                  <span className="text-xs text-zinc-400">Server</span>
                  <select 
                    value={server} 
                    onChange={(e) => setServer(e.target.value)}
                    className="bg-black border border-white/10 rounded-md px-2 py-1 text-sm text-white focus:outline-none focus:border-accent"
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

            {/* Video Player Frame */}
            <div className="aspect-video w-full bg-black relative">
              <iframe
                src={getEmbedUrl()}
                className="w-full h-full"
                allowFullScreen
                allow="autoplay; encrypted-media"
                title="Movie Player"
                frameBorder="0"
                sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
              />
            </div>

            {/* Disclaimer & safety Banner at Bottom */}
            <div className="p-3 text-center bg-zinc-900/50 border-t border-white/5 space-y-1">
              <p className="text-[11px] text-emerald-400 font-medium">
                💡 Tip: To watch in Hindi/English, click the Gear (Settings) icon inside the bottom bar of the video player.
              </p>
              <p className="text-[10px] text-zinc-500">
                Disclaimer: The video stream is provided by highly trusted third-party servers. We do not host any content. 
                <span className="text-accent"> If encountering ads inside player, use an adblocker for safe browsing.</span>
              </p>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
