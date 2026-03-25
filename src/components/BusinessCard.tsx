import Link from "next/link";
import { MapPin, ExternalLink } from "lucide-react";
import { Business } from "@/lib/types";

export default function BusinessCard({ business }: { business: Business }) {
  const handle = business.instagramHandle.replace("@", "");

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-pink-200 transition-all duration-200 group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <Link href={`/business/${handle}`}>
            <h3 className="font-semibold text-gray-900 truncate group-hover:text-pink-600 transition-colors">
              {business.businessName}
            </h3>
          </Link>
          <a
            href={`https://instagram.com/${handle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-pink-500 hover:text-pink-600 flex items-center gap-1"
          >
            {business.instagramHandle}
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
        {business.description}
      </p>

      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="text-xs bg-pink-50 text-pink-700 px-2 py-1 rounded-full">
          {business.subCategory}
        </span>
        {business.city && (
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {business.city}{business.state ? `, ${business.state}` : ""}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {business.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
