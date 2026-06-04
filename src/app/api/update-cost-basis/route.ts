import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { updates } = body;

    if (!Array.isArray(updates)) {
      return NextResponse.json({ error: "updates must be an array" }, { status: 400 });
    }

    let updated = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const u of updates) {
      const { ticker, avg_cost } = u;
      
      if (!ticker || avg_cost === undefined || avg_cost === null) {
        skipped++;
        continue;
      }

      try {
        await query(
          `UPDATE positions SET avg_cost = $1, updated_at = NOW() WHERE ticker = $2`,
          [avg_cost, ticker]
        );
        updated++;
      } catch (e: any) {
        errors.push(`${ticker}: ${e.message}`);
      }
    }

    return NextResponse.json({ 
      success: true, 
      updated, 
      skipped,
      errors: errors.length > 0 ? errors : undefined 
    });
  } catch (error: any) {
    console.error("Update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
