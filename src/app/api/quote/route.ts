import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Live quote for a ticker.
 * Prefer DB (price_asof fresh) else note stale — Hermes refresh cron is source of truth.
 * Optional: ?live=1 attempts nothing external from Next (Railway has no Yahoo outbound guarantee);
 * always returns DB-enriched fields.
 */
export async function GET(req: NextRequest) {
  try {
    const ticker = (req.nextUrl.searchParams.get("ticker") || "")
      .trim()
      .toUpperCase();
    if (!ticker || ticker.length > 12) {
      return NextResponse.json({ error: "ticker required" }, { status: 400 });
    }

    const rows = await query(
      `
      SELECT
        p.ticker,
        COALESCE(p.live_price, 0) AS live_price,
        p.prev_close,
        p.day_chg_pct,
        p.price_source,
        p.price_asof,
        p.updated_at,
        CASE
          WHEN p.price_asof IS NULL THEN true
          WHEN p.price_asof < NOW() - INTERVAL '45 minutes' THEN true
          ELSE false
        END AS price_stale,
        EXTRACT(EPOCH FROM (NOW() - p.price_asof)) / 60.0 AS price_age_min,
        (
          SELECT close FROM price_history ph
          WHERE UPPER(ph.ticker) = $1
          ORDER BY date DESC LIMIT 1
        ) AS last_history_close,
        (
          SELECT date FROM price_history ph
          WHERE UPPER(ph.ticker) = $1
          ORDER BY date DESC LIMIT 1
        ) AS last_history_date
      FROM positions p
      WHERE UPPER(p.ticker) = $1
      LIMIT 1
      `,
      [ticker]
    );

    // also allow non-held: history only
    if (!rows.length) {
      const hist = await query(
        `
        SELECT close AS last_history_close, date AS last_history_date
        FROM price_history
        WHERE UPPER(ticker) = $1
        ORDER BY date DESC LIMIT 2
        `,
        [ticker]
      );
      if (!hist.length) {
        return NextResponse.json(
          { error: "unknown ticker", ticker },
          { status: 404 }
        );
      }
      const last = hist[0];
      const prev = hist[1];
      const live = Number(last.last_history_close || 0);
      const prevC = prev ? Number(prev.last_history_close || 0) : null;
      const day =
        prevC && prevC > 0 ? ((live - prevC) / prevC) * 100 : null;
      return NextResponse.json({
        ticker,
        live_price: live,
        prev_close: prevC,
        day_chg_pct: day,
        price_source: "price_history",
        price_asof: last.last_history_date,
        price_stale: true,
        note: "not in positions — history only; run pricing refresh for live",
      });
    }

    const r = rows[0];
    return NextResponse.json({
      ticker: r.ticker,
      live_price: Number(r.live_price || 0),
      prev_close: r.prev_close != null ? Number(r.prev_close) : null,
      day_chg_pct: r.day_chg_pct != null ? Number(r.day_chg_pct) : null,
      price_source: r.price_source || null,
      price_asof: r.price_asof,
      price_stale: !!r.price_stale,
      price_age_min:
        r.price_age_min != null ? Number(r.price_age_min) : null,
      last_history_close:
        r.last_history_close != null ? Number(r.last_history_close) : null,
      last_history_date: r.last_history_date,
    });
  } catch (e: any) {
    console.error("quote error", e);
    return NextResponse.json(
      { error: e?.message || "quote failed" },
      { status: 500 }
    );
  }
}
