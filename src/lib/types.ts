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
