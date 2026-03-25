import { unstable_cache } from "next/cache";
import { getDb } from "./mongodb";
import { Business, Category, SubmitBusinessInput } from "./types";

// --- Categories ---

export const getAllCategories = unstable_cache(
  async (): Promise<Category[]> => {
    const db = await getDb();
    const docs = await db.collection("categories").find({}).toArray();
    return docs.map(({ _id, ...rest }) => rest) as unknown as Category[];
  },
  ["all-categories"],
  { revalidate: 3600, tags: ["categories"] }
);

export const getCategoryBySlug = unstable_cache(
  async (slug: string): Promise<Category | undefined> => {
    const db = await getDb();
    const doc = await db.collection("categories").findOne({ slug });
    if (!doc) return undefined;
    const { _id, ...rest } = doc;
    return rest as unknown as Category;
  },
  ["category-by-slug"],
  { revalidate: 3600, tags: ["categories"] }
);

// --- Businesses ---

export const getAllBusinesses = unstable_cache(
  async (): Promise<Business[]> => {
    const db = await getDb();
    const docs = await db
      .collection("businesses")
      .find({ status: "approved" })
      .toArray();
    return docs.map(({ _id, ...rest }) => rest) as unknown as Business[];
  },
  ["all-businesses"],
  { revalidate: 60, tags: ["businesses"] }
);

export const getBusinessesByCategory = unstable_cache(
  async (categorySlug: string): Promise<Business[]> => {
    const db = await getDb();
    const category = await db
      .collection("categories")
      .findOne({ slug: categorySlug });
    if (!category) return [];
    const docs = await db
      .collection("businesses")
      .find({ category: category.name, status: "approved" })
      .toArray();
    return docs.map(({ _id, ...rest }) => rest) as unknown as Business[];
  },
  ["businesses-by-category"],
  { revalidate: 60, tags: ["businesses"] }
);

export const getBusinessByHandle = unstable_cache(
  async (handle: string): Promise<Business | undefined> => {
    const db = await getDb();
    const normalized = handle.startsWith("@") ? handle : `@${handle}`;
    const doc = await db
      .collection("businesses")
      .findOne({ instagramHandle: normalized, status: "approved" });
    if (!doc) return undefined;
    const { _id, ...rest } = doc;
    return rest as unknown as Business;
  },
  ["business-by-handle"],
  { revalidate: 60, tags: ["businesses"] }
);

export async function searchBusinesses(query: string): Promise<Business[]> {
  const db = await getDb();
  if (!query.trim()) return [];

  try {
    const docs = await db
      .collection("businesses")
      .find({ $text: { $search: query }, status: "approved" })
      .limit(50)
      .toArray();
    return docs.map(({ _id, ...rest }) => rest) as unknown as Business[];
  } catch {
    // Fallback to regex search if text index not ready
    const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    const docs = await db
      .collection("businesses")
      .find({
        status: "approved",
        $or: [
          { businessName: regex },
          { instagramHandle: regex },
          { description: regex },
          { category: regex },
          { subCategory: regex },
          { city: regex },
          { state: regex },
        ],
      })
      .limit(50)
      .toArray();
    return docs.map(({ _id, ...rest }) => rest) as unknown as Business[];
  }
}

export const getBusinessCount = unstable_cache(
  async (): Promise<number> => {
    const db = await getDb();
    return db.collection("businesses").countDocuments({ status: "approved" });
  },
  ["business-count"],
  { revalidate: 60, tags: ["businesses"] }
);

export const getCategoryCount = unstable_cache(
  async (): Promise<number> => {
    const db = await getDb();
    return db.collection("categories").countDocuments();
  },
  ["category-count"],
  { revalidate: 3600, tags: ["categories"] }
);

export const getFeaturedBusinesses = unstable_cache(
  async (limit: number): Promise<Business[]> => {
    const db = await getDb();
    const docs = await db
      .collection("businesses")
      .find({ status: "approved" })
      .limit(limit)
      .toArray();
    return docs.map(({ _id, ...rest }) => rest) as unknown as Business[];
  },
  ["featured-businesses"],
  { revalidate: 60, tags: ["businesses"] }
);

export const getRelatedBusinesses = unstable_cache(
  async (
    category: string,
    excludeId: string,
    limit: number
  ): Promise<Business[]> => {
    const db = await getDb();
    const docs = await db
      .collection("businesses")
      .find({ category, status: "approved", id: { $ne: excludeId } })
      .limit(limit)
      .toArray();
    return docs.map(({ _id, ...rest }) => rest) as unknown as Business[];
  },
  ["related-businesses"],
  { revalidate: 60, tags: ["businesses"] }
);

export const getSubCategories = unstable_cache(
  async (categorySlug: string): Promise<string[]> => {
    const category = await getCategoryBySlug(categorySlug);
    return category?.subCategories ?? [];
  },
  ["sub-categories"],
  { revalidate: 3600, tags: ["categories"] }
);

export const getUniqueCities = unstable_cache(
  async (): Promise<string[]> => {
    const db = await getDb();
    const cities = await db
      .collection("businesses")
      .distinct("city", { status: "approved", city: { $ne: "" } });
    return (cities as string[]).sort();
  },
  ["unique-cities"],
  { revalidate: 3600, tags: ["businesses"] }
);

export const getUniqueStates = unstable_cache(
  async (): Promise<string[]> => {
    const db = await getDb();
    const states = await db
      .collection("businesses")
      .distinct("state", { status: "approved", state: { $ne: "" } });
    return (states as string[]).sort();
  },
  ["unique-states"],
  { revalidate: 3600, tags: ["businesses"] }
);

// --- Submit ---

export async function submitBusiness(data: SubmitBusinessInput): Promise<void> {
  const db = await getDb();

  const handle = data.instagramHandle.startsWith("@")
    ? data.instagramHandle
    : `@${data.instagramHandle}`;

  const existing = await db
    .collection("businesses")
    .findOne({ instagramHandle: handle });
  if (existing) {
    throw new Error("This Instagram handle is already in our directory");
  }

  const slug = data.category
    .toLowerCase()
    .replace(/[&]/g, "")
    .replace(/\s+/g, "-");

  await db.collection("businesses").insertOne({
    id: `submitted-${Date.now()}`,
    instagramHandle: handle,
    businessName: data.businessName,
    category: data.category,
    subCategory: "",
    city: data.city || "",
    state: data.state || "",
    country: "India",
    description: data.description,
    tags: [],
    verified: false,
    addedAt: new Date().toISOString().split("T")[0],
    status: "pending",
  });
}
