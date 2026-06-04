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
    let skipped = 0;
    const errors: string[] = [];

    for (const pos of positions) {
      const { ticker, shares, avg_cost, live_price, live_value, brokers, sector } = pos;

      // Validate required fields
      if (!ticker || !shares || shares <= 0) {
        skipped++;
        errors.push(`Skipped ${ticker || "?"}: invalid shares (${shares})`);
        continue;
      }

      // Validate cost basis — if missing, try to derive from live_value / shares
      let validAvgCost = avg_cost;
      if (!validAvgCost || validAvgCost <= 0) {
        if (live_value && shares && live_value > 0 && shares > 0) {
          // Derive approximate cost from live_value (this is wrong direction — 
          // live_value = shares * live_price, not cost)
          // Better: if we have live_price, we can use that as fallback
          validAvgCost = live_price;
        }
        if (!validAvgCost || validAvgCost <= 0) {
          errors.push(`⚠️ ${ticker}: Missing cost basis (avg_cost=0). Gain % will be inaccurate.`);
        }
      }

      // Check if position exists
      const existing = await query("SELECT * FROM positions WHERE ticker = $1", [ticker]);

      if (existing && existing.length > 0) {
        // Merge brokers
        const oldBrokers = existing[0].brokers || [];
        const newBrokers = Array.from(new Set([...oldBrokers, ...(brokers || [])]));

        // Only update avg_cost if we have a valid new one, otherwise keep existing
        const existingCost = existing[0].avg_cost;
        const finalCost = (validAvgCost && validAvgCost > 0) ? validAvgCost : (existingCost || 0);

        await query(
          `UPDATE positions SET shares = $1, avg_cost = $2, live_price = $3, live_value = $4,
           brokers = $5, sector = $6, updated_at = NOW() WHERE ticker = $7`,
          [shares, finalCost, live_price, live_value, newBrokers, sector || existing[0].sector || "", ticker]
        );
        updated++;
      } else {
        await query(
          `INSERT INTO positions (ticker, shares, avg_cost, live_price, live_value, grade, council, brokers, sector, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
          [ticker, shares, validAvgCost || 0, live_price, live_value, 0, "", brokers || ["eToro"], sector || ""]
        );
        inserted++;
      }
    }

    // Auto-grade any new positions (grade = 0)
    const newPositions = await query(`SELECT ticker, sector, live_price, shares FROM positions WHERE grade = 0`);
    if (newPositions && newPositions.length > 0) {
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

    return NextResponse.json({ 
      success: true, 
      updated, 
      inserted, 
      skipped,
      total: positions.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error: any) {
    console.error("Sync error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
