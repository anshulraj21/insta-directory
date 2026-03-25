import { NextRequest, NextResponse } from "next/server";
import { submitBusiness } from "@/lib/data";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { instagramHandle, businessName, category, city, state, description } =
      body;

    if (!instagramHandle || !businessName || !category || !description) {
      return NextResponse.json(
        { error: "Missing required fields: instagramHandle, businessName, category, description" },
        { status: 400 }
      );
    }

    await submitBusiness({
      instagramHandle,
      businessName,
      category,
      city: city || "",
      state: state || "",
      description,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Something went wrong";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
