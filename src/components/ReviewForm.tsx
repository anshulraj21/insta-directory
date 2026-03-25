"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import StarRating from "@/components/StarRating";

export default function ReviewForm({
  businessId,
  onSubmitted,
}: {
  businessId: string;
  onSubmitted: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (rating === 0) {
      setError("Please select a rating");
      return;
    }
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (comment.trim().length < 10) {
      setError("Review must be at least 10 characters");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId,
          authorName: name.trim(),
          rating,
          comment: comment.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit review");
      }

      setSuccess(true);
      setRating(0);
      setName("");
      setComment("");
      onSubmitted();

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Your Rating
        </label>
        <StarRating rating={rating} size="lg" interactive onChange={setRating} />
      </div>

      <div>
        <label
          htmlFor="reviewer-name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Your Name
        </label>
        <input
          id="reviewer-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          maxLength={50}
        />
      </div>

      <div>
        <label
          htmlFor="review-comment"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Your Review
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this business..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
          maxLength={500}
        />
        <p className="text-xs text-gray-400 mt-1">{comment.length}/500</p>
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {success && (
        <p className="text-sm text-green-600">Review submitted successfully!</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center gap-2 bg-pink-500 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
        {submitting ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
