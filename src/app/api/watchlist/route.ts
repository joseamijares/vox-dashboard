import { NextResponse } from "next/server";
import { getWatchlist } from "@/lib/db";

export async function GET() {
  try {
    const watchlist = await getWatchlist();
    return NextResponse.json({ watchlist });
  } catch (error) {
    console.error("Error fetching watchlist:", error);
    return NextResponse.json(
      { error: "Failed to fetch watchlist" },
      { status: 500 }
    );
  }
}
