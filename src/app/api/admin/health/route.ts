import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const start = Date.now();

    // Test DB connection
    const dbTest = await query("SELECT NOW() as now, version() as version");
    const dbLatency = Date.now() - start;

    // Count key tables
    const tables = await query(`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename IN ('positions', 'watchlist', 'vox_grades', 'macro_signals', 
                        'weather_patterns', 'sector_momentum', 'sp500_universe', 
                        'sp500_grades', 'sp500_sector_leaders', 'commodity_prices',
                        'cron_runs', 'journal_entries')
    `);

    // Count rows in key tables
    const counts: Record<string, number> = {};
    for (const t of tables) {
      try {
        const result = await query(`SELECT COUNT(*) as count FROM ${t.tablename}`);
        counts[t.tablename] = parseInt(result[0]?.count || "0");
      } catch {
        counts[t.tablename] = -1;
      }
    }

    // Check latest cron run
    const latestCron = await query(`
      SELECT job_name, status, started_at 
      FROM cron_runs 
      ORDER BY started_at DESC 
      LIMIT 1
    `);

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        latency_ms: dbLatency,
        version: dbTest[0]?.version?.split(" ")[0] || "unknown",
        tables_found: tables.length,
        row_counts: counts,
      },
      latest_cron: latestCron[0] || null,
    });
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
