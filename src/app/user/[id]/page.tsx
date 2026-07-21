import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { 
  Crown, Trophy, Medal, Clock, ArrowLeft, 
  User, Calendar, Award, Film, MessageSquare, 
  Sparkles, Star
} from "lucide-react";
import UserAvatar from "@/components/ui/UserAvatar";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function PublicProfilePage({ params }: PageProps) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  // 1. Fetch user details and stats
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          watchlist: true,
          reviews: true,
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  // 2. Determine exact leaderboard rank
  const allUsers = await prisma.user.findMany({
    orderBy: { points: "desc" },
    select: { id: true },
  });

  const rankIndex = allUsers.findIndex((u) => u.id === id);
  const rankNumber = rankIndex !== -1 ? rankIndex + 1 : null;

  // 3. Define ranks (same as ProfileClient.tsx)
  const getRankInfo = (points: number) => {
    if (points >= 1000) return { title: "Grandmaster Cinephile", text: "text-[#ff6b35]" };
    if (points >= 500) return { title: "Elite Critic", text: "text-yellow-400" };
    if (points >= 100) return { title: "Movie Buff", text: "text-purple-400" };
    if (points >= 10) return { title: "Active Streamer", text: "text-emerald-400" };
    return { title: "Cinephile Starter", text: "text-zinc-400" };
  };

  const rankInfo = getRankInfo(user.points || 0);

  // 4. Custom badges for Rank 1, 2, 3
  const getRankBadge = (rank: number | null) => {
    if (rank === 1) {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-black uppercase tracking-wider animate-pulse shadow-[0_0_10px_rgba(250,204,21,0.2)]">
          <Crown className="w-3.5 h-3.5 fill-yellow-400/20" /> KING / RANK #1
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-400/10 border border-zinc-400/30 text-zinc-300 text-xs font-black uppercase tracking-wider">
          <Trophy className="w-3.5 h-3.5" /> RANK #2
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-700/10 border border-amber-700/30 text-amber-600 text-xs font-black uppercase tracking-wider">
          <Medal className="w-3.5 h-3.5" /> RANK #3
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/8 text-zinc-400 text-xs font-bold uppercase tracking-wider">
        RANK #{rank}
      </div>
    );
  };

  // Format watch time
  const formatWatchTime = (mins: number) => {
    if (mins < 60) return `${mins} mins`;
    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return remainingMins > 0 ? `${hrs}h ${remainingMins}m` : `${hrs} hrs`;
  };

  const memberDate = user.createdAt 
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "May 2026";

  // Border and shadow classes for top 3 avatars
  const avatarBorderClass = rankNumber === 1
    ? "from-yellow-400 via-amber-500 to-yellow-300 shadow-[0_0_35px_rgba(250,204,21,0.5)] ring-2 ring-yellow-400/20"
    : rankNumber === 2
    ? "from-zinc-300 via-zinc-400 to-zinc-200 shadow-[0_0_25px_rgba(228,228,231,0.3)] ring-2 ring-zinc-400/20"
    : rankNumber === 3
    ? "from-amber-600 to-amber-700 shadow-[0_0_20px_rgba(180,83,9,0.3)]"
    : "from-[#e50914] to-[#ff6b35]";

  return (
    <main className="min-h-screen bg-[#060608] pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-red-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] rounded-full bg-yellow-500/5 blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto space-y-8 relative z-10 animate-fade-up">
        {/* Navigation back */}
        <Link 
          href="/leaderboard" 
          className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-semibold w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Rankings
        </Link>

        {/* 1. PUBLIC PROFILE BANNER */}
        <div className="relative overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-br from-zinc-950 via-[#0d0d14] to-zinc-900/40 p-6 sm:p-8 shadow-2xl">
          {/* Abstract Glow Shapes in Banner */}
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#e50914]/5 blur-[80px] pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-yellow-500/5 blur-[80px] pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 sm:gap-8">
            {/* Avatar Container */}
            <div className="relative flex-shrink-0">
              {/* Floating Crown for rank #1 */}
              {rankNumber === 1 && (
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-20 animate-bounce" style={{ animationDuration: "3s" }}>
                  <Crown className="w-8 h-8 text-yellow-400 fill-yellow-400 filter drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
                </div>
              )}

              <div className={`w-32 h-32 rounded-full p-[3px] bg-gradient-to-tr ${avatarBorderClass}`}>
                <div className="w-full h-full rounded-full overflow-hidden bg-zinc-900 flex items-center justify-center relative">
                  <UserAvatar 
                    src={user.image} 
                    iconClassName="w-14 h-14 text-zinc-500" 
                  />
                </div>
              </div>
            </div>

            {/* User Metadata */}
            <div className="flex-1 text-center md:text-left space-y-3">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-2">
                  {user.name || "CineStream User"}
                  {rankNumber === 1 && (
                    <Crown className="w-6 h-6 text-yellow-400 fill-yellow-400 filter drop-shadow-[0_0_4px_rgba(250,204,21,0.6)]" />
                  )}
                </h2>
                
                {/* Custom Rank Badge */}
                {getRankBadge(rankNumber)}
              </div>

              <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-5 gap-y-2 text-sm text-zinc-400 font-medium">
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-zinc-500" /> Member since {memberDate}
                </span>
              </div>
              
              <div className="pt-2 flex justify-center md:justify-start">
                <span className="flex items-center gap-1.5 text-xs bg-white/5 border border-white/8 px-3.5 py-1.5 rounded-full text-zinc-300 font-semibold shadow-inner">
                  <Award className={`w-4 h-4 ${rankInfo.text}`} /> Rank: <span className={`${rankInfo.text} font-bold`}>{rankInfo.title}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. STATS GRID & DETAILS */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* STATS TILES (Full Width on Public view) */}
          <div className="md:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-4">
            
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
                <span className="text-2xl font-black text-white tracking-tight leading-none">
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
                <span className="text-4xl font-black text-white tracking-tight">{user._count.watchlist}</span>
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
                <span className="text-4xl font-black text-white tracking-tight">{user._count.reviews}</span>
                <span className="text-xs text-zinc-500">written</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </main>
  );
}
