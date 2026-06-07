import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const level = searchParams.get("level");
    const source = searchParams.get("source");

    let sql = `
      SELECT id, level, source, message, created_at
      FROM system_logs
      WHERE 1=1
    `;
    const params: any[] = [];

    if (level) {
      sql += ` AND level = $${params.length + 1}`;
      params.push(level);
    }
    if (source) {
      sql += ` AND source ILIKE $${params.length + 1}`;
      params.push(`%${source}%`);
    }

    sql += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const rows = await query(sql, params);

    return NextResponse.json({ logs: rows, count: rows.length });
  } catch (error) {
    console.error("Logs API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch logs: " + (error as Error).message },
      { status: 500 }
    );
  }
}
