import { PageShell } from "@/components/vox-nav";
import { VoxBadge, VoxError, VoxKpi, VoxLoading } from "@/components/vox";
import { query } from "@/lib/db";
import { cn } from "@/lib/utils";
import { typography } from "@/lib/design-system";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

interface TradeSignal {
  id: number;
  ticker: string;
  signal_type: string;
  composite_score: number;
  technical_score: number;
  fundamental_score: number;
  macro_score: number;
  sector_score: number;
  weather_score: number;
  sentiment_score: number;
  rsi: number;
  grade: number;
  target_price: number;
  stop_price: number;
  rationale: string;
  created_at: string;
}

function n(v: any): number {
  if (v == null) return 0;
  if (typeof v === "number") return v;
  const p = parseFloat(v);
  return isNaN(p) ? 0 : p;
}

async function getSignals(): Promise<TradeSignal[]> {
  try {
    const rows = await query(`
      SELECT id, ticker, signal_type, composite_score,
             technical_score, fundamental_score, macro_score,
             sector_score, weather_score, sentiment_score,
             rsi, grade, target_price, stop_price, rationale,
             created_at
      FROM trade_signals
      ORDER BY created_at DESC NULLS LAST, composite_score DESC
      LIMIT 150
    `);
    return (rows || []).map((row: any) => ({
      ...row,
      composite_score: n(row.composite_score),
      technical_score: n(row.technical_score),
      fundamental_score: n(row.fundamental_score),
      macro_score: n(row.macro_score),
      sector_score: n(row.sector_score),
      weather_score: n(row.weather_score),
      sentiment_score: n(row.sentiment_score),
      rsi: n(row.rsi),
      grade: n(row.grade),
      target_price: n(row.target_price),
      stop_price: n(row.stop_price),
    }));
  } catch (e) {
    console.error(e);
    return [];
  }
}

function typeVariant(t: string) {
  const x = (t || "").toUpperCase();
  if (x === "BUY" || x === "ADD") return "profit" as const;
  if (x === "SELL") return "loss" as const;
  if (x === "TRIM") return "warning" as const;
  return "info" as const;
}

async function SignalsBody() {
  const signals = await getSignals();
  const buys = signals.filter((s) =>
    ["BUY", "ADD"].includes((s.signal_type || "").toUpperCase())
  ).length;
  const sells = signals.filter((s) =>
    ["SELL", "TRIM"].includes((s.signal_type || "").toUpperCase())
  ).length;

  if (!signals.length) {
    return (
      <div className="vox-surface p-8 text-center text-sm text-muted-foreground">
        No trade_signals rows yet — VOX still uses grades + brain for decisions.
        Signals are optional confirmation, not auto-execution.
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <VoxKpi label="Signals" value={signals.length} />
        <VoxKpi label="Buy/Add" value={buys} />
        <VoxKpi label="Sell/Trim" value={sells} />
        <VoxKpi
          label="Use"
          value="Confirm"
          sub="never auto-execute"
        />
      </div>

      <div className="vox-surface overflow-x-auto">
        <table className="vox-table w-full min-w-[800px]">
          <thead>
            <tr>
              <th className="text-left px-4 py-3">Ticker</th>
              <th className="text-left px-4 py-3">Type</th>
              <th className="text-right px-4 py-3">Score</th>
              <th className="text-right px-4 py-3">Grade</th>
              <th className="text-right px-4 py-3">T/F/M</th>
              <th className="text-left px-4 py-3">Rationale</th>
              <th className="text-left px-4 py-3">When</th>
            </tr>
          </thead>
          <tbody>
            {signals.map((s) => (
              <tr key={s.id || `${s.ticker}-${s.created_at}`}>
                <td className="px-4 py-2.5 font-mono font-semibold">
                  {s.ticker}
                </td>
                <td className="px-4 py-2.5">
                  <VoxBadge variant={typeVariant(s.signal_type)}>
                    {s.signal_type || "—"}
                  </VoxBadge>
                </td>
                <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                  {s.composite_score?.toFixed?.(1) ?? s.composite_score}
                </td>
                <td className="px-4 py-2.5 text-right">
                  {s.grade ? (
                    <VoxBadge grade={s.grade}>{s.grade}</VoxBadge>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-xs text-muted-foreground tabular-nums">
                  {Math.round(s.technical_score)}/
                  {Math.round(s.fundamental_score)}/
                  {Math.round(s.macro_score)}
                </td>
                <td className="px-4 py-2.5 text-xs text-muted-foreground max-w-[280px] truncate">
                  {s.rationale || "—"}
                </td>
                <td className="px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                  {s.created_at
                    ? new Date(s.created_at).toLocaleString()
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Signals compound with grades + Portfolio Brain — they do not override the
        balanced mandate.
      </p>
    </>
  );
}

export default function SignalsPage() {
  return (
    <PageShell
      title="Signals"
      subtitle="Confirmation layer · not a day-trade feed"
    >
      <Suspense fallback={<VoxLoading text="Loading signals…" />}>
        <SignalsBody />
      </Suspense>
    </PageShell>
  );
}
