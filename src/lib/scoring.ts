/**
 * ShopFinder Scoring System
 *
 * 4 dimensions, each 0-100:
 * - Quality (25%): Manual admin curation score
 * - Activity (20%): Post frequency + recency
 * - Engagement (25%): Tier-relative engagement rate
 * - Community (30%): Bayesian average of user reviews
 *
 * Overall = weighted sum of all four
 */

export type SizeCategory = "nano" | "micro" | "small" | "medium" | "large";

export interface InstagramMetrics {
  followerCount: number;
  postCount: number;
  avgLikesPerPost: number;
  avgCommentsPerPost: number;
  lastPostDate: string; // ISO date
  metricsUpdatedAt: string;
}

export interface Scores {
  quality: number;
  activity: number;
  engagement: number;
  community: number;
  overall: number;
  lastCalculatedAt: string;
}

// --- Size Category ---

export function getSizeCategory(followers: number): SizeCategory {
  if (followers < 1000) return "nano";
  if (followers < 10000) return "micro";
  if (followers < 50000) return "small";
  if (followers < 100000) return "medium";
  return "large";
}

export function getSizeCategoryLabel(category: SizeCategory): string {
  const labels: Record<SizeCategory, string> = {
    nano: "Nano (<1K)",
    micro: "Micro (1K-10K)",
    small: "Small (10K-50K)",
    medium: "Medium (50K-100K)",
    large: "Large (100K+)",
  };
  return labels[category];
}

// --- Activity Score ---

export function calculateActivityScore(
  postsLast30Days: number,
  lastPostDate: string
): number {
  const postsPerWeek = postsLast30Days / 4.3;

  let score: number;
  if (postsPerWeek >= 5) score = 100;
  else if (postsPerWeek >= 3) score = 80;
  else if (postsPerWeek >= 1) score = 60;
  else if (postsPerWeek >= 0.5) score = 40;
  else if (postsPerWeek > 0) score = 20;
  else score = 0;

  // Recency penalty
  const daysSinceLastPost = Math.floor(
    (Date.now() - new Date(lastPostDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceLastPost > 90) score *= 0.3;
  else if (daysSinceLastPost > 60) score *= 0.5;
  else if (daysSinceLastPost > 30) score *= 0.75;

  return Math.round(score);
}

// --- Engagement Score (tier-relative) ---

// Engagement rate benchmarks by tier: [poor, belowAvg, average, good, excellent]
const ENGAGEMENT_BENCHMARKS: Record<SizeCategory, number[]> = {
  nano: [1, 2, 4, 6, 8],
  micro: [0.5, 1.5, 3, 5, 7],
  small: [0.3, 1, 2, 3.5, 5],
  medium: [0.2, 0.5, 1.5, 2.5, 4],
  large: [0.1, 0.5, 1, 2, 3],
};

export function calculateEngagementScore(
  engagementRate: number,
  sizeCategory: SizeCategory
): number {
  const benchmarks = ENGAGEMENT_BENCHMARKS[sizeCategory];
  // [poor, belowAvg, avg, good, excellent]
  // Maps to [0, 25, 50, 75, 100]

  if (engagementRate <= benchmarks[0]) return 0;
  if (engagementRate >= benchmarks[4]) return 100;

  const ranges = [
    { min: benchmarks[0], max: benchmarks[1], scoreMin: 0, scoreMax: 25 },
    { min: benchmarks[1], max: benchmarks[2], scoreMin: 25, scoreMax: 50 },
    { min: benchmarks[2], max: benchmarks[3], scoreMin: 50, scoreMax: 75 },
    { min: benchmarks[3], max: benchmarks[4], scoreMin: 75, scoreMax: 100 },
  ];

  for (const range of ranges) {
    if (engagementRate >= range.min && engagementRate <= range.max) {
      const pct = (engagementRate - range.min) / (range.max - range.min);
      return Math.round(range.scoreMin + pct * (range.scoreMax - range.scoreMin));
    }
  }

  return 50; // fallback
}

// --- Community Score (Bayesian) ---

const PRIOR_COUNT = 5;
const PRIOR_RATING = 3.0;

export function calculateCommunityScore(
  totalReviews: number,
  sumOfRatings: number
): number {
  if (totalReviews === 0) return 50; // neutral default

  const bayesianAvg =
    (PRIOR_COUNT * PRIOR_RATING + sumOfRatings) / (PRIOR_COUNT + totalReviews);

  // Convert 1-5 Bayesian average to 0-100
  return Math.round(((bayesianAvg - 1) / 4) * 100);
}

// --- Overall Score ---

const WEIGHTS = {
  quality: 0.25,
  activity: 0.2,
  engagement: 0.25,
  community: 0.3,
};

export function calculateOverallScore(scores: {
  quality: number;
  activity: number;
  engagement: number;
  community: number;
}): number {
  const overall =
    scores.quality * WEIGHTS.quality +
    scores.activity * WEIGHTS.activity +
    scores.engagement * WEIGHTS.engagement +
    scores.community * WEIGHTS.community;

  return Math.round(overall);
}

// --- Full Score Calculation ---

export function calculateAllScores(params: {
  qualityScore: number; // manual 0-100
  postsLast30Days: number;
  lastPostDate: string;
  engagementRate: number;
  followerCount: number;
  totalReviews: number;
  sumOfRatings: number;
}): Scores {
  const sizeCategory = getSizeCategory(params.followerCount);

  const quality = Math.max(0, Math.min(100, params.qualityScore));
  const activity = calculateActivityScore(
    params.postsLast30Days,
    params.lastPostDate
  );
  const engagement = calculateEngagementScore(
    params.engagementRate,
    sizeCategory
  );
  const community = calculateCommunityScore(
    params.totalReviews,
    params.sumOfRatings
  );

  const overall = calculateOverallScore({
    quality,
    activity,
    engagement,
    community,
  });

  return {
    quality,
    activity,
    engagement,
    community,
    overall,
    lastCalculatedAt: new Date().toISOString(),
  };
}
