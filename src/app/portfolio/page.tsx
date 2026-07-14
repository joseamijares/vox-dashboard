"use client";

import { PageShell } from "@/components/vox-nav";
import { VoxBadge, VoxKpi, VoxLoading } from "@/components/vox";
import { typography } from "@/lib/design-system";
import {
  getPositions,
  calculateTotalValue,
  calculateBrokerBreakdown,
} from "@/lib/data";
import { useState, useMemo, useEffect } from "react";
import { Search } from "lucide-react";
import { fmtCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

type GradeFilter = "all" | "buy" | "hold" | "trim" | "sell";
type SortKey = "value" | "grade" | "research" | "ticker";

export default function PortfolioPage() {
  const [allPositions, setAllPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [brokerFilter, setBrokerFilter] = useState("all");
  const [gradeFilter, setGradeFilter] = useState<GradeFilter>("all");
  const [sortBy, setSortBy] = useState<SortKey>("value");

  useEffect(() => {
    (async () => {
      try {
        const data = await getPositions();
        setAllPositions(data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalValue = useMemo(
    () => (allPositions.length ? calculateTotalValue(allPositions) : 0),
    [allPositions]
  );

  const avgGrade = useMemo(() => {
    const g = allPositions.filter((p) => (p.grade || 0) > 0);
    if (!g.length) return 0;
    return Math.round(g.reduce((s, p) => s + (p.grade || 0), 0) / g.length);
  }, [allPositions]);

  const avgResearch = useMemo(() => {
    const g = allPositions.filter((p) => p.research_score != null);
    if (!g.length) return 0;
    return (
      Math.round(
        (g.reduce((s, p) => s + (p.research_score || 0), 0) / g.length) * 10
      ) / 10
    );
  }, [allPositions]);

  const brokers = useMemo(() => {
    const set = new Set<string>();
    allPositions.forEach((p) => {
      (p.brokers || (p.broker ? [p.broker] : [])).forEach((b: string) =>
        set.add(b)
      );
    });
    return Array.from(set).sort();
  }, [allPositions]);

  const brokerBreakdown = useMemo(() => {
    if (!allPositions.length) return [];
    return Object.entries(calculateBrokerBreakdown(allPositions))
      .map(([broker, value]) => ({ broker, value: value as number }))
      .sort((a, b) => b.value - a.value);
  }, [allPositions]);

  const filtered = useMemo(() => {
    let result = allPositions.filter((p) => {
      const q = search.toLowerCase();
      const matchQ =
        !q ||
        p.ticker?.toLowerCase().includes(q) ||
        (p.name || "").toLowerCase().includes(q);
      const brs = p.brokers || (p.broker ? [p.broker] : []);
      const matchB = brokerFilter === "all" || brs.includes(brokerFilter);
      const g = p.grade || 0;
      const matchG =
        gradeFilter === "all" ||
        (gradeFilter === "buy" && g >= 60) ||
        (gradeFilter === "hold" && g >= 50 && g < 60) ||
        (gradeFilter === "trim" && g >= 40 && g < 50) ||
        (gradeFilter === "sell" && g > 0 && g < 40);
      return matchQ && matchB && matchG;
    });

    result = [...result].sort((a, b) => {
      if (sortBy === "ticker")
        return (a.ticker || "").localeCompare(b.ticker || "");
      if (sortBy === "grade") return (b.grade || 0) - (a.grade || 0);
      if (sortBy === "research")
        return (b.research_score || 0) - (a.research_score || 0);
      return (
        (b.value || b.live_value || b.value_usd || 0) -
        (a.value || a.live_value || a.value_usd || 0)
      );
    });
    return result;
  }, [allPositions, search, brokerFilter, gradeFilter, sortBy]);

  if (loading) {
    return (
      <PageShell title="Positions" subtitle="Full multi-broker book">
        <VoxLoading text="Loading portfolio…" />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Positions"
      subtitle="Full book · grades · research scores · multi-broker"
    >
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
        <VoxKpi label="AUM" value={fmtCurrency(totalValue)} />
        <VoxKpi label="Positions" value={allPositions.length} />
        <VoxKpi label="Avg grade" value={avgGrade || "—"} />
        <VoxKpi
          label="Avg research"
          value={avgResearch || "—"}
          sub="T/F/M/S composite"
        />
      </div>

      {/* Broker strip */}
      {brokerBreakdown.length > 0 && (
        <div className="vox-surface p-4 mb-6">
          <div className={cn(typography.label, "mb-3")}>Brokers</div>
          <div className="flex flex-wrap gap-2">
            {brokerBreakdown.map((b) => (
              <button
                key={b.broker}
                onClick={() =>
                  setBrokerFilter(
                    brokerFilter === b.broker ? "all" : b.broker
                  )
                }
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  brokerFilter === b.broker
                    ? "bg-secondary text-foreground"
                    : "bg-muted/50 text-muted-foreground hover:text-foreground"
                )}
              >
                {b.broker}{" "}
                <span className="font-mono tabular-nums opacity-80">
                  {fmtCurrency(b.value)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ticker…"
            className="w-full h-10 rounded-lg bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <select
          value={gradeFilter}
          onChange={(e) => setGradeFilter(e.target.value as GradeFilter)}
          className="h-10 rounded-lg bg-card px-3 text-sm border border-border text-foreground"
        >
          <option value="all">All grades</option>
          <option value="buy">Buy 60+</option>
          <option value="hold">Hold 50–59</option>
          <option value="trim">Trim 40–49</option>
          <option value="sell">Sell &lt;40</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortKey)}
          className="h-10 rounded-lg bg-card px-3 text-sm border border-border text-foreground"
        >
          <option value="value">Sort: value</option>
          <option value="grade">Sort: grade</option>
          <option value="research">Sort: research</option>
          <option value="ticker">Sort: ticker</option>
        </select>
      </div>

      {/* Table */}
      <div className="vox-surface overflow-x-auto">
        <table className="vox-table w-full min-w-[720px]">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-3">Ticker</th>
              <th className="text-right px-4 py-3">Value</th>
              <th className="text-right px-4 py-3">W%</th>
              <th className="text-right px-4 py-3">Grade</th>
              <th className="text-right px-4 py-3">Research</th>
              <th className="text-left px-4 py-3">Layers</th>
              <th className="text-left px-4 py-3">Council</th>
              <th className="text-left px-4 py-3">Brokers</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const val = p.value || p.live_value || p.value_usd || 0;
              const w =
                totalValue > 0 ? ((val / totalValue) * 100).toFixed(2) : "0";
              const layers = p.layer_scores || {};
              return (
                <tr key={p.ticker + (p.brokers || []).join()}>
                  <td className="px-4 py-3 font-semibold font-mono tracking-tight">
                    {p.ticker}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums">
                    {fmtCurrency(val)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-muted-foreground">
                    {w}%
                  </td>
                  <td className="px-4 py-3 text-right">
                    {p.grade ? (
                      <VoxBadge grade={p.grade} variant="grade">
                        {p.grade}
                      </VoxBadge>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums">
                    {p.research_score != null ? (
                      <span className="text-foreground font-medium">
                        {p.research_score}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[11px] font-mono text-muted-foreground tabular-nums">
                    {layers.technical != null
                      ? `T${Math.round(layers.technical)} F${Math.round(layers.fundamental || 0)} M${Math.round(layers.macro || 0)} S${Math.round(layers.sentiment || 0)}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {p.council || p.action || "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {(p.brokers || [p.broker].filter(Boolean)).join(", ") ||
                      "—"}
                  </td>
                </tr>
              );
            })}
            {!filtered.length && (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-10 text-center text-muted-foreground text-sm"
                >
                  No positions match filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Showing {filtered.length} of {allPositions.length} · Multi-broker
        ownership is never a sell reason
      </p>
    </PageShell>
  );
}
