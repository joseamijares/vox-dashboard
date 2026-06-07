import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    // System configuration from database
    const config = await query(`
      SELECT key, value, updated_at
      FROM system_config
      WHERE key IN ('dashboard_version', 'grader_version', 'last_full_sync', 
                    'alert_threshold_sell', 'alert_threshold_trim',
                    'max_position_pct', 'rebalance_frequency')
    `);

    // Build config object
    const configMap: Record<string, any> = {};
    for (const c of config) {
      configMap[c.key] = {
        value: c.value,
        updated_at: c.updated_at,
      };
    }

    // Default values if not in DB
    const defaults = {
      dashboard_version: "v12.1",
      grader_version: "v2.1",
      alert_threshold_sell: 40,
      alert_threshold_trim: 50,
      max_position_pct: 15,
      rebalance_frequency: "weekly",
    };

    return NextResponse.json({
      generated_at: new Date().toISOString(),
      config: { ...defaults, ...configMap },
      environment: process.env.NODE_ENV || "development",
    });
  } catch (error) {
    console.error("Config API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch config: " + (error as Error).message },
      { status: 500 }
    );
  }
}
