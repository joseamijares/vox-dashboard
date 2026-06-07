import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const ticker = searchParams.get("ticker");
    const minGrade = searchParams.get("min_grade");

    let sql = `
      SELECT DISTINCT ON (ticker)
        ticker, vox_grade, technical_score, fundamental_score, macro_score,
        sector_score, weather_score, sentiment_score, action, generated_at
      FROM vox_grades
      WHERE 1=1
    `;
    const params: any[] = [];

    if (ticker) {
      sql += ` AND ticker = $${params.length + 1}`;
      params.push(ticker.toUpperCase());
    }
    if (minGrade) {
      sql += ` AND vox_grade >= $${params.length + 1}`;
      params.push(parseInt(minGrade));
    }

    sql += ` ORDER BY ticker, generated_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const rows = await query(sql, params);

    // Convert numeric strings to numbers
    const cleanRows = rows.map((g: any) => ({
      ...g,
      vox_grade: g.vox_grade ? parseInt(g.vox_grade) : null,
      technical_score: g.technical_score ? parseInt(g.technical_score) : null,
      fundamental_score: g.fundamental_score ? parseInt(g.fundamental_score) : null,
      macro_score: g.macro_score ? parseInt(g.macro_score) : null,
      sector_score: g.sector_score ? parseInt(g.sector_score) : null,
      weather_score: g.weather_score ? parseInt(g.weather_score) : null,
      sentiment_score: g.sentiment_score ? parseInt(g.sentiment_score) : null,
    }));

    return NextResponse.json({ grades: cleanRows, count: cleanRows.length });
  } catch (error) {
    console.error("Grades API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch grades: " + (error as Error).message },
      { status: 500 }
    );
  }
}
