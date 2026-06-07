import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// Parse numeric strings from Postgres into numbers
function parseNumeric(value: any): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}

export async function GET() {
  try {
    const rows = await query(`
      SELECT id, region, risk_type, severity, description, affected_tickers,
             max_temp, min_temp, precip_5day, created_at
      FROM weather_risks
      ORDER BY created_at DESC
      LIMIT 50
    `);
    // Parse numeric fields to avoid string types
    const parsed = rows.map((row: any) => ({
      ...row,
      max_temp: parseNumeric(row.max_temp),
      min_temp: parseNumeric(row.min_temp),
      precip_5day: parseNumeric(row.precip_5day),
    }));
    return NextResponse.json({ risks: parsed });
  } catch (error) {
    console.error("Error fetching weather risks:", error);
    return NextResponse.json({ error: "Failed to fetch weather risks" }, { status: 500 });
  }
}
