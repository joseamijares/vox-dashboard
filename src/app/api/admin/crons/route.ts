import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const status = searchParams.get("status");
    const jobName = searchParams.get("job");

    let sql = `
      SELECT job_name, status, started_at, finished_at, duration_ms, output, error
      FROM cron_runs
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status) {
      sql += ` AND status = $${params.length + 1}`;
      params.push(status);
    }
    if (jobName) {
      sql += ` AND job_name = $${params.length + 1}`;
      params.push(jobName);
    }

    sql += ` ORDER BY started_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const rows = await query(sql, params);

    return NextResponse.json({ runs: rows, count: rows.length });
  } catch (error) {
    console.error("Crons API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch cron runs: " + (error as Error).message },
      { status: 500 }
    );
  }
}
