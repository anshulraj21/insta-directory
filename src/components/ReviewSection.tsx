"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession, signIn } from "next-auth/react";
import { MessageCircle, ThumbsUp, User, LogIn, ExternalLink } from "lucide-react";
import StarRating from "@/components/StarRating";
import ReviewForm from "@/components/ReviewForm";
import { Review, ReviewStats } from "@/lib/types";

export default function ReviewSection({
  businessId,
  businessName,
}: {
  businessId: string;
  businessName: string;
}) {
  const { data: session, status } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/reviews?businessId=${encodeURIComponent(businessId)}`
      );
      const data = await res.json();
      setReviews(data.reviews || []);
      setStats(data.stats || null);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  async function handleHelpful(reviewId: string) {
    await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "helpful", reviewId }),
    });
    fetchReviews();
  }

  function handleWriteReview() {
    if (status === "unauthenticated") {
      signIn("google");
      return;
    }
    setShowForm(!showForm);
  }

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    return `${months}mo ago`;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-pink-500" />
          <h2 className="text-lg font-bold text-gray-900">Community Reviews</h2>
          {stats && stats.totalReviews > 0 && (
            <span className="text-sm text-gray-400">
              ({stats.totalReviews})
            </span>
          )}
        </div>
        <button
          onClick={handleWriteReview}
          className="text-sm bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition flex items-center gap-1.5"
        >
          {status === "unauthenticated" ? (
            <>
              <LogIn className="w-3.5 h-3.5" />
              Sign in to Review
            </>
          ) : showForm ? (
            "Cancel"
          ) : (
            "Write a Review"
          )}
        </button>
      </div>

      {/* Stats summary */}
      {stats && stats.totalReviews > 0 && (
        <div className="flex items-center gap-6 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">
              {stats.averageRating}
            </div>
            <StarRating rating={Math.round(stats.averageRating)} size="sm" />
            <p className="text-xs text-gray-500 mt-1">
              {stats.totalReviews} review{stats.totalReviews !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex-1 space-y-1">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = stats.distribution[star] || 0;
              const pct =
                stats.totalReviews > 0
                  ? (count / stats.totalReviews) * 100
                  : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="w-3 text-gray-500">{star}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-amber-400 h-2 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-6 text-right text-gray-400">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Review Form (only for authenticated users) */}
      {showForm && session?.user && (
        <div className="mb-6 p-4 bg-pink-50 rounded-lg border border-pink-100">
          <div className="flex items-center gap-2 mb-3">
            {session.user.image ? (
              <img
                src={session.user.image}
                alt=""
                className="w-8 h-8 rounded-full"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-pink-200 flex items-center justify-center">
                <User className="w-4 h-4 text-pink-600" />
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-900">
                {session.user.name}
              </p>
              <p className="text-xs text-gray-400">
                Posting as {session.user.email}
              </p>
            </div>
          </div>
          <ReviewForm
            businessId={businessId}
            userName={session.user.name || "Anonymous"}
            onSubmitted={() => {
              fetchReviews();
              setShowForm(false);
            }}
          />
        </div>
      )}

      {/* Reviews list */}
      {loading ? (
        <div className="text-center text-gray-400 py-8 text-sm">
          Loading reviews...
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8">
          <MessageCircle className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-500 mb-1">No reviews yet</p>
          <p className="text-xs text-gray-400">
            Be the first to review {businessName}!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="border-b border-gray-100 pb-4 last:border-0 last:pb-0"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-pink-100 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-pink-500" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {review.authorName}
                  </span>
                  {review.instagramHandle && (
                    <a
                      href={`https://instagram.com/${review.instagramHandle.replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-pink-500 hover:text-pink-600 flex items-center gap-0.5"
                    >
                      @{review.instagramHandle.replace("@", "")}
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                  <span className="text-xs text-gray-400">
                    {timeAgo(review.createdAt)}
                  </span>
                </div>
                <StarRating rating={review.rating} size="sm" />
              </div>
              <p className="text-sm text-gray-600 ml-9 mb-2">
                {review.comment}
              </p>
              <button
                onClick={() => handleHelpful(review.id)}
                className="ml-9 text-xs text-gray-400 hover:text-pink-500 flex items-center gap-1 transition"
              >
                <ThumbsUp className="w-3 h-3" />
                Helpful{review.helpful > 0 ? ` (${review.helpful})` : ""}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
