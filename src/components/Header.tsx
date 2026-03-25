"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Store } from "lucide-react";
import InlineSearch from "@/components/InlineSearch";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Store className="w-7 h-7 text-pink-500" />
            <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              ShopFinder
            </span>
          </Link>

          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <InlineSearch variant="header" />
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/categories" className="text-sm text-gray-600 hover:text-gray-900">
              Browse
            </Link>
            <Link href="/submit" className="text-sm bg-pink-500 text-white px-4 py-2 rounded-full hover:bg-pink-600 transition">
              Submit Business
            </Link>
          </nav>

          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-3">
            <InlineSearch
              variant="header"
              placeholder="Search businesses..."
              onResultClick={() => setMobileMenuOpen(false)}
            />
            <Link href="/submit" className="block text-center text-sm bg-pink-500 text-white px-4 py-2 rounded-full" onClick={() => setMobileMenuOpen(false)}>
              Submit Business
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
