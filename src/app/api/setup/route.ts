import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS vox_grades (
        id SERIAL PRIMARY KEY,
        ticker VARCHAR(20) NOT NULL,
        name VARCHAR(200),
        vox_grade INTEGER,
        previous_grade INTEGER,
        action VARCHAR(10),
        current_price NUMERIC,
        stop_loss NUMERIC,
        entry_point NUMERIC,
        position_value NUMERIC,
        shares NUMERIC,
        technical_score INTEGER,
        fundamental_score INTEGER,
        macro_score INTEGER,
        sector_score INTEGER,
        weather_score INTEGER,
        sentiment_score INTEGER,
        catalysts TEXT,
        weather_factors TEXT,
        generated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_vox_grades_ticker_time 
      ON vox_grades(ticker, generated_at)
    `);
    return NextResponse.json({ success: true, message: "vox_grades table created" });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json({ error: "Setup failed", details: String(error) }, { status: 500 });
  }
}
