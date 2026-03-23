"use client";

import { useState, useEffect } from "react";
import { User, Copy, Mail, Camera, Save, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import ForgotPasswordModal from "../auth/ForgotPasswordModal";

export default function ProfileClient({ user, stats }: { user: any, stats: any }) {
  const { update } = useSession();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [name, setName] = useState(user.name || "");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  useEffect(() => {
    // Load avatar from local storage
    const savedAvatar = localStorage.getItem(`avatar_${user.id}`);
    if (savedAvatar) {
      setAvatarUrl(savedAvatar);
    }
  }, [user.id]);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarUrl(result);
        localStorage.setItem(`avatar_${user.id}`, result);
        update({ image: result }); // Try to update session if NextAuth supports it
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
        await update(); // Refresh session
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="col-span-1 flex flex-col items-center p-8 glass-morphism rounded-2xl shadow-2xl">
        <div className="relative group cursor-pointer mb-6">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-zinc-800 ring-4 ring-white/10 flex items-center justify-center">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-12 h-12 text-zinc-500" />
            )}
          </div>
          <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer">
            <Camera className="w-8 h-8 text-white" />
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </label>
        </div>
        
        {isEditing ? (
          <div className="w-full flex items-center gap-2 mb-2">
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className="flex-1 bg-black border border-white/20 rounded-lg px-3 py-2 text-white outline-none"
            />
            <button onClick={handleNameSave} className="p-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors">
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin"/> : <Save className="w-5 h-5" />}
            </button>
          </div>
        ) : (
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2 cursor-pointer hover:text-accent transition-colors" onClick={() => setIsEditing(true)} title="Click to edit">
            {name}
          </h2>
        )}
        
        <p className="text-zinc-400 flex items-center gap-2 text-sm mt-1">
          <Mail className="w-4 h-4" /> {user.email}
        </p>
      </div>

      <div className="col-span-1 md:col-span-2 space-y-6">
        <div className="p-8 glass-morphism rounded-2xl shadow-2xl">
          <h3 className="text-xl font-bold text-white mb-6">Account Details</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-4 border-b border-white/5">
              <span className="text-zinc-400">Account ID</span>
              <span className="text-white font-mono flex items-center gap-2">
                {user.id ? `${user.id.substring(0, 8)}...` : "N/A"}
                {user.id && <button title="Copy ID"><Copy className="w-4 h-4 text-zinc-500 hover:text-white" /></button>}
              </span>
            </div>
            <div className="flex justify-between items-center py-4 border-b border-white/5">
              <span className="text-zinc-400">Subscription</span>
              <span className="px-3 py-1 bg-accent/20 text-accent font-medium rounded-full text-xs uppercase tracking-wider shadow-sm">Premium</span>
            </div>
            <div className="flex justify-between items-center py-4 border-b border-white/5">
              <span className="text-zinc-400">Member Since</span>
              <span className="text-white">March 2026</span>
            </div>
            <div className="flex justify-between items-center py-4">
              <span className="text-zinc-400">Password</span>
              <button 
                onClick={() => setIsForgotModalOpen(true)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl text-xs hover:scale-105 active:scale-95 transition-all shadow-md border border-white/10"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>

        <div className="p-8 glass-morphism rounded-2xl shadow-2xl">
          <h3 className="text-xl font-bold text-white mb-6">Your Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 bg-black/40 rounded-xl border border-white/5 shadow-inner hover-glow transition-all">
              <p className="text-zinc-500 text-sm font-medium mb-2 uppercase tracking-wide">Watchlist</p>
              <p className="text-4xl font-bold text-white">{stats.watchlistCount}</p>
            </div>
            <div className="p-5 bg-black/40 rounded-xl border border-white/5 shadow-inner hover-glow transition-all">
              <p className="text-zinc-500 text-sm font-medium mb-2 uppercase tracking-wide">Reviews</p>
              <p className="text-4xl font-bold text-white">0</p>
            </div>
          </div>
        </div>
      </div>
      <ForgotPasswordModal isOpen={isForgotModalOpen} onClose={() => setIsForgotModalOpen(false)} />
    </div>
  );
}
