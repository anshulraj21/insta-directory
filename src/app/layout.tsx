import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://shopfinder.in"),
  title: {
    default: "ShopFinder - Discover Small Businesses on Instagram in India",
    template: "%s | ShopFinder",
  },
  description:
    "Discover 425+ curated small businesses on Instagram in India. Browse by category, read community ratings, and find hidden gems across fashion, jewelry, food, beauty, and more.",
  keywords: [
    "Instagram businesses India",
    "small business India",
    "Instagram shops",
    "handmade India",
    "artisan brands",
    "shop on Instagram",
    "Indian small businesses",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "ShopFinder",
    title: "ShopFinder - Discover Small Businesses on Instagram in India",
    description:
      "Browse 425+ curated Indian small businesses on Instagram. Fashion, jewelry, food, beauty, home decor, and more.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ShopFinder - Discover Small Businesses on Instagram",
    description:
      "Browse 425+ curated Indian small businesses on Instagram across 11 categories.",
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
