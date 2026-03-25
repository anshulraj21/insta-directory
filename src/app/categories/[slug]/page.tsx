import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { categories, getBusinessesByCategory, getCategoryBySlug } from "@/lib/data";
import BusinessCard from "@/components/BusinessCard";
import CategoryFilter from "@/components/CategoryFilter";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sub?: string; city?: string; page?: string }>;
}

export async function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: `Best ${category.name} Instagram Businesses in India`,
    description: `Discover ${category.name.toLowerCase()} small businesses on Instagram. ${category.description}`,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  let filtered = getBusinessesByCategory(slug);

  if (sp.sub) {
    filtered = filtered.filter((b) => b.subCategory === sp.sub);
  }
  if (sp.city) {
    filtered = filtered.filter(
      (b) => b.city.toLowerCase() === sp.city!.toLowerCase()
    );
  }

  const page = Number(sp.page) || 1;
  const perPage = 24;
  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const cities = Array.from(
    new Set(
      getBusinessesByCategory(slug)
        .filter((b) => b.city)
        .map((b) => b.city)
    )
  ).sort();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-gray-900">Home</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900">{category.name}</span>
      </nav>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">{category.name}</h1>
      <p className="text-gray-600 mb-8">{category.description}</p>

      <CategoryFilter
        slug={slug}
        subCategories={category.subCategories}
        cities={cities}
        activeSub={sp.sub}
        activeCity={sp.city}
      />

      <p className="text-sm text-gray-500 mb-6">{filtered.length} businesses found</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {paged.map((b) => (
          <BusinessCard key={b.id} business={b} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            const params = new URLSearchParams();
            if (sp.sub) params.set("sub", sp.sub);
            if (sp.city) params.set("city", sp.city);
            params.set("page", String(p));
            return (
              <Link
                key={p}
                href={`/categories/${slug}?${params.toString()}`}
                className={`px-3 py-1.5 rounded text-sm ${
                  p === page
                    ? "bg-pink-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {p}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
