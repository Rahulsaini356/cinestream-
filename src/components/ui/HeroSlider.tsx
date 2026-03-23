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
    <div className="relative min-h-[85vh] h-auto md:h-[85vh] w-full flex items-center overflow-hidden bg-black pb-20 md:pb-0">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMovie.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0"
          style={{
            backgroundImage: `url('${getImageUrl(currentMovie.backdrop_path, "original")}')`,
            backgroundSize: "cover",
            backgroundPosition: "center 20%",
            zIndex: 0,
          }}
        >
          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent z-[1]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent z-[1]" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-20 md:pt-24 pb-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMovie.id}
            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="flex flex-col items-start"
          >
            {/* Tagline / Meta */}
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.8, delay: 0.5 }}
               className="flex flex-wrap items-center gap-4 mb-4 text-xs tracking-[0.2em] uppercase font-bold text-white/70"
            >
              <span className="flex items-center gap-1.5 text-accent bg-accent/10 px-3 py-1.5 rounded-full border border-accent/20">
                <Star className="w-3.5 h-3.5 fill-accent" />
                {currentMovie.vote_average?.toFixed(1)}
              </span>
              <span className="bg-white/10 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
                {currentMovie.media_type === "tv" ? "Series" : "Film"}
              </span>
              <span>
                {(currentMovie.release_date || currentMovie.first_air_date)?.substring(0, 4)}
              </span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black max-w-3xl text-white mb-6 tracking-tighter leading-[1.1] drop-shadow-2xl font-serif">
              {currentMovie.title || currentMovie.name}
            </h1>

            <p className="max-w-xl text-lg md:text-xl text-zinc-300 mb-10 line-clamp-3 leading-relaxed drop-shadow-lg font-medium">
              {currentMovie.overview}
            </p>

            {/* Buttons */}
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8, delay: 0.7 }}
               className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto pb-10 md:pb-0"
            >
              <Link
                href={`/${currentMovie.media_type === "tv" ? "tv" : "movie"}/${currentMovie.id}`}
                className="group flex items-center justify-center gap-3 px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-white/10"
              >
                <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center group-hover:scale-110 transition-transform">
                   <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                </div>
                Listen / Watch
              </Link>
              <Link
                href={`/${currentMovie.media_type === "tv" ? "tv" : "movie"}/${currentMovie.id}`}
                className="flex items-center justify-center gap-3 px-8 py-4 bg-zinc-900/40 text-white font-bold rounded-xl hover:bg-zinc-800/80 backdrop-blur-md border border-white/20 hover:border-white/40 hover:scale-105 active:scale-95 transition-all shadow-xl"
              >
                <Info className="w-5 h-5 opacity-70" />
                More Info
              </Link>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots indicators */}
      <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {movies.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-500 ease-out ${i === currentIndex ? "w-10 bg-accent shadow-[0_0_10px_rgba(229,9,20,0.8)]" : "w-2 bg-white/20 hover:bg-white/50 cursor-pointer"}`}
            onClick={() => setCurrentIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}
