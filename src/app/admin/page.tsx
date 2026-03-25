"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Search, Save, Loader2, Shield, RefreshCw } from "lucide-react";
import { Business } from "@/lib/types";

const ADMIN_EMAILS = [
  "anshulraj.21@gmail.com", // Add admin emails here
];

interface BusinessWithMetrics extends Business {
  instagram?: {
    followerCount: number;
    postCount: number;
    avgLikesPerPost: number;
    avgCommentsPerPost: number;
    lastPostDate: string;
    metricsUpdatedAt: string;
  };
  scores?: {
    quality: number;
    activity: number;
    engagement: number;
    community: number;
    overall: number;
  };
  sizeCategory?: string;
  priceRange?: string;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [businesses, setBusinesses] = useState<BusinessWithMetrics[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [metrics, setMetrics] = useState({
    followerCount: 0,
    postCount: 0,
    avgLikesPerPost: 0,
    avgCommentsPerPost: 0,
    lastPostDate: "",
    qualityScore: 50,
    priceRange: "mid-range",
  });

  const isAdmin =
    session?.user?.email && ADMIN_EMAILS.includes(session.user.email);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  async function fetchBusinesses() {
    setLoading(true);
    try {
      const res = await fetch("/api/businesses");
      const data = await res.json();
      setBusinesses(data.businesses || []);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }

  async function saveMetrics(businessId: string) {
    setSaving(businessId);
    try {
      const res = await fetch("/api/admin/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId, ...metrics }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setEditingId(null);
      fetchBusinesses();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save metrics");
    } finally {
      setSaving(null);
    }
  }

  function startEditing(biz: BusinessWithMetrics) {
    setEditingId(biz.id);
    setMetrics({
      followerCount: biz.instagram?.followerCount || 0,
      postCount: biz.instagram?.postCount || 0,
      avgLikesPerPost: biz.instagram?.avgLikesPerPost || 0,
      avgCommentsPerPost: biz.instagram?.avgCommentsPerPost || 0,
      lastPostDate: biz.instagram?.lastPostDate || "",
      qualityScore: biz.scores?.quality || 50,
      priceRange: biz.priceRange || "mid-range",
    });
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Admin Access Required
        </h1>
        <p className="text-gray-500">
          You must be signed in with an admin account to access this page.
        </p>
      </div>
    );
  }

  const filtered = businesses.filter(
    (b) =>
      !search.trim() ||
      b.businessName.toLowerCase().includes(search.toLowerCase()) ||
      b.instagramHandle.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-sm text-gray-500">
            Manage business metrics and scores ({businesses.length} businesses)
          </p>
        </div>
        <button
          onClick={fetchBusinesses}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search businesses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : (
        <div className="space-y-3">
          {filtered.slice(0, 50).map((biz) => (
            <div
              key={biz.id}
              className="bg-white border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {biz.businessName}
                    </h3>
                    <span className="text-xs text-pink-500">
                      {biz.instagramHandle}
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                      {biz.category}
                    </span>
                  </div>
                  {biz.scores && (
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      <span>
                        Overall:{" "}
                        <strong className="text-gray-900">
                          {biz.scores.overall}
                        </strong>
                      </span>
                      <span>Q: {biz.scores.quality}</span>
                      <span>A: {biz.scores.activity}</span>
                      <span>E: {biz.scores.engagement}</span>
                      <span>C: {biz.scores.community}</span>
                      {biz.instagram?.followerCount && (
                        <span>
                          {biz.instagram.followerCount.toLocaleString()}{" "}
                          followers
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <button
                  onClick={() =>
                    editingId === biz.id
                      ? setEditingId(null)
                      : startEditing(biz)
                  }
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded transition"
                >
                  {editingId === biz.id ? "Cancel" : "Edit Metrics"}
                </button>
              </div>

              {editingId === biz.id && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Followers
                      </label>
                      <input
                        type="number"
                        value={metrics.followerCount}
                        onChange={(e) =>
                          setMetrics({
                            ...metrics,
                            followerCount: Number(e.target.value),
                          })
                        }
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Post Count
                      </label>
                      <input
                        type="number"
                        value={metrics.postCount}
                        onChange={(e) =>
                          setMetrics({
                            ...metrics,
                            postCount: Number(e.target.value),
                          })
                        }
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Avg Likes/Post
                      </label>
                      <input
                        type="number"
                        value={metrics.avgLikesPerPost}
                        onChange={(e) =>
                          setMetrics({
                            ...metrics,
                            avgLikesPerPost: Number(e.target.value),
                          })
                        }
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Avg Comments/Post
                      </label>
                      <input
                        type="number"
                        value={metrics.avgCommentsPerPost}
                        onChange={(e) =>
                          setMetrics({
                            ...metrics,
                            avgCommentsPerPost: Number(e.target.value),
                          })
                        }
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Last Post Date
                      </label>
                      <input
                        type="date"
                        value={metrics.lastPostDate.split("T")[0]}
                        onChange={(e) =>
                          setMetrics({
                            ...metrics,
                            lastPostDate: e.target.value,
                          })
                        }
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Quality Score (0-100)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={metrics.qualityScore}
                        onChange={(e) =>
                          setMetrics({
                            ...metrics,
                            qualityScore: Number(e.target.value),
                          })
                        }
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Price Range
                      </label>
                      <select
                        value={metrics.priceRange}
                        onChange={(e) =>
                          setMetrics({
                            ...metrics,
                            priceRange: e.target.value,
                          })
                        }
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                      >
                        <option value="budget">Budget</option>
                        <option value="mid-range">Mid-Range</option>
                        <option value="premium">Premium</option>
                        <option value="luxury">Luxury</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={() => saveMetrics(biz.id)}
                        disabled={saving === biz.id}
                        className="inline-flex items-center gap-1.5 bg-pink-500 text-white px-4 py-1.5 rounded text-sm hover:bg-pink-600 transition disabled:opacity-50"
                      >
                        {saving === biz.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Save className="w-3.5 h-3.5" />
                        )}
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          {filtered.length > 50 && (
            <p className="text-center text-sm text-gray-400 py-4">
              Showing 50 of {filtered.length} businesses. Use search to narrow
              down.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
