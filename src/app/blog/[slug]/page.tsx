import { getBlogPost, getRelatedPosts, blogPosts } from "@/lib/blog";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, Tag, ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import type { Metadata } from "next";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} — CineStream Blog`,
    description: post.excerpt,
    keywords: post.tags.join(", "),
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      url: `https://cinestream.digital/blog/${slug}`,
      images: [{ url: post.coverImage, width: 1280, height: 720 }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
    },
  };
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const related = getRelatedPosts(slug, post.category, 3);

  return (
    <main className="min-h-screen bg-[#060608] pt-20 pb-24">
      {/* Hero */}
      <div className="relative w-full aspect-[16/6] max-h-[520px] overflow-hidden">
        <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060608] via-[#060608]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#060608]/80 via-transparent to-transparent" />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-24 relative z-10">
        {/* Back link */}
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400">
            {post.category}
          </span>
          <span className="flex items-center gap-1 text-xs text-zinc-500">
            <Clock className="w-3 h-3" /> {post.readTime}
          </span>
          <span className="text-xs text-zinc-600">
            {new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </span>
          <span className="text-xs text-zinc-600">by {post.author}</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-4 tracking-tight">
          {post.title}
        </h1>
        <p className="text-zinc-400 text-lg leading-relaxed mb-8">{post.excerpt}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-10 pb-8 border-b border-white/8">
          {post.tags.map((tag) => (
            <span key={tag} className="flex items-center gap-1.5 text-xs text-zinc-500 bg-white/5 border border-white/8 px-3 py-1 rounded-full">
              <Tag className="w-3 h-3" /> {tag}
            </span>
          ))}
        </div>

        {/* Article Content */}
        <article
          className="prose prose-invert prose-lg max-w-none
            prose-headings:text-white prose-headings:font-bold
            prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-b prose-h2:border-white/10 prose-h2:pb-3
            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-h3:text-[#ff6b35]
            prose-p:text-zinc-300 prose-p:leading-relaxed prose-p:mb-5
            prose-strong:text-white
            prose-ul:text-zinc-300 prose-ul:space-y-2
            prose-ol:text-zinc-300 prose-ol:space-y-2
            prose-li:marker:text-[#e50914]
            prose-a:text-[#ff6b35] prose-a:no-underline hover:prose-a:underline"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Author block */}
        <div className="mt-16 p-6 glass rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-full gradient-accent flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold">{post.author}</p>
            <p className="text-sm text-zinc-500">Film critics and movie enthusiasts curating the best content for CineStream readers.</p>
          </div>
        </div>
      </div>

      {/* Related Posts */}
      {related.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-20">
          <h2 className="text-2xl font-black text-white mb-6">More From the Blog</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {related.map((r) => (
              <Link href={`/blog/${r.slug}`} key={r.slug} className="group glass rounded-2xl overflow-hidden hover:border-white/15 transition-all">
                <div className="aspect-video overflow-hidden">
                  <img src={r.coverImage} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-5">
                  <span className="text-[11px] font-bold text-rose-400">{r.category}</span>
                  <h3 className="text-white font-bold text-sm leading-snug mt-1 line-clamp-2 group-hover:text-[#ff6b35] transition-colors">
                    {r.title}
                  </h3>
                  <div className="flex items-center gap-1 mt-3 text-xs text-[#ff6b35] font-semibold">
                    Read <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
