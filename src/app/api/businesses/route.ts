import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const category = searchParams.get("category");
  const sub = searchParams.get("sub");
  const city = searchParams.get("city");
  const page = Number(searchParams.get("page")) || 1;
  const limit = Math.min(Number(searchParams.get("limit")) || 24, 100);

  const db = await getDb();

  const filter: Record<string, unknown> = { status: "approved" };
  if (category) filter.category = category;
  if (sub) filter.subCategory = sub;
  if (city) filter.city = new RegExp(`^${city}$`, "i");

  const [docs, total] = await Promise.all([
    db
      .collection("businesses")
      .find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray(),
    db.collection("businesses").countDocuments(filter),
  ]);

  const businesses = docs.map(({ _id, ...rest }) => rest);

  return NextResponse.json({
    businesses,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
