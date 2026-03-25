import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import {
  getSizeCategory,
  calculateAllScores,
} from "@/lib/scoring";

const ADMIN_EMAILS = [
  "anshulraj.21@gmail.com",
];

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const {
      businessId,
      followerCount,
      postCount,
      avgLikesPerPost,
      avgCommentsPerPost,
      lastPostDate,
      qualityScore,
      priceRange,
    } = body;

    if (!businessId) {
      return NextResponse.json(
        { error: "businessId is required" },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Calculate engagement rate
    const engagementRate =
      followerCount > 0
        ? ((avgLikesPerPost + avgCommentsPerPost) / followerCount) * 100
        : 0;

    // Estimate posts in last 30 days (rough: assume even distribution)
    const postsLast30Days = postCount > 0 ? Math.min(postCount, 30) : 0;

    // Get community review stats for this business
    const reviews = await db
      .collection("reviews")
      .find({ businessId })
      .toArray();
    const totalReviews = reviews.length;
    const sumOfRatings = reviews.reduce(
      (sum, r) => sum + (r.rating as number),
      0
    );

    // Calculate all scores
    const scores = calculateAllScores({
      qualityScore: qualityScore || 50,
      postsLast30Days,
      lastPostDate: lastPostDate || new Date().toISOString(),
      engagementRate,
      followerCount: followerCount || 0,
      totalReviews,
      sumOfRatings,
    });

    const sizeCategory = getSizeCategory(followerCount || 0);

    // Update the business document
    await db.collection("businesses").updateOne(
      { id: businessId },
      {
        $set: {
          instagram: {
            followerCount: followerCount || 0,
            postCount: postCount || 0,
            avgLikesPerPost: avgLikesPerPost || 0,
            avgCommentsPerPost: avgCommentsPerPost || 0,
            lastPostDate: lastPostDate || "",
            engagementRate: Math.round(engagementRate * 100) / 100,
            metricsUpdatedAt: new Date().toISOString(),
          },
          scores,
          sizeCategory,
          priceRange: priceRange || "mid-range",
        },
      }
    );

    return NextResponse.json({
      success: true,
      scores,
      sizeCategory,
      engagementRate: Math.round(engagementRate * 100) / 100,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Something went wrong";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
