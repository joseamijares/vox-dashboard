"use client";

import { useState, useEffect, useMemo } from "react";
import { PageShell } from "@/components/vox-nav";
import { VoxKpi, VoxBadge, VoxLoading, VoxError } from "@/components/vox";
import { typography } from "@/lib/design-system";
import { fmtCurrency } from "@/lib/format";
import {
  calculateTotalValue,
  calculateBrokerBreakdown,
} from "@/lib/data";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export default function Dashboard() {
  const [positions, setPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [regime, setRegime] = useState({ regime: "—", confidence: 0 });

  useEffect(() => {
    async function load() {
      try {
        const [posRes, harnessRes] = await Promise.all([
          fetch("/api/positions"),
          fetch("/api/harness").catch(() => null),
        ]);
        if (!posRes.ok) throw new Error("Failed to load positions");
        const posJson = await posRes.json();
        setPositions(posJson.positions || []);
        if (harnessRes && harnessRes.ok) {
          const h = await harnessRes.json();
          const l5 = h.layer5 || {};
          setRegime({
            regime: l5.regime || "—",
            confidence: l5.confidence || 0,
          });
        }
      } catch {
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalValue = useMemo(
    () => (positions.length ? calculateTotalValue(positions) : 0),
    [positions]
  );

  const graded = positions.filter((p) => (p.grade || 0) > 0);
  const avgGrade = graded.length
    ? Math.round(graded.reduce((s, p) => s + p.grade, 0) / graded.length)
    : 0;
  const researched = positions.filter((p) => p.research_score != null);
  const avgResearch = researched.length
    ? Math.round(
        (researched.reduce((s, p) => s + p.research_score, 0) /
          researched.length) *
          10
      ) / 10
    : 0;

  const top = useMemo(
    () =>
      [...positions]
        .sort(
          (a, b) =>
            (b.value || b.live_value || b.value_usd || 0) -
            (a.value || a.live_value || a.value_usd || 0)
        )
        .slice(0, 8),
    [positions]
  );

  const weak = useMemo(
    () =>
      [...positions]
        .filter(
          (p) =>
            (p.grade || 0) > 0 &&
            (p.grade || 0) < 45 &&
            (p.value || p.live_value || p.value_usd || 0) >= 200
        )
        .sort((a, b) => (a.grade || 0) - (b.grade || 0))
        .slice(0, 6),
    [positions]
  );

  const leaders = useMemo(
    () =>
      [...positions]
        .filter((p) => p.research_score != null)
        .sort((a, b) => (b.research_score || 0) - (a.research_score || 0))
        .slice(0, 6),
    [positions]
  );

  const brokers = useMemo(() => {
    if (!positions.length) return [];
    return Object.entries(calculateBrokerBreakdown(positions))
      .map(([broker, value]) => ({ broker, value: value as number }))
      .sort((a, b) => b.value - a.value);
  }, [positions]);

  const maxBroker = brokers[0]?.value || 1;

  if (loading) {
    return (
      <PageShell title="Dashboard" subtitle="Portfolio intelligence">
        <VoxLoading text="Loading VOX…" />
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell title="Dashboard">
        <VoxError message={error} />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Dashboard"
      subtitle="Balanced book · research scores · not day-trading"
      actions={
        <Link
          href="/portfolio"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Full positions <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      }
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
        <VoxKpi label="AUM" value={fmtCurrency(totalValue)} />
        <VoxKpi label="Positions" value={positions.length} />
        <VoxKpi label="Avg grade" value={avgGrade || "—"} />
        <VoxKpi
          label="Avg research"
          value={avgResearch || "—"}
          sub={regime.regime !== "—" ? `Regime ${regime.regime}` : undefined}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        {/* Broker allocation */}
        <div className="vox-surface p-4 lg:p-5 lg:col-span-1">
          <div className={cn(typography.label, "mb-4")}>Broker allocation</div>
          <div className="space-y-3">
            {brokers.map((b) => (
              <div key={b.broker}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-foreground font-medium">{b.broker}</span>
                  <span className="font-mono tabular-nums text-muted-foreground">
                    {fmtCurrency(b.value)}
                  </span>
                </div>
                <div className="h-1 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-grade-buy/80"
                    style={{ width: `${Math.max(4, (b.value / maxBroker) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
            {!brokers.length && (
              <p className="text-sm text-muted-foreground">No broker data</p>
            )}
          </div>
        </div>

        {/* Research leaders */}
        <div className="vox-surface p-4 lg:p-5">
          <div className="flex items-center justify-between mb-4">
            <div className={typography.label}>Research leaders</div>
            <Link href="/grades" className="text-xs text-muted-foreground hover:text-foreground">
              Grades
            </Link>
          </div>
          <ul className="space-y-2.5">
            {leaders.map((p) => (
              <li key={p.ticker} className="flex items-center justify-between gap-2">
                <span className="font-mono font-semibold text-sm">{p.ticker}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-mono">
                    g{p.grade ?? "—"}
                  </span>
                  <VoxBadge grade={Math.round(p.research_score)} variant="grade">
                    {p.research_score}
                  </VoxBadge>
                </div>
              </li>
            ))}
            {!leaders.length && (
              <li className="text-sm text-muted-foreground">No research scores yet</li>
            )}
          </ul>
        </div>

        {/* Weak names */}
        <div className="vox-surface p-4 lg:p-5">
          <div className={cn(typography.label, "mb-4")}>Weak (≥$200)</div>
          <ul className="space-y-2.5">
            {weak.map((p) => (
              <li key={p.ticker} className="flex items-center justify-between gap-2">
                <span className="font-mono font-semibold text-sm">{p.ticker}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground tabular-nums">
                    {fmtCurrency(p.value || p.live_value || p.value_usd || 0)}
                  </span>
                  <VoxBadge grade={p.grade} variant="grade">
                    {p.grade}
                  </VoxBadge>
                </div>
              </li>
            ))}
            {!weak.length && (
              <li className="text-sm text-muted-foreground">None material</li>
            )}
          </ul>
        </div>
      </div>

      {/* Top holdings */}
      <div className="vox-surface overflow-x-auto">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className={typography.label}>Top holdings</div>
          <Link
            href="/portfolio"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            View all
          </Link>
        </div>
        <table className="vox-table w-full min-w-[560px]">
          <thead>
            <tr>
              <th className="text-left px-4 py-2">Ticker</th>
              <th className="text-right px-4 py-2">Value</th>
              <th className="text-right px-4 py-2">Grade</th>
              <th className="text-right px-4 py-2">Research</th>
              <th className="text-left px-4 py-2">Council</th>
            </tr>
          </thead>
          <tbody>
            {top.map((p) => {
              const val = p.value || p.live_value || p.value_usd || 0;
              return (
                <tr key={p.ticker}>
                  <td className="px-4 py-2.5 font-mono font-semibold text-sm">
                    {p.ticker}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums text-sm">
                    {fmtCurrency(val)}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {p.grade ? (
                      <VoxBadge grade={p.grade}>{p.grade}</VoxBadge>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums text-sm">
                    {p.research_score ?? "—"}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">
                    {p.council || "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
