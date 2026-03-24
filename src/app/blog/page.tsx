import { blogPosts } from "@/lib/blog";
import Link from "next/link";
import { BookOpen, Clock, ArrowRight, Tag } from "lucide-react";
import type { Metadata } from "next";

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

export default function BlogPage() {
  const featured = blogPosts[0];
  const rest = blogPosts.slice(1);

  return (
    <main className="min-h-screen bg-[#060608] pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Blog & Reviews</h1>
            <p className="text-sm text-zinc-500 mt-0.5">Movie reviews, guides & cinema analysis</p>
          </div>
        </div>

        {/* Featured Post */}
        <Link href={`/blog/${featured.slug}`} className="block group mb-12">
          <div className="relative rounded-2xl overflow-hidden aspect-[21/9] sm:aspect-[21/8]">
            <img
              src={featured.coverImage}
              alt={featured.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${categoryColors[featured.category] || "bg-white/10 text-white"}`}>
                  {featured.category}
                </span>
                <span className="flex items-center gap-1 text-xs text-zinc-400">
                  <Clock className="w-3 h-3" />{featured.readTime}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white max-w-2xl leading-tight group-hover:text-[#ff6b35] transition-colors">
                {featured.title}
              </h2>
              <p className="text-zinc-300 mt-2 text-sm max-w-xl line-clamp-2">{featured.excerpt}</p>
              <div className="flex items-center gap-2 mt-4 text-[#ff6b35] text-sm font-semibold">
                Read Article <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </Link>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map((post) => (
            <Link href={`/blog/${post.slug}`} key={post.slug} className="group glass rounded-2xl overflow-hidden hover:border-white/15 transition-all">
              <div className="aspect-video overflow-hidden">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${categoryColors[post.category] || "bg-white/10 text-white"}`}>
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

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {post.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="flex items-center gap-1 text-[10px] text-zinc-600 bg-white/4 px-2 py-0.5 rounded-full">
                      <Tag className="w-2.5 h-2.5" />{tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
