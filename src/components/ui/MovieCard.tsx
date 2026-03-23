"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Star } from "lucide-react";
import { getImageUrl } from "@/lib/tmdb";

export default function MovieCard({ item, className = "" }: { item: any; className?: string }) {
  const imageUrl = getImageUrl(item.poster_path, "w500");
  const title = item.title || item.name;
  const rating = item.vote_average?.toFixed(1);
  const year = (item.release_date || item.first_air_date)?.substring(0, 4);

  return (
    <Link href={`/${item.title ? "movie" : "tv"}/${item.id}`} className={`snap-start ${className || "min-w-[140px] sm:min-w-[180px] md:min-w-[220px] lg:min-w-[240px]"}`}>
      <motion.div
        whileHover={{ scale: 1.05, y: -8 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative aspect-[2/3] rounded-2xl overflow-hidden cursor-pointer bg-zinc-900 border border-white/5 shadow-xl hover:shadow-[0_20px_40px_-15px_rgba(255,255,255,0.1)] group transition-shadow duration-300"
      >
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out inset-0" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-500 bg-zinc-800">No Cover</div>
        )}

        {/* Ambient Back Glow Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Hover Details overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
          <h3 className="text-white font-bold text-sm sm:text-lg mb-1.5 line-clamp-2 drop-shadow-lg tracking-tight leading-snug">{title}</h3>
          
          <div className="flex items-center gap-3 text-xs sm:text-sm text-zinc-300 font-medium">
            <span className="flex items-center gap-1.5 text-yellow-500 font-bold bg-black/50 px-2 py-1 rounded backdrop-blur-md border border-white/10">
              <Star className="w-3 h-3 md:w-3.5 md:h-3.5 fill-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]" /> {rating}
            </span>
            <span className="opacity-80">{year}</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
