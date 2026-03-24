"use client";

import Link from "next/link";
import { Star, Plus, Check, Info } from "lucide-react";
import { getImageUrl } from "@/lib/tmdb";
import { motion } from "framer-motion";
import { useState } from "react";

interface MovieCardProps {
  item: any;
  className?: string;
}

export default function MovieCard({ item, className = "" }: MovieCardProps) {
  const [imgError, setImgError] = useState(false);

  const href = `/${item.media_type === "tv" || item.first_air_date ? "tv" : "movie"}/${item.id}`;
  const title = item.title || item.name || "Unknown";
  const year = (item.release_date || item.first_air_date)?.substring(0, 4);
  const rating = item.vote_average?.toFixed(1);
  const isTV = item.media_type === "tv" || !!item.first_air_date;
  const posterUrl = getImageUrl(item.poster_path, "w500");

  return (
    <motion.div
      className={`group relative flex-shrink-0 w-[160px] sm:w-[180px] snap-start ${className}`}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <Link href={href} className="block">
        {/* Poster */}
        <div className="relative rounded-xl overflow-hidden bg-[#0d0d14] aspect-[2/3] shadow-xl">
          {item.poster_path && !imgError ? (
            <img
              src={posterUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setImgError(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#0d0d14] text-zinc-600 text-xs text-center p-4">
              {title}
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Rating badge */}
          {rating && rating > 0 && (
            <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded-full px-2 py-0.5 text-[11px] font-bold text-yellow-400">
              <Star className="w-2.5 h-2.5 fill-yellow-400" />
              {rating}
            </div>
          )}

          {/* Type badge */}
          <div className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm ${
            isTV
              ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
              : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
          }`}>
            {isTV ? "TV" : "Film"}
          </div>

          {/* Hover actions */}
          <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <span className="text-xs font-semibold text-white truncate flex-1 mr-2">{year}</span>
            <div className="flex items-center gap-1.5">
              <div className="w-7 h-7 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors">
                <Info className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Info below card */}
        <div className="mt-2.5 px-0.5">
          <h3 className="text-sm font-semibold text-zinc-100 truncate group-hover:text-white transition-colors">
            {title}
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">{year || "—"}</p>
        </div>
      </Link>
    </motion.div>
  );
}
