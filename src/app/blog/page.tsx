import { blogPosts } from "@/lib/blog";
import Link from "next/link";
import { BookOpen, Clock, ArrowRight, Tag, Send, Zap, Calendar, TrendingUp } from "lucide-react";
import type { Metadata } from "next";
import { fetchTMDB, getImageUrl } from "@/lib/tmdb";

export const metadata: Metadata = {
  title: "Blog & Movie Reviews — CineStream",
  description: "Movie reviews, streaming guides, top 10 lists, and cinema analysis. Expert opinions on the latest films and shows from CineStream Editorial.",
  keywords: "movie reviews, film blog, streaming guide, top movies, best web series",
  openGraph: {
    title: "CineStream Blog — Movie Reviews & Streaming Guides",
    description: "Expert movie reviews, streaming comparisons, and cinema guides.",
    url: "https://cinestream.digital/blog",
    type: "website",
  },
};

const categoryColors: Record<string, string> = {
  "Top Lists": "bg-yellow-500/20 text-yellow-400",
  "Hindi Content": "bg-orange-500/20 text-orange-400",
  "Best Of": "bg-blue-500/20 text-blue-400",
  "Streaming Guide": "bg-purple-500/20 text-purple-400",
  "Director Spotlight": "bg-rose-500/20 text-rose-400",
  "Guides": "bg-green-500/20 text-green-400",
  "Horror": "bg-red-500/20 text-red-400",
  "Film Education": "bg-indigo-500/20 text-indigo-400",
};

