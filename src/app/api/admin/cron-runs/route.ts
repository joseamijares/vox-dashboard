import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET /api/admin/cron-runs — fetch recent cron runs
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const jobName = searchParams.get("job");
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    let sql = `SELECT * FROM cron_runs`;
    const params: any[] = [];

    if (jobName) {
      sql += ` WHERE job_name = $1`;
      params.push(jobName);
    }

    sql += ` ORDER BY started_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const rows = await query(sql, params);

    return NextResponse.json({ runs: rows, count: rows.length });
  } catch (error) {
    console.error("Error fetching cron runs:", error);
    return NextResponse.json(
      { error: "Failed to fetch cron runs: " + (error as Error).message },
      { status: 500 }
    );
  }
}

// POST /api/admin/cron-runs — record a new cron run start
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { job_name, status = "running", output, error } = body;

    if (!job_name) {
      return NextResponse.json({ error: "Missing job_name" }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO cron_runs (job_name, status, output, error) VALUES ($1, $2, $3, $4) RETURNING *`,
      [job_name, status, output || null, error || null]
    );

    return NextResponse.json({ success: true, run: result[0] });
  } catch (error) {
    console.error("Error recording cron run:", error);
    return NextResponse.json(
      { error: "Failed to record cron run: " + (error as Error).message },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/cron-runs — update a run with finish status
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, duration_ms, output, error } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing run id" }, { status: 400 });
    }

    const result = await query(
      `UPDATE cron_runs SET status = $1, finished_at = NOW(), duration_ms = $2, output = $3, error = $4 WHERE id = $5 RETURNING *`,
      [status, duration_ms || null, output || null, error || null, id]
    );

    return NextResponse.json({ success: true, run: result[0] });
  } catch (error) {
    console.error("Error updating cron run:", error);
    return NextResponse.json(
      { error: "Failed to update cron run: " + (error as Error).message },
      { status: 500 }
    );
  }
}
