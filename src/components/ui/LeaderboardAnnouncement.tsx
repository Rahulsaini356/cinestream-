"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, X, Sparkles, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LeaderboardAnnouncement() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  // Expiry date is set to 5 days from today (June 30, 2026) -> July 5, 2026
  const EXPIRY_DATE = new Date("2026-07-05T23:59:59Z");

  useEffect(() => {
    // Check if the current time is before the expiry date
    const now = new Date();
    const isExpired = now > EXPIRY_DATE;

    // Check if user already dismissed the announcement
    const isDismissed = localStorage.getItem("leaderboard_announcement_dismissed") === "true";

    if (!isExpired && !isDismissed) {
      // Delay showing the popup slightly for a premium feel
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsOpen(false);
    localStorage.setItem("leaderboard_announcement_dismissed", "true");
  };

  const handleNavigate = () => {
    handleDismiss();
    router.push("/leaderboard");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          {/* Backdrop click to dismiss */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
            onClick={handleDismiss}
          />

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-950 via-[#0d0d14] to-zinc-900/60 p-6 sm:p-8 shadow-2xl relative z-10"
          >
            {/* Abstract Glow Background Elements */}
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-yellow-500/10 rounded-full blur-[40px] pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-red-500/10 rounded-full blur-[40px] pointer-events-none" />

            {/* Close Button */}
            <button 
              onClick={handleDismiss}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/5 border border-white/8 text-zinc-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center text-center space-y-5">
              {/* Glowing Trophy Icon container */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-yellow-400 to-amber-500 flex items-center justify-center text-black shadow-[0_0_30px_rgba(250,204,21,0.3)] animate-bounce relative" style={{ animationDuration: "3s" }}>
                <Trophy className="w-8 h-8 fill-yellow-400/20" />
                <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              </div>

              {/* Title & Badge */}
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 text-[10px] font-black uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 fill-yellow-400/10 animate-pulse" /> New Feature
                </span>
                <h3 className="text-2xl font-black text-white tracking-tight">Stream Rankings Live!</h3>
              </div>

              {/* Description */}
              <p className="text-sm text-zinc-400 leading-relaxed">
                We have added a global **Rewards & Points** system! Stream movies, add titles to your watchlist, and write reviews to earn points and climb the rankings. Can you claim the crown?
              </p>

              {/* Action Buttons */}
              <div className="w-full pt-2 flex flex-col gap-3">
                <button
                  onClick={handleNavigate}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#e50914] to-[#ff6b35] hover:opacity-95 text-white font-extrabold rounded-2xl text-sm shadow-lg shadow-red-500/15 hover:scale-102 active:scale-98 transition-all group cursor-pointer"
                >
                  Check Your Rank 
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={handleDismiss}
                  className="w-full py-3 text-zinc-500 hover:text-zinc-300 text-xs font-semibold hover:bg-white/2 rounded-2xl transition-colors cursor-pointer"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
