import { NextResponse } from "next/server";
import { getJournal } from "@/lib/db";

export async function GET() {
  try {
    const journal = await getJournal();
    return NextResponse.json({ journal });
  } catch (error) {
    console.error("Error fetching journal:", error);
    return NextResponse.json(
      { error: "Failed to fetch journal" },
      { status: 500 }
    );
  }
}
