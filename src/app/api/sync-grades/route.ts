import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST() {
  try {
    // Update all positions with new VOX grades
    const updates = [
      { ticker: "0700.HK", grade: 74, action: "HOLD" },
      { ticker: "A", grade: 76, action: "HOLD" },
      { ticker: "AAPL", grade: 76, action: "HOLD" },
      { ticker: "ADA-USD", grade: 60, action: "HOLD" },
      { ticker: "AMD", grade: 73, action: "HOLD" },
      { ticker: "AMZN", grade: 77, action: "HOLD" },
      { ticker: "APH", grade: 75, action: "HOLD" },
      { ticker: "ARKX", grade: 68, action: "HOLD" },
      { ticker: "AVGO", grade: 75, action: "HOLD" },
      { ticker: "AXS", grade: 71, action: "HOLD" },
      { ticker: "BIDU", grade: 72, action: "HOLD" },
      { ticker: "BIVI", grade: 74, action: "HOLD" },
      { ticker: "BNB-USD", grade: 63, action: "HOLD" },
      { ticker: "BTC-USD", grade: 59, action: "HOLD" },
      { ticker: "BYND", grade: 55, action: "HOLD" },
      { ticker: "CBRS", grade: 65, action: "HOLD" },
      { ticker: "CEG", grade: 74, action: "HOLD" },
      { ticker: "COIN", grade: 62, action: "HOLD" },
      { ticker: "CORZ", grade: 76, action: "HOLD" },
      { ticker: "COST", grade: 68, action: "HOLD" },
      { ticker: "CRWD", grade: 69, action: "HOLD" },
      { ticker: "DASH", grade: 69, action: "HOLD" },
      { ticker: "DDOG", grade: 74, action: "HOLD" },
      { ticker: "DOGE-USD", grade: 60, action: "HOLD" },
      { ticker: "ETH-USD", grade: 59, action: "HOLD" },
      { ticker: "GOOGL", grade: 80, action: "TRIM" },
      { ticker: "HBAR-USD", grade: 62, action: "HOLD" },
      { ticker: "IREN", grade: 72, action: "HOLD" },
      { ticker: "JMIA", grade: 68, action: "HOLD" },
      { ticker: "MELI", grade: 68, action: "HOLD" },
      { ticker: "META", grade: 78, action: "HOLD" },
      { ticker: "MIRA", grade: 62, action: "HOLD" },
      { ticker: "MS", grade: 73, action: "HOLD" },
      { ticker: "MSFT", grade: 79, action: "HOLD" },
      { ticker: "NAFTRAC.MX", grade: 70, action: "HOLD" },
      { ticker: "NVDA", grade: 82, action: "TRIM" },
      { ticker: "O", grade: 70, action: "HOLD" },
      { ticker: "OKLO", grade: 71, action: "HOLD" },
      { ticker: "OSCR", grade: 69, action: "HOLD" },
      { ticker: "PLTR", grade: 74, action: "HOLD" },
      { ticker: "POET", grade: 75, action: "HOLD" },
      { ticker: "QQQ", grade: 66, action: "HOLD" },
      { ticker: "SCCO", grade: 66, action: "HOLD" },
      { ticker: "SHOP", grade: 70, action: "HOLD" },
      { ticker: "SIDU", grade: 73, action: "HOLD" },
      { ticker: "SMH", grade: 65, action: "HOLD" },
      { ticker: "SNOW", grade: 73, action: "HOLD" },
      { ticker: "SOL-USD", grade: 60, action: "HOLD" },
      { ticker: "SPOT", grade: 73, action: "HOLD" },
      { ticker: "SPRB", grade: 70, action: "HOLD" },
      { ticker: "TE", grade: 72, action: "HOLD" },
      { ticker: "TRX-USD", grade: 63, action: "HOLD" },
      { ticker: "TSLA", grade: 71, action: "HOLD" },
      { ticker: "TSM", grade: 82, action: "TRIM" },
      { ticker: "VOO", grade: 69, action: "HOLD" },
      { ticker: "VTI", grade: 69, action: "HOLD" },
      { ticker: "WMT", grade: 68, action: "HOLD" },
      { ticker: "XLE", grade: 70, action: "HOLD" },
      { ticker: "XRP-USD", grade: 60, action: "HOLD" },
    ];

    let updated = 0;
    for (const u of updates) {
      await query(
        `UPDATE positions SET grade = $1, council = $2, updated_at = NOW() WHERE ticker = $3`,
        [u.grade, u.action, u.ticker]
      );
      updated++;
    }

    return NextResponse.json({ success: true, updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
