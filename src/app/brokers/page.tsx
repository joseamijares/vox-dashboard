"use client";

import { useEffect, useMemo, useState } from "react";
import { PageShell } from "@/components/vox-nav";
import { VoxBadge, VoxError, VoxKpi, VoxLoading } from "@/components/vox";
import { typography } from "@/lib/design-system";
import { fmtCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

interface BrokerRow {
  broker: string;
  value: number;
  position_count: number;
  last_updated?: string;
  sync_age_days?: number;
}

export default function BrokersPage() {
  const [brokers, setBrokers] = useState<BrokerRow[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const [bRes, pRes] = await Promise.all([
        fetch("/api/brokers"),
        fetch("/api/positions"),
      ]);
      if (!bRes.ok) throw new Error("Failed to load brokers");
      const bJson = await bRes.json();
      const pJson = pRes.ok ? await pRes.json() : { positions: [] };
      setBrokers(bJson.brokers || []);
      setPositions(pJson.positions || []);
    } catch (e: any) {
      setError(e.message || "Failed to load brokers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const total = useMemo(
    () => brokers.reduce((s, b) => s + (b.value || 0), 0),
    [brokers]
  );
  const max = Math.max(...brokers.map((b) => b.value || 0), 1);
  const stale = brokers.filter((b) => (b.sync_age_days || 0) > 7);

  if (loading) {
    return (
      <PageShell title="Brokers" subtitle="Multi-broker health">
        <VoxLoading text="Loading brokers…" />
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell title="Brokers">
        <VoxError message={error} onRetry={load} />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Brokers"
      subtitle="Source of truth · multi-broker ownership is never a sell reason"
      actions={
        <button
          onClick={load}
          className="rounded-full px-3 py-1.5 text-xs bg-secondary text-secondary-foreground"
        >
          Refresh
        </button>
      }
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <VoxKpi label="Broker book" value={fmtCurrency(total)} />
        <VoxKpi label="Brokers" value={brokers.length} />
        <VoxKpi label="Positions" value={positions.length} />
        <VoxKpi
          label="Stale (>7d)"
          value={stale.length}
          sub={stale.length ? stale.map((b) => b.broker).join(", ") : "none"}
          subVariant={stale.length ? "warning" : "profit"}
        />
      </div>

      <div className="vox-surface p-4 mb-6">
        <div className={cn(typography.label, "mb-4")}>Allocation</div>
        <div className="space-y-3">
          {brokers.map((b) => {
            const age = b.sync_age_days;
            const fresh =
              age == null ? "unknown" : age <= 2 ? "fresh" : age <= 7 ? "ok" : "stale";
            return (
              <div key={b.broker}>
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{b.broker}</span>
                    <VoxBadge
                      variant="status"
                      label={fresh === "fresh" ? "fresh" : fresh === "stale" ? "stale" : "active"}
                    >
                      {fresh}
                    </VoxBadge>
                  </div>
                  <div className="font-mono tabular-nums text-muted-foreground text-xs">
                    {fmtCurrency(b.value)} · {b.position_count} pos
                    {age != null ? ` · ${age.toFixed(1)}d` : ""}
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-grade-buy/80"
                    style={{
                      width: `${Math.max(3, ((b.value || 0) / max) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="vox-surface overflow-x-auto">
        <table className="vox-table w-full min-w-[520px]">
          <thead>
            <tr>
              <th className="text-left px-4 py-3">Broker</th>
              <th className="text-right px-4 py-3">Value</th>
              <th className="text-right px-4 py-3">W%</th>
              <th className="text-right px-4 py-3">#</th>
              <th className="text-right px-4 py-3">Sync age</th>
              <th className="text-left px-4 py-3">Last sync</th>
            </tr>
          </thead>
          <tbody>
            {brokers.map((b) => (
              <tr key={b.broker}>
                <td className="px-4 py-2.5 font-medium">{b.broker}</td>
                <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                  {fmtCurrency(b.value)}
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-muted-foreground tabular-nums">
                  {total > 0 ? ((b.value / total) * 100).toFixed(1) : "0"}%
                </td>
                <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                  {b.position_count}
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-xs tabular-nums">
                  {b.sync_age_days != null
                    ? `${b.sync_age_days.toFixed(1)}d`
                    : "—"}
                </td>
                <td className="px-4 py-2.5 text-xs text-muted-foreground">
                  {b.last_updated
                    ? new Date(b.last_updated).toLocaleString()
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 vox-surface p-4">
        <div className={cn(typography.label, "mb-2")}>Manual refresh path</div>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
          <li>GBM Main / USA → Excel export to Hermes</li>
          <li>Schwab → Individual Positions CSV</li>
          <li>IBKR → screenshot or CSV</li>
          <li>eToro / Binance / Bitso → API when credentials healthy</li>
        </ul>
      </div>
    </PageShell>
  );
}
