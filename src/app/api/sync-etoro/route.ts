import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { positions } = body;

    if (!Array.isArray(positions)) {
      return NextResponse.json({ error: "positions must be an array" }, { status: 400 });
    }

    let updated = 0;
    let inserted = 0;

    for (const pos of positions) {
      const { ticker, shares, avg_cost, live_price, live_value, brokers, sector } = pos;

      // Check if position exists
      const existing = await query("SELECT * FROM positions WHERE ticker = $1", [ticker]);

      if (existing && existing.length > 0) {
        // Merge brokers
        const oldBrokers = existing[0].brokers || [];
        const newBrokers = Array.from(new Set([...oldBrokers, ...(brokers || [])]));

        await query(
          `UPDATE positions SET shares = $1, avg_cost = $2, live_price = $3, live_value = $4,
           brokers = $5, sector = $6, updated_at = NOW() WHERE ticker = $7`,
          [shares, avg_cost, live_price, live_value, newBrokers, sector || "", ticker]
        );
        updated++;
      } else {
        await query(
          `INSERT INTO positions (ticker, shares, avg_cost, live_price, live_value, grade, council, brokers, sector, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
          [ticker, shares, avg_cost, live_price, live_value, 0, "", brokers || ["eToro"], sector || ""]
        );
        inserted++;
      }
    }

    // Auto-grade any new positions (grade = 0)
    const newPositions = await query(`SELECT ticker, sector, live_price, shares FROM positions WHERE grade = 0`);
    if (newPositions && newPositions.length > 0) {
      // Call auto-grade endpoint internally
      try {
        const autoGradeRes = await fetch(`http://localhost:${process.env.PORT || 3000}/api/auto-grade`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        const autoGradeData = await autoGradeRes.json();
        console.log("Auto-grade result:", autoGradeData);
      } catch (e) {
        console.error("Auto-grade failed:", e);
      }
    }

    return NextResponse.json({ success: true, updated, inserted, total: positions.length });
  } catch (error: any) {
    console.error("Sync error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
