import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    // Portfolio stats — council thresholds: SELL<45, TRIM=45-49, HOLD=50-59, BUY=60-69, CORE=70+
    // AUM: live_value is already in account base currency (USD-equivalent)
    // currency=MXN indicates broker account, not value currency
    const positions = await query(`
      SELECT COUNT(*) as count, 
             SUM(live_value) as total_value,
             AVG(grade) as avg_grade,
             COUNT(CASE WHEN grade >= 70 THEN 1 END) as core_count,
             COUNT(CASE WHEN grade >= 60 AND grade < 70 THEN 1 END) as buy_count,
             COUNT(CASE WHEN grade >= 50 AND grade < 60 THEN 1 END) as hold_count,
             COUNT(CASE WHEN grade >= 45 AND grade < 50 THEN 1 END) as trim_count,
             COUNT(CASE WHEN grade < 45 THEN 1 END) as sell_count
      FROM positions
    `);

    // Watchlist stats
    const watchlist = await query(`
      SELECT COUNT(*) as count,
             AVG(grade) as avg_grade,
             COUNT(CASE WHEN grade >= 70 THEN 1 END) as strong_buy
      FROM watchlist
    `);

    // S&P 500 stats — council thresholds: SELL<45, TRIM=45-49, HOLD=50-59, BUY=60-69, CORE=70+
    const sp500 = await query(`
      SELECT COUNT(*) as graded,
             AVG(vox_grade) as avg_grade,
             COUNT(CASE WHEN vox_grade >= 70 THEN 1 END) as core,
             COUNT(CASE WHEN vox_grade >= 60 AND vox_grade < 70 THEN 1 END) as buy,
             COUNT(CASE WHEN vox_grade >= 50 AND vox_grade < 60 THEN 1 END) as hold,
             COUNT(CASE WHEN vox_grade >= 45 AND vox_grade < 50 THEN 1 END) as trim,
             COUNT(CASE WHEN vox_grade < 45 THEN 1 END) as sell
      FROM sp500_grades
    `);

    // Macro signals count
    const macro = await query(`SELECT COUNT(*) as count FROM macro_signals`);

    // Weather patterns count
    const weather = await query(`SELECT COUNT(*) as count FROM weather_patterns`);

    // Sector momentum count
    const sectors = await query(`SELECT COUNT(*) as count FROM sector_momentum`);

    // Cron runs (last 24h)
    const crons = await query(`
      SELECT COUNT(*) as count,
             COUNT(CASE WHEN status = 'success' THEN 1 END) as success,
             COUNT(CASE WHEN status = 'error' THEN 1 END) as errors
      FROM cron_runs
      WHERE started_at > NOW() - INTERVAL '24 hours'
    `);

    return NextResponse.json({
      generated_at: new Date().toISOString(),
      portfolio: {
        positions: parseInt(positions[0]?.count || "0"),
        total_value: parseFloat(positions[0]?.total_value || "0"),
        avg_grade: Math.round(parseFloat(positions[0]?.avg_grade || "0") * 10) / 10,
        core: parseInt(positions[0]?.core_count || "0"),
        buy: parseInt(positions[0]?.buy_count || "0"),
        hold: parseInt(positions[0]?.hold_count || "0"),
        trim: parseInt(positions[0]?.trim_count || "0"),
        sell: parseInt(positions[0]?.sell_count || "0"),
      },
      watchlist: {
        total: parseInt(watchlist[0]?.count || "0"),
        avg_grade: Math.round(parseFloat(watchlist[0]?.avg_grade || "0") * 10) / 10,
        strong_buy: parseInt(watchlist[0]?.strong_buy || "0"),
      },
      sp500: {
        graded: parseInt(sp500[0]?.graded || "0"),
        avg_grade: Math.round(parseFloat(sp500[0]?.avg_grade || "0") * 10) / 10,
        core: parseInt(sp500[0]?.core || "0"),
        buy: parseInt(sp500[0]?.buy || "0"),
        hold: parseInt(sp500[0]?.hold || "0"),
        trim: parseInt(sp500[0]?.trim || "0"),
        sell: parseInt(sp500[0]?.sell || "0"),
      },
      intelligence: {
        macro_signals: parseInt(macro[0]?.count || "0"),
        weather_patterns: parseInt(weather[0]?.count || "0"),
        sector_momentum: parseInt(sectors[0]?.count || "0"),
      },
      cron_activity_24h: {
        total: parseInt(crons[0]?.count || "0"),
        success: parseInt(crons[0]?.success || "0"),
        errors: parseInt(crons[0]?.errors || "0"),
      },
    });
  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats: " + (error as Error).message },
      { status: 500 }
    );
  }
}
