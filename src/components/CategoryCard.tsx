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

export default function CategoryCard({
  category,
  count,
}: {
  category: Category;
  count: number;
}) {
  const Icon = iconMap[category.icon] || Sparkles;

  return (
    <Link
      href={`/categories/${category.slug}`}
      className="flex flex-col items-center p-6 bg-white rounded-xl border border-gray-200 hover:shadow-lg hover:border-pink-200 transition-all duration-200 group"
    >
      <div className="w-14 h-14 rounded-full bg-pink-50 flex items-center justify-center mb-3 group-hover:bg-pink-100 transition-colors">
        <Icon className="w-7 h-7 text-pink-500" />
      </div>
      <h3 className="font-semibold text-gray-900 text-center text-sm">
        {category.name}
      </h3>
      <p className="text-xs text-gray-400 mt-1">{count} businesses</p>
    </Link>
  );
}
