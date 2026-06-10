import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { ticker } = await req.json();
    if (!ticker) {
      return NextResponse.json({ error: "ticker required" }, { status: 400 });
    }

    const rows = await query(`
      SELECT ticker, timestamp, consensus, consensus_pct, votes, deliberations, risk_veto, risk_veto_reason, final_action
      FROM council_deliberations
      WHERE ticker = $1
      ORDER BY timestamp DESC
      LIMIT 1
    `, [ticker]);

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "No deliberation found" }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
