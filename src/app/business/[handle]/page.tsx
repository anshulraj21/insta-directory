import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, MapPin, ExternalLink, Tag, Store } from "lucide-react";
import { getAllBusinesses, getBusinessByHandle, getAllCategories, getRelatedBusinesses } from "@/lib/data";
import BusinessCard from "@/components/BusinessCard";
import InstagramEmbed from "@/components/InstagramEmbed";
import BusinessThumbnail from "@/components/BusinessThumbnail";

interface Props {
  params: Promise<{ handle: string }>;
}

export const revalidate = 60;

export async function generateStaticParams() {
  const businesses = await getAllBusinesses();
  return businesses.map((b) => ({
    handle: b.instagramHandle.replace("@", ""),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const business = await getBusinessByHandle(handle);
  if (!business) return {};
  return {
    title: `${business.businessName} - ${business.subCategory} on Instagram`,
    description: `${business.description}. Find ${business.businessName} (${business.instagramHandle}) on Instagram. ${business.category} in India.`,
    openGraph: {
      title: `${business.businessName} - ${business.subCategory} on Instagram`,
      description: `${business.description}. ${business.category} in India.`,
    },
    alternates: {
      canonical: `/business/${handle}`,
    },
  };
}

export default async function BusinessPage({ params }: Props) {
  const { handle } = await params;
  const business = await getBusinessByHandle(handle);
  if (!business) notFound();

  const categories = await getAllCategories();
  const categorySlug = categories.find((c) => c.name === business.category)?.slug || "";

  const relatedBusinesses = await getRelatedBusinesses(business.category, business.id, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: business.businessName,
    description: business.description,
    url: `https://shopfinder.com/business/${handle}`,
    sameAs: [`https://instagram.com/${handle}`],
    address: {
      "@type": "PostalAddress",
      addressLocality: business.city || undefined,
      addressRegion: business.state || undefined,
      addressCountry: "IN",
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://shopfinder.com" },
        { "@type": "ListItem", position: 2, name: business.category, item: `https://shopfinder.com/categories/${categorySlug}` },
        { "@type": "ListItem", position: 3, name: business.businessName },
      ],
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-gray-900">Home</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href={`/categories/${categorySlug}`} className="hover:text-gray-900">
          {business.category}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900">{business.businessName}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <BusinessThumbnail
              businessName={business.businessName}
              category={business.category}
              size="lg"
            />
            <div className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {business.businessName}
                </h1>
                <a
                  href={`https://instagram.com/${handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-500 hover:text-pink-600 flex items-center gap-1 text-lg"
                >
                  <Store className="w-5 h-5" />
                  {business.instagramHandle}
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            <p className="text-gray-700 text-lg mb-6">{business.description}</p>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-500 w-24">Category</span>
                <Link
                  href={`/categories/${categorySlug}`}
                  className="text-sm text-pink-600 hover:underline"
                >
                  {business.category}
                </Link>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-500 w-24">Sub-category</span>
                <span className="text-sm bg-pink-50 text-pink-700 px-2 py-1 rounded-full">
                  {business.subCategory}
                </span>
              </div>
              {(business.city || business.state) && (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-500 w-24">Location</span>
                  <span className="text-sm text-gray-700 flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {[business.city, business.state].filter(Boolean).join(", ")}
                  </span>
                </div>
              )}
              <div className="flex items-start gap-3">
                <span className="text-sm font-medium text-gray-500 w-24 pt-0.5">Tags</span>
                <div className="flex flex-wrap gap-2">
                  {business.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded flex items-center gap-1"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <a
                href={`https://instagram.com/${handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-full hover:opacity-90 transition font-medium"
              >
                <Store className="w-5 h-5" />
                Visit on Instagram
              </a>
            </div>
          </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <InstagramEmbed handle={handle} />

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Info</h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-gray-500">Country</dt>
                <dd className="font-medium">{business.country}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Added</dt>
                <dd className="font-medium">{new Date(business.addedAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Related Businesses */}
      {relatedBusinesses.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            More in {business.category}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedBusinesses.map((b) => (
              <BusinessCard key={b.id} business={b} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
