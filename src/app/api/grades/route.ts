import { NextResponse } from "next/server";
import { query, getVoxGrades } from "@/lib/db";

export async function GET() {
  try {
    const rows = await getVoxGrades();
    return NextResponse.json({ grades: rows });
  } catch (error) {
    console.error("Error fetching grades:", error);
    return NextResponse.json({ error: "Failed to fetch grades" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const grades = body.grades || [body];

    for (const g of grades) {
      await query(
        `INSERT INTO vox_grades 
         (ticker, name, vox_grade, previous_grade, action, current_price, stop_loss,
          entry_point, position_value, shares, technical_score, fundamental_score,
          macro_score, sector_score, weather_score, sentiment_score, catalysts, weather_factors)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
         ON CONFLICT DO NOTHING`,
        [
          g.ticker, g.name, g.vox_grade, g.previous_grade, g.action, g.current_price,
          g.stop_loss, g.entry_point, g.position_value, g.shares,
          g.technical_score, g.fundamental_score, g.macro_score, g.sector_score,
          g.weather_score, g.sentiment_score, g.catalysts, g.weather_factors
        ]
      );
    }

    return NextResponse.json({ success: true, count: grades.length });
  } catch (error) {
    console.error("Error saving grades:", error);
    return NextResponse.json({ error: "Failed to save grades" }, { status: 500 });
  }
}
