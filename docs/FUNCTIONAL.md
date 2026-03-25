# ShopFinder -- Functional Documentation

**Version:** 0.1.0
**Last Updated:** 2026-03-25

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Target Audience and Market](#target-audience-and-market)
3. [Feature List](#feature-list)
4. [User Flows](#user-flows)
5. [Pages and Functionality](#pages-and-functionality)
6. [SEO Features](#seo-features)
7. [Business Submission Workflow](#business-submission-workflow)
8. [Data Model](#data-model)
9. [API Endpoints](#api-endpoints)

---

## Project Overview

ShopFinder is a curated web directory of small businesses operating on Instagram in India. The platform enables users to discover, browse, search, and filter Instagram-based small businesses across multiple product categories. It serves as a bridge between Instagram sellers and potential customers by providing a structured, searchable catalog of verified businesses.

The project is built as a server-rendered Next.js application backed by MongoDB Atlas, optimized for SEO to attract organic traffic from users searching for Indian small businesses on Instagram.

### Core Value Proposition

- **For Consumers:** A single place to discover trusted small businesses on Instagram, organized by category, sub-category, and city.
- **For Business Owners:** Free listing in a curated directory that drives traffic to their Instagram profiles.
- **For the Community:** A submission-driven model where anyone can recommend businesses they know and trust.

---

## Target Audience and Market

### Primary Audience

| Segment | Description |
|---------|-------------|
| Instagram Shoppers | Indian consumers who prefer buying from small/indie Instagram businesses over large e-commerce platforms |
| Gift Seekers | People looking for unique, handmade, or artisan products for gifting |
| Local Supporters | Consumers who want to support local and small-scale Indian entrepreneurs |
| Category Browsers | Users looking for specific product types (ethnic wear, handmade jewelry, home bakers, etc.) |

### Market Context

- **Geography:** India
- **Platform Focus:** Instagram-based businesses exclusively
- **Category Breadth:** 11 categories spanning fashion, food, beauty, home decor, kids products, pets, plants, health, art, jewelry, and tech accessories
- **Scale:** 425+ curated businesses at launch

---

## Feature List

### Current Features

| Feature | Status | Description |
|---------|--------|-------------|
| Category Browsing | Live | Browse businesses across 11 categories with sub-category filters |
| Full-Text Search | Live | Search by business name, handle, description, category, city, or state |
| Business Profiles | Live | Dedicated pages for each business with details, tags, and Instagram link |
| City Filtering | Live | Filter businesses within a category by city |
| Sub-Category Filtering | Live | Filter businesses within a category by sub-category |
| Pagination | Live | Paginated listing on category pages (24 per page) |
| Business Submission | Live | Community-driven submission form with moderation queue |
| Related Businesses | Live | "More in this category" section on business detail pages |
| Featured Businesses | Live | Homepage showcase of select businesses |
| Dynamic Sitemap | Live | Auto-generated sitemap covering all businesses and categories |
| JSON-LD Structured Data | Live | Schema.org markup on all key pages |
| Responsive Design | Live | Mobile-first layout with responsive breakpoints |
| SEO Metadata | Live | Per-page Open Graph, Twitter Card, and canonical URL metadata |

### Planned Features

| Feature | Description |
|---------|-------------|
| Admin Dashboard | Review and approve/reject submitted businesses |
| User Ratings | Community ratings and reviews for listed businesses |
| Verified Badges | Visual indicator for verified/premium businesses |
| City Pages | Dedicated landing pages for major cities |
| Follower Count Display | Show Instagram follower counts via API integration |
| Favorites/Bookmarks | Allow users to save businesses for later |

---

## User Flows

### 1. Browse by Category

```
Homepage
  |
  +--> Click category card (e.g., "Jewelry & Accessories")
         |
         +--> Category page loads with all businesses in that category
                |
                +--> (Optional) Filter by sub-category (e.g., "Handmade Jewelry")
                |
                +--> (Optional) Filter by city (e.g., "Mumbai")
                |
                +--> (Optional) Navigate pagination
                |
                +--> Click a business card
                       |
                       +--> Business detail page
                              |
                              +--> Click "Visit on Instagram" --> Instagram profile
```

### 2. Search for a Business

```
Any page (Header search bar)
  |
  +--> Type search query and press Enter
         |
         +--> Search results page with matching businesses
                |
                +--> Click a business card
                       |
                       +--> Business detail page
```

### 3. Submit a Business

```
Any page
  |
  +--> Click "Submit Business" in header/CTA
         |
         +--> Submit form page
                |
                +--> Fill in: Instagram handle, business name, category, city, description
                |
                +--> Click "Submit Business"
                       |
                       +--> (Success) Confirmation screen with thank-you message
                       |
                       +--> (Error) Error message displayed inline
```

### 4. Discover from Homepage

```
Homepage
  |
  +--> View stats (business count, category count)
  |
  +--> Browse category grid
  |
  +--> View featured businesses section
  |
  +--> Click "Submit a Business" CTA
```

---

## Pages and Functionality

### Homepage (`/`)

| Aspect | Detail |
|--------|--------|
| Rendering | ISR with 60-second revalidation |
| Sections | Hero with search CTA, Stats bar, Category grid, Featured businesses, Submit CTA |
| Data Loaded | All categories with per-category business counts, business/category totals, 8 featured businesses |
| Structured Data | `WebSite` schema with `SearchAction` |

### Category Page (`/categories/[slug]`)

| Aspect | Detail |
|--------|--------|
| Rendering | ISR with 60-second revalidation; statically generated at build via `generateStaticParams` |
| Features | Breadcrumb navigation, sub-category filter buttons, city dropdown filter, pagination (24/page), business count |
| Query Parameters | `sub` (sub-category filter), `city` (city filter), `page` (pagination) |
| Structured Data | `CollectionPage` schema with `BreadcrumbList` |

### Business Detail Page (`/business/[handle]`)

| Aspect | Detail |
|--------|--------|
| Rendering | ISR with 60-second revalidation; statically generated at build via `generateStaticParams` |
| Features | Breadcrumb, full business info (name, handle, description, category, sub-category, location, tags), Instagram link, quick info sidebar, related businesses (up to 4) |
| Structured Data | `LocalBusiness` schema with `BreadcrumbList` and `sameAs` linking to Instagram |

### Search Page (`/search`)

| Aspect | Detail |
|--------|--------|
| Rendering | Fully dynamic (`force-dynamic`), SSR on every request |
| Features | Breadcrumb, search results grid, empty state with category browsing suggestion |
| Query Parameters | `q` (search query string) |

### Submit Page (`/submit`)

| Aspect | Detail |
|--------|--------|
| Rendering | Client-side rendered (`"use client"`) |
| Features | Form with validation, loading state, error display, success confirmation |
| Form Fields | Instagram Handle (required), Business Name (required), Category dropdown (required), City (optional), Description (required) |

---

## SEO Features

### Metadata Strategy

| Feature | Implementation |
|---------|---------------|
| Title Template | `"%s | ShopFinder"` with default `"ShopFinder - Discover Small Businesses on Instagram in India"` |
| Meta Description | Unique per page, dynamically generated for category and business pages |
| Open Graph Tags | `og:title`, `og:description`, `og:type`, `og:locale` (en_IN), `og:site_name` |
| Twitter Cards | `summary_large_image` card type with title and description |
| Canonical URLs | Set on every page via `alternates.canonical` |
| Keywords | Targeted keywords including "Instagram businesses India", "small business India", "artisan brands" |

### Structured Data (JSON-LD)

| Page | Schema Type | Key Properties |
|------|-------------|---------------|
| Homepage | `WebSite` | `name`, `url`, `description`, `SearchAction` with query parameter |
| Category Page | `CollectionPage` | `name`, `description`, `url`, `BreadcrumbList` |
| Business Page | `LocalBusiness` | `name`, `description`, `url`, `sameAs` (Instagram), `PostalAddress`, `BreadcrumbList` |

### Sitemap and Robots

- **Sitemap** (`/sitemap.xml`): Dynamically generated, includes homepage (priority 1.0), category pages (priority 0.8), all approved business pages (priority 0.7), and submit page (priority 0.3).
- **Robots** (`/robots.txt`): Allows all crawlers on all paths except `/api/`. References sitemap URL.

---

## Business Submission Workflow

```
User submits form
       |
       v
POST /api/businesses/submit
       |
       +--> Validate required fields
       |      (instagramHandle, businessName, category, description)
       |
       +--> Check for duplicate Instagram handle
       |      |
       |      +--> (Duplicate found) Return 400 error
       |
       +--> Insert into MongoDB with status: "pending"
       |
       v
Business stored in DB (not visible on site)
       |
       v
[Manual Review Required -- Admin changes status to "approved"]
       |
       v
Business appears in directory
```

### Submission Details

- Submitted businesses receive an auto-generated ID in the format `submitted-{timestamp}`.
- The `status` field defaults to `"pending"`, meaning newly submitted businesses are **not visible** in the directory until manually approved.
- All public-facing queries filter on `status: "approved"`, ensuring only reviewed businesses appear.
- Duplicate Instagram handles are rejected at submission time.
- The `country` field is automatically set to `"India"`.
- The `verified` flag defaults to `false` for submissions.

---

## Data Model

### Business Entity

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes | Unique identifier (e.g., `"fashion-001"` or `"submitted-1711234567890"`) |
| `instagramHandle` | `string` | Yes | Instagram handle prefixed with `@` (e.g., `"@shopname"`) |
| `businessName` | `string` | Yes | Display name of the business |
| `category` | `string` | Yes | Primary category name (e.g., `"Fashion & Ethnic Wear"`) |
| `subCategory` | `string` | Yes | Sub-category within the primary category (e.g., `"Sarees"`) |
| `city` | `string` | No | City where the business is based |
| `state` | `string` | No | State where the business is based |
| `country` | `string` | Yes | Country (currently always `"India"`) |
| `description` | `string` | Yes | Brief description of the business and its products |
| `tags` | `string[]` | Yes | Array of keyword tags for the business |
| `verified` | `boolean` | Yes | Whether the business has been verified |
| `addedAt` | `string` | Yes | Date the business was added (ISO date format, e.g., `"2025-01-15"`) |
| `status` | `"approved" \| "pending"` | No | Moderation status; defaults to `"approved"` for seeded data, `"pending"` for submissions |

### Category Entity

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes | Unique slug-style identifier (e.g., `"fashion-ethnic-wear"`) |
| `name` | `string` | Yes | Display name (e.g., `"Fashion & Ethnic Wear"`) |
| `slug` | `string` | Yes | URL-safe slug used in routes (e.g., `"fashion-ethnic-wear"`) |
| `icon` | `string` | Yes | Lucide icon key (e.g., `"shirt"`, `"gem"`, `"cake"`) |
| `description` | `string` | Yes | Category description shown on category pages |
| `subCategories` | `string[]` | Yes | List of sub-category names available for filtering |

### SubmitBusinessInput (Form Input)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `instagramHandle` | `string` | Yes | Instagram handle (with or without `@` prefix) |
| `businessName` | `string` | Yes | Name of the business |
| `category` | `string` | Yes | Selected category from dropdown |
| `city` | `string` | No | City of the business |
| `state` | `string` | No | State of the business |
| `description` | `string` | Yes | Description of the business |

### Categories Available

| Category | Sub-Categories |
|----------|---------------|
| Fashion & Ethnic Wear | Sarees, Kurtis & Ethnic, Sustainable Fashion, Western Wear, Streetwear, Bridal Wear, Menswear, Footwear, Plus Size |
| Jewelry & Accessories | Handmade Jewelry, Silver & Oxidized, Temple & Bridal, Polymer Clay & Resin, Imitation Jewelry, Bags & Clutches, Hair Accessories |
| Home Decor & Handicrafts | Pottery & Ceramics, Candles, Handicrafts, Furniture & Furnishings, Wall Art, Macrame & Textiles, Lighting |
| Food & Home Bakers | Home Bakers, Artisan Chocolate, Organic Food, Pickles & Condiments, Tea & Coffee, Health Food, Snacks |
| Beauty & Skincare | Natural Skincare, Ayurvedic, Handmade Soaps, Haircare, Men's Grooming, Organic Makeup, Perfumes & Attars |
| Art & Stationery | Stationery & Planners, Art Prints, Calligraphy, Resin Art, Custom Gifts |
| Kids & Baby Products | (sub-categories defined in data) |
| Pet Products | (sub-categories defined in data) |
| Plants & Gardening | (sub-categories defined in data) |
| Health & Wellness | (sub-categories defined in data) |
| Tech Accessories | (sub-categories defined in data) |

---

## API Endpoints

### GET `/api/businesses`

List businesses with optional filters and pagination.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `category` | string | -- | Filter by category name |
| `sub` | string | -- | Filter by sub-category name |
| `city` | string | -- | Filter by city (case-insensitive) |
| `page` | number | 1 | Page number |
| `limit` | number | 24 | Results per page (max 100) |

**Response:**

```json
{
  "businesses": [
    {
      "id": "fashion-001",
      "instagramHandle": "@example_shop",
      "businessName": "Example Shop",
      "category": "Fashion & Ethnic Wear",
      "subCategory": "Sarees",
      "city": "Mumbai",
      "state": "Maharashtra",
      "country": "India",
      "description": "Handloom sarees from across India",
      "tags": ["handloom", "sarees", "traditional"],
      "verified": true,
      "addedAt": "2025-01-15",
      "status": "approved"
    }
  ],
  "total": 42,
  "page": 1,
  "totalPages": 2
}
```

---

### GET `/api/businesses/search`

Search businesses by text query.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | Yes | Search query string |

**Response:**

```json
{
  "businesses": [ ... ],
  "total": 5
}
```

**Search Behavior:**
- Uses MongoDB `$text` index for full-text search across business name, handle, description, category, sub-category, city, and state.
- Falls back to regex-based search if the text index is unavailable.
- Limited to 50 results.
- Returns only businesses with `status: "approved"`.

---

### POST `/api/businesses/submit`

Submit a new business for review.

**Request Body:**

```json
{
  "instagramHandle": "@new_shop",
  "businessName": "New Shop",
  "category": "Jewelry & Accessories",
  "city": "Delhi",
  "state": "Delhi",
  "description": "Handcrafted silver jewelry"
}
```

| Field | Type | Required |
|-------|------|----------|
| `instagramHandle` | string | Yes |
| `businessName` | string | Yes |
| `category` | string | Yes |
| `city` | string | No |
| `state` | string | No |
| `description` | string | Yes |

**Success Response (200):**

```json
{
  "success": true
}
```

**Error Responses (400):**

```json
{
  "error": "Missing required fields: instagramHandle, businessName, category, description"
}
```

```json
{
  "error": "This Instagram handle is already in our directory"
}
```

---

### GET `/api/categories`

List all categories.

**Response:**

```json
{
  "categories": [
    {
      "id": "fashion-ethnic-wear",
      "name": "Fashion & Ethnic Wear",
      "slug": "fashion-ethnic-wear",
      "icon": "shirt",
      "description": "Sarees, kurtis, western wear, sustainable fashion, streetwear, and more",
      "subCategories": ["Sarees", "Kurtis & Ethnic", "Sustainable Fashion", ...]
    }
  ]
}
```

| Aspect | Detail |
|--------|--------|
| Caching | Revalidates every 3600 seconds (1 hour) |
| Authentication | None required |
