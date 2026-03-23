"use client";

import { useState, useEffect } from "react";
import { Star, MessageSquare, Loader2, User } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns"; // Make sure to npm install date-fns

interface Review {
  id: string;
  rating: number;
  content: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface ReviewSectionProps {
  tmdbId: string;
  type: "movie" | "tv";
}

export default function ReviewSection({ tmdbId, type }: ReviewSectionProps) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [hoveredStar, setHoveredStar] = useState(0);
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/reviews?tmdbId=${tmdbId}&type=${type}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
        
        // Find if current user already reviewed to pre-fill
        if (session?.user?.id) {
            const myReview = data.find((r: Review) => r.user.id === session.user.id);
            if (myReview) {
                setRating(myReview.rating);
                setContent(myReview.content || "");
            }
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [tmdbId, type, session?.user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return alert("Please select a star rating first!");
    
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tmdbId, type, rating, content }),
      });

      if (res.ok) {
        await fetchReviews(); // Refresh list to show new review
        alert("Review saved successfully!");
      } else {
        alert("Failed to save review.");
      }
    } catch (error) {
      alert("Error saving review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-16 w-full max-w-4xl mx-auto space-y-12">
      <div className="flex items-center justify-between pb-6 border-b border-white/10">
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-accent" />
          Community Reviews
        </h2>
        <span className="text-zinc-400 font-medium">{reviews.length} Ratings</span>
      </div>

      {/* Review Submission Form */}
      <div className="glass-morphism p-6 md:p-8 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-accent"></div>
        {session ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              <div className="flex flex-col gap-2">
                <span className="text-zinc-400 text-sm uppercase tracking-wider font-semibold">Your Rating</span>
                <div className="flex gap-1" onMouseLeave={() => setHoveredStar(0)}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredStar(star)}
                      className="transition-transform hover:scale-110 outline-none"
                    >
                      <Star
                        className={`w-8 h-8 md:w-10 md:h-10 transition-colors ${
                          star <= (hoveredStar || rating)
                            ? "fill-yellow-500 text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]"
                            : "text-zinc-600 hover:text-zinc-500"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex-1 w-full relative">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What did you think of this? (Optional)"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all font-medium"
                ></textarea>
                <div className="absolute bottom-3 right-3 text-xs text-zinc-500">{content.length}/500</div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSubmitting || rating === 0}
                className="px-8 py-3 bg-accent hover:bg-red-700 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Review"}
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
             <Star className="w-12 h-12 text-zinc-700 mb-2" />
             <p className="text-lg text-zinc-300 font-medium">Log in to rate and review this.</p>
             <Link href="/login" className="px-6 py-2 bg-white text-black font-bold rounded-full hover:bg-zinc-200 transition-colors shadow-xl">
               Sign In
             </Link>
          </div>
        )}
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-accent animate-spin" />
          </div>
        ) : reviews.length > 0 ? (
          reviews.map((rev) => (
            <div key={rev.id} className="p-6 bg-zinc-900/40 rounded-2xl border border-white/5 shadow-inner flex gap-5 animate-[fade-in_0.5s_ease-out]">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-800 shrink-0 border border-white/10">
                {rev.user.image ? (
                  <img src={rev.user.image} alt={rev.user.name || "User"} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-400">
                    <User className="w-6 h-6" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-lg">{rev.user.name || "CineStream User"}</h4>
                  <span className="text-xs text-zinc-500 font-medium">
                     {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`w-4 h-4 ${s <= rev.rating ? "fill-yellow-500 text-yellow-500 drop-shadow-sm" : "text-zinc-700"}`} />
                  ))}
                </div>
                {rev.content && (
                  <p className="text-zinc-300 leading-relaxed text-sm pt-2 break-words whitespace-pre-wrap">{rev.content}</p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 bg-zinc-900/20 rounded-2xl border border-dashed border-white/10">
            <MessageSquare className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-400 text-lg">No reviews yet. Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
    </div>
  );
}
