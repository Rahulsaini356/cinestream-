"use client";

import { useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useRouter } from "next/navigation";

export default function WatchlistButton({ 
  movieId, 
  title, 
  poster, 
  type, 
  initialState = false 
}: { 
  movieId: string; 
  title: string; 
  poster: string | null; 
  type: "movie" | "tv"; 
  initialState?: boolean 
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

  return (
    <button
      onClick={toggleWatchlist}
      disabled={isLoading}
      className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-xl transition-all shadow-xl disabled:opacity-50 ${
        inWatchlist 
          ? "bg-white/20 text-white hover:bg-white/30 backdrop-blur-md border border-white/10" 
          : "bg-accent hover:bg-accent-hover text-white"
      }`}
    >
      {inWatchlist ? (
        <>
          <BookmarkCheck className="w-5 h-5 text-accent" />
          In Watchlist
        </>
      ) : (
        <>
          <Bookmark className="w-5 h-5 fill-transparent" />
          Add to Watchlist
        </>
      )}
    </button>
  );
}
