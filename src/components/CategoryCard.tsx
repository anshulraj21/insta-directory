import Link from "next/link";
import {
  Shirt, Gem, Home, Cake, Sparkles, Palette,
  Baby, PawPrint, Leaf, HeartPulse, Smartphone,
} from "lucide-react";
import { Category } from "@/lib/types";

const iconMap: Record<string, React.ElementType> = {
  shirt: Shirt,
  gem: Gem,
  home: Home,
  cake: Cake,
  sparkles: Sparkles,
  palette: Palette,
  baby: Baby,
  "paw-print": PawPrint,
  leaf: Leaf,
  "heart-pulse": HeartPulse,
  smartphone: Smartphone,
};

const gradientMap: Record<string, string> = {
  shirt: "from-pink-400 to-rose-500",
  gem: "from-purple-400 to-indigo-500",
  home: "from-amber-400 to-orange-500",
  cake: "from-yellow-400 to-pink-500",
  sparkles: "from-fuchsia-400 to-pink-500",
  palette: "from-cyan-400 to-blue-500",
  baby: "from-sky-400 to-indigo-400",
  "paw-print": "from-emerald-400 to-teal-500",
  leaf: "from-green-400 to-emerald-500",
  "heart-pulse": "from-red-400 to-rose-500",
  smartphone: "from-slate-400 to-gray-600",
};

export default function CategoryCard({
  category,
  count,
}: {
  category: Category;
  count: number;
}) {
  const Icon = iconMap[category.icon] || Sparkles;
  const gradient = gradientMap[category.icon] || "from-pink-400 to-purple-500";

  return (
    <Link
      href={`/categories/${category.slug}`}
      className="flex flex-col items-center overflow-hidden rounded-xl border border-gray-200 hover:shadow-lg hover:border-pink-200 transition-all duration-200 group bg-white"
    >
      <div
        className={`w-full py-6 flex items-center justify-center bg-gradient-to-br ${gradient} relative`}
      >
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 80" preserveAspectRatio="none">
            <circle cx="80" cy="10" r="30" fill="white" />
            <circle cx="20" cy="70" r="20" fill="white" />
          </svg>
        </div>
        <Icon className="w-10 h-10 text-white drop-shadow-md relative z-10 group-hover:scale-110 transition-transform duration-200" />
      </div>
      <div className="p-3 text-center">
        <h3 className="font-semibold text-gray-900 text-sm leading-tight">
          {category.name}
        </h3>
        <p className="text-xs text-gray-400 mt-1">{count} businesses</p>
      </div>
    </Link>
  );
}
