import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST() {
  try {
    // For now, manually insert the current macro signals
    // In production, this would call the grader service
    const signals = [
      {
        signal_name: "YIELD_CURVE_NORMAL",
        signal_value: 0.26,
        signal_direction: "BULLISH",
        impact_sector: "Financials",
        confidence: 60,
        source: "Treasury spreads (TNX-FVX)",
      },
      {
        signal_name: "DOLLAR_STRENGTHENING",
        signal_value: 100.07,
        signal_direction: "BEARISH",
        impact_sector: "Emerging Markets",
        confidence: 70,
        source: "DXY 5d change +0.66%",
      },
      {
        signal_name: "OIL_HIGH",
        signal_value: 90.54,
        signal_direction: "BEARISH",
        impact_sector: "Consumer Discretionary",
        confidence: 65,
        source: "WTI Crude > $85",
      },
      {
        signal_name: "VIX_ELEVATED",
        signal_value: 21.51,
        signal_direction: "BEARISH",
        impact_sector: "All",
        confidence: 55,
        source: "VIX > 20",
      },
    ];

    for (const sig of signals) {
      await query(
        `
        INSERT INTO macro_signals (signal_name, signal_value, signal_direction, impact_sector, confidence, source, computed_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        ON CONFLICT (signal_name) DO UPDATE SET
          signal_value = EXCLUDED.signal_value,
          signal_direction = EXCLUDED.signal_direction,
          impact_sector = EXCLUDED.impact_sector,
          confidence = EXCLUDED.confidence,
          source = EXCLUDED.source,
          computed_at = EXCLUDED.computed_at
      `,
        [sig.signal_name, sig.signal_value, sig.signal_direction, sig.impact_sector, sig.confidence, sig.source]
      );
    }

    return NextResponse.json({ success: true, signals_saved: signals.length });
  } catch (error: any) {
    console.error("Macro scan error:", error);
    return NextResponse.json({ error: error?.message || String(error) }, { status: 500 });
  }
}
