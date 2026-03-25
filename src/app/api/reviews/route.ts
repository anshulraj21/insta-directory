import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
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
    const { action, reviewId } = body;

    // Handle "helpful" upvote (no auth required)
    if (action === "helpful" && reviewId) {
      await markReviewHelpful(reviewId);
      return NextResponse.json({ success: true });
    }

    // For new reviews, require authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be signed in to write a review" },
        { status: 401 }
      );
    }

    const { businessId, rating, comment, instagramHandle } = body;

    if (!businessId || !rating || !comment) {
      return NextResponse.json(
        { error: "businessId, rating, and comment are required" },
        { status: 400 }
      );
    }

    await submitReview({
      businessId,
      authorName: session.user.name || "Anonymous",
      rating,
      comment,
      userId: session.user.id || session.user.email || "",
      instagramHandle: instagramHandle || undefined,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Something went wrong";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
