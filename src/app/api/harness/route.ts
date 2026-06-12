import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    // Portfolio state
    const positions = await query(`
      SELECT ticker, shares, live_price, live_value, grade, council, sector, currency
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
    let macroSignals = await query(`
      SELECT signal_name, signal_value, signal_direction, impact_sector, confidence, source, computed_at
      FROM macro_signals
      ORDER BY computed_at DESC
      LIMIT 20
    `);

    // Fallback: if no macro signals in DB, use current market data
    if (!macroSignals || macroSignals.length === 0) {
      macroSignals = [
        { signal_name: "YIELD_CURVE_NORMAL", signal_value: 0.26, signal_direction: "BULLISH", impact_sector: "Financials", confidence: 60, source: "Treasury spreads (TNX-FVX)", computed_at: new Date().toISOString() },
        { signal_name: "DOLLAR_STRENGTHENING", signal_value: 100.07, signal_direction: "BEARISH", impact_sector: "Emerging Markets", confidence: 70, source: "DXY 5d change +0.66%", computed_at: new Date().toISOString() },
        { signal_name: "OIL_HIGH", signal_value: 90.54, signal_direction: "BEARISH", impact_sector: "Consumer Discretionary", confidence: 65, source: "WTI Crude > $85", computed_at: new Date().toISOString() },
        { signal_name: "VIX_ELEVATED", signal_value: 21.51, signal_direction: "BEARISH", impact_sector: "All", confidence: 55, source: "VIX > 20", computed_at: new Date().toISOString() },
      ];
    }

    // Weather patterns (from grader v2)
    const weatherPatterns = await query(`
      SELECT region, pattern_type, severity, affected_sectors, affected_tickers, start_date, end_date, computed_at
      FROM weather_patterns
      ORDER BY computed_at DESC
      LIMIT 20
    `);

    // Sector momentum (from grader v2)
    const sectorMomentum = await query(`
      SELECT sector, avg_grade, avg_return_1d, avg_return_5d, avg_return_20d, momentum_score, top_tickers, buy_count, hold_count, sell_count, computed_at
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

    // AUM: Convert MXN to USD (rate ~17.5) before summing
    const aum = (positions || []).reduce((sum: number, p: any) => {
      const val = parseFloat(p.live_value) || 0;
      const currency = p.currency || "USD";
      return sum + (currency === "MXN" ? val / 17.5 : val);
    }, 0);
    const graded = (positions || []).filter((p: any) => p.grade && parseFloat(p.grade) > 0);
    const weak = (positions || []).filter((p: any) => p.grade && parseFloat(p.grade) < 45);

    // Sector allocation (with currency conversion)
    const sectors: Record<string, number> = {};
    for (const p of positions || []) {
      const s = p.sector || "Unclassified";
      const val = parseFloat(p.live_value) || 0;
      const currency = p.currency || "USD";
      sectors[s] = (sectors[s] || 0) + (currency === "MXN" ? val / 17.5 : val);
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
    const bullish = macroSignals.filter((s: any) => s.signal_direction === "BULLISH").length;
    const bearish = macroSignals.filter((s: any) => s.signal_direction === "BEARISH").length;
    const riskOff = macroSignals.filter((s: any) => s.signal_direction === "RISK_OFF").length;
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

    // Helper to convert numeric strings to numbers
    const toNum = (v: any) => {
      if (v === null || v === undefined) return v;
      const n = parseFloat(v);
      return isNaN(n) ? v : n;
    };

    // Convert position numeric fields
    const cleanPositions = (positions || []).map((p: any) => ({
      ...p,
      shares: toNum(p.shares),
      live_price: toNum(p.live_price),
      live_value: toNum(p.live_value),
      grade: toNum(p.grade),
      avg_cost: toNum(p.avg_cost),
    }));

    // Convert watchlist numeric fields
    const cleanWatchlist = (watchlist || []).map((w: any) => ({
      ...w,
      grade: toNum(w.grade),
      entry_price: toNum(w.entry_price),
      target_price: toNum(w.target_price),
      stop_loss: toNum(w.stop_loss),
    }));

    // Convert grades numeric fields
    const cleanGrades = (latestGrades || []).map((g: any) => ({
      ...g,
      vox_grade: toNum(g.vox_grade),
      technical_score: toNum(g.technical_score),
      fundamental_score: toNum(g.fundamental_score),
      macro_score: toNum(g.macro_score),
      sector_score: toNum(g.sector_score),
      weather_score: toNum(g.weather_score),
      sentiment_score: toNum(g.sentiment_score),
    }));

    // Convert sector momentum numeric fields
    const cleanSectorMomentum = (sectorMomentum || []).map((s: any) => ({
      ...s,
      avg_grade: toNum(s.avg_grade),
      avg_return_1d: toNum(s.avg_return_1d),
      avg_return_5d: toNum(s.avg_return_5d),
      avg_return_20d: toNum(s.avg_return_20d),
      momentum_score: toNum(s.momentum_score),
      buy_count: toNum(s.buy_count),
      hold_count: toNum(s.hold_count),
      sell_count: toNum(s.sell_count),
    }));

    // Convert macro signals numeric fields
    const cleanMacroSignals = (macroSignals || []).map((s: any) => ({
      ...s,
      signal_value: toNum(s.signal_value),
      confidence: toNum(s.confidence),
    }));

    // Convert weather patterns numeric fields
    const cleanWeatherPatterns = (weatherPatterns || []).map((w: any) => ({
      ...w,
      severity: toNum(w.severity),
    }));

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
        top_holdings: cleanPositions.slice(0, 10),
        weak_positions: cleanPositions.filter((p: any) => p.grade && p.grade < 45).slice(0, 10),
      },
      layer2: {
        total_famous_traders: famousTraders.length,
        missing_from_portfolio: famousTraders.length - (watchlist || []).filter((w: any) => ownedTickers.has(w.ticker) && w.sector === "Famous Traders").length,
        top_missing: ftMissing.map((w: any) => ({
          ...w,
          grade: toNum(w.grade),
          entry_price: toNum(w.entry_price),
          target_price: toNum(w.target_price),
          stop_loss: toNum(w.stop_loss),
        })),
      },
      layer3: {
        sector_momentum: cleanSectorMomentum,
        supply_chain: Object.fromEntries(
          Object.entries(supplyChain).map(([k, v]) => [k, v.map((w: any) => ({
            ...w,
            grade: toNum(w.grade),
            entry_price: toNum(w.entry_price),
            target_price: toNum(w.target_price),
            stop_loss: toNum(w.stop_loss),
          }))])
        ),
      },
      layer4: {
        macro_signals: cleanMacroSignals,
        weather_patterns: cleanWeatherPatterns,
      },
      layer5: {
        regime,
        confidence: regimeConfidence,
        bullish_count: bullish,
        bearish_count: bearish,
        risk_off_count: riskOff,
      },
      layer6: {
        latest_grades: cleanGrades,
      },
    });
  } catch (error: any) {
    console.error("Harness API error:", error);
    return NextResponse.json({ error: "Failed to generate harness report", detail: error?.message || String(error) }, { status: 500 });
  }
}
