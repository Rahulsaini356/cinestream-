"use client";

import { useState } from "react";
import { BookmarkCheck, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function WatchlistButton({ 
  movieId, 
  title, 
  poster, 
  type, 
  initialState = false,
  variant = "circle"
}: { 
  movieId: string; 
  title: string; 
  poster: string | null; 
  type: "movie" | "tv"; 
  initialState?: boolean;
  variant?: "circle" | "pill";
}) {
  const [inWatchlist, setInWatchlist] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const toggleWatchlist = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movieId, title, poster, type }),
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      if (res.ok) {
        setInWatchlist(!inWatchlist);
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === "circle") {
    return (
      <button
        onClick={toggleWatchlist}
        disabled={isLoading}
        title={inWatchlist ? "In Watchlist" : "Add to Watchlist"}
        className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 shadow-xl disabled:opacity-50 cursor-pointer hover:scale-105 active:scale-95 ${
          inWatchlist
            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
            : "bg-black/40 hover:bg-white hover:text-black text-white border border-white/20"
        }`}
      >
        {inWatchlist ? (
          <BookmarkCheck className="w-5 h-5 text-emerald-400" />
        ) : (
          <Plus className="w-5 h-5" />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={toggleWatchlist}
      disabled={isLoading}
      className={`inline-flex items-center gap-2 px-6 py-3 font-semibold text-sm rounded-full transition-all duration-200 shadow-sm disabled:opacity-50 cursor-pointer ${
        inWatchlist 
          ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30 backdrop-blur-md" 
          : "bg-black/40 hover:bg-white hover:text-black text-white border border-white/20 backdrop-blur-md active:scale-95"
      }`}
    >
      {inWatchlist ? (
        <>
          <BookmarkCheck className="w-4 h-4 text-emerald-400" />
          <span>In Watchlist</span>
        </>
      ) : (
        <>
          <Plus className="w-4 h-4" />
          <span>Add to Watchlist</span>
        </>
      )}
    </button>
  );
}
