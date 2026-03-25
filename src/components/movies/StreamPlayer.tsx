"use client";

import { useState } from "react";
import { Play } from "lucide-react";

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
  const [lang, setLang] = useState("en");

  // Servers grouped by language support
  const servers = [
    // English / Multi-audio (has gear icon for lang switch inside player)
    { label: "Server 1 – vidsrc.to", value: "vidsrc.to", langs: ["en", "hi"] },
    { label: "Server 2 – vidsrc.me", value: "vidsrc.me", langs: ["en", "hi"] },
    { label: "Server 3 – vidsrc.xyz", value: "vidsrc.xyz", langs: ["en"] },
    // Hindi dubbed focused servers
    { label: "Server 4 – Hindi (2embed)", value: "2embed.cc", langs: ["hi", "en"] },
    { label: "Server 5 – Hindi (autoembed)", value: "autoembed.cc", langs: ["hi", "en"] },
  ];

  // Filter servers by selected language
  const filteredServers = servers.filter((s) => s.langs.includes(lang));

  // If current server not available for selected lang, reset to first available
  const effectiveServer = filteredServers.find((s) => s.value === server)
    ? server
    : filteredServers[0]?.value || server;

  const getEmbedUrl = () => {
    const s = effectiveServer;
    if (s === "2embed.cc") {
      if (type === "movie") return `https://www.2embed.cc/embed/${id}`;
      return `https://www.2embed.cc/embedtv/${id}&s=${season}&e=${episode}`;
    }
    if (s === "autoembed.cc") {
      if (type === "movie") return `https://player.autoembed.cc/embed/movie/${id}`;
      return `https://player.autoembed.cc/embed/tv/${id}/${season}/${episode}`;
    }
    // Default vidsrc pattern
    if (type === "movie") return `https://${s}/embed/movie/${id}`;
    return `https://${s}/embed/tv/${id}/${season}/${episode}`;
  };

  const currentSeasonData = seasonsData?.find((s) => s.season_number === season);
  const maxEpisodes = currentSeasonData?.episode_count || 1;

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-6 py-3 font-semibold rounded-xl bg-gradient-to-r from-[#e50914] to-[#ff6b35] text-white hover:scale-105 hover:shadow-[0_0_30px_rgba(229,9,20,0.5)] transition-all duration-300"
      >
        <Play className="w-5 h-5 fill-current" /> Watch Now
      </button>

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

                {/* 🌐 Language Selector */}
                <div className="flex items-center gap-1.5 border-l border-white/10 pl-3">
                  <span className="text-xs text-zinc-400">🌐 Lang</span>
                  <select
                    value={lang}
                    onChange={(e) => {
                      setLang(e.target.value);
                      // Reset server to first available for new lang
                      const available = servers.filter((s) => s.langs.includes(e.target.value));
                      if (available.length > 0) setServer(available[0].value);
                    }}
                    className="bg-black border border-white/10 rounded-md px-2 py-1 text-sm text-white focus:outline-none"
                  >
                    <option value="en">🇬🇧 English</option>
                    <option value="hi">🇮🇳 Hindi</option>
                  </select>
                </div>

                {/* Server Selector */}
                <div className="flex items-center gap-1.5 border-l border-white/10 pl-3">
                  <span className="text-xs text-zinc-400">Server</span>
                  <select
                    value={effectiveServer}
                    onChange={(e) => setServer(e.target.value)}
                    className="bg-black border border-white/10 rounded-md px-2 py-1 text-sm text-white focus:outline-none"
                  >
                    {filteredServers.map((s) => (
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
              <p className="text-[11px] text-emerald-400 font-medium">
                💡 To watch in Hindi: Select <strong>🌐 Lang → Hindi</strong> above, or use the Gear ⚙️ icon inside the player to switch audio tracks.
              </p>
              <p className="text-[10px] text-zinc-500">
                Disclaimer: Video stream third-party servers se provided hai. We do not host any content.{" "}
                <span className="text-red-400">Ads ke liye adblocker use karein.</span>
              </p>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
