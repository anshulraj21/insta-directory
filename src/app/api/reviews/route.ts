import { NextRequest, NextResponse } from "next/server";
import {
  getReviewsForBusiness,
  getReviewStats,
  submitReview,
  markReviewHelpful,
} from "@/lib/data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get("businessId");
  const statsOnly = searchParams.get("stats") === "true";

  if (!businessId) {
    return NextResponse.json(
      { error: "businessId is required" },
      { status: 400 }
    );
  }

  if (statsOnly) {
    const stats = await getReviewStats(businessId);
    return NextResponse.json(stats);
  }

  const [reviews, stats] = await Promise.all([
    getReviewsForBusiness(businessId),
    getReviewStats(businessId),
  ]);

  return NextResponse.json({ reviews, stats });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessId, authorName, rating, comment, action, reviewId } = body;

    // Handle "helpful" upvote
    if (action === "helpful" && reviewId) {
      await markReviewHelpful(reviewId);
      return NextResponse.json({ success: true });
    }

    // Handle new review submission
    if (!businessId || !authorName || !rating || !comment) {
      return NextResponse.json(
        { error: "businessId, authorName, rating, and comment are required" },
        { status: 400 }
      );
    }

    await submitReview({ businessId, authorName, rating, comment });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Something went wrong";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
