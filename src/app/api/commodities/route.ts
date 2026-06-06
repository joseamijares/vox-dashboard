import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const rows = await query(`
      SELECT id, symbol, name, price, unit, category, change_pct, source, created_at
      FROM commodity_prices
      ORDER BY symbol, created_at DESC
    `);
    return NextResponse.json({ commodities: rows });
  } catch (error) {
    console.error("Error fetching commodities:", error);
    return NextResponse.json({ error: "Failed to fetch commodities" }, { status: 500 });
  }
}
