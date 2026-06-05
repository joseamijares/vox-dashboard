import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const rows = await query(`
      SELECT ticker, name, sector, entry_price, target_price, stop_loss, grade, status
      FROM watchlist
      WHERE entry_price IS NULL OR entry_price = 0
      ORDER BY grade DESC NULLS LAST
    `);
    return NextResponse.json({
      count: rows.length,
      tickers: rows,
    });
  } catch (error) {
    console.error("Error fetching empty watchlist targets:", error);
    return NextResponse.json(
      { error: "Failed to fetch empty watchlist targets" },
      { status: 500 }
    );
  }
}
