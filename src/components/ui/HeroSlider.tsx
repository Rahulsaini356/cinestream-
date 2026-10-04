"use client";
import Image from "next/image";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Play, Info, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { getImageUrl } from "@/lib/tmdb-client";
import { motion, AnimatePresence } from "framer-motion";

export default function HeroSlider({ movies }: { movies: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const DURATION = 8000;

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % movies.length);
    setProgress(0);
  }, [movies.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length);
    setProgress(0);
  }, [movies.length]);

  useEffect(() => {
    if (!movies || movies.length <= 1) return;
    const interval = setInterval(goNext, DURATION);
    return () => clearInterval(interval);
  }, [movies, goNext]);

  useEffect(() => {
    const start = Date.now();
    const frame = () => {
      const elapsed = Date.now() - start;
      setProgress(Math.min((elapsed / DURATION) * 100, 100));
      if (elapsed < DURATION) requestAnimationFrame(frame);
    };
    const raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [currentIndex]);

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev]);

  if (!movies || movies.length === 0) return null;

  const currentMovie = movies[currentIndex];
  const mediaType = currentMovie.media_type === "tv" ? "tv" : "movie";
  const href = `/${mediaType}/${currentMovie.id}`;

  return (
    <div className="relative h-[80vh] sm:h-[88vh] md:h-[92vh] min-h-[520px] max-h-[900px] w-full overflow-hidden bg-black">
      {/* Background layers */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMovie.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-0"
        >
          {currentMovie.backdrop_path && (
            <Image
              src={getImageUrl(currentMovie.backdrop_path, "original")}
              alt={currentMovie.title || currentMovie.name || "Hero backdrop"}
              className="w-full h-full object-cover object-center"
              fill
              priority
              sizes="100vw"
            />
          )}

          {/* Multi-layered cinematic overlays */}
          {/* Deep left-to-right fade for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#060608] via-[#060608]/85 via-45% to-transparent" />
          
          {/* Bottom fade into page background */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#060608] via-[#060608]/50 via-25% to-transparent" />
          
          {/* Top fade for navbar readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#060608]/80 via-transparent to-transparent h-32" />
          
          {/* Atmospheric warm cinema glow on bottom left */}
          <div 
            className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full pointer-events-none opacity-25 blur-3xl"
            style={{ background: "radial-gradient(circle, #e50914 0%, transparent 70%)" }}
          />

          {/* Subtle perimeter vignette */}
          <div 
            className="absolute inset-0 pointer-events-none" 
            style={{ background: "radial-gradient(ellipse at 70% 30%, transparent 40%, rgba(6,6,8,0.7) 100%)" }} 
          />
        </motion.div>
      </AnimatePresence>

      {/* Hero Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-16 sm:pt-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMovie.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="max-w-2xl lg:max-w-3xl"
            >
              {/* Badges & Meta Row (Vivarium / ShuttleTV Style) */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="flex items-center gap-2.5 sm:gap-3 mb-4 text-xs sm:text-sm font-semibold text-zinc-300"
              >
                {/* Circular Rating Badge */}
                {currentMovie.vote_average > 0 && (
                  <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-emerald-400 text-emerald-400 flex items-center justify-center font-bold text-xs bg-black/50 shadow-sm shrink-0">
                    {currentMovie.vote_average.toFixed(1)}
                  </span>
                )}

                {/* Dot */}
                <span className="text-zinc-500 font-bold">•</span>

                {/* Release Year */}
                {(currentMovie.release_date || currentMovie.first_air_date) && (
                  <span className="text-white font-bold">
                    {(currentMovie.release_date || currentMovie.first_air_date).substring(0, 4)}
                  </span>
                )}

                {/* Dot */}
                <span className="text-zinc-500 font-bold">•</span>

                {/* Media Type / Genre */}
                <span className="text-zinc-300">
                  {currentMovie.media_type === "tv" ? "TV Series" : "Movie"}
                </span>

                {/* Age Rating Circle Pill */}
                <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-pink-500/20 border border-pink-500/40 text-pink-300 text-[10px] font-black flex items-center justify-center shrink-0">
                  15
                </span>
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.6 }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.05] mb-4 drop-shadow-[0_4px_30px_rgba(0,0,0,0.9)]"
              >
                {currentMovie.title || currentMovie.name}
              </motion.h1>

              {/* Overview */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="text-sm sm:text-base md:text-lg text-zinc-200 line-clamp-2 md:line-clamp-3 leading-relaxed mb-8 max-w-xl text-shadow-sm font-normal"
              >
                {currentMovie.overview}
              </motion.p>

              {/* Action Buttons (Play & Details Pills) */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="flex items-center gap-3.5"
              >
                {/* Play Pill Button */}
                <Link
                  href={href}
                  prefetch={false}
                  className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-white text-black font-extrabold text-sm hover:bg-zinc-200 hover:scale-105 active:scale-95 transition-all duration-200 shadow-2xl"
                >
                  <Play className="w-4 h-4 fill-black text-black ml-0.5" />
                  <span>Play</span>
                </Link>

                {/* Details Pill Button */}
                <Link
                  href={href}
                  prefetch={false}
                  className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-black/40 hover:bg-black/70 border border-white/20 backdrop-blur-md text-white font-bold text-sm hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  <span>Details</span>
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Floating Navigation Controls */}
      <button
        onClick={goPrev}
        aria-label="Previous slide"
        className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/15 text-white/80 hover:text-white items-center justify-center transition-all duration-200 hidden md:flex shadow-xl cursor-pointer hover:scale-110 active:scale-95"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={goNext}
        aria-label="Next slide"
        className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/15 text-white/80 hover:text-white items-center justify-center transition-all duration-200 hidden md:flex shadow-xl cursor-pointer hover:scale-110 active:scale-95"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Slide Indicator Dots (Centered at bottom) */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5">
        {movies.map((_, i) => (
          <button
            key={i}
            onClick={() => { setCurrentIndex(i); setProgress(0); }}
            aria-label={`Go to slide ${i + 1}`}
            className={`rounded-full transition-all duration-300 cursor-pointer ${
              i === currentIndex
                ? "w-2.5 h-2.5 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                : "w-2 h-2 bg-white/30 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
