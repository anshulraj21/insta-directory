export interface Business {
  id: string;
  instagramHandle: string;
  businessName: string;
  category: string;
  subCategory: string;
  city: string;
  state: string;
  country: string;
  description: string;
  tags: string[];
  verified: boolean;
  addedAt: string;
  status?: "approved" | "pending";
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  subCategories: string[];
}

export interface SubmitBusinessInput {
  instagramHandle: string;
  businessName: string;
  category: string;
  city: string;
  state: string;
  description: string;
}

export interface Review {
  id: string;
  businessId: string;
  authorName: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
  helpful: number; // upvote count
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  distribution: Record<number, number>; // {5: 10, 4: 5, 3: 2, 2: 1, 1: 0}
}
