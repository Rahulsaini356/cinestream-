"use client";
import { useState, useEffect } from "react";
import { 
  User, Copy, Mail, Camera, Save, Loader2, 
  Calendar, Shield, Award, Film, MessageSquare, 
  Check, Key, LogOut, ArrowRight, Crown, Clock,
  Trash2, AlertTriangle
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import ForgotPasswordModal from "../auth/ForgotPasswordModal";
import UserAvatar from "../ui/UserAvatar";

interface ProfileClientProps {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    createdAt?: Date | string | null;
    points?: number;
    watchTime?: number;
    isKing?: boolean;
  };
  stats: {
    watchlistCount: number;
    reviewCount: number;
  };
}

export default function ProfileClient({ user, stats }: ProfileClientProps) {
  const { update } = useSession();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user.image || null);
  const [name, setName] = useState(user.name || "");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch("/api/user/delete-account", { method: "DELETE" });
      if (res.ok) {
        if (user.id) {
          localStorage.removeItem(`avatar_${user.id}`);
        }
        await signOut({ callbackUrl: "/" });
      } else {
        alert("Failed to delete account. Please try again.");
      }
    } catch (error) {
      console.error("Account deletion error:", error);
      alert("An error occurred during account deletion.");
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (user.image) {
      setAvatarUrl(user.image);
    } else if (user.id) {
      const savedAvatar = localStorage.getItem(`avatar_${user.id}`);
      if (savedAvatar) {
        setAvatarUrl(savedAvatar);
      }
    }
  }, [user.id, user.image]);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user.id) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const result = reader.result as string;
        setAvatarUrl(result);
        
        // Save to localStorage as a fast client-side fallback/cache
        localStorage.setItem(`avatar_${user.id}`, result);
        
        // Notify Navbar to update corner PFP in real-time
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("avatarUpdated", { detail: { image: result } }));
        }
        
        try {
          // Save to database!
          const res = await fetch("/api/user/update-profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: result }),
          });
          if (res.ok) {
            await update({ image: result });
          } else {
            console.error("Failed to save avatar to database");
          }
        } catch (error) {
          console.error("Error saving avatar to database:", error);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNameSave = async () => {
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/user/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (res.ok) {
        setIsEditing(false);
        await update();
      } else {
        alert("Failed to update name. Please try again.");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyId = () => {
    if (user.id) {
      navigator.clipboard.writeText(user.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Format member date
  const memberDate = user.createdAt 
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "May 2026";

  // Calculate dynamic rank
  const getRank = () => {
    const points = user.points || 0;
    if (points >= 1000) return { title: "Grandmaster Cinephile", color: "from-red-500 to-[#ff6b35]", text: "text-[#ff6b35]" };
    if (points >= 500) return { title: "Elite Critic", color: "from-amber-400 to-yellow-500", text: "text-yellow-400" };
    if (points >= 100) return { title: "Movie Buff", color: "from-indigo-400 to-purple-500", text: "text-purple-400" };
    if (points >= 10) return { title: "Active Streamer", color: "from-emerald-400 to-teal-500", text: "text-emerald-400" };
    return { title: "Cinephile Starter", color: "from-zinc-400 to-zinc-500", text: "text-zinc-400" };
  };

  const rank = getRank();

  // Format watch time
  const formatWatchTime = (mins: number) => {
    if (mins < 60) return `${mins} mins`;
    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return remainingMins > 0 ? `${hrs}h ${remainingMins}m` : `${hrs} hrs`;
  };

  return (
    <div className="space-y-8 animate-fade-up">
      {/* 1. PROFILE HEADER CARD (BANNER) */}
      <div className="relative overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-br from-zinc-950 via-[#0d0d14] to-zinc-900/40 p-6 sm:p-8 shadow-2xl">
        {/* Abstract Glow Shapes in Banner */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#e50914]/8 blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-indigo-500/8 blur-[80px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 sm:gap-8">
          {/* Avatar Upload Container */}
          <div className="relative group cursor-pointer flex-shrink-0">
            {/* Golden Crown for the King */}
            {user.isKing && (
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-20 animate-bounce" style={{ animationDuration: "3s" }}>
                <Crown className="w-8 h-8 text-yellow-400 fill-yellow-400 filter drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
              </div>
            )}

            <div className={`w-32 h-32 rounded-full p-[3px] bg-gradient-to-tr ${
              user.isKing 
                ? "from-yellow-400 via-amber-500 to-yellow-300 shadow-[0_0_35px_rgba(250,204,21,0.6)] ring-2 ring-yellow-400/20" 
                : "from-[#e50914] to-[#ff6b35] shadow-[0_0_30px_rgba(229,9,20,0.3)]"
            }`}>
              <div className="w-full h-full rounded-full overflow-hidden bg-zinc-900 flex items-center justify-center relative">
                <UserAvatar 
                  src={avatarUrl} 
                  iconClassName="w-14 h-14 text-zinc-500" 
                />
              </div>
            </div>
            
            {/* Camera Overlay */}
            <label className="absolute inset-0 flex items-center justify-center bg-black/75 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-full cursor-pointer border border-white/10 backdrop-blur-[2px]">
              <Camera className="w-8 h-8 text-white" />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </label>
          </div>

          {/* User Meta Data */}
          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              {isEditing ? (
                <div className="flex items-center gap-2 max-w-sm w-full">
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    className="flex-1 bg-black/60 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-[#e50914] transition-all text-lg font-medium"
                    placeholder="Enter name..."
                    autoFocus
                  />
                  <button 
                    onClick={handleNameSave} 
                    disabled={isSaving}
                    className="p-2.5 bg-gradient-to-r from-[#e50914] to-[#ff6b35] text-white rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center justify-center disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin"/> : <Save className="w-5 h-5" />}
                  </button>
                </div>
              ) : (
                <h2 
                  onClick={() => setIsEditing(true)}
                  className="text-3xl sm:text-4xl font-black text-white tracking-tight cursor-pointer hover:text-red-400 transition-colors flex items-center justify-center md:justify-start gap-2 group"
                  title="Click to edit name"
                >
                  {name || "Add Name"}
                  {user.isKing && (
                    <Crown className="w-6 h-6 text-yellow-400 fill-yellow-400 filter drop-shadow-[0_0_4px_rgba(250,204,21,0.6)] animate-pulse" />
                  )}
                  <span className="text-xs text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white/5 border border-white/8 px-2.5 py-1 rounded-lg">Edit</span>
                </h2>
              )}
              
              {/* Premium Badge */}
              <span className="px-3 py-1 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 text-red-400 font-extrabold rounded-full text-[10px] uppercase tracking-wider shadow-md">
                Premium
              </span>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-5 gap-y-2 text-sm text-zinc-400 font-medium">
              <span className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-zinc-500" /> {user.email}
              </span>
              <span className="hidden sm:inline text-zinc-600">•</span>
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-zinc-500" /> Member since {memberDate}
              </span>
            </div>
            
            <div className="pt-2 flex justify-center md:justify-start">
              <span className="flex items-center gap-1.5 text-xs bg-white/5 border border-white/8 px-3.5 py-1.5 rounded-full text-zinc-300 font-semibold shadow-inner">
                <Award className={`w-4 h-4 ${rank.text}`} /> Rank: <span className={`${rank.text} font-bold`}>{rank.title}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. DASHBOARD BODY GRID */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: ACCOUNT DETAILS & SECURITY (5 cols) */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-gradient-to-br from-zinc-950 via-[#0d0d14] to-zinc-900/40 border border-white/8 p-6 rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="absolute -top-16 -left-16 w-40 h-40 rounded-full bg-white/2 blur-[40px] pointer-events-none" />
            
            <h3 className="text-lg font-black text-white mb-5 flex items-center gap-2.5">
              <Shield className="w-5 h-5 text-red-500" /> Account Security
            </h3>
            
            <div className="space-y-4 text-sm font-medium">
              
              {/* Account ID Row */}
              <div className="flex justify-between items-center py-3 border-b border-white/5">
                <span className="text-zinc-400">Account ID</span>
                <span className="text-white font-mono flex items-center gap-2 bg-white/5 px-2.5 py-1 rounded-xl border border-white/8 text-xs">
                  {user.id ? `${user.id.substring(0, 8)}...` : "N/A"}
                  {user.id && (
                    <button 
                      onClick={handleCopyId}
                      className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
                      title="Copy full ID"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </span>
              </div>
              
              {/* Subscription Status Row */}
              <div className="flex justify-between items-center py-3 border-b border-white/5">
                <span className="text-zinc-400">Status</span>
                <span className="text-emerald-400 flex items-center gap-1.5 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active
                </span>
              </div>

              {/* Security Actions */}
              <div className="pt-4 space-y-3">
                <button 
                  onClick={() => setIsForgotModalOpen(true)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white/5 border border-white/8 hover:border-white/15 text-white font-bold rounded-2xl text-xs hover:bg-white/10 active:scale-98 transition-all group cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-zinc-400" /> Reset Password
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:translate-x-1 transition-transform" />
                </button>

                <button 
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white/5 border border-white/8 hover:border-white/15 text-zinc-300 font-bold rounded-2xl text-xs hover:bg-white/10 active:scale-98 transition-all group cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <LogOut className="w-4 h-4 text-zinc-400" /> Sign Out Session
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:translate-x-1 transition-transform" />
                </button>

                <button 
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-red-500/10 border border-red-500/20 hover:border-red-500/40 text-red-400 font-bold rounded-2xl text-xs hover:bg-red-500/20 active:scale-98 transition-all group cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-red-400" /> Delete Personal Data & Account
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-red-400/70 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: STATS OVERVIEW & QUICK ACTIONS (7 cols) */}
        <div className="md:col-span-7 space-y-6">
          {/* Stats Grid - 2x2 layout */}
          <div className="grid grid-cols-2 gap-4">
            
            {/* Rank Points */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#0d0d14] to-zinc-900/60 border border-white/8 hover:border-yellow-500/30 p-5 rounded-3xl shadow-xl transition-all duration-300 group hover:shadow-[0_15px_30px_-15px_rgba(250,204,21,0.15)]">
              <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-yellow-500/5 rounded-full blur-[10px] group-hover:bg-yellow-500/10 transition-colors pointer-events-none" />
              <div className="w-10 h-10 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400 mb-4">
                <Crown className="w-5 h-5 fill-yellow-400/20" />
              </div>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Rank Points</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-white tracking-tight">{user.points || 0}</span>
                <span className="text-xs text-zinc-500">pts</span>
              </div>
            </div>

            {/* Watch Time */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#0d0d14] to-zinc-900/60 border border-white/8 hover:border-emerald-500/30 p-5 rounded-3xl shadow-xl transition-all duration-300 group hover:shadow-[0_15px_30px_-15px_rgba(16,185,129,0.15)]">
              <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-emerald-500/5 rounded-full blur-[10px] group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Time Watched</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white tracking-tight leading-none">
                  {formatWatchTime(user.watchTime || 0)}
                </span>
              </div>
            </div>

            {/* Watchlist Counter */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#0d0d14] to-zinc-900/60 border border-white/8 hover:border-indigo-500/30 p-5 rounded-3xl shadow-xl transition-all duration-300 group hover:shadow-[0_15px_30px_-15px_rgba(99,102,241,0.15)]">
              <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-indigo-500/5 rounded-full blur-[10px] group-hover:bg-indigo-500/10 transition-colors pointer-events-none" />
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
                <Film className="w-5 h-5" />
              </div>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Watchlist Items</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-white tracking-tight">{stats.watchlistCount}</span>
                <span className="text-xs text-zinc-500">saved</span>
              </div>
            </div>

            {/* Reviews Counter */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#0d0d14] to-zinc-900/60 border border-white/8 hover:border-[#e50914]/30 p-5 rounded-3xl shadow-xl transition-all duration-300 group hover:shadow-[0_15px_30px_-15px_rgba(229,9,20,0.15)]">
              <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-[#e50914]/5 rounded-full blur-[10px] group-hover:bg-[#e50914]/10 transition-colors pointer-events-none" />
              <div className="w-10 h-10 rounded-2xl bg-[#e50914]/10 border border-[#e50914]/20 flex items-center justify-center text-[#e50914] mb-4">
                <MessageSquare className="w-5 h-5" />
              </div>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Reviews Published</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-white tracking-tight">{stats.reviewCount}</span>
                <span className="text-xs text-zinc-500">written</span>
              </div>
            </div>

          </div>

          {/* Quick Hub / Activity Panel */}
          <div className="bg-gradient-to-br from-zinc-950 via-[#0d0d14] to-zinc-900/40 border border-white/8 p-6 rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-zinc-800/10 rounded-full blur-[50px] pointer-events-none" />
            
            <h4 className="text-sm font-black text-zinc-400 uppercase tracking-widest mb-4">Entertainment Hub</h4>
            
            <div className="space-y-4">
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-white/5 transition-colors">
                <div className="space-y-1">
                  <p className="text-white font-bold text-sm">Ready for a Movie Night?</p>
                  <p className="text-xs text-zinc-500">Browse thousands of trending movies, series and anime.</p>
                </div>
                <Link 
                  href="/movies" 
                  className="flex items-center gap-1.5 text-xs text-red-400 hover:text-white font-bold transition-colors group shrink-0"
                >
                  Browse Now 
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-white/5 transition-colors">
                <div className="space-y-1">
                  <p className="text-white font-bold text-sm">Global Leaderboard</p>
                  <p className="text-xs text-zinc-500">Check who is the King of the CineStream stream ranks.</p>
                </div>
                <Link 
                  href="/leaderboard" 
                  className="flex items-center gap-1.5 text-xs text-yellow-400 hover:text-white font-bold transition-colors group shrink-0"
                >
                  View Leaderboard 
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>

      <ForgotPasswordModal 
        isOpen={isForgotModalOpen} 
        onClose={() => setIsForgotModalOpen(false)} 
        prefillEmail={user.email || ""} 
      />

      {/* 3. ACCOUNT DELETION CONFIRMATION MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-[#0d0d14] border border-red-500/30 rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Delete Account?</h3>
                <p className="text-xs text-red-400/80 font-medium">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Permanently delete your CineStream account, watch history, reviews, watchlists, points, and all associated personal data from our servers.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl text-xs transition-all border border-white/8 cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white font-bold rounded-2xl text-xs shadow-lg hover:shadow-red-500/20 hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" /> Delete Account
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
