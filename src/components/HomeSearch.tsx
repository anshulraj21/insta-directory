"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, X, MapPin, ExternalLink, Loader2 } from "lucide-react";
import { Business } from "@/lib/types";

export default function HomeSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }

    setLoading(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/businesses/search?q=${encodeURIComponent(query.trim())}`
        );
        const data = await res.json();
        setResults(data.businesses || []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative max-w-md w-full mx-auto">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search businesses, categories, cities..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && results.length > 0 && setOpen(true)}
          className="w-full pl-12 pr-10 py-3 bg-white border border-gray-300 rounded-full text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent hover:border-pink-300 hover:shadow-md transition-all"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
              setOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {loading && (
          <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-500 animate-spin" />
        )}
      </div>

      {open && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-xl border border-gray-200 shadow-xl z-50 max-h-[400px] overflow-y-auto">
          {results.length === 0 && !loading && (
            <div className="p-6 text-center text-gray-500 text-sm">
              No businesses found for &ldquo;{query}&rdquo;
            </div>
          )}
          {results.slice(0, 8).map((b) => {
            const handle = b.instagramHandle.replace("@", "");
            return (
              <Link
                key={b.id}
                href={`/business/${handle}`}
                onClick={() => setOpen(false)}
                className="flex items-start gap-3 px-4 py-3 hover:bg-pink-50 transition-colors border-b border-gray-50 last:border-0"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-sm truncate">
                    {b.businessName}
                  </div>
                  <div className="text-xs text-pink-500 flex items-center gap-1">
                    {b.instagramHandle}
                    <ExternalLink className="w-3 h-3" />
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-pink-50 text-pink-700 px-1.5 py-0.5 rounded">
                      {b.subCategory}
                    </span>
                    {b.city && (
                      <span className="text-xs text-gray-400 flex items-center gap-0.5">
                        <MapPin className="w-3 h-3" />
                        {b.city}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
          {results.length > 8 && (
            <Link
              href={`/search?q=${encodeURIComponent(query)}`}
              onClick={() => setOpen(false)}
              className="block text-center py-3 text-sm text-pink-500 hover:text-pink-600 font-medium border-t border-gray-100"
            >
              View all {results.length} results
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
