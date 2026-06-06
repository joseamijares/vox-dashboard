import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const rows = await query(`
      SELECT id, event_type, severity, region, description, affected_sectors, affected_tickers, source_url, created_at
      FROM geopolitical_events
      ORDER BY created_at DESC
      LIMIT 50
    `);
    return NextResponse.json({ events: rows });
  } catch (error) {
    console.error("Error fetching geopolitical events:", error);
    return NextResponse.json({ error: "Failed to fetch geopolitical events" }, { status: 500 });
  }
}
