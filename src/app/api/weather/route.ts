import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const rows = await query(`
      SELECT id, region, risk_type, severity, description, affected_tickers,
             max_temp, min_temp, precip_5day, created_at
      FROM weather_risks
      ORDER BY created_at DESC
      LIMIT 50
    `);
    return NextResponse.json({ risks: rows });
  } catch (error) {
    console.error("Error fetching weather risks:", error);
    return NextResponse.json({ error: "Failed to fetch weather risks" }, { status: 500 });
  }
}
