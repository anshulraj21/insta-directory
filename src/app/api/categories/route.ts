import { NextResponse } from "next/server";
import { getAllCategories } from "@/lib/data";

export const revalidate = 3600;

export async function GET() {
  const categories = await getAllCategories();
  return NextResponse.json({ categories });
}
