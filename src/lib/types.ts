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
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  subCategories: string[];
}
