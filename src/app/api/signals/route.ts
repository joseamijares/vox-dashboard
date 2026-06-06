import { NextResponse } from "next/server";
import { query } from "@/lib/db";

function parseNumeric(value: any): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}

function parseRow(row: Record<string, any>): Record<string, any> {
  const parsed = { ...row };
  const numericFields = [
    "composite_score", "technical_score", "fundamental_score", "macro_score",
    "sector_score", "weather_score", "sentiment_score", "rsi", "grade",
    "target_price", "stop_price"
  ];
  for (const field of numericFields) {
    if (field in parsed) parsed[field] = parseNumeric(parsed[field]);
  }
  return parsed;
}

export async function GET() {
  try {
    const rows = await query(`
      SELECT id, ticker, signal_type, composite_score,
             technical_score, fundamental_score, macro_score,
             sector_score, weather_score, sentiment_score,
             rsi, grade, target_price, stop_price, rationale,
             created_at
      FROM trade_signals
      ORDER BY composite_score DESC, created_at DESC
      LIMIT 200
    `);
    return NextResponse.json({ signals: rows.map(parseRow) });
  } catch (error) {
    console.error("Failed to fetch trade signals:", error);
    return NextResponse.json({ signals: [], error: String(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { signals } = await req.json();
    if (!Array.isArray(signals) || signals.length === 0) {
      return NextResponse.json({ count: 0 });
    }

    // Clear old signals
    await query(`DELETE FROM trade_signals WHERE created_at < NOW() - INTERVAL '7 days'`);

    let count = 0;
    for (const s of signals) {
      await query(
        `INSERT INTO trade_signals (
          ticker, signal_type, composite_score, technical_score, fundamental_score,
          macro_score, sector_score, weather_score, sentiment_score, rsi, grade,
          target_price, stop_price, rationale
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT DO NOTHING`,
        [
          s.ticker,
          s.signal_type,
          s.composite_score,
          s.technical_score,
          s.fundamental_score,
          s.macro_score,
          s.sector_score,
          s.weather_score,
          s.sentiment_score,
          s.rsi,
          s.grade,
          s.target_price,
          s.stop_price,
          s.rationale,
        ]
      );
      count++;
    }

    return NextResponse.json({ success: true, count });
  } catch (error) {
    console.error("Failed to write trade signals:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
