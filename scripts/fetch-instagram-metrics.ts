/**
 * Fetches public Instagram profile metrics for businesses in the database.
 * Extracts: follower count, following count, post count, bio, profile pic, business category.
 *
 * Usage:
 *   MONGODB_URI="mongodb+srv://..." npx tsx scripts/fetch-instagram-metrics.ts [--batch=20] [--delay=3000] [--offset=0]
 *
 * Options:
 *   --batch=N    Number of profiles to fetch per run (default: 20)
 *   --delay=N    Delay between requests in ms (default: 3000)
 *   --offset=N   Skip first N businesses (default: 0)
 *   --verify     Only verify handles (check if page exists), don't extract metrics
 */

import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("Missing MONGODB_URI. Set it as an environment variable.");
  process.exit(1);
}

// Parse CLI args
const args = process.argv.slice(2);
function getArg(name: string, fallback: number): number {
  const arg = args.find((a) => a.startsWith(`--${name}=`));
  return arg ? parseInt(arg.split("=")[1]) : fallback;
}
const verifyOnly = args.includes("--verify");
const BATCH_SIZE = getArg("batch", 20);
const DELAY_MS = getArg("delay", 3000);
const OFFSET = getArg("offset", 0);

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface ProfileMetrics {
  followerCount: number;
  followingCount: number;
  postCount: number;
  bio: string;
  profilePicUrl: string;
  businessCategory: string;
  isBusinessAccount: boolean;
  externalUrl: string;
  fullName: string;
}

async function fetchProfileMetrics(
  handle: string
): Promise<{ status: "ok" | "not_found" | "private" | "error"; metrics?: ProfileMetrics; error?: string }> {
  const cleanHandle = handle.replace("@", "");
  const url = `https://www.instagram.com/${cleanHandle}/`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
    });

    if (res.status === 404) {
      return { status: "not_found" };
    }

    if (!res.ok) {
      return { status: "error", error: `HTTP ${res.status}` };
    }

    const html = await res.text();

    // Check for "Page not found"
    if (html.includes("Page Not Found") || html.includes("Sorry, this page isn")) {
      return { status: "not_found" };
    }

    // Check for private account
    if (html.includes('"is_private":true')) {
      return { status: "private" };
    }

    if (verifyOnly) {
      return { status: "ok" };
    }

    // Extract metrics from the HTML meta tags and embedded JSON
    const metrics: ProfileMetrics = {
      followerCount: 0,
      followingCount: 0,
      postCount: 0,
      bio: "",
      profilePicUrl: "",
      businessCategory: "",
      isBusinessAccount: false,
      externalUrl: "",
      fullName: "",
    };

    // Try to extract from meta description: "X Followers, Y Following, Z Posts"
    const metaMatch = html.match(
      /(\d[\d,.]*[KMkm]?)\s*Followers?,\s*(\d[\d,.]*[KMkm]?)\s*Following,\s*(\d[\d,.]*[KMkm]?)\s*Posts?/i
    );
    if (metaMatch) {
      metrics.followerCount = parseCount(metaMatch[1]);
      metrics.followingCount = parseCount(metaMatch[2]);
      metrics.postCount = parseCount(metaMatch[3]);
    }

    // Try to extract from JSON embedded in page
    const followerMatch = html.match(/"edge_followed_by":\s*\{"count":\s*(\d+)\}/);
    if (followerMatch) metrics.followerCount = parseInt(followerMatch[1]);

    const followingMatch = html.match(/"edge_follow":\s*\{"count":\s*(\d+)\}/);
    if (followingMatch) metrics.followingCount = parseInt(followingMatch[1]);

    const postMatch = html.match(/"edge_owner_to_timeline_media":\s*\{"count":\s*(\d+)/);
    if (postMatch) metrics.postCount = parseInt(postMatch[1]);

    // Bio from og:description or meta
    const bioMatch = html.match(/<meta\s+(?:property="og:description"|name="description")\s+content="([^"]*?)"\s*\/?>/);
    if (bioMatch) {
      // Bio is usually after the follower/following/posts line
      const bio = bioMatch[1].replace(/.*Posts? - /, "").trim();
      metrics.bio = bio.substring(0, 500);
    }

    // Profile pic
    const picMatch = html.match(/"profile_pic_url_hd":"([^"]+)"/);
    if (picMatch) metrics.profilePicUrl = picMatch[1].replace(/\\u0026/g, "&");

    // Business category
    const catMatch = html.match(/"category_name":"([^"]+)"/);
    if (catMatch) {
      metrics.businessCategory = catMatch[1];
      metrics.isBusinessAccount = true;
    }

    // External URL
    const urlMatch = html.match(/"external_url":"([^"]+)"/);
    if (urlMatch) metrics.externalUrl = urlMatch[1].replace(/\\u0026/g, "&");

    // Full name
    const nameMatch = html.match(/"full_name":"([^"]+)"/);
    if (nameMatch) metrics.fullName = nameMatch[1];

    return { status: "ok", metrics };
  } catch (err) {
    return { status: "error", error: String(err) };
  }
}

