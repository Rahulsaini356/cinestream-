"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2, Film, Tv } from "lucide-react";

export default function SearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length > 2) {
        setIsLoading(true);
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
          const data = await res.json();
          setResults(data.results || []);
        } catch (error) {
          console.error(error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 sm:pt-32 px-4 shadow-2xl">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="relative w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
        >
          <div className="flex items-center px-4 border-b border-white/10">
            <Search className="w-5 h-5 text-zinc-400" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for movies or TV shows..."
              className="flex-1 bg-transparent px-4 py-4 outline-none text-white placeholder:text-zinc-500"
            />
            {query && (
              <button onClick={() => setQuery("")} className="p-1 text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="ml-4 hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-white/10 text-zinc-300">
              ESC
            </kbd>
          </div>

          <div className="max-h-[60vh] overflow-y-auto w-full">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-accent" />
              </div>
            ) : results.length > 0 ? (
              <ul className="p-2">
                {results.slice(0, 10).map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        onClose();
                        router.push(`/${item.media_type === "tv" ? "tv" : "movie"}/${item.id}`);
                      }}
                      className="w-full flex items-center gap-4 p-2 rounded-xl hover:bg-white/5 transition-colors text-left"
                    >
                      {item.poster_path ? (
                        <div className="w-12 h-16 bg-zinc-800 rounded-md overflow-hidden shrink-0">
                          <img
                            src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                            alt={item.title || item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-16 bg-zinc-800 flex items-center justify-center rounded-md shrink-0">
                          {item.media_type === "tv" ? <Tv className="w-5 h-5 text-zinc-500" /> : <Film className="w-5 h-5 text-zinc-500" />}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{item.title || item.name}</p>
                        <p className="text-sm text-zinc-400">
                          {item.media_type === "tv" ? "TV Show" : "Movie"} • {item.release_date?.substring(0, 4) || item.first_air_date?.substring(0, 4) || "Unknown"}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : query.length > 2 ? (
              <div className="py-12 text-center text-zinc-500">
                No results found for "{query}"
              </div>
            ) : (
              <div className="py-12 text-center text-zinc-500">
                Start typing to search...
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
