import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const rows = await query(`
      SELECT id, symbol, name, price, unit, category, change_pct, source, created_at
      FROM commodity_prices
      ORDER BY symbol, created_at DESC
    `);
    // Convert numeric strings to numbers for frontend
    const commodities = rows.map((row: any) => ({
      ...row,
      price: row.price !== null ? parseFloat(row.price) : null,
      change_pct: row.change_pct !== null ? parseFloat(row.change_pct) : null,
    }));
    return NextResponse.json({ commodities });
  } catch (error) {
    console.error("Error fetching commodities:", error);
    return NextResponse.json({ error: "Failed to fetch commodities" }, { status: 500 });
  }
}
