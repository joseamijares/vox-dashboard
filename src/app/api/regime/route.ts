import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const rows = await query(`
      SELECT id, regime, confidence, vix_level, spy_trend, yield_curve, fed_stance, description, created_at
      FROM market_regime
      ORDER BY created_at DESC
      LIMIT 1
    `);
    return NextResponse.json({ regime: rows[0] || null });
  } catch (error) {
    console.error("Error fetching market regime:", error);
    return NextResponse.json({ error: "Failed to fetch market regime" }, { status: 500 });
  }
}
