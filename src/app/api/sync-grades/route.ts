import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getCouncilAction } from "@/lib/council";

/**
 * Sync positions.grade and positions.council from the latest vox_grades record.
 * Uses unified council logic: SELL<45, TRIM=45-49, HOLD=50-59, BUY=60-69, CORE=70+
 */
export async function POST() {
  try {
    // Get the latest grade per ticker from vox_grades
    const latestGrades = await query(`
      SELECT DISTINCT ON (ticker)
        ticker, vox_grade, action
      FROM vox_grades
      ORDER BY ticker, generated_at DESC
    `);

    if (!latestGrades || latestGrades.length === 0) {
      return NextResponse.json({ success: true, updated: 0, message: "No grades found to sync" });
    }

    let updated = 0;
    const mismatches = [];

    for (const g of latestGrades) {
      const ticker = g.ticker;
      const grade = parseInt(g.vox_grade, 10);
      const expectedAction = getCouncilAction(grade);

      // Update positions table with unified council action
      const result = await query(
        `UPDATE positions
         SET grade = $1, council = $2, updated_at = NOW()
         WHERE ticker = $3
         RETURNING ticker, grade, council`,
        [grade, expectedAction, ticker]
      );

      if (result && result.length > 0) {
        updated++;
        if (g.action !== expectedAction) {
          mismatches.push({ ticker, oldAction: g.action, newAction: expectedAction, grade });
        }
      }
    }

    return NextResponse.json({
      success: true,
      updated,
      mismatchesFixed: mismatches.length,
      mismatches: mismatches.slice(0, 20),
    });
  } catch (err: any) {
    console.error("Sync grades error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
