import { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, SearchX } from "lucide-react";
import { searchBusinesses } from "@/lib/data";
import BusinessCard from "@/components/BusinessCard";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  return {
    title: sp.q ? `Search: ${sp.q}` : "Search Businesses",
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const query = sp.q || "";
  const results = query ? await searchBusinesses(query) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-gray-900">Home</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900">Search</span>
      </nav>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        {query ? `Results for "${query}"` : "Search Businesses"}
      </h1>
      <p className="text-gray-500 mb-8">
        {query ? `${results.length} businesses found` : "Use the search bar above to find businesses"}
      </p>

      {query && results.length === 0 && (
        <div className="text-center py-16">
          <SearchX className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No results found</h2>
          <p className="text-gray-500">
            Try different keywords or browse by{" "}
            <Link href="/" className="text-pink-500 hover:underline">category</Link>
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((b) => (
          <BusinessCard key={b.id} business={b} />
        ))}
      </div>
    </div>
  );
}
