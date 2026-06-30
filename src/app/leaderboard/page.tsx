import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Crown, Trophy, Medal, Clock, ArrowLeft, User, Sparkles, Star, PlusCircle, Play, Info } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const session = await getServerSession(authOptions);
  
  // Fetch users ordered by points desc
  const leaderboard = await prisma.user.findMany({
    orderBy: {
      points: "desc",
    },
    select: {
      id: true,
      name: true,
      image: true,
      points: true,
      watchTime: true,
    },
    take: 50,
  });

  const formatWatchTime = (mins: number) => {
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return remainingMins > 0 ? `${hrs}h ${remainingMins}m` : `${hrs}h`;
  };

  const getRankBadge = (index: number) => {
    if (index === 0) {
      return (
        <div className="w-8 h-8 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400 relative">
          <Crown className="w-4.5 h-4.5 fill-yellow-400/20" />
        </div>
      );
    }
    if (index === 1) {
      return (
        <div className="w-8 h-8 rounded-full bg-zinc-400/10 border border-zinc-400/30 flex items-center justify-center text-zinc-300">
          <Trophy className="w-4 h-4" />
        </div>
      );
    }
    if (index === 2) {
      return (
        <div className="w-8 h-8 rounded-full bg-amber-700/10 border border-amber-700/30 flex items-center justify-center text-amber-600">
          <Medal className="w-4 h-4" />
        </div>
      );
    }
    return (
      <span className="text-zinc-500 font-bold text-sm w-8 text-center">{index + 1}</span>
    );
  };

  return (
    <main className="min-h-screen bg-[#060608] pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-red-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] rounded-full bg-yellow-500/5 blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto space-y-8 relative z-10 animate-fade-up">
        {/* Navigation / Header */}
        <div className="flex flex-col gap-4">
          <Link href="/profile" className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-semibold w-fit">
            <ArrowLeft className="w-4 h-4" /> Back to Profile
          </Link>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
                <Trophy className="w-8 h-8 text-yellow-400 fill-yellow-400/10" /> 
                Stream Rankings
              </h1>
              <p className="text-sm text-zinc-500 mt-1">Earn points by watching movies, saving watchlists, and writing reviews.</p>
            </div>
            
            <div className="bg-white/5 border border-white/8 px-4 py-2 rounded-2xl text-xs text-zinc-400 font-semibold h-fit flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" /> Live Leaderboard
            </div>
          </div>
        </div>

        {/* Podium/Top 3 Visual Feature */}
        {leaderboard.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-4">
            
            {/* Rank 2 (Silver) */}
            {leaderboard[1] && (
              <div className="order-2 md:order-1 bg-gradient-to-t from-zinc-950 via-[#0d0d14] to-zinc-900/30 border border-white/8 p-6 rounded-3xl text-center flex flex-col items-center gap-3 md:h-[220px] justify-center relative overflow-hidden">
                <div className="absolute top-3 left-3 bg-zinc-400/10 border border-zinc-400/20 text-zinc-300 text-xs px-2.5 py-1 rounded-lg font-bold">#2</div>
                <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center border-2 border-zinc-400 shadow-lg overflow-hidden">
                  {leaderboard[1].image ? (
                    <img src={leaderboard[1].image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-7 h-7 text-zinc-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base truncate max-w-[150px]">{leaderboard[1].name || "Cinephile"}</h3>
                  <p className="text-yellow-400 font-black text-sm mt-0.5">{leaderboard[1].points} pts</p>
                  <p className="text-zinc-500 text-xs mt-1 flex items-center gap-1 justify-center">
                    <Clock className="w-3 h-3" /> {formatWatchTime(leaderboard[1].watchTime)}
                  </p>
                </div>
              </div>
            )}

            {/* Rank 1 (Gold / King) */}
            {leaderboard[0] && (
              <div className="order-1 md:order-2 bg-gradient-to-t from-zinc-950 via-[#0d0d14] to-yellow-950/20 border border-yellow-500/20 p-6 md:p-8 rounded-3xl text-center flex flex-col items-center gap-4 md:h-[260px] justify-center relative overflow-hidden shadow-[0_20px_50px_rgba(250,204,21,0.15)] ring-1 ring-yellow-500/10 scale-100 md:scale-105">
                {/* Floating Crown over PFP */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 animate-bounce" style={{ animationDuration: "3s" }}>
                  <Crown className="w-7 h-7 text-yellow-400 fill-yellow-400 filter drop-shadow-[0_0_6px_rgba(250,204,21,0.6)]" />
                </div>
                <div className="absolute top-3 left-3 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs px-2.5 py-1 rounded-lg font-extrabold">KING</div>
                <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center border-4 border-yellow-400 shadow-2xl overflow-hidden relative">
                  {leaderboard[0].image ? (
                    <img src={leaderboard[0].image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-9 h-9 text-zinc-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-black text-white text-lg truncate max-w-[180px] flex items-center justify-center gap-1">
                    {leaderboard[0].name || "Cinephile"}
                  </h3>
                  <p className="text-yellow-400 font-black text-base mt-0.5">{leaderboard[0].points} pts</p>
                  <p className="text-zinc-400 text-xs mt-1 flex items-center gap-1 justify-center font-medium">
                    <Clock className="w-3.5 h-3.5" /> {formatWatchTime(leaderboard[0].watchTime)}
                  </p>
                </div>
              </div>
            )}

            {/* Rank 3 (Bronze) */}
            {leaderboard[2] && (
              <div className="order-3 bg-gradient-to-t from-zinc-950 via-[#0d0d14] to-zinc-900/30 border border-white/8 p-6 rounded-3xl text-center flex flex-col items-center gap-3 md:h-[220px] justify-center relative overflow-hidden">
                <div className="absolute top-3 left-3 bg-amber-700/10 border border-amber-700/20 text-amber-600 text-xs px-2.5 py-1 rounded-lg font-bold">#3</div>
                <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center border-2 border-amber-600 shadow-lg overflow-hidden">
                  {leaderboard[2].image ? (
                    <img src={leaderboard[2].image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-7 h-7 text-zinc-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base truncate max-w-[150px]">{leaderboard[2].name || "Cinephile"}</h3>
                  <p className="text-yellow-400 font-black text-sm mt-0.5">{leaderboard[2].points} pts</p>
                  <p className="text-zinc-500 text-xs mt-1 flex items-center gap-1 justify-center">
                    <Clock className="w-3 h-3" /> {formatWatchTime(leaderboard[2].watchTime)}
                  </p>
                </div>
              </div>
            )}

          </div>
        )}

        {/* Complete Leaderboard List */}
        <div className="bg-gradient-to-br from-zinc-950 via-[#0d0d14] to-zinc-900/40 border border-white/8 rounded-3xl shadow-2xl overflow-hidden p-2 sm:p-4">
          <div className="px-4 py-3 border-b border-white/5 flex justify-between items-center text-xs uppercase tracking-widest text-zinc-500 font-extrabold">
            <span>Leaderboard Standings</span>
            <span>{leaderboard.length} users ranked</span>
          </div>

          {leaderboard.length === 0 ? (
            <div className="py-16 text-center text-zinc-500 space-y-2">
              <Trophy className="w-12 h-12 mx-auto opacity-10" />
              <p className="font-bold">No rankings available</p>
              <p className="text-xs">Be the first to join and watch movies to rank up!</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {leaderboard.map((u, i) => {
                const isCurrentUser = session?.user?.id === u.id;
                return (
                  <div 
                    key={u.id} 
                    className={`flex items-center justify-between p-4 transition-colors ${
                      isCurrentUser ? "bg-white/[0.03]" : "hover:bg-white/[0.01]"
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Rank Indicator */}
                      <div className="w-8 flex justify-center shrink-0">
                        {getRankBadge(i)}
                      </div>

                      {/* Avatar */}
                      <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center overflow-hidden border ${
                        i === 0 ? "border-yellow-400" : "border-white/10"
                      }`}>
                        {u.image ? (
                          <img src={u.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-4 h-4 text-zinc-500" />
                        )}
                      </div>

                      {/* User Info */}
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate flex items-center gap-1.5">
                          {u.name || "Cinephile"}
                          {isCurrentUser && (
                            <span className="text-[10px] bg-red-500/20 border border-red-500/30 text-red-400 font-bold px-1.5 py-0.5 rounded-md">You</span>
                          )}
                          {i === 0 && (
                            <Crown className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                          )}
                        </p>
                        <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" /> {formatWatchTime(u.watchTime)} watched
                        </p>
                      </div>
                    </div>

                    {/* Points display */}
                    <div className="text-right shrink-0">
                      <p className="text-sm font-black text-white">{u.points} <span className="text-xs text-zinc-500 font-normal">pts</span></p>
                      <p className="text-[10px] text-zinc-500 font-medium">Rank #{i + 1}</p>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Points System Policy / Explanation */}
        <div className="bg-gradient-to-br from-zinc-950 via-[#0d0d14] to-zinc-900/40 border border-white/8 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400">
              <Sparkles className="w-5 h-5 fill-yellow-400/10" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">CineStream Rewards & Rankings</h2>
              <p className="text-xs text-zinc-500">Understand how points are calculated and start climbing the ranks.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Stream Points Card */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-red-400">
                <Play className="w-4.5 h-4.5 fill-red-400/10" />
                <span className="text-xs font-black uppercase tracking-wider">Active Streaming</span>
              </div>
              <p className="text-2xl font-black text-white">+1 <span className="text-xs text-zinc-500 font-bold">Pt / min</span></p>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Watch your favorite movies or TV shows on any server. Get rewarded with 1 point for every single minute of active screen time.
              </p>
            </div>

            {/* Watchlist Points Card */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-indigo-400">
                <PlusCircle className="w-4.5 h-4.5" />
                <span className="text-xs font-black uppercase tracking-wider">Watchlist Curation</span>
              </div>
              <p className="text-2xl font-black text-white">+15 <span className="text-xs text-zinc-500 font-bold">Pts / add</span></p>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Build your perfect entertainment queue. Adding any title to your watchlist grants 15 points (removing deduplicates points).
              </p>
            </div>

            {/* Review Points Card */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-400">
                <Star className="w-4.5 h-4.5 fill-emerald-400/10" />
                <span className="text-xs font-black uppercase tracking-wider">Critique & Reviews</span>
              </div>
              <p className="text-2xl font-black text-white">+50 <span className="text-xs text-zinc-500 font-bold">Pts / review</span></p>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Share your cinema reviews. Writing a detailed rating and review for any title awards you 50 points instantly.
              </p>
            </div>
          </div>

          <div className="border-t border-white/5 pt-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-zinc-500" /> CineStream Rank Progression
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="bg-white/[0.01] border border-white/5 px-4 py-3 rounded-xl text-center">
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">0 - 9 pts</p>
                <p className="text-xs font-extrabold text-zinc-400 mt-1">Cinephile</p>
              </div>
              <div className="bg-emerald-500/[0.02] border border-emerald-500/10 px-4 py-3 rounded-xl text-center">
                <p className="text-[10px] text-emerald-500/50 font-bold uppercase tracking-wider">10 - 99 pts</p>
                <p className="text-xs font-extrabold text-emerald-400 mt-1">Active Streamer</p>
              </div>
              <div className="bg-indigo-500/[0.02] border border-indigo-500/10 px-4 py-3 rounded-xl text-center">
                <p className="text-[10px] text-indigo-500/50 font-bold uppercase tracking-wider">100 - 499 pts</p>
                <p className="text-xs font-extrabold text-purple-400 mt-1">Movie Buff</p>
              </div>
              <div className="bg-amber-500/[0.02] border border-amber-500/10 px-4 py-3 rounded-xl text-center">
                <p className="text-[10px] text-amber-500/50 font-bold uppercase tracking-wider">500 - 999 pts</p>
                <p className="text-xs font-extrabold text-yellow-400 mt-1">Elite Critic</p>
              </div>
              <div className="bg-red-500/[0.02] border border-red-500/10 px-4 py-3 rounded-xl text-center col-span-2 sm:col-span-1">
                <p className="text-[10px] text-red-500/50 font-bold uppercase tracking-wider">1000+ pts</p>
                <p className="text-xs font-extrabold text-[#ff6b35] mt-1">Grandmaster</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
