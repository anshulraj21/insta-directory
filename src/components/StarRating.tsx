"use client";

import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export default function StarRating({
  rating,
  size = "md",
  interactive = false,
  onChange,
}: StarRatingProps) {
  const sizeClass = { sm: "w-3.5 h-3.5", md: "w-5 h-5", lg: "w-6 h-6" };

  return (
    <div className={`flex items-center gap-0.5 ${interactive ? "cursor-pointer" : ""}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange?.(star)}
          className={`${interactive ? "hover:scale-110 transition-transform" : ""} disabled:cursor-default`}
        >
          <Star
            className={`${sizeClass[size]} ${
              star <= rating
                ? "text-amber-400 fill-amber-400"
                : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
}
