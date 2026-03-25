"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";

interface Props {
  slug: string;
  subCategories: string[];
  cities: string[];
  activeSub?: string;
  activeCity?: string;
  activeSort?: string;
  totalCount: number;
}

const SORT_OPTIONS = [
  { value: "", label: "Recommended" },
  { value: "highest-rated", label: "Highest Rated" },
  { value: "most-reviewed", label: "Most Reviewed" },
  { value: "name-asc", label: "A-Z" },
  { value: "name-desc", label: "Z-A" },
  { value: "newest", label: "Newest Added" },
  { value: "city", label: "By City" },
];

export default function CategoryFilter({
  slug,
  subCategories,
  cities,
  activeSub,
  activeCity,
  activeSort,
  totalCount,
}: Props) {
  const router = useRouter();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const hasFilters = activeSub || activeCity;

  function navigate(sub?: string, city?: string, sort?: string) {
    const params = new URLSearchParams();
    if (sub) params.set("sub", sub);
    if (city) params.set("city", city);
    if (sort) params.set("sort", sort);
    const qs = params.toString();
    router.push(`/categories/${slug}${qs ? `?${qs}` : ""}`);
  }

  function clearAll() {
    router.push(`/categories/${slug}`);
  }

  return (
    <div className="mb-6">
      {/* Mobile filter toggle + sort row */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="md:hidden inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {hasFilters && (
              <span className="w-5 h-5 bg-pink-500 text-white rounded-full text-xs flex items-center justify-center">
                {(activeSub ? 1 : 0) + (activeCity ? 1 : 0)}
              </span>
            )}
          </button>
          <span className="text-sm text-gray-500">
            {totalCount} business{totalCount !== 1 ? "es" : ""}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {hasFilters && (
            <button
              onClick={clearAll}
              className="text-xs text-pink-500 hover:text-pink-600 flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Clear all
            </button>
          )}
          <div className="relative">
            <select
              value={activeSort || ""}
              onChange={(e) => navigate(activeSub, activeCity, e.target.value || undefined)}
              className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  Sort: {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Active filter chips */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2 mb-3">
          {activeSub && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-pink-50 text-pink-700 rounded-full text-xs">
              {activeSub}
              <button
                onClick={() => navigate(undefined, activeCity, activeSort)}
                className="hover:text-pink-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {activeCity && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-pink-50 text-pink-700 rounded-full text-xs">
              {activeCity}
              <button
                onClick={() => navigate(activeSub, undefined, activeSort)}
                className="hover:text-pink-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Desktop filters (always visible) */}
      <div className="hidden md:block">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate(undefined, activeCity, activeSort)}
              className={`px-3 py-1.5 rounded-full text-sm transition ${
                !activeSub
                  ? "bg-pink-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            {subCategories.map((sub) => (
              <button
                key={sub}
                onClick={() => navigate(sub, activeCity, activeSort)}
                className={`px-3 py-1.5 rounded-full text-sm transition ${
                  activeSub === sub
                    ? "bg-pink-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
          {cities.length > 0 && (
            <select
              value={activeCity || ""}
              onChange={(e) =>
                navigate(activeSub, e.target.value || undefined, activeSort)
              }
              className="px-3 py-1.5 border border-gray-300 rounded-full text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="">All Cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Mobile filters (slide-down) */}
      {mobileFiltersOpen && (
        <div className="md:hidden bg-white border border-gray-200 rounded-lg p-4 space-y-4 animate-in slide-in-from-top-2">
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Sub-category
            </h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  navigate(undefined, activeCity, activeSort);
                  setMobileFiltersOpen(false);
                }}
                className={`px-3 py-1.5 rounded-full text-xs transition ${
                  !activeSub
                    ? "bg-pink-500 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                All
              </button>
              {subCategories.map((sub) => (
                <button
                  key={sub}
                  onClick={() => {
                    navigate(sub, activeCity, activeSort);
                    setMobileFiltersOpen(false);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs transition ${
                    activeSub === sub
                      ? "bg-pink-500 text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>

          {cities.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                City
              </h4>
              <select
                value={activeCity || ""}
                onChange={(e) => {
                  navigate(activeSub, e.target.value || undefined, activeSort);
                  setMobileFiltersOpen(false);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
              >
                <option value="">All Cities</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
