import { MongoClient } from "mongodb";
import { readFileSync } from "fs";
import { resolve } from "path";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("Missing MONGODB_URI environment variable.");
  console.error("Create a .env.local file with:");
  console.error(
    "  MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/shopfinder"
  );
  process.exit(1);
}

async function seed() {
  const client = new MongoClient(uri!);

  try {
    await client.connect();
    console.log("Connected to MongoDB Atlas");

    const db = client.db("shopfinder");

    // Read JSON data
    const businessesPath = resolve(__dirname, "../data/businesses.json");
    const categoriesPath = resolve(__dirname, "../data/categories.json");

    const businesses = JSON.parse(readFileSync(businessesPath, "utf-8"));
    const categories = JSON.parse(readFileSync(categoriesPath, "utf-8"));

    // Clear existing data
    await db.collection("businesses").deleteMany({});
    await db.collection("categories").deleteMany({});
    console.log("Cleared existing data");

    // Add status to all businesses
    const businessesWithStatus = businesses.map(
      (b: Record<string, unknown>) => ({
        ...b,
        status: "approved",
      })
    );

    // Insert data
    const bizResult = await db
      .collection("businesses")
      .insertMany(businessesWithStatus);
    console.log(`Inserted ${bizResult.insertedCount} businesses`);

    const catResult = await db
      .collection("categories")
      .insertMany(categories);
    console.log(`Inserted ${catResult.insertedCount} categories`);

    // Create indexes for businesses
    await db
      .collection("businesses")
      .createIndex({ instagramHandle: 1 }, { unique: true });
    await db.collection("businesses").createIndex({ category: 1 });
    await db
      .collection("businesses")
      .createIndex({ category: 1, subCategory: 1, city: 1 });
    await db.collection("businesses").createIndex({ city: 1 });
    await db.collection("businesses").createIndex({ state: 1 });
    await db.collection("businesses").createIndex({ status: 1 });
    await db.collection("businesses").createIndex(
      {
        businessName: "text",
        instagramHandle: "text",
        description: "text",
        category: "text",
        subCategory: "text",
        city: "text",
        state: "text",
      },
      { name: "text_search" }
    );
    console.log("Created business indexes");

    // Create indexes for categories
    await db
      .collection("categories")
      .createIndex({ slug: 1 }, { unique: true });
    console.log("Created category indexes");

    console.log("\nSeed completed successfully!");
    console.log(`  Businesses: ${bizResult.insertedCount}`);
    console.log(`  Categories: ${catResult.insertedCount}`);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

seed();
