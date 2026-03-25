import { Camera } from "lucide-react";

const categoryGradients: Record<string, string> = {
  "Fashion & Ethnic Wear": "from-pink-400 to-rose-500",
  "Jewelry & Accessories": "from-purple-400 to-indigo-500",
  "Home Decor & Handicrafts": "from-amber-400 to-orange-500",
  "Food & Home Bakers": "from-yellow-400 to-pink-500",
  "Beauty & Skincare": "from-fuchsia-400 to-pink-500",
  "Art & Stationery": "from-cyan-400 to-blue-500",
  "Kids & Baby Products": "from-sky-400 to-indigo-400",
  "Pet Products": "from-emerald-400 to-teal-500",
  "Plants & Gardening": "from-green-400 to-emerald-500",
  "Health & Wellness": "from-red-400 to-rose-500",
  "Tech Accessories": "from-slate-400 to-gray-600",
};

export default function BusinessThumbnail({
  businessName,
  category,
  thumbnailUrl,
  size = "md",
}: {
  businessName: string;
  category: string;
  thumbnailUrl?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "w-12 h-12 text-lg",
    md: "w-full aspect-[4/3] text-4xl",
    lg: "w-full aspect-[16/9] text-5xl",
  };

  if (thumbnailUrl) {
    return (
      <div className={`${sizeClasses[size]} overflow-hidden rounded-t-xl`}>
        <img
          src={thumbnailUrl}
          alt={businessName}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    );
  }

  const gradient =
    categoryGradients[category] || "from-pink-400 to-purple-500";
  const initials = businessName
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className={`${sizeClasses[size]} bg-gradient-to-br ${gradient} flex items-center justify-center relative overflow-hidden ${size === "sm" ? "rounded-lg" : "rounded-t-xl"}`}
    >
      {/* Decorative circles */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-4 -right-4 w-20 h-20 bg-white rounded-full" />
        <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white rounded-full" />
      </div>
      {/* Business initials */}
      <span className="font-bold text-white/90 relative z-10 drop-shadow-md">
        {initials}
      </span>
      {/* Instagram badge */}
      <div className="absolute bottom-2 right-2 bg-white/20 backdrop-blur-sm rounded-full p-1.5 z-10">
        <Camera className="w-3.5 h-3.5 text-white" />
      </div>
    </div>
  );
}
