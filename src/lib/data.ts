import { Business, Category } from "./types";
import businessesData from "../../data/businesses.json";
import categoriesData from "../../data/categories.json";

export const businesses: Business[] = businessesData as Business[];
export const categories: Category[] = categoriesData as Category[];

export function getBusinessesByCategory(categorySlug: string): Business[] {
  const category = categories.find((c) => c.slug === categorySlug);
  if (!category) return [];
  return businesses.filter((b) => b.category === category.name);
}

export function getBusinessByHandle(handle: string): Business | undefined {
  const normalized = handle.startsWith("@") ? handle : `@${handle}`;
  return businesses.find((b) => b.instagramHandle === normalized);
}

export function searchBusinesses(query: string): Business[] {
  const q = query.toLowerCase();
  return businesses.filter(
    (b) =>
      b.businessName.toLowerCase().includes(q) ||
      b.instagramHandle.toLowerCase().includes(q) ||
      b.description.toLowerCase().includes(q) ||
      b.category.toLowerCase().includes(q) ||
      b.subCategory.toLowerCase().includes(q) ||
      b.tags.some((t) => t.toLowerCase().includes(q)) ||
      b.city.toLowerCase().includes(q) ||
      b.state.toLowerCase().includes(q)
  );
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getSubCategories(categorySlug: string): string[] {
  const category = getCategoryBySlug(categorySlug);
  return category?.subCategories ?? [];
}

export function getUniqueCities(): string[] {
  const cities = new Set(
    businesses.filter((b) => b.city).map((b) => b.city)
  );
  return Array.from(cities).sort();
}

export function getUniqueStates(): string[] {
  const states = new Set(
    businesses.filter((b) => b.state).map((b) => b.state)
  );
  return Array.from(states).sort();
}