function parseCount(str: string): number {
  str = str.replace(/,/g, "");
  const num = parseFloat(str);
  if (str.toLowerCase().endsWith("k")) return Math.round(num * 1000);
  if (str.toLowerCase().endsWith("m")) return Math.round(num * 1000000);
  return Math.round(num);
}

function getSizeCategory(followers: number): string {
  if (followers < 1000) return "nano";
  if (followers < 10000) return "micro";
  if (followers < 50000) return "small";
  if (followers < 100000) return "medium";
  return "large";
}

async function main() {
  const client = new MongoClient(uri!);
  await client.connect();
  console.log("Connected to MongoDB");

  const db = client.db("shopfinder");
  const businesses = db.collection("businesses");

  const allBusinesses = await businesses
    .find({ status: "approved" })
    .skip(OFFSET)
    .limit(BATCH_SIZE)
    .toArray();

  console.log(
    `\nProcessing ${allBusinesses.length} businesses (offset: ${OFFSET}, batch: ${BATCH_SIZE})`
  );
  console.log(verifyOnly ? "Mode: VERIFY ONLY\n" : "Mode: FULL METRICS\n");

  const results = {
    ok: 0,
    not_found: 0,
    private: 0,
    error: 0,
    updated: 0,
  };
  const broken: string[] = [];
  const privateAccounts: string[] = [];
  const errors: string[] = [];

  for (let i = 0; i < allBusinesses.length; i++) {
    const biz = allBusinesses[i];
    const handle = biz.instagramHandle;
    process.stdout.write(
      `[${i + 1}/${allBusinesses.length}] ${handle.padEnd(30)} `
    );

    const result = await fetchProfileMetrics(handle);

    switch (result.status) {
      case "ok":
        results.ok++;
        process.stdout.write("OK");
        if (!verifyOnly && result.metrics) {
          const updateData: Record<string, unknown> = {
            "instagram.followerCount": result.metrics.followerCount,
            "instagram.followingCount": result.metrics.followingCount,
            "instagram.postCount": result.metrics.postCount,
            "instagram.bio": result.metrics.bio,
            "instagram.profilePicUrl": result.metrics.profilePicUrl,
            "instagram.businessCategory": result.metrics.businessCategory,
            "instagram.isBusinessAccount": result.metrics.isBusinessAccount,
            "instagram.externalUrl": result.metrics.externalUrl,
            "instagram.metricsUpdatedAt": new Date().toISOString(),
            sizeCategory: getSizeCategory(result.metrics.followerCount),
          };
          await businesses.updateOne(
            { _id: biz._id },
            { $set: updateData }
          );
          results.updated++;
          if (result.metrics.followerCount > 0) {
            process.stdout.write(
              ` (${result.metrics.followerCount.toLocaleString()} followers)`
            );
          }
        }
        break;
      case "not_found":
        results.not_found++;
        broken.push(handle);
        process.stdout.write("NOT FOUND");
        break;
      case "private":
        results.private++;
        privateAccounts.push(handle);
        process.stdout.write("PRIVATE");
        break;
      case "error":
        results.error++;
        errors.push(`${handle}: ${result.error}`);
        process.stdout.write(`ERROR: ${result.error}`);
        break;
    }
    process.stdout.write("\n");

    // Delay between requests
    if (i < allBusinesses.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  console.log("\n========== SUMMARY ==========");
  console.log(`Total processed: ${allBusinesses.length}`);
  console.log(`  OK:        ${results.ok}`);
  console.log(`  Not found: ${results.not_found}`);
  console.log(`  Private:   ${results.private}`);
  console.log(`  Errors:    ${results.error}`);
  if (!verifyOnly) console.log(`  Updated:   ${results.updated}`);

  if (broken.length > 0) {
    console.log(`\nBROKEN HANDLES (${broken.length}):`);
    broken.forEach((h) => console.log(`  ${h}`));
  }
  if (privateAccounts.length > 0) {
    console.log(`\nPRIVATE ACCOUNTS (${privateAccounts.length}):`);
    privateAccounts.forEach((h) => console.log(`  ${h}`));
  }
  if (errors.length > 0) {
    console.log(`\nERRORS (${errors.length}):`);
    errors.forEach((e) => console.log(`  ${e}`));
  }

  await client.close();
}

main().catch(console.error);
