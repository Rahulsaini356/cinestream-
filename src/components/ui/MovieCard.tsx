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
        whileHover={{ scale: 1.08, y: -4 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="relative aspect-[2/3] rounded-xl overflow-hidden cursor-pointer bg-zinc-900 border border-white/5 shadow-2xl group"
      >
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-500 bg-zinc-800">No Image</div>
        )}

        {/* Ambient Back Glow Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />

        {/* Hover Details overlay */}
        <div className="absolute inset-0 p-4 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[2px]">
          <h3 className="text-white font-bold text-sm sm:text-base mb-2 line-clamp-2 drop-shadow-md tracking-tight">{title}</h3>
          
          <div className="flex items-center justify-between text-xs text-zinc-300">
            <span className="font-medium">{year}</span>
            <span className="flex items-center gap-1 text-yellow-500 font-bold bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-sm">
              <Star className="w-3 h-3 fill-yellow-500" /> {rating}
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
