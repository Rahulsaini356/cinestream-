"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Play, Info, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { getImageUrl } from "@/lib/tmdb";
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
    setProgress(0);
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
    <div className="relative h-[95vh] min-h-[600px] max-h-[900px] w-full overflow-hidden bg-black">
      {/* Background layers */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMovie.id}
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          className="absolute inset-0"
        >
          {currentMovie.backdrop_path && (
            <img
              src={getImageUrl(currentMovie.backdrop_path, "original")}
              alt=""
              className="w-full h-full object-cover object-center"
            />
          )}
          {/* Cinematic overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#060608] via-[#060608]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060608] via-transparent to-[#060608]/30" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#060608]/40 via-transparent to-transparent" />
          {/* Subtle vignette */}
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(6,6,8,0.6) 100%)" }} />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 w-full pt-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMovie.id}
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="max-w-2xl"
            >
              {/* Badges */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-wrap items-center gap-2 mb-4"
              >
                <span className="badge badge-accent">
                  <Star className="w-3 h-3 fill-current" />
                  {currentMovie.vote_average?.toFixed(1)}
                </span>
                <span className="badge badge-indigo">
                  {currentMovie.media_type === "tv" ? "Series" : "Film"}
                </span>
                {(currentMovie.release_date || currentMovie.first_air_date) && (
                  <span className="text-xs text-zinc-400 font-medium">
                    {(currentMovie.release_date || currentMovie.first_air_date).substring(0, 4)}
                  </span>
                )}
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.7 }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.05] mb-4"
                style={{ textShadow: "0 4px 40px rgba(0,0,0,0.8)" }}
              >
                {currentMovie.title || currentMovie.name}
              </motion.h1>

              {/* Overview */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-base md:text-lg text-zinc-300 line-clamp-3 leading-relaxed mb-8 max-w-xl"
              >
                {currentMovie.overview}
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
                className="flex flex-wrap gap-3"
              >
                <Link
                  href={href}
                  className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-white text-black font-bold text-sm hover:bg-zinc-100 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-white/10"
                >
                  <div className="w-7 h-7 rounded-full bg-black flex items-center justify-center">
                    <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />
                  </div>
                  Watch Now
                </Link>
                <Link
                  href={href}
                  className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl glass text-white font-bold text-sm hover:bg-white/10 hover:scale-105 active:scale-95 transition-all"
                >
                  <Info className="w-4 h-4 opacity-80" />
                  More Info
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={goPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full glass flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all hidden md:flex"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={goNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full glass flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all hidden md:flex"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Progress indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {movies.map((_, i) => (
          <button
            key={i}
            onClick={() => { setCurrentIndex(i); setProgress(0); }}
            className="relative h-0.5 rounded-full overflow-hidden transition-all duration-500"
            style={{ width: i === currentIndex ? 48 : 16, background: "rgba(255,255,255,0.2)" }}
          >
            {i === currentIndex && (
              <motion.div
                className="absolute inset-0 rounded-full gradient-accent"
                initial={{ scaleX: 0, originX: 0 }}
                animate={{ scaleX: progress / 100 }}
                transition={{ duration: 0.1 }}
                style={{ transformOrigin: "left" }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