export default async function BlogPage() {
  // Fetch live upcoming movies to power the "Live Cinema News" feed
  let upcomingMovies = [];
  try {
    const upcomingData = await fetchTMDB("/movie/upcoming", { region: "IN", page: "1" });
    upcomingMovies = upcomingData.results?.slice(0, 5) || [];
  } catch (error) {
    console.error("Failed to fetch upcoming movies for blog sidebar:", error);
  }

  const featured = blogPosts[0];
  const rest = blogPosts.slice(1);

  return (
    <main className="min-h-screen bg-[#060608] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Page Header */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Blog & Reviews</h1>
            <p className="text-sm text-zinc-500 mt-0.5">Movie reviews, guides & cinema analysis</p>
          </div>
        </div>

        {/* Two Column Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Editorial & Articles (8 Cols) */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* Featured Post Card */}
            <Link href={`/blog/${featured.slug}`} className="block group">
              <div className="relative rounded-2xl overflow-hidden aspect-[21/9] sm:aspect-[21/8] border border-white/5 group-hover:border-white/10 transition-colors">
                <img
                  src={featured.coverImage}
                  alt={featured.title}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#060608] via-[#060608]/50 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6 sm:p-8 w-full">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-full ${categoryColors[featured.category] || "bg-white/10 text-white"}`}>
                      {featured.category}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-zinc-400">
                      <Clock className="w-3.5 h-3.5" />{featured.readTime}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white max-w-2xl leading-tight group-hover:text-[#ff6b35] transition-colors tracking-tight">
                    {featured.title}
                  </h2>
                  <p className="text-zinc-300 mt-2 text-sm max-w-xl line-clamp-2">{featured.excerpt}</p>
                  <div className="flex items-center gap-2 mt-4 text-[#ff6b35] text-sm font-bold">
                    Read Article 
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>

            {/* Articles Grid list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {rest.map((post) => (
                <Link 
                  href={`/blog/${post.slug}`} 
                  key={post.slug} 
                  className="group glass rounded-2xl overflow-hidden hover:border-white/12 transition-all flex flex-col h-full"
                >
                  <div className="aspect-video overflow-hidden border-b border-white/5 relative">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5 flex flex-col flex-1 justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`text-[9px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-full ${categoryColors[post.category] || "bg-white/10 text-white"}`}>
                          {post.category}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-zinc-500">
                          <Clock className="w-3 h-3" />{post.readTime}
                        </span>
                      </div>
                      <h3 className="text-white font-bold text-sm leading-snug line-clamp-2 group-hover:text-[#ff6b35] transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-zinc-500 text-xs mt-2 line-clamp-2">{post.excerpt}</p>
                    </div>

                    {/* Footer Tags */}
                    <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-white/5">
                      {post.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="flex items-center gap-1 text-[9px] text-zinc-500 bg-white/3 px-2 py-0.5 rounded-full">
                          <Tag className="w-2.5 h-2.5" />{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

          </div>

          {/* RIGHT COLUMN: Sidebar (4 Cols) */}
          <div className="lg:col-span-4 space-y-6 sticky top-24 z-10">
            
            {/* Live Cinema News & Buzz Feed Widget */}
            <div className="glass rounded-2xl p-5 border border-white/5 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-xl pointer-events-none" />
              
              {/* Widget Header */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/5">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Zap className="w-4 h-4 text-red-500 animate-pulse" />
                  <span>Live Cinema News & Buzz</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold tracking-wider animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  LIVE
                </div>
              </div>

              {/* News List Container */}
              <div className="space-y-4">
                {upcomingMovies.length > 0 ? (
                  upcomingMovies.map((movie: any) => (
                    <div 
                      key={movie.id} 
                      className="group/item flex gap-3 p-2.5 rounded-xl hover:bg-white/3 border border-transparent hover:border-white/5 transition-all"
                    >
                      {/* Movie Mini Poster */}
                      <div className="w-12 h-16 rounded bg-zinc-900 border border-white/5 overflow-hidden flex-shrink-0 relative">
                        <img 
                          src={getImageUrl(movie.poster_path, "w500")} 
                          alt={movie.title}
                          className="w-full h-full object-cover group-hover/item:scale-105 transition-transform"
                        />
                      </div>
                      
                      {/* News details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-red-400 tracking-wide uppercase mb-0.5">
                          <Calendar className="w-2.5 h-2.5" />
                          <span>Release: {movie.release_date ? new Date(movie.release_date).toLocaleDateString("en-US", {month: "short", day: "numeric"}) : "TBD"}</span>
                        </div>
                        <h4 className="text-zinc-200 font-bold text-xs leading-tight truncate group-hover/item:text-white transition-colors">
                          {movie.title}
                        </h4>
                        <p className="text-[10px] text-zinc-500 leading-normal line-clamp-2 mt-1">
                          {movie.overview || "Production has wrapped! Keep an eye out for dynamic teasers and official streaming release windows."}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-zinc-600 text-xs">
                    No cinema news available. Please refresh.
                  </div>
                )}
              </div>

              {/* Sidebar Footer Link */}
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-500 font-semibold">
                <span>Data powered by TMDB</span>
                <span className="flex items-center gap-1 text-zinc-400 group hover:text-white transition-colors cursor-default">
                  Hourly Refresh <TrendingUp className="w-3.5 h-3.5 text-zinc-500 group-hover:text-green-400 transition-colors" />
                </span>
              </div>
            </div>

            {/* SLEEK, COMPACT TELEGRAM WIDGET */}
            <div className="glass rounded-2xl border border-blue-500/20 p-4 bg-gradient-to-br from-blue-500/5 to-transparent relative overflow-hidden shadow-xl">
              <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
              
              <div className="flex items-center gap-3">
                {/* Send Icon Bubble */}
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center text-[#229ED9] flex-shrink-0">
                  <Send className="w-4 h-4 animate-pulse" />
                </div>
                
                {/* Description Text */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-extrabold text-xs tracking-tight flex items-center gap-1">
                    CineStream Telegram
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                  </h4>
                  <p className="text-zinc-500 text-[10px] truncate">Instant ad-free download links & requests!</p>
                </div>
                
                {/* Join button */}
                <a
                  href={process.env.NEXT_PUBLIC_TELEGRAM_URL || "https://t.me/cinestreamdigital"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#229ED9] to-[#0088cc] hover:from-[#2ba6e3] hover:to-[#0493dc] text-white text-[11px] font-bold shadow-md hover:shadow-blue-500/20 hover:scale-[1.03] active:scale-95 transition-all"
                >
                  Join
                </a>
              </div>
            </div>

          </div>

        </div>

      </div>
    </main>
  );
}
