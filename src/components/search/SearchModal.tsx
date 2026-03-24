"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2, Film, Tv, Star, Clock, ArrowUpRight } from "lucide-react";

interface SearchResult {
  id: number;
  title?: string;
  name?: string;
  media_type: string;
  poster_path?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
}

const RECENT_KEY = "cinestream_recent_searches";

export default function SearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recents, setRecents] = useState<string[]>([]);

  // Load recents
  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem(RECENT_KEY);
      if (saved) setRecents(JSON.parse(saved));
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setResults([]);
      setActiveIndex(-1);
    } else {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results?.slice(0, 10) || []);
        setActiveIndex(-1);
      } catch {}
      finally { setIsLoading(false); }
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  const saveRecent = useCallback((q: string) => {
    const updated = [q, ...recents.filter(r => r !== q)].slice(0, 5);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    setRecents(updated);
  }, [recents]);

  const navigate = useCallback((item: SearchResult) => {
    saveRecent(item.title || item.name || "");
    onClose();
    router.push(`/${item.media_type === "tv" ? "tv" : "movie"}/${item.id}`);
  }, [onClose, router, saveRecent]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex(i => Math.min(i + 1, results.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex(i => Math.max(i - 1, -1));
      }
      if (e.key === "Enter" && activeIndex >= 0 && results[activeIndex]) {
        navigate(results[activeIndex]);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, results, activeIndex, navigate, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -16 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-2xl glass rounded-2xl shadow-2xl shadow-black/60 overflow-hidden"
        >
          {/* Input */}
          <div className="flex items-center gap-3 px-5 border-b border-white/8">
            <Search className="w-5 h-5 text-zinc-400 flex-shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search movies, TV shows, people..."
              className="flex-1 bg-transparent py-4 text-white placeholder:text-zinc-500 outline-none text-base"
            />
            {isLoading && <Loader2 className="w-5 h-5 animate-spin text-zinc-500 flex-shrink-0" />}
            {query && !isLoading && (
              <button
                onClick={() => setQuery("")}
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all flex-shrink-0"
              >
                <X className="w-3.5 h-3.5 text-zinc-400" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center px-2 py-1 rounded-lg text-xs bg-white/8 text-zinc-500 font-mono flex-shrink-0">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-[65vh] overflow-y-auto scrollbar-hide">
            {results.length > 0 ? (
              <ul className="p-2">
                {results.map((item, i) => {
                  const isActive = i === activeIndex;
                  const title = item.title || item.name || "";
                  const year = (item.release_date || item.first_air_date)?.substring(0, 4);
                  const isTV = item.media_type === "tv";
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => navigate(item)}
                        onMouseEnter={() => setActiveIndex(i)}
                        className={`w-full flex items-center gap-4 px-3 py-2.5 rounded-xl transition-all text-left ${
                          isActive ? "bg-white/8" : "hover:bg-white/5"
                        }`}
                      >
                        {/* Poster */}
                        <div className="w-10 h-14 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0">
                          {item.poster_path ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                              alt={title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              {isTV ? <Tv className="w-4 h-4 text-zinc-500" /> : <Film className="w-4 h-4 text-zinc-500" />}
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold truncate text-sm">{title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded-md ${
                              isTV ? "bg-indigo-500/20 text-indigo-400" : "bg-rose-500/20 text-rose-400"
                            }`}>
                              {isTV ? "TV" : "Movie"}
                            </span>
                            {year && <span className="text-xs text-zinc-500">{year}</span>}
                            {item.vote_average && item.vote_average > 0 && (
                              <span className="flex items-center gap-0.5 text-xs text-yellow-500">
                                <Star className="w-2.5 h-2.5 fill-yellow-500" />
                                {item.vote_average.toFixed(1)}
                              </span>
                            )}
                          </div>
                        </div>

                        <ArrowUpRight className={`w-4 h-4 text-zinc-600 flex-shrink-0 transition-all ${isActive ? "text-zinc-400" : ""}`} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : query.length >= 2 && !isLoading ? (
              <div className="py-16 text-center text-zinc-500">
                <Search className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="font-medium">No results for "{query}"</p>
                <p className="text-sm mt-1 text-zinc-600">Try a different keyword</p>
              </div>
            ) : !query && recents.length > 0 ? (
              <div className="p-4">
                <p className="text-xs text-zinc-600 uppercase font-bold tracking-wider px-2 mb-2">Recent Searches</p>
                <ul>
                  {recents.map((r) => (
                    <li key={r}>
                      <button
                        onClick={() => setQuery(r)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-all text-left"
                      >
                        <Clock className="w-4 h-4 text-zinc-600 flex-shrink-0" />
                        <span className="text-sm text-zinc-400">{r}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="py-14 text-center text-zinc-600">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Search for anything...</p>
                <p className="text-xs mt-1 text-zinc-700">Use ↑↓ to navigate, ↩ to select</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
