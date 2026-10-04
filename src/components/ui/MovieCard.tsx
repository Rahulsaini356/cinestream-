"use client";
import Image from "next/image";

import Link from "next/link";
import { Star, Play, Plus } from "lucide-react";
import { getImageUrl } from "@/lib/tmdb-client";
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
  const rating = item.vote_average ? Number(item.vote_average).toFixed(1) : null;
  const isTV = item.media_type === "tv" || !!item.first_air_date;
  const posterUrl = getImageUrl(item.poster_path, "w500");

  return (
    <motion.div
      className={`group relative flex-shrink-0 w-[150px] sm:w-[170px] md:w-[185px] snap-start ${className}`}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <Link href={href} prefetch={false} className="block group focus:outline-none">
        {/* Poster Wrapper with refined border and glow */}
        <div className="relative rounded-2xl overflow-hidden bg-[#0c0c14] aspect-[2/3] shadow-lg border border-white/[0.08] group-hover:border-white/30 group-hover:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.8)] transition-all duration-300">
          {item.poster_path && !imgError ? (
            <Image
              src={posterUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              onError={() => setImgError(true)}
              fill
              sizes="(max-width: 640px) 150px, (max-width: 768px) 170px, 185px"
              priority={false}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#0d0d14] text-zinc-500 text-xs text-center p-4">
              {title}
            </div>
          )}

          {/* Hover Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#060608] via-[#060608]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Top Rating Badge */}
          {rating && Number(rating) > 0 && (
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-black/75 backdrop-blur-md rounded-lg px-2 py-0.5 text-[11px] font-bold text-amber-300 border border-white/10 shadow-sm">
              <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
              <span>{rating}</span>
            </div>
          )}

          {/* Top-Right Plus Icon (ShuttleTV Style) */}
          <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white/90 flex items-center justify-center opacity-80 group-hover:opacity-100 group-hover:bg-white group-hover:text-black transition-all shadow-md">
            <Plus className="w-3.5 h-3.5" />
          </div>

          {/* Center Play Icon on Hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
            <div className="w-11 h-11 rounded-full bg-[#e50914] text-white flex items-center justify-center shadow-lg shadow-[#e50914]/50">
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </div>
          </div>

          {/* Quick Year Pill on Hover Bottom */}
          {year && (
            <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
              <span className="text-[11px] font-semibold text-zinc-300 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded border border-white/10">
                {year}
              </span>
            </div>
          )}
        </div>

        {/* Info below card */}
        <div className="mt-3 px-0.5">
          <h3 className="text-sm font-semibold text-zinc-200 truncate group-hover:text-white transition-colors duration-200">
            {title}
          </h3>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-500 font-medium">
            <span>{year || "—"}</span>
            {rating && Number(rating) > 0 && (
              <>
                <span className="w-1 h-1 rounded-full bg-zinc-600" />
                <span className="text-zinc-400">{rating} ★</span>
              </>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
