import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET /api/admin/cron-runs/latest — fetch latest run for each job
export async function GET() {
  try {
    const rows = await query(`
      SELECT DISTINCT ON (job_name) *
      FROM cron_runs
      ORDER BY job_name, started_at DESC
    `);

    return NextResponse.json({ jobs: rows, count: rows.length });
  } catch (error) {
    console.error("Error fetching latest cron runs:", error);
    return NextResponse.json(
      { error: "Failed to fetch latest cron runs: " + (error as Error).message },
      { status: 500 }
    );
  }
}
