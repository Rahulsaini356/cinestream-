"use client";
import Image from "next/image";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, LogOut, Search, Menu, X, Bookmark, ChevronDown, Send, Crown, Home, Film, Tv, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SearchModal from "@/components/search/SearchModal";
import UserAvatar from "@/components/ui/UserAvatar";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isKing, setIsKing] = useState(false);

  useEffect(() => {
    if (session?.user?.image) {
      setTimeout(() => {
        setAvatarUrl(session.user.image || null);
      }, 0);
    } else if (session?.user?.id) {
      const saved = localStorage.getItem(`avatar_${session.user.id}`);
      if (saved) {
        setTimeout(() => {
          setAvatarUrl(saved);
        }, 0);
      }
    } else {
      setTimeout(() => {
        setAvatarUrl(null);
      }, 0);
    }
  }, [session?.user?.id, session?.user?.image]);

  useEffect(() => {
    const handleAvatarUpdate = (e: any) => {
      if (e.detail?.image) {
        setAvatarUrl(e.detail.image);
      }
    };
    window.addEventListener("avatarUpdated", handleAvatarUpdate);
    return () => window.removeEventListener("avatarUpdated", handleAvatarUpdate);
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      fetch("/api/leaderboard")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.leaderboard?.length > 0) {
            setIsKing(data.leaderboard[0].id === session.user.id);
          }
        })
        .catch((err) => console.error("Error fetching leaderboard in navbar:", err));
    } else {
      Promise.resolve().then(() => {
        setIsKing(false);
      });
    }
  }, [session?.user?.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
        setDropdownOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (pathname === "/login" || pathname === "/signup") return null;

  const navLinks = [
    { name: "Home", href: "/", icon: <Home className="w-3.5 h-3.5" /> },
    { name: "Movies", href: "/movies", icon: <Film className="w-3.5 h-3.5" /> },
    { name: "Series", href: "/tv", icon: <Tv className="w-3.5 h-3.5" /> },
    { name: "Anime", href: "/anime", icon: <Sparkles className="w-3.5 h-3.5" /> },
    { name: "Top", href: "/leaderboard", icon: <Crown className="w-3.5 h-3.5" /> },
    { name: "List", href: "/watchlist", icon: <Bookmark className="w-3.5 h-3.5" /> },
  ];

  return (
    <>
      {/* Floating Centered Pill Navbar (Vivarium & ShuttleTV Style) */}
      <header className="fixed top-3 sm:top-4 inset-x-0 z-50 flex justify-center px-3 sm:px-6 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-[#0a0a10]/85 backdrop-blur-2xl border border-white/15 shadow-[0_12px_45px_rgba(0,0,0,0.85)] max-w-full">
          {/* Logo / Home icon button */}
          <Link
            href="/"
            className="w-8 h-8 rounded-full gradient-accent flex items-center justify-center shadow-md hover:scale-105 transition-transform shrink-0"
            title="CineStream Home"
          >
            <Image src="/icon.svg" alt="CineStream" className="w-4 h-4" width={16} height={16} />
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1 pl-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  prefetch={false}
                  className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                    isActive
                      ? "bg-white text-black shadow-md"
                      : "text-zinc-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {link.icon}
                  <span>{link.name}</span>
                  {link.name === "Top" && (
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-yellow-500" />
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Divider */}
          <div className="h-4 w-px bg-white/15 mx-1 hidden md:block" />

          {/* Action icons */}
          <div className="flex items-center gap-1">
            {/* Search icon button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              title="Search (⌘K)"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Telegram Community */}
            <a
              href={process.env.NEXT_PUBLIC_TELEGRAM_URL || "https://t.me/telegram"}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full hidden sm:flex items-center justify-center text-zinc-300 hover:text-[#229ED9] hover:bg-blue-500/10 transition-all relative"
              title="Join Telegram Community"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse shadow-[0_0_6px_#229ED9]" />
            </a>

            {/* Profile Avatar / Dropdown */}
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center pl-0.5 rounded-full hover:opacity-90 transition-all relative cursor-pointer"
                >
                  {isKing && (
                    <div className="absolute -top-3.5 left-1 z-20">
                      <Crown className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 filter drop-shadow-[0_0_2px_rgba(250,204,21,0.6)]" />
                    </div>
                  )}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 ${
                      isKing
                        ? "bg-gradient-to-br from-yellow-400 to-amber-500 border border-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.4)]"
                        : "bg-gradient-to-br from-[#e50914] to-[#ff6b35] border border-white/20"
                    }`}
                  >
                    <UserAvatar
                      src={avatarUrl || session.user?.image}
                      iconClassName="w-3.5 h-3.5 text-white"
                    />
                  </div>
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-3 w-56 bg-[#0a0a10]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl shadow-black/90 overflow-hidden z-50"
                      onMouseLeave={() => setDropdownOpen(false)}
                    >
                      <div className="px-4 py-3 border-b border-white/8">
                        <p className="text-sm font-semibold text-white truncate">{session.user?.name || "CineStream User"}</p>
                        <p className="text-xs text-zinc-400 truncate mt-0.5">{session.user?.email}</p>
                      </div>
                      <div className="p-1.5">
                        <Link
                          href="/profile"
                          prefetch={false}
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                        >
                          <User className="w-4 h-4" /> Profile
                        </Link>
                        <Link
                          href="/watchlist"
                          prefetch={false}
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                        >
                          <Bookmark className="w-4 h-4" /> My Watchlist
                        </Link>
                        <div className="h-px bg-white/5 my-1.5" />
                        <button
                          onClick={() => { setDropdownOpen(false); signOut(); }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all text-left cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href="/login"
                prefetch={false}
                className="px-3 py-1 rounded-full bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-all shadow-md ml-1"
              >
                Sign In
              </Link>
            )}

            {/* Mobile hamburger menu */}
            <button
              className="md:hidden w-8 h-8 rounded-full flex items-center justify-center text-zinc-300 hover:text-white hover:bg-white/10 transition-all ml-0.5"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#060608]/98 backdrop-blur-xl"
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 250 }}
              className="absolute inset-0 flex flex-col pt-6 px-6"
            >
              <div className="flex items-center justify-between mb-10">
                <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl gradient-accent flex items-center justify-center">
                    <Image src="/icon.svg" alt="CineStream" className="w-5 h-5" width={20} height={20} />
                  </div>
                  <span className="text-lg font-black">
                    <span className="gradient-accent-text">Cine</span>
                    <span className="text-white">Stream</span>
                  </span>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Search Button */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setSearchOpen(true);
                }}
                className="flex items-center gap-3 px-4 py-3.5 mb-4 rounded-xl bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 transition-all text-base w-full"
              >
                <Search className="w-5 h-5 text-zinc-400" />
                <span>Search movies, TV & anime...</span>
              </button>

              <nav className="flex flex-col gap-1">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                  >
                    <Link
                      href={link.href}
                      prefetch={false}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`px-4 py-3.5 rounded-xl text-lg font-semibold transition-all flex items-center justify-between ${
                        pathname === link.href
                          ? "text-white bg-white/10"
                          : "text-zinc-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <span>{link.name}</span>
                      {link.name === "Leaderboard" && (
                        <span className="text-[10px] bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider animate-pulse">
                          New
                        </span>
                      )}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Mobile Telegram Link banner */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-auto mb-6 animate-fade-up"
              >
                <a
                  href={process.env.NEXT_PUBLIC_TELEGRAM_URL || "https://t.me/telegram"}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 to-indigo-500/5 border border-blue-500/20 hover:border-blue-500/40 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-[#229ED9]">
                      <Send className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="text-left">
                      <div className="text-white text-sm font-extrabold flex items-center gap-1">
                        CineStream Telegram
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                      </div>
                      <div className="text-zinc-400 text-xs font-medium">Join for instant movie drops!</div>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:bg-white/10 transition-all">
                    →
                  </div>
                </a>
              </motion.div>

              <div className="pb-10">
                {session ? (
                  <button
                    onClick={() => { setMobileMenuOpen(false); signOut(); }}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl text-lg font-semibold transition-all"
                  >
                    <LogOut className="w-5 h-5" /> Sign Out
                  </button>
                ) : (
                  <Link
                    href="/login"
                    prefetch={false}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center px-4 py-3.5 rounded-xl gradient-accent text-white font-bold text-lg"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
