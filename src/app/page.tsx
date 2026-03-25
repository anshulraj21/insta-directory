import Link from "next/link";
import { Search, ArrowRight } from "lucide-react";
import {
  getAllCategories,
  getBusinessesByCategory,
  getBusinessCount,
  getCategoryCount,
  getFeaturedBusinesses,
} from "@/lib/data";
import CategoryCard from "@/components/CategoryCard";
import BusinessCard from "@/components/BusinessCard";

export const revalidate = 60;

export default async function HomePage() {
  const [categories, businessCount, categoryCount, featuredBusinesses] =
    await Promise.all([
      getAllCategories(),
      getBusinessCount(),
      getCategoryCount(),
      getFeaturedBusinesses(8),
    ]);

  // Get counts per category
  const categoriesWithCounts = await Promise.all(
    categories.map(async (cat) => ({
      category: cat,
      count: (await getBusinessesByCategory(cat.slug)).length,
    }))
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "ShopFinder",
    url: "https://shopfinder.com",
    description: `Discover ${businessCount}+ curated small businesses on Instagram in India.`,
    potentialAction: {
      "@type": "SearchAction",
      target: "https://shopfinder.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero */}
      <section className="bg-gradient-to-br from-pink-50 via-purple-50 to-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Discover Amazing{" "}
            <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              Small Businesses
            </span>{" "}
            on Instagram
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Browse {businessCount}+ curated Indian small businesses across{" "}
            {categoryCount} categories. Find hidden gems, support local, and
            shop with confidence.
          </p>
          <Link
            href="/search?q="
            className="inline-flex items-center gap-2 bg-white border border-gray-300 rounded-full px-6 py-3 text-gray-500 hover:border-pink-300 hover:shadow-md transition-all max-w-md w-full justify-center"
          >
            <Search className="w-5 h-5" />
            Search businesses, categories, cities...
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-8 sm:gap-16 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">{businessCount}+</div>
              <div className="text-sm text-gray-500">Businesses</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{categoryCount}</div>
              <div className="text-sm text-gray-500">Categories</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">India</div>
              <div className="text-sm text-gray-500">Region</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Browse by Category
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categoriesWithCounts.map(({ category: cat, count }) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                count={count}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Businesses */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Featured Businesses
            </h2>
            <Link
              href="/categories/fashion-ethnic-wear"
              className="text-sm text-pink-500 hover:text-pink-600 flex items-center gap-1"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredBusinesses.map((b) => (
              <BusinessCard key={b.id} business={b} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Know a great small business?
          </h2>
          <p className="text-gray-600 mb-6">
            Help the community discover amazing Instagram businesses by
            submitting one.
          </p>
          <Link
            href="/submit"
            className="inline-flex items-center gap-2 bg-pink-500 text-white px-6 py-3 rounded-full hover:bg-pink-600 transition font-medium"
          >
            Submit a Business <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
