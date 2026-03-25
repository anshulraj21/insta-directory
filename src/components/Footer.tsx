import Link from "next/link";
import { Store } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Store className="w-6 h-6 text-pink-500" />
              <span className="text-lg font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                ShopFinder
              </span>
            </div>
            <p className="text-sm text-gray-500">
              Discover the best small businesses on Instagram in India. Curated, rated, and loved by the community.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/" className="hover:text-gray-900">Home</Link></li>
              <li><Link href="/submit" className="hover:text-gray-900">Submit a Business</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Popular Categories</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/categories/fashion-ethnic-wear" className="hover:text-gray-900">Fashion & Ethnic Wear</Link></li>
              <li><Link href="/categories/jewelry-accessories" className="hover:text-gray-900">Jewelry & Accessories</Link></li>
              <li><Link href="/categories/beauty-skincare" className="hover:text-gray-900">Beauty & Skincare</Link></li>
              <li><Link href="/categories/food-home-bakers" className="hover:text-gray-900">Food & Home Bakers</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} ShopFinder. Built with love for small businesses.
        </div>
      </div>
    </footer>
  );
}
