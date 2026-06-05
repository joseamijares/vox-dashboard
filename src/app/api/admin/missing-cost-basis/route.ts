import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const rows = await query(`
      SELECT ticker, shares, avg_cost, live_price, live_value, brokers, sector
      FROM positions
      WHERE avg_cost IS NULL OR avg_cost = 0
      ORDER BY live_value DESC NULLS LAST
    `);
    return NextResponse.json({
      count: rows.length,
      positions: rows,
    });
  } catch (error) {
    console.error("Error fetching missing cost basis:", error);
    return NextResponse.json(
      { error: "Failed to fetch missing cost basis" },
      { status: 500 }
    );
  }
}
