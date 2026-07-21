import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const CRYPTO = new Set([
  "BTC", "ETH", "SOL", "XRP", "DOGE", "ADA", "BNB", "TRX", "HBAR", "AVAX",
  "DOT", "BONK", "PENGU", "VAULTA", "VANA", "MORPHO",
]);

/** Shells / junk — never fail pricing.ok on these (align with Ops Card). */
const JUNK_ASOF = new Set([
  "MIRROR_TOTAL",
  "CASH",
  "GBM O",
  "BI 270121",
  "TOTAL",
  "VAULTA",
  "KITE",
  "FF",
]);

const DUST_USD = 25;

function isPriceable(ticker: string, value: number): boolean {
  const t = String(ticker || "").toUpperCase();
  if (!t || JUNK_ASOF.has(t)) return false;
  if (t.includes(" ")) return false;
  if (value < DUST_USD) return false;
  return true;
}

/** Lightweight ops snapshot for dashboard home / API consumers */
export async function GET() {
  try {
    const positions = await query(`
      SELECT ticker,
             COALESCE(live_value_usd, live_value, 0) AS v,
             COALESCE(live_price, 0) AS live_price,
             day_chg_pct, price_asof, price_source, grade, sector
      FROM positions
      WHERE COALESCE(live_value_usd, live_value, 0) > 0
         OR COALESCE(shares, 0) > 0
    `);

    const aum = positions.reduce(
      (s: number, p: any) => s + Number(p.v || 0),
      0
    );
    let crypto = 0;
    let tech = 0;
    let energy = 0;
    let missingAsof = 0;
    const big: any[] = [];

    for (const p of positions) {
      const t = String(p.ticker || "").toUpperCase();
      const v = Number(p.v || 0);
      const w = aum > 0 ? (100 * v) / aum : 0;
      if (CRYPTO.has(t)) crypto += w;
      const sec = String(p.sector || "").toLowerCase();
      if (sec.includes("tech")) tech += w;
      if (sec.includes("energy")) energy += w;
      if (isPriceable(t, v) && !p.price_asof) missingAsof += 1;
      const d = p.day_chg_pct != null ? Number(p.day_chg_pct) : null;
      if (d != null && Math.abs(d) >= 8 && isPriceable(t, v)) {
        big.push({
          ticker: t,
          day_chg_pct: d,
          live_price: Number(p.live_price || 0),
          value: v,
        });
      }
    }
    big.sort((a, b) => Math.abs(b.day_chg_pct) - Math.abs(a.day_chg_pct));

    const actions: string[] = [];
    if (energy < 1) actions.push("STRUCTURE: add energy (XLE) — ~0% sleeve");
    if (crypto >= 10) actions.push(`TRIM crypto ~${crypto.toFixed(0)}%`);
    if (missingAsof > 5) actions.push(`Pricing: ${missingAsof} names missing asof`);
    if (big.filter((b) => b.day_chg_pct <= -8).length)
      actions.push("Review large down moves — no FOMO reverse");
    if (!actions.length) actions.push("No material action flagged");

    return NextResponse.json({
      asof: new Date().toISOString(),
      aum,
      positions: positions.length,
      weights: {
        tech: Math.round(tech * 10) / 10,
        energy: Math.round(energy * 10) / 10,
        crypto: Math.round(crypto * 10) / 10,
      },
      pricing: {
        missing_asof: missingAsof,
        ok: missingAsof <= 5,
      },
      big_moves: big.slice(0, 12),
      actions: actions.slice(0, 5),
      note: "Hygiene control tower — not auto-trade. Full card in Obsidian Daily-Ops-LATEST.md",
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: e?.message || "ops failed" },
      { status: 500 }
    );
  }
}
