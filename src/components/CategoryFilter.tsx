"use client";

import { useRouter } from "next/navigation";

interface Props {
  slug: string;
  subCategories: string[];
  cities: string[];
  activeSub?: string;
  activeCity?: string;
}

export default function CategoryFilter({ slug, subCategories, cities, activeSub, activeCity }: Props) {
  const router = useRouter();

  function navigate(sub?: string, city?: string) {
    const params = new URLSearchParams();
    if (sub) params.set("sub", sub);
    if (city) params.set("city", city);
    const qs = params.toString();
    router.push(`/categories/${slug}${qs ? `?${qs}` : ""}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => navigate(undefined, activeCity)}
          className={`px-3 py-1.5 rounded-full text-sm transition ${
            !activeSub ? "bg-pink-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All
        </button>
        {subCategories.map((sub) => (
          <button
            key={sub}
            onClick={() => navigate(sub, activeCity)}
            className={`px-3 py-1.5 rounded-full text-sm transition ${
              activeSub === sub ? "bg-pink-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {sub}
          </button>
        ))}
      </div>
      {cities.length > 0 && (
        <select
          value={activeCity || ""}
          onChange={(e) => navigate(activeSub, e.target.value || undefined)}
          className="px-3 py-1.5 border border-gray-300 rounded-full text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          <option value="">All Cities</option>
          {cities.map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      )}
    </div>
  );
}
