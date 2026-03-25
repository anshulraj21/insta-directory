import { NextRequest, NextResponse } from "next/server";
import { searchBusinesses } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") || "";

  if (!query.trim()) {
    return NextResponse.json({ businesses: [], total: 0 });
  }

  const businesses = await searchBusinesses(query);

  return NextResponse.json({
    businesses,
    total: businesses.length,
  });
}
