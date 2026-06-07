import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    // SELL alerts (grade < 40)
    const sellAlerts = await query(`
      SELECT ticker, shares, live_price, live_value, grade, sector
      FROM positions
      WHERE grade < 40
      ORDER BY live_value DESC
    `);

    // TRIM alerts (grade 40-49)
    const trimAlerts = await query(`
      SELECT ticker, shares, live_price, live_value, grade, sector
      FROM positions
      WHERE grade >= 40 AND grade < 50
      ORDER BY live_value DESC
    `);

    // Big losers (>10% below avg_cost)
    const bigLosers = await query(`
      SELECT ticker, shares, avg_cost, live_price, live_value, grade, sector,
             CASE WHEN avg_cost > 0 THEN ((live_price - avg_cost) / avg_cost * 100) ELSE 0 END as return_pct
      FROM positions
      WHERE avg_cost > 0 AND live_price < avg_cost * 0.90
      ORDER BY return_pct ASC
      LIMIT 10
    `);

    // Missing cost basis
    const missingBasis = await query(`
      SELECT ticker, shares, live_price, live_value, grade, sector
      FROM positions
      WHERE avg_cost IS NULL OR avg_cost = 0
    `);

    // Convert numeric strings
    const clean = (rows: any[]) => rows.map((r: any) => ({
      ...r,
      shares: r.shares ? parseFloat(r.shares) : null,
      live_price: r.live_price ? parseFloat(r.live_price) : null,
      live_value: r.live_value ? parseFloat(r.live_value) : null,
      grade: r.grade ? parseInt(r.grade) : null,
      avg_cost: r.avg_cost ? parseFloat(r.avg_cost) : null,
      return_pct: r.return_pct ? parseFloat(r.return_pct) : null,
    }));

    return NextResponse.json({
      generated_at: new Date().toISOString(),
      sell: clean(sellAlerts),
      trim: clean(trimAlerts),
      big_losers: clean(bigLosers),
      missing_cost_basis: clean(missingBasis),
      summary: {
        sell_count: sellAlerts.length,
        trim_count: trimAlerts.length,
        big_loser_count: bigLosers.length,
        missing_cost_basis_count: missingBasis.length,
      },
    });
  } catch (error) {
    console.error("Alerts API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch alerts: " + (error as Error).message },
      { status: 500 }
    );
  }
}
