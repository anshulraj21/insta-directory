import { MetadataRoute } from "next";
import { getAllBusinesses, getAllCategories } from "@/lib/data";

const BASE_URL = "https://shopfinder.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [businesses, categories] = await Promise.all([
    getAllBusinesses(),
    getAllCategories(),
  ]);

  const businessUrls = businesses.map((b) => ({
    url: `${BASE_URL}/business/${b.instagramHandle.replace("@", "")}`,
    lastModified: new Date(b.addedAt),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const categoryUrls = categories.map((c) => ({
    url: `${BASE_URL}/categories/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/submit`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    ...categoryUrls,
    ...businessUrls,
  ];
}
