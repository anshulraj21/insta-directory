import { Metadata } from "next";
import { getAllCategories, getBusinessesByCategory } from "@/lib/data";
import CategoryCard from "@/components/CategoryCard";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Browse All Categories",
  description:
    "Browse all categories of small businesses on Instagram in India — fashion, jewelry, food, beauty, home decor, and more.",
  alternates: { canonical: "/categories" },
};

export default async function CategoriesPage() {
  const categories = await getAllCategories();

  const categoriesWithCounts = await Promise.all(
    categories.map(async (cat) => ({
      category: cat,
      count: (await getBusinessesByCategory(cat.slug)).length,
    }))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Browse All Categories
      </h1>
      <p className="text-gray-500 mb-8">
        Explore {categories.length} categories of curated small businesses on Instagram in India.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {categoriesWithCounts.map(({ category, count }) => (
          <CategoryCard key={category.id} category={category} count={count} />
        ))}
      </div>
    </div>
  );
}
