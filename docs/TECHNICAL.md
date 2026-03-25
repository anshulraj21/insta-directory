# ShopFinder -- Technical Documentation

**Version:** 0.1.0
**Last Updated:** 2026-03-25

---

## Table of Contents

### High-Level Design (HLD)
1. [System Architecture](#system-architecture)
2. [Data Flow Diagram](#data-flow-diagram)
3. [Deployment Pipeline](#deployment-pipeline)

### Low-Level Design (LLD)
4. [Tech Stack](#tech-stack)
5. [Project Structure](#project-structure)
6. [Database Schema](#database-schema)
7. [Caching Strategy](#caching-strategy)
8. [Connection Pooling](#connection-pooling)
9. [API Route Implementations](#api-route-implementations)
10. [SEO Implementation](#seo-implementation)
11. [Rendering Strategy](#rendering-strategy)
12. [Environment Variables](#environment-variables)
13. [Seed Script](#seed-script)
14. [Performance Considerations](#performance-considerations)

---

# High-Level Design (HLD)

## System Architecture

```
+-------------------+         +----------------------------+         +---------------------+
|                   |  HTTPS  |                            |         |                     |
|   Browser/User    +-------->+     Vercel Edge Network     |         |   MongoDB Atlas     |
|                   |         |       (CDN + SSL)          |         |   (Cloud DB)        |
|  - Desktop        |         |                            |         |                     |
|  - Mobile         |<--------+   Cached static assets     |         |  +---------------+  |
|                   |         |   ISR pages served from    |         |  | businesses    |  |
+-------------------+         |   edge cache               |         |  | (collection)  |  |
                              |                            |         |  +---------------+  |
                              +------------+---------------+         |                     |
                                           |                         |  +---------------+  |
                                           | On cache MISS           |  | categories    |  |
                                           | or dynamic route        |  | (collection)  |  |
                                           v                         |  +---------------+  |
                              +----------------------------+         |                     |
                              |                            |         +----------+----------+
                              |   Next.js 16 App           |                    |
                              |   (Serverless Functions)   |                    |
                              |                            +--------------------+
                              |  +----------------------+  |    MongoDB Driver
                              |  | Server Components    |  |    (Connection Pool)
                              |  | - page.tsx (SSG/ISR) |  |
                              |  | - layout.tsx         |  |
                              |  +----------------------+  |
                              |                            |
                              |  +----------------------+  |
                              |  | API Routes           |  |
                              |  | - /api/businesses    |  |
                              |  | - /api/businesses/   |  |
                              |  |   search             |  |
                              |  | - /api/businesses/   |  |
                              |  |   submit             |  |
                              |  | - /api/categories    |  |
                              |  +----------------------+  |
                              |                            |
                              |  +----------------------+  |
                              |  | Client Components    |  |
                              |  | - Header.tsx         |  |
                              |  | - CategoryFilter.tsx |  |
                              |  | - SubmitPage.tsx     |  |
                              |  +----------------------+  |
                              |                            |
                              +----------------------------+
```

### Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| Next.js App Router | Server Components for data fetching, file-based routing, built-in ISR support |
| MongoDB Atlas | Managed cloud database with global availability, text search, and serverless-friendly connection pooling |
| Vercel Hosting | Native Next.js support, edge caching, automatic HTTPS, serverless functions |
| ISR (Incremental Static Regeneration) | Combines static performance with near-real-time data updates |
| No ORM | Direct MongoDB driver for minimal overhead and full query flexibility |

---

## Data Flow Diagram

### Read Flow (Browse/Search)

```
+--------+     +----------+     +--------------+     +----------------+     +---------+
| Client |---->| Vercel   |---->| Next.js      |---->| unstable_cache |---->| MongoDB |
| (GET)  |     | CDN Edge |     | Server       |     | (in-memory     |     | Atlas   |
+--------+     +----------+     | Component    |     |  with TTL)     |     +---------+
                    |           +--------------+     +----------------+         |
                    |                  |                     |                   |
                    |                  |    Cache HIT        |                   |
                    |                  |<--------------------+                   |
                    |                  |                                         |
                    |                  |    Cache MISS                           |
                    |                  |<----------------------------------------+
                    |                  |                                         |
                    |           +------v-------+                                |
                    |           | Render HTML  |                                |
                    |<----------| + JSON-LD    |                                |
                    |           +--------------+                                |
                    |                                                           |
              ISR stores page                                                   |
              in CDN cache for                                                  |
              60s (businesses)                                                  |
              3600s (categories)                                                |
```

### Write Flow (Submit Business)

```
+--------+     +--------------+     +------------------+     +---------+
| Client |---->| POST         |---->| Validate Fields  |---->| MongoDB |
| (Form) |     | /api/        |     |                  |     | Atlas   |
+--------+     | businesses/  |     | Check duplicate  |     +---------+
    ^          | submit       |     | handle           |         |
    |          +--------------+     +------------------+         |
    |                |                     |                     |
    |                |              +------v-------+             |
    |                |              | Insert doc   |             |
    |                |              | status:      +------------>|
    |                |              | "pending"    |             |
    |                |              +--------------+             |
    |                |                                           |
    |          +-----v--------+                                  |
    +----------| JSON {       |                                  |
               |  success:    |                                  |
               |  true        |                                  |
               | }            |                                  |
               +--------------+                                  |
```

---

## Deployment Pipeline

```
+------------+     +-------------+     +-------------------+     +------------------+
|            |     |             |     |                   |     |                  |
| Developer  +---->+  GitHub     +---->+  Vercel Build     +---->+  Production      |
| (git push) |     |  Repository |     |  Pipeline         |     |  (Vercel Edge)   |
|            |     |  (master)   |     |                   |     |                  |
+------------+     +------+------+     |  1. npm install   |     |  - CDN cached    |
                          |            |  2. next build    |     |    static pages  |
                          |            |  3. SSG pages     |     |  - Serverless    |
                          |            |     generated     |     |    functions     |
                          |            |  4. Deploy        |     |  - ISR on demand |
                          |            |                   |     |                  |
                          |            +-------------------+     +------------------+
                          |
                   +------v------+
                   |  Vercel     |
                   |  Webhook    |
                   |  triggers   |
                   |  build on   |
                   |  push       |
                   +-------------+

Environment Variables (set in Vercel dashboard):
  - MONGODB_URI = mongodb+srv://...
```

### Build Artifacts

| Artifact | Description |
|----------|-------------|
| Static HTML | Pre-rendered pages for `/`, `/categories/*`, `/business/*` |
| Serverless Functions | API routes and dynamic pages (`/search`) |
| Client JS Bundles | Hydration code for interactive components |
| Sitemap | Generated at build time, regenerated on demand |

---

# Low-Level Design (LLD)

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.2.1 |
| UI Library | React | 19.2.4 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| CSS Processing | PostCSS with `@tailwindcss/postcss` | 4.x |
| Database | MongoDB (via native driver) | 7.1.1 |
| Icons | Lucide React | 1.6.x |
| Font | Geist Sans (via `next/font/google`) | -- |
| Linting | ESLint with `eslint-config-next` | 9.x |
| Seed Runner | tsx | 4.21.x |
| Hosting | Vercel | -- |
| Database Hosting | MongoDB Atlas | -- |

---

## Project Structure

```
shopfinder/
|-- data/
|   |-- businesses.json          # Seed data: 425+ business entries
|   |-- categories.json          # Seed data: 11 category definitions
|
|-- scripts/
|   |-- seed.ts                  # Database seeding script
|
|-- src/
|   |-- app/
|   |   |-- layout.tsx           # Root layout (Header + Footer wrapper)
|   |   |-- page.tsx             # Homepage (SSG/ISR)
|   |   |-- globals.css          # Global Tailwind CSS imports
|   |   |-- robots.ts            # robots.txt generation
|   |   |-- sitemap.ts           # sitemap.xml generation
|   |   |
|   |   |-- business/
|   |   |   |-- [handle]/
|   |   |       |-- page.tsx     # Business detail page (SSG/ISR)
|   |   |
|   |   |-- categories/
|   |   |   |-- [slug]/
|   |   |       |-- page.tsx     # Category listing page (SSG/ISR)
|   |   |
|   |   |-- search/
|   |   |   |-- page.tsx         # Search results page (SSR, force-dynamic)
|   |   |
|   |   |-- submit/
|   |   |   |-- page.tsx         # Business submission form (Client Component)
|   |   |
|   |   |-- api/
|   |       |-- businesses/
|   |       |   |-- route.ts     # GET: List/filter businesses
|   |       |   |-- search/
|   |       |   |   |-- route.ts # GET: Full-text search
|   |       |   |-- submit/
|   |       |       |-- route.ts # POST: Submit new business
|   |       |
|   |       |-- categories/
|   |           |-- route.ts     # GET: List all categories
|   |
|   |-- components/
|   |   |-- BusinessCard.tsx     # Business listing card (Server Component)
|   |   |-- CategoryCard.tsx     # Category grid card (Server Component)
|   |   |-- CategoryFilter.tsx   # Sub-category and city filters (Client Component)
|   |   |-- Header.tsx           # Site header with search (Client Component)
|   |   |-- Footer.tsx           # Site footer (Server Component)
|   |
|   |-- lib/
|       |-- data.ts              # Data access layer (cached queries)
|       |-- mongodb.ts           # MongoDB connection singleton
|       |-- types.ts             # TypeScript interfaces
|
|-- package.json
|-- tsconfig.json
|-- next.config.ts
|-- postcss.config.mjs
|-- eslint.config.mjs
```

---

## Database Schema

### Database: `shopfinder`

### Collection: `businesses`

```
{
  _id:              ObjectId        (auto-generated by MongoDB)
  id:               String          "fashion-001" | "submitted-1711234567890"
  instagramHandle:  String          "@shopname"
  businessName:     String          "Shop Name"
  category:         String          "Fashion & Ethnic Wear"
  subCategory:      String          "Sarees"
  city:             String          "Mumbai"
  state:            String          "Maharashtra"
  country:          String          "India"
  description:      String          "Business description..."
  tags:             Array<String>   ["handloom", "sarees"]
  verified:         Boolean         true | false
  addedAt:          String          "2025-01-15"
  status:           String          "approved" | "pending"
}
```

**Indexes:**

| Index | Fields | Type | Purpose |
|-------|--------|------|---------|
| Unique Handle | `{ instagramHandle: 1 }` | Unique | Prevent duplicate handles, fast lookup by handle |
| Category | `{ category: 1 }` | Standard | Filter by category |
| Compound Category | `{ category: 1, subCategory: 1, city: 1 }` | Compound | Optimized filtering with sub-category and city |
| City | `{ city: 1 }` | Standard | City-based filtering and distinct queries |
| State | `{ state: 1 }` | Standard | State-based filtering and distinct queries |
| Status | `{ status: 1 }` | Standard | Filter approved vs pending businesses |
| Full-Text Search | `{ businessName: "text", instagramHandle: "text", description: "text", category: "text", subCategory: "text", city: "text", state: "text" }` | Text | Full-text search across all relevant fields |

### Collection: `categories`

```
{
  _id:              ObjectId        (auto-generated by MongoDB)
  id:               String          "fashion-ethnic-wear"
  name:             String          "Fashion & Ethnic Wear"
  slug:             String          "fashion-ethnic-wear"
  icon:             String          "shirt"
  description:      String          "Category description..."
  subCategories:    Array<String>   ["Sarees", "Kurtis & Ethnic", ...]
}
```

**Indexes:**

| Index | Fields | Type | Purpose |
|-------|--------|------|---------|
| Unique Slug | `{ slug: 1 }` | Unique | Prevent duplicate slugs, fast lookup by slug |

---

## Caching Strategy

The application uses `unstable_cache` from Next.js to cache database query results in server memory with tag-based invalidation.

### Cache Configuration

| Function | Cache Key | Revalidation (TTL) | Cache Tag | Description |
|----------|-----------|---------------------|-----------|-------------|
| `getAllCategories` | `["all-categories"]` | 3600s (1 hour) | `categories` | Full category list |
| `getCategoryBySlug` | `["category-by-slug"]` | 3600s (1 hour) | `categories` | Single category lookup |
| `getCategoryCount` | `["category-count"]` | 3600s (1 hour) | `categories` | Total category count |
| `getSubCategories` | `["sub-categories"]` | 3600s (1 hour) | `categories` | Sub-categories for a category |
| `getAllBusinesses` | `["all-businesses"]` | 60s (1 minute) | `businesses` | All approved businesses |
| `getBusinessesByCategory` | `["businesses-by-category"]` | 60s (1 minute) | `businesses` | Businesses filtered by category |
| `getBusinessByHandle` | `["business-by-handle"]` | 60s (1 minute) | `businesses` | Single business lookup |
| `getBusinessCount` | `["business-count"]` | 60s (1 minute) | `businesses` | Total approved business count |
| `getFeaturedBusinesses` | `["featured-businesses"]` | 60s (1 minute) | `businesses` | Featured businesses (limited) |
| `getRelatedBusinesses` | `["related-businesses"]` | 60s (1 minute) | `businesses` | Related businesses in same category |
| `getUniqueCities` | `["unique-cities"]` | 3600s (1 hour) | `businesses` | Distinct city list |
| `getUniqueStates` | `["unique-states"]` | 3600s (1 hour) | `businesses` | Distinct state list |

### Cache Tag Groups

- **`categories`** tag: All category-related data revalidates together. TTL of 1 hour since categories change infrequently.
- **`businesses`** tag: All business-related data revalidates together. TTL of 1 minute for near-real-time updates.

### Uncached Functions

| Function | Reason |
|----------|--------|
| `searchBusinesses` | Dynamic user input; results vary per query, not suitable for key-based caching |
| `submitBusiness` | Write operation; no caching applicable |

### Page-Level Revalidation

All ISR pages set `export const revalidate = 60`, meaning Vercel serves stale pages from CDN and regenerates them in the background at most once per minute.

---

## Connection Pooling

The MongoDB connection uses a singleton pattern optimized for serverless environments.

### Implementation (`src/lib/mongodb.ts`)

```
Development Mode:
  - Client promise is stored on globalThis to survive HMR (Hot Module Replacement)
  - Prevents creating new connections on every file reload
  - Key: globalThis._mongoClientPromise

Production Mode:
  - A single MongoClient instance is created per serverless function cold start
  - The promise is module-scoped (reused across invocations within the same function instance)
```

### Connection Options

| Option | Value | Purpose |
|--------|-------|---------|
| `maxPoolSize` | 10 | Limits concurrent connections per serverless instance |
| `serverSelectionTimeoutMS` | 5000 | Fails fast if MongoDB Atlas is unreachable |

### Why This Pattern Matters on Vercel

Vercel serverless functions can scale to many concurrent instances. Without connection pooling:
- Each function invocation could open a new connection.
- MongoDB Atlas has a connection limit (typically 500 for M0/free tier).
- The singleton pattern ensures each function instance reuses a single connection pool of up to 10 connections.

---

## API Route Implementations

### `GET /api/businesses` (`src/app/api/businesses/route.ts`)

- **Rendering:** `force-dynamic` (always server-rendered)
- **Filter construction:** Builds a MongoDB query filter object from query parameters
- **City filter:** Uses case-insensitive regex: `new RegExp('^city$', 'i')`
- **Pagination:** Server-side skip/limit with configurable page size (default 24, max 100)
- **Returns:** Paginated results with total count and total pages

### `GET /api/businesses/search` (`src/app/api/businesses/search/route.ts`)

- **Rendering:** `force-dynamic`
- **Primary search:** MongoDB `$text` operator against the composite text index
- **Fallback search:** If text index fails, falls back to `$or` with regex matching across 7 fields
- **Limit:** 50 results maximum
- **Status filter:** Only returns `status: "approved"` businesses

### `POST /api/businesses/submit` (`src/app/api/businesses/submit/route.ts`)

- **Validation:** Checks for required fields (`instagramHandle`, `businessName`, `category`, `description`)
- **Deduplication:** Queries for existing handle before insert
- **Handle normalization:** Ensures `@` prefix on Instagram handle
- **Default fields set on insert:** `status: "pending"`, `verified: false`, `country: "India"`, `tags: []`, `subCategory: ""`
- **ID generation:** `submitted-{Date.now()}`

### `GET /api/categories` (`src/app/api/categories/route.ts`)

- **Rendering:** Revalidates every 3600 seconds (ISR)
- **Implementation:** Delegates to `getAllCategories()` cached function

---

## SEO Implementation

### Metadata (Root Layout)

The root layout at `src/app/layout.tsx` defines base metadata that all pages inherit:

- `metadataBase`: `https://shopfinder.com` -- used for resolving relative URLs in OG tags
- `title.template`: `"%s | ShopFinder"` -- page-specific titles are inserted via template
- `title.default`: Used when no page-specific title is set
- `openGraph.locale`: `en_IN` (English, India)
- `twitter.card`: `summary_large_image`
- `keywords`: Array of targeted SEO keywords

### Per-Page Metadata

| Page | Title Pattern | Canonical URL |
|------|--------------|---------------|
| Homepage | Default title | `/` |
| Category | `Best {name} Instagram Businesses in India` | `/categories/{slug}` |
| Business | `{businessName} - {subCategory} on Instagram` | `/business/{handle}` |
| Search | `Search: {query}` or `Search Businesses` | -- |

### JSON-LD Structured Data

| Page | Schema Type | Key Properties |
|------|-------------|---------------|
| Homepage | `WebSite` | `SearchAction` with target URL template for sitelinks search box |
| Category | `CollectionPage` | `BreadcrumbList` with Home > Category hierarchy |
| Business | `LocalBusiness` | `sameAs` to Instagram URL, `PostalAddress`, `BreadcrumbList` (Home > Category > Business) |

### Sitemap (`src/app/sitemap.ts`)

Dynamic sitemap generator that queries the database for all content:

| URL Pattern | Priority | Change Frequency | Source |
|-------------|----------|------------------|--------|
| `/` | 1.0 | daily | Static |
| `/submit` | 0.3 | monthly | Static |
| `/categories/{slug}` | 0.8 | weekly | All categories from DB |
| `/business/{handle}` | 0.7 | monthly | All approved businesses from DB |

### Robots (`src/app/robots.ts`)

- **Allow:** `/` (all pages)
- **Disallow:** `/api/` (all API routes)
- **Sitemap:** `https://shopfinder.com/sitemap.xml`

---

## Rendering Strategy

### Page Rendering Modes

| Page | Mode | Details |
|------|------|---------|
| `/` (Homepage) | ISR | `revalidate = 60`. Statically generated, regenerated in background every 60 seconds. |
| `/categories/[slug]` | ISR + SSG | `revalidate = 60`. All category slugs pre-rendered at build time via `generateStaticParams()`. Supports query params for filtering (handled server-side). |
| `/business/[handle]` | ISR + SSG | `revalidate = 60`. All business handles pre-rendered at build time via `generateStaticParams()`. |
| `/search` | SSR | `dynamic = "force-dynamic"`. Server-rendered on every request because search queries are user-driven and unpredictable. |
| `/submit` | CSR | Client Component (`"use client"`). Form logic runs entirely in the browser. |
| `/api/*` | Serverless | API routes run as serverless functions. Business list and search routes are `force-dynamic`. Categories route uses ISR (3600s). |

### Component Rendering

| Component | Type | Reason |
|-----------|------|--------|
| `Header` | Client | Interactive search form, mobile menu toggle, router navigation |
| `Footer` | Server | Static content, no interactivity |
| `BusinessCard` | Server | Pure presentational, no state |
| `CategoryCard` | Server | Pure presentational, no state |
| `CategoryFilter` | Client | Interactive filter buttons, router navigation |
| `SubmitPage` | Client | Form state management, API call |

---

## Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `MONGODB_URI` | Yes | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/shopfinder` |

### Configuration Files

| File | Purpose |
|------|---------|
| `.env.local` | Local environment variables (not committed to Git) |
| `next.config.ts` | Next.js configuration |
| `tsconfig.json` | TypeScript compiler options |
| `postcss.config.mjs` | PostCSS plugins (Tailwind CSS) |
| `eslint.config.mjs` | ESLint rules |

---

## Seed Script

### Location

`scripts/seed.ts`

### Usage

```bash
npm run seed
```

This runs:
```bash
npx tsx --env-file=.env.local scripts/seed.ts
```

### What It Does

1. Connects to MongoDB Atlas using `MONGODB_URI` from `.env.local`
2. Reads `data/businesses.json` and `data/categories.json` from disk
3. Clears existing data in both collections (`deleteMany({})`)
4. Adds `status: "approved"` to all business documents
5. Inserts all businesses and categories
6. Creates the following indexes:
   - `businesses.instagramHandle` (unique)
   - `businesses.category`
   - `businesses.{category, subCategory, city}` (compound)
   - `businesses.city`
   - `businesses.state`
   - `businesses.status`
   - `businesses` full-text index (named `text_search`)
   - `categories.slug` (unique)
7. Prints a summary of inserted counts

### Seed Data Files

| File | Records | Description |
|------|---------|-------------|
| `data/businesses.json` | 425+ | Pre-curated Indian Instagram businesses |
| `data/categories.json` | 11 | Category definitions with sub-categories |

---

## Performance Considerations

### Caching Layers

The application has three distinct caching layers:

```
Layer 1: Vercel CDN Edge Cache
  |-- ISR pages served from the nearest edge location
  |-- TTL controlled by page-level `revalidate` export
  |
  v
Layer 2: Next.js unstable_cache (Server Memory)
  |-- Database query results cached in function memory
  |-- TTL and tag-based invalidation
  |
  v
Layer 3: MongoDB Connection Pool
  |-- Reused TCP connections to Atlas
  |-- Avoids connection handshake overhead
```

### Static Generation at Build Time

- All category pages are pre-rendered via `generateStaticParams()` -- eliminates cold start latency for category browsing.
- All business detail pages are pre-rendered via `generateStaticParams()` -- every `/business/[handle]` page is available as static HTML.
- The homepage is statically generated with ISR.

### Query Optimization

| Optimization | Details |
|-------------|---------|
| Compound index for category filtering | `{ category: 1, subCategory: 1, city: 1 }` covers the most common filter combination in a single index scan |
| Text index for search | Composite text index across 7 fields enables MongoDB's native full-text search |
| Regex fallback | If text index is unavailable, search gracefully degrades to regex matching |
| Pagination at DB level | `skip()` and `limit()` prevent loading entire collections into memory |
| Parallel data fetching | Homepage uses `Promise.all()` to fetch categories, counts, and featured businesses concurrently |
| Result limiting | Search capped at 50 results; featured businesses capped at 8; related businesses capped at 4 |

### Bundle Size Management

| Strategy | Implementation |
|----------|---------------|
| Server Components by default | Only `Header`, `CategoryFilter`, and `SubmitPage` ship client-side JavaScript |
| Lucide tree-shaking | Individual icon imports (`import { Search } from "lucide-react"`) avoid bundling the full icon set |
| Geist font via `next/font` | Self-hosted font with automatic `font-display: swap` and subsetting |

### Serverless Cold Start Mitigation

| Strategy | Implementation |
|----------|---------------|
| Connection reuse | MongoDB client singleton survives across invocations within the same function instance |
| Minimal dependencies | Only `mongodb`, `lucide-react`, and framework dependencies -- no heavy ORMs or libraries |
| Static pre-rendering | Most pages are served as static HTML, avoiding function invocations entirely |
| Low `maxPoolSize` | Set to 10 to avoid exhausting Atlas connection limits across many serverless instances |

### Potential Bottleneck: Per-Category Count on Homepage

The homepage computes per-category business counts by calling `getBusinessesByCategory()` for each of the 11 categories. While each call is individually cached, this results in 11 database queries on cache miss. A dedicated aggregation pipeline or a precomputed counts collection would improve this if the category count grows significantly.
