"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, MessageSquare, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import UserAvatar from "@/components/ui/UserAvatar";

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

  const fetchReviews = useCallback(async () => {
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
  }, [tmdbId, type, session?.user?.id]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

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
    } catch {
      alert("Error saving review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-16 w-full max-w-4xl mx-auto space-y-10">
      <div className="flex items-center justify-between pb-5 border-b border-white/10">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
          <span className="w-1 h-5 rounded-full bg-gradient-to-b from-[#e50914] to-[#ff414d]" />
          <MessageSquare className="w-6 h-6 text-[#e50914]" />
          Community Reviews
        </h2>
        <span className="text-zinc-400 text-sm font-medium">{reviews.length} Ratings</span>
      </div>

      {/* Review Submission Form */}
      <div className="bg-[#0c0c14] p-6 md:p-8 rounded-2xl border border-white/10 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#e50914] to-[#ff414d]" />
        {session ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              <div className="flex flex-col gap-2">
                <span className="text-zinc-400 text-xs uppercase tracking-wider font-semibold">Your Rating</span>
                <div className="flex gap-1" onMouseLeave={() => setHoveredStar(0)}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredStar(star)}
                      className="transition-transform hover:scale-110 outline-none cursor-pointer"
                    >
                      <Star
                        className={`w-7 h-7 md:w-8 md:h-8 transition-colors ${
                          star <= (hoveredStar || rating)
                            ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                            : "text-zinc-700 hover:text-zinc-500"
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
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 min-h-[90px] resize-none focus:outline-none focus:border-[#e50914] transition-all font-medium text-sm"
                />
                <div className="absolute bottom-3 right-3 text-xs text-zinc-500">{content.length}/500</div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSubmitting || rating === 0}
                className="px-7 py-3 bg-gradient-to-r from-[#e50914] to-[#ff414d] hover:shadow-[0_0_25px_rgba(229,9,20,0.5)] text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm cursor-pointer"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Review"}
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
             <Star className="w-10 h-10 text-zinc-700 mb-1" />
             <p className="text-base text-zinc-300 font-medium">Log in to rate and review this title.</p>
             <Link href="/login" prefetch={false} className="px-6 py-2.5 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors shadow-xl text-sm">
               Sign In
             </Link>
          </div>
        )}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#e50914] animate-spin" />
          </div>
        ) : reviews.length > 0 ? (
          reviews.map((rev) => (
            <div key={rev.id} className="p-5 sm:p-6 bg-[#0c0c14] rounded-2xl border border-white/[0.07] shadow-md flex gap-4 sm:gap-5">
              <div className="w-11 h-11 rounded-full overflow-hidden bg-zinc-800 shrink-0 border border-white/10 flex items-center justify-center">
                <UserAvatar src={rev.user.image} iconClassName="w-5 h-5 text-zinc-400" />
              </div>
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm sm:text-base">{rev.user.name || "CineStream User"}</h4>
                  <span className="text-xs text-zinc-500 font-medium">
                     {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`w-3.5 h-3.5 ${s <= rev.rating ? "fill-amber-400 text-amber-400" : "text-zinc-700"}`} />
                  ))}
                </div>
                {rev.content && (
                  <p className="text-zinc-300 leading-relaxed text-sm pt-1.5 break-words whitespace-pre-wrap">{rev.content}</p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-14 bg-[#0c0c14]/50 rounded-2xl border border-dashed border-white/10">
            <MessageSquare className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-400 text-sm">No reviews yet. Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
    </div>
  );
}
