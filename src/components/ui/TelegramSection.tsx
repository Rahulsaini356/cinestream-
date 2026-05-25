"use client";

import { motion } from "framer-motion";
import { Send, Users, Sparkles, MessageCircle, Flame, Download, CheckCircle2, Heart, ThumbsUp } from "lucide-react";
import { useEffect, useState } from "react";

export default function TelegramSection() {
  const telegramUrl = process.env.NEXT_PUBLIC_TELEGRAM_URL || "https://t.me/cinestreamdigital";
  const [subCount, setSubCount] = useState(15340);

  // Subtle count increment to simulate a live active channel
  useEffect(() => {
    const interval = setInterval(() => {
      setSubCount((prev) => prev + Math.floor(Math.random() * 3));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Formatter for subscriber count
  const formattedCount = new Intl.NumberFormat().format(subCount);

  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[#060608]">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 -translate-y-1/2 w-96 h-96 rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Text Content Area */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-6 flex flex-col justify-center text-left z-10"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-6 w-fit">
              <Send className="w-3.5 h-3.5 animate-pulse" />
              Community Channel
            </div>

            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-6">
              Join Our Premium <br />
              <span className="text-[#229ED9] drop-shadow-[0_0_15px_rgba(34,158,217,0.3)]">
                Telegram Channel
              </span>
            </h2>

            <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
              Never miss a premiere again! Get instant notifications, direct high-speed download links, and stream your favorite movies, TV shows, and anime in pristine quality straight from Telegram.
            </p>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-6 mb-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-[#229ED9]">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-white font-extrabold text-lg leading-tight">{formattedCount}+</div>
                  <div className="text-zinc-500 text-xs font-medium">Cinephiles Active</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
                  <Flame className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="text-white font-extrabold text-lg leading-tight">Daily Drops</div>
                  <div className="text-zinc-500 text-xs font-medium">Fast Server Links</div>
                </div>
              </div>
            </div>

            {/* Features Bullet Points */}
            <ul className="space-y-4 mb-10 text-zinc-300">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#229ED9] flex-shrink-0 mt-0.5" />
                <span><strong>No Pop-up Ads:</strong> Pure entertainment without annoying redirects.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#229ED9] flex-shrink-0 mt-0.5" />
                <span><strong>Premium Request Box:</strong> Request any movie/anime; we upload within an hour!</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#229ED9] flex-shrink-0 mt-0.5" />
                <span><strong>Multiple Resolutions:</strong> 4K HDR, 1080p Web-DL, and data-saver 720p files.</span>
              </li>
            </ul>

            {/* Primary Action Button */}
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#229ED9] to-[#0088cc] hover:from-[#2ba6e3] hover:to-[#0493dc] text-white font-bold text-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-lg hover:shadow-blue-500/30 active:scale-95 group w-fit"
            >
              <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              Join CineStream Channel
            </a>
          </motion.div>

          {/* Interactive Telegram Feed Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 55 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.15 }}
            className="lg:col-span-6 relative"
          >
            {/* Phone/Window frame */}
            <div className="relative glass rounded-3xl border border-white/10 overflow-hidden shadow-2xl shadow-black/80 max-w-[480px] mx-auto">
              
              {/* Channel Header */}
              <div className="bg-[#17212b] border-b border-white/5 px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Channel Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#229ED9] to-[#1272a8] flex items-center justify-center text-white font-black text-sm shadow-md">
                    CS
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-white font-bold text-sm tracking-wide">CineStream Digital</span>
                      <div className="w-3.5 h-3.5 rounded-full bg-[#229ED9] flex items-center justify-center text-white text-[8px] font-bold">
                        ✓
                      </div>
                    </div>
                    <span className="text-xs text-zinc-400">{formattedCount} subscribers</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-zinc-400">
                  <span className="text-xs font-semibold px-2 py-1 rounded bg-[#2b394a] text-blue-400">LIVE FEED</span>
                </div>
              </div>

              {/* Chat Feed Messages */}
              <div className="p-4 space-y-4 max-h-[440px] overflow-y-auto scrollbar-hide bg-[#0e1621] relative">
                
                {/* Message 1 */}
                <div className="flex flex-col gap-1 items-start max-w-[85%]">
                  <div className="bg-[#182533] text-zinc-300 rounded-2xl rounded-tl-none px-4 py-3 shadow-md border border-white/5 text-sm">
                    <p className="text-blue-400 font-bold text-xs mb-1">CineStream Admin 🍿</p>
                    <p>Welcome to <strong>CineStream Digital</strong>! We post the latest high-quality movies, TV series, and anime with ad-free direct download/stream links. Enjoy your stay! 🎉</p>
                    <span className="text-[10px] text-zinc-500 float-right mt-1.5">12:30 PM</span>
                  </div>
                </div>

                {/* Message 2 (Movie Drop Card) */}
                <div className="flex flex-col gap-1 items-start max-w-[90%] ml-auto">
                  <div className="bg-[#2b5278] text-white rounded-2xl rounded-tr-none px-4 py-3.5 shadow-lg border border-blue-400/20 text-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider animate-pulse">New Release</span>
                      <span className="text-[10px] text-blue-200">#LatestMovie</span>
                    </div>

                    <h4 className="font-extrabold text-base mb-1 tracking-tight">
                      🎬 SPIDER-MAN: BEYOND THE SPIDER-VERSE (2026)
                    </h4>
                    <p className="text-xs text-blue-200 mb-3">Genre: Animation | Action | Adventure</p>

                    {/* Styled Movie Card Inside Message */}
                    <div className="rounded-xl overflow-hidden bg-black/30 border border-white/10 p-3 mb-3 flex gap-3">
                      <div className="w-16 h-20 rounded bg-zinc-800 flex-shrink-0 flex items-center justify-center relative overflow-hidden">
                        <img 
                          src="https://images.unsplash.com/photo-1635805737707-575885ab0820?w=120&auto=format&fit=crop&q=60" 
                          alt="Spider-man poster" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col justify-center gap-1.5">
                        <div className="flex flex-wrap gap-1">
                          <span className="bg-blue-500/20 border border-blue-500/30 text-blue-300 text-[9px] font-semibold px-1.5 py-0.5 rounded">4K Ultra HD</span>
                          <span className="bg-green-500/20 border border-green-500/30 text-green-300 text-[9px] font-semibold px-1.5 py-0.5 rounded">Dual Audio</span>
                        </div>
                        <p className="text-[11px] text-zinc-300 line-clamp-2">
                          Miles Morales goes on an epic adventure to save the multiverse from a massive threat.
                        </p>
                      </div>
                    </div>

                    {/* Download Links Grid */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <a 
                        href={telegramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 bg-[#17212b] hover:bg-[#1f2d3a] border border-white/10 text-white text-[11px] font-bold py-2 px-3 rounded-lg transition-colors"
                      >
                        <Download className="w-3.5 h-3.5 text-[#229ED9]" />
                        Download 4K (4.2GB)
                      </a>
                      <a 
                        href={telegramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 bg-[#17212b] hover:bg-[#1f2d3a] border border-white/10 text-white text-[11px] font-bold py-2 px-3 rounded-lg transition-colors"
                      >
                        <Download className="w-3.5 h-3.5 text-[#229ED9]" />
                        Download 1080p (1.8GB)
                      </a>
                    </div>

                    {/* Live Emojis Reaction Container */}
                    <div className="flex items-center gap-1.5 bg-[#1f3c5c] rounded-full px-3 py-1.5 w-fit text-[11px] font-semibold">
                      <span className="flex items-center gap-0.5 hover:scale-125 transition-transform cursor-pointer">👍 <span className="text-[10px] text-zinc-300">412</span></span>
                      <span className="mx-1 text-zinc-500">|</span>
                      <span className="flex items-center gap-0.5 hover:scale-125 transition-transform cursor-pointer">🔥 <span className="text-[10px] text-zinc-300">854</span></span>
                      <span className="mx-1 text-zinc-500">|</span>
                      <span className="flex items-center gap-0.5 hover:scale-125 transition-transform cursor-pointer">❤️ <span className="text-[10px] text-zinc-300">392</span></span>
                    </div>

                    <span className="text-[10px] text-blue-200/60 float-right mt-1">12:35 PM</span>
                  </div>
                </div>

                {/* Message 3 (Anime Upload Notification) */}
                <div className="flex flex-col gap-1 items-start max-w-[85%]">
                  <div className="bg-[#182533] text-zinc-300 rounded-2xl rounded-tl-none px-4 py-3 shadow-md border border-white/5 text-sm">
                    <p className="text-[#229ED9] font-bold text-xs mb-1">CineStream Bot 🤖</p>
                    <p>⚡ REQUEST FULFILLED! ⚡<br />
                    <strong>Demon Slayer: Hashira Training Arc [Movie Edition - Dual Audio ENG/JAP]</strong> is now uploaded on the channel in 1080p & 720p! Check the pinned message to download instantly.</p>
                    
                    <div className="flex items-center gap-2 mt-2.5 bg-[#202e3e] rounded-lg px-2.5 py-1.5 text-xs text-zinc-400">
                      <MessageCircle className="w-3.5 h-3.5 text-blue-400" />
                      <span>Request Portal is currently open!</span>
                    </div>

                    <div className="flex items-center gap-2 mt-3 text-zinc-500 text-[10px]">
                      <span className="flex items-center gap-0.5">🔥 324</span>
                      <span className="flex items-center gap-0.5">❤️ 185</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 float-right mt-1">12:42 PM</span>
                  </div>
                </div>

              </div>
              
              {/* Bottom Join Banner inside feed */}
              <div className="bg-[#17212b] border-t border-white/5 p-4 text-center">
                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center py-2.5 rounded-xl bg-[#229ED9] hover:bg-[#2092c9] text-white text-xs font-bold transition-all shadow-md active:scale-98"
                >
                  Join Channel
                </a>
              </div>

            </div>

            {/* Custom Overlay Decorative Elements */}
            <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 opacity-20 blur-xl pointer-events-none" />
            <div className="absolute -top-6 -left-6 w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 opacity-20 blur-xl pointer-events-none" />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
