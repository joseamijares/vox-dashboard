import { NextResponse } from "next/server";
import { getPlays } from "@/lib/db";

export async function GET() {
  try {
    const plays = await getPlays();
    return NextResponse.json({ plays });
  } catch (error) {
    console.error("Error fetching plays:", error);
    return NextResponse.json(
      { error: "Failed to fetch plays" },
      { status: 500 }
    );
  }
}
