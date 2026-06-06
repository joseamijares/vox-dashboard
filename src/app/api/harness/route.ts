import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    // Portfolio state
    const positions = await query(`
      SELECT ticker, shares, live_price, live_value, grade, council, sector
      FROM positions
      ORDER BY live_value DESC
    `);

    // Watchlist
    const watchlist = await query(`
      SELECT ticker, grade, sector, entry_price, target_price, stop_loss
      FROM watchlist
      ORDER BY grade DESC NULLS LAST
    `);

    // Macro signals (from grader v2)
    const macroSignals = await query(`
      SELECT signal_type, direction, impact_score, impact_sectors, notes, date
      FROM macro_signals
      ORDER BY date DESC
      LIMIT 20
    `);

    // Weather patterns (from grader v2)
    const weatherPatterns = await query(`
      SELECT pattern, severity, sectors, tickers, date, notes
      FROM weather_patterns
      ORDER BY date DESC
      LIMIT 20
    `);

    // Sector momentum (from grader v2)
    const sectorMomentum = await query(`
      SELECT sector, momentum_score, top_tickers, updated_at
      FROM sector_momentum
      ORDER BY momentum_score DESC
    `);

    // Latest vox grades breakdown
    const latestGrades = await query(`
      SELECT DISTINCT ON (ticker)
        ticker, vox_grade, technical_score, fundamental_score, macro_score,
        sector_score, weather_score, sentiment_score, action, generated_at
      FROM vox_grades
      ORDER BY ticker, generated_at DESC
    `);

    const aum = (positions || []).reduce((sum: number, p: any) => sum + (parseFloat(p.live_value) || 0), 0);
    const graded = (positions || []).filter((p: any) => p.grade && parseFloat(p.grade) > 0);
    const weak = (positions || []).filter((p: any) => p.grade && parseFloat(p.grade) < 45);

    // Sector allocation
    const sectors: Record<string, number> = {};
    for (const p of positions || []) {
      const s = p.sector || "Unclassified";
      sectors[s] = (sectors[s] || 0) + (parseFloat(p.live_value) || 0);
    }
    const sectorPct: Record<string, number> = {};
    for (const [s, v] of Object.entries(sectors)) {
      sectorPct[s] = aum ? Math.round((v / aum) * 1000) / 10 : 0;
    }

    // Famous traders missing from portfolio
    const ownedTickers = new Set((positions || []).map((p: any) => p.ticker));
    const famousTraders = (watchlist || []).filter((w: any) => w.sector === "Famous Traders");
    const ftMissing = famousTraders
      .filter((w: any) => !ownedTickers.has(w.ticker))
      .sort((a: any, b: any) => (parseFloat(b.grade) || 0) - (parseFloat(a.grade) || 0))
      .slice(0, 10);

    // Supply chain leaders
    const thematic = ["AI Infrastructure", "Quantum", "Space", "Cybersecurity", "Security", "Nuclear"];
    const supplyChain: Record<string, any[]> = {};
    for (const sector of thematic) {
      const tickers = (watchlist || [])
        .filter((w: any) => w.sector === sector)
        .sort((a: any, b: any) => (parseFloat(b.grade) || 0) - (parseFloat(a.grade) || 0))
        .slice(0, 3);
      supplyChain[sector] = tickers;
    }

    // Determine market regime from macro signals
    let regime = "NEUTRAL";
    let regimeConfidence = 50;
    const bullish = macroSignals.filter((s: any) => s.direction === "BULLISH").length;
    const bearish = macroSignals.filter((s: any) => s.direction === "BEARISH").length;
    const riskOff = macroSignals.filter((s: any) => s.direction === "RISK_OFF").length;
    if (bearish + riskOff >= bullish + 2) {
      regime = "RISK_OFF";
      regimeConfidence = Math.min(95, 60 + (bearish + riskOff - bullish) * 10);
    } else if (bullish > bearish + riskOff) {
      regime = "BULLISH";
      regimeConfidence = Math.min(95, 60 + (bullish - bearish - riskOff) * 10);
    } else if (bearish > bullish) {
      regime = "BEARISH";
      regimeConfidence = Math.min(95, 60 + (bearish - bullish) * 10);
    }

    return NextResponse.json({
      generated_at: new Date().toISOString(),
      layer0: {
        aum: Math.round(aum * 100) / 100,
        total_positions: positions?.length || 0,
        total_watchlist: watchlist?.length || 0,
        graded_positions: graded.length,
        weak_positions: weak.length,
      },
      layer1: {
        sector_allocation: sectorPct,
        top_holdings: (positions || []).slice(0, 10),
        weak_positions: weak.slice(0, 10),
      },
      layer2: {
        total_famous_traders: famousTraders.length,
        missing_from_portfolio: famousTraders.length - (watchlist || []).filter((w: any) => ownedTickers.has(w.ticker) && w.sector === "Famous Traders").length,
        top_missing: ftMissing,
      },
      layer3: {
        sector_momentum: sectorMomentum || [],
        supply_chain: supplyChain,
      },
      layer4: {
        macro_signals: macroSignals || [],
        weather_patterns: weatherPatterns || [],
      },
      layer5: {
        regime,
        confidence: regimeConfidence,
        bullish_count: bullish,
        bearish_count: bearish,
        risk_off_count: riskOff,
      },
      layer6: {
        latest_grades: latestGrades || [],
      },
    });
  } catch (error: any) {
    console.error("Harness API error:", error);
    return NextResponse.json({ error: "Failed to generate harness report", detail: error?.message || String(error) }, { status: 500 });
  }
}
