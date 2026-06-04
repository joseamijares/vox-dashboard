import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { grades } = await request.json();

    if (!Array.isArray(grades)) {
      return NextResponse.json({ error: "grades must be an array" }, { status: 400 });
    }

    let inserted = 0;
    let errors = 0;

    for (const g of grades) {
      try {
        await query(
          `INSERT INTO vox_grades 
           (ticker, name, vox_grade, previous_grade, action, current_price, stop_loss,
            entry_point, position_value, shares, technical_score, fundamental_score,
            macro_score, sector_score, weather_score, sentiment_score, catalysts, weather_factors, generated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, NOW())
           ON CONFLICT DO NOTHING`,
          [
            g.ticker, g.name || g.ticker, g.vox_grade, g.previous_grade || 0, g.action,
            g.current_price || 0, g.stop_loss || 0, g.entry_point || 0, g.position_value || 0, g.shares || 0,
            g.technical_score || 50, g.fundamental_score || 50, g.macro_score || 50, g.sector_score || 50,
            g.weather_score || 50, g.sentiment_score || 50, g.catalysts || "", g.weather_factors || ""
          ]
        );
        inserted++;
      } catch (e) {
        errors++;
      }
    }

    return NextResponse.json({ success: true, inserted, errors, total: grades.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
