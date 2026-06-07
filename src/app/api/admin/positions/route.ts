import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const minGrade = searchParams.get("min_grade");
    const sector = searchParams.get("sector");
    const weakOnly = searchParams.get("weak") === "true";

    let sql = `
      SELECT ticker, shares, avg_cost, live_price, live_value,
             grade, council, sector, updated_at
      FROM positions
      WHERE 1=1
    `;
    const params: any[] = [];

    if (minGrade) {
      sql += ` AND grade >= $${params.length + 1}`;
      params.push(parseInt(minGrade));
    }
    if (sector) {
      sql += ` AND sector = $${params.length + 1}`;
      params.push(sector);
    }
    if (weakOnly) {
      sql += ` AND grade < 45`;
    }

    sql += ` ORDER BY live_value DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const rows = await query(sql, params);

    // Convert numeric strings to numbers
    const cleanRows = rows.map((p: any) => ({
      ...p,
      shares: p.shares ? parseFloat(p.shares) : null,
      avg_cost: p.avg_cost ? parseFloat(p.avg_cost) : null,
      live_price: p.live_price ? parseFloat(p.live_price) : null,
      live_value: p.live_value ? parseFloat(p.live_value) : null,
      grade: p.grade ? parseInt(p.grade) : null,
    }));

    return NextResponse.json({ positions: cleanRows, count: cleanRows.length });
  } catch (error) {
    console.error("Positions API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch positions: " + (error as Error).message },
      { status: 500 }
    );
  }
}
