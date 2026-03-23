"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Play, Info, Star } from "lucide-react";
import { getImageUrl } from "@/lib/tmdb";
import { motion, AnimatePresence } from "framer-motion";

export default function HeroSlider({ movies }: { movies: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!movies || movies.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, 8000); 
    return () => clearInterval(interval);
  }, [movies]);

  if (!movies || movies.length === 0) return null;

  const currentMovie = movies[currentIndex];

  return (
    <div className="relative h-[85vh] w-full flex items-center overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMovie.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
          style={{
            backgroundImage: `url('${getImageUrl(currentMovie.backdrop_path, "original")}')`,
            backgroundSize: "cover",
            backgroundPosition: "center top",
            zIndex: 0,
          }}
        >
          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMovie.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-7xl font-extrabold max-w-2xl bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent mb-4 tracking-tighter drop-shadow-2xl">
              {currentMovie.title || currentMovie.name}
            </h1>

            <div className="flex items-center gap-4 mb-6 text-sm text-zinc-300 font-medium tracking-wide">
              <span className="flex items-center gap-1 text-yellow-500 bg-black/50 px-2 py-1 rounded-md backdrop-blur-md border border-white/5">
                <Star className="w-4 h-4 fill-yellow-500" />
                {currentMovie.vote_average?.toFixed(1)}
              </span>
              <span className="bg-white/10 px-2 py-1 rounded-md text-white backdrop-blur-md border border-white/5">
                {currentMovie.media_type === "tv" ? "TV Show" : "Movie"}
              </span>
              <span>
                {(currentMovie.release_date || currentMovie.first_air_date)?.substring(0, 4)}
              </span>
            </div>

            <p className="max-w-xl text-lg text-zinc-300 mb-8 line-clamp-3 drop-shadow-md leading-relaxed">
              {currentMovie.overview}
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 max-w-xs sm:max-w-none">
              <Link
                href={`/${currentMovie.media_type === "tv" ? "tv" : "movie"}/${currentMovie.id}`}
                className="flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 hover:border-white/30 text-white font-bold rounded-full hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-black/60 justify-center"
              >
                <Play className="w-5 h-5 fill-white" />
                Play Now
              </Link>
              <Link
                href={`/${currentMovie.media_type === "tv" ? "tv" : "movie"}/${currentMovie.id}`}
                className="flex items-center gap-2 px-8 py-4 bg-zinc-900/40 text-zinc-300 font-bold rounded-full hover:bg-zinc-800/60 backdrop-blur-md border border-white/5 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/40 justify-center"
              >
                <Info className="w-5 h-5" />
                More Info
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Dots indicators */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {movies.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? "w-8 bg-red-600" : "w-3 bg-zinc-600"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
