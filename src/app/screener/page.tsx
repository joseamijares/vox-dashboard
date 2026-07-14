"use client";

import { useEffect, useMemo, useState } from "react";
import { PageShell } from "@/components/vox-nav";
import { VoxBadge, VoxError, VoxKpi, VoxLoading } from "@/components/vox";
import { typography } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

interface GradeRow {
  ticker: string;
  name?: string;
  sector?: string;
  vox_grade: number;
  technical_score?: number;
  fundamental_score?: number;
  macro_score?: number;
  sector_score?: number;
  weather_score?: number;
  sentiment_score?: number;
  in_portfolio?: boolean;
  portfolio_value?: number;
  computed_at?: string;
}

interface SectorLeader {
  sector: string;
  ticker: string;
  rank: number;
  change_5d_pct: number;
  momentum_score: number;
}

type Tab = "universe" | "portfolio" | "leaders" | "sectors";
type Band = "all" | "core" | "buy" | "hold" | "trim" | "sell";

export default function ScreenerPage() {
  const [tab, setTab] = useState<Tab>("universe");
  const [filter, setFilter] = useState("");
  const [band, setBand] = useState<Band>("all");
  const [sector, setSector] = useState("all");
  const [grades, setGrades] = useState<GradeRow[]>([]);
  const [leaders, setLeaders] = useState<SectorLeader[]>([]);
  const [sectors, setSectors] = useState<any[]>([]);
  const [distribution, setDistribution] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const [gRes, lRes, sRes, dRes] = await Promise.all([
        fetch("/api/sp500?type=grades"),
        fetch("/api/sp500?type=leaders"),
        fetch("/api/sp500?type=sectors"),
        fetch("/api/sp500?type=distribution"),
      ]);
      if (!gRes.ok) throw new Error("Failed to load grades");
      const gJson = await gRes.json();
      const lJson = lRes.ok ? await lRes.json() : { leaders: [] };
      const sJson = sRes.ok ? await sRes.json() : { sectors: [] };
      const dJson = dRes.ok ? await dRes.json() : { distribution: [] };
      setGrades(gJson.grades || []);
      setLeaders(lJson.leaders || []);
      setSectors(sJson.sectors || []);
      setDistribution(dJson.distribution || []);
    } catch (e: any) {
      setError(e.message || "Failed to load screener");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const sectorOptions = useMemo(() => {
    const set = new Set<string>();
    grades.forEach((g) => g.sector && set.add(g.sector));
    return Array.from(set).sort();
  }, [grades]);

  const filtered = useMemo(() => {
    const q = filter.toLowerCase().trim();
    return grades.filter((g) => {
      const grade = g.vox_grade || 0;
      const matchQ =
        !q ||
        g.ticker.toLowerCase().includes(q) ||
        (g.name || "").toLowerCase().includes(q) ||
        (g.sector || "").toLowerCase().includes(q);
      const matchS = sector === "all" || g.sector === sector;
      const matchB =
        band === "all" ||
        (band === "core" && grade >= 70) ||
        (band === "buy" && grade >= 60 && grade < 70) ||
        (band === "hold" && grade >= 50 && grade < 60) ||
        (band === "trim" && grade >= 40 && grade < 50) ||
        (band === "sell" && grade > 0 && grade < 40);
      const matchTab =
        tab !== "portfolio" || g.in_portfolio || (g.portfolio_value || 0) > 0;
      return matchQ && matchS && matchB && matchTab;
    });
  }, [grades, filter, sector, band, tab]);

  const groupedLeaders = useMemo(() => {
    return leaders.reduce((acc, leader) => {
      if (!acc[leader.sector]) acc[leader.sector] = [];
      acc[leader.sector].push(leader);
      return acc;
    }, {} as Record<string, SectorLeader[]>);
  }, [leaders]);

  const heldCount = grades.filter(
    (g) => g.in_portfolio || (g.portfolio_value || 0) > 0
  ).length;
  const maxSectorVal = Math.max(
    ...sectors.map((s) => Number(s.portfolio_value || 0)),
    1
  );

  if (loading) {
    return (
      <PageShell title="Screener" subtitle="Universe · sectors · layers">
        <VoxLoading text="Loading screener…" />
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell title="Screener">
        <VoxError message={error} onRetry={load} />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Screener"
      subtitle={`${grades.length} graded · ${heldCount} in book · not day-trading`}
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <VoxKpi label="Universe graded" value={grades.length} />
        <VoxKpi label="In portfolio" value={heldCount} />
        <VoxKpi label="Sectors" value={sectorOptions.length || sectors.length} />
        <VoxKpi
          label="Leaders"
          value={leaders.length}
          sub="sector momentum"
        />
      </div>

      {distribution.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-6">
          {distribution.map((d) => (
            <div key={d.bucket} className="vox-surface p-3">
              <div className={typography.label}>{d.bucket}</div>
              <div className="vox-metric text-xl font-semibold mt-1">
                {d.count}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {(
          [
            ["universe", "Universe"],
            ["portfolio", "In book"],
            ["leaders", "Sector leaders"],
            ["sectors", "Sector map"],
          ] as [Tab, string][]
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              tab === id
                ? "bg-secondary text-foreground"
                : "bg-muted/40 text-muted-foreground hover:text-foreground"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {(tab === "universe" || tab === "portfolio") && (
        <>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filter ticker, name, sector…"
                className="w-full h-10 rounded-lg bg-card pl-9 pr-3 text-sm border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="h-10 rounded-lg bg-card px-3 text-sm border border-border"
            >
              <option value="all">All sectors</option>
              {sectorOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              value={band}
              onChange={(e) => setBand(e.target.value as Band)}
              className="h-10 rounded-lg bg-card px-3 text-sm border border-border"
            >
              <option value="all">All grades</option>
              <option value="core">Core 70+</option>
              <option value="buy">Buy 60–69</option>
              <option value="hold">Hold 50–59</option>
              <option value="trim">Trim 40–49</option>
              <option value="sell">Sell &lt;40</option>
            </select>
          </div>

          <div className="vox-surface overflow-x-auto">
            <table className="vox-table w-full min-w-[760px]">
              <thead>
                <tr>
                  <th className="text-left px-4 py-3">Ticker</th>
                  <th className="text-left px-4 py-3">Sector</th>
                  <th className="text-right px-4 py-3">Grade</th>
                  <th className="text-right px-4 py-3">T</th>
                  <th className="text-right px-4 py-3">F</th>
                  <th className="text-right px-4 py-3">M</th>
                  <th className="text-right px-4 py-3">Se</th>
                  <th className="text-left px-4 py-3">Book</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 200).map((g) => (
                  <tr key={g.ticker}>
                    <td className="px-4 py-2.5">
                      <div className="font-mono font-semibold">{g.ticker}</div>
                      <div className="text-[11px] text-muted-foreground truncate max-w-[180px]">
                        {g.name}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">
                      {g.sector || "—"}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <VoxBadge grade={g.vox_grade}>{g.vox_grade}</VoxBadge>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-xs tabular-nums text-muted-foreground">
                      {Math.round(g.technical_score || 0)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-xs tabular-nums text-muted-foreground">
                      {Math.round(g.fundamental_score || 0)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-xs tabular-nums text-muted-foreground">
                      {Math.round(g.macro_score || 0)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-xs tabular-nums text-muted-foreground">
                      {Math.round(g.sentiment_score || 0)}
                    </td>
                    <td className="px-4 py-2.5 text-xs">
                      {g.in_portfolio || (g.portfolio_value || 0) > 0 ? (
                        <span className="text-grade-core">Held</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
                {!filtered.length && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-10 text-center text-sm text-muted-foreground"
                    >
                      No rows match filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Showing {Math.min(filtered.length, 200)} of {filtered.length} ·
            dense scan for ideas, not auto-trade
          </p>
        </>
      )}

      {tab === "leaders" && (
        <div className="space-y-6">
          {Object.entries(groupedLeaders).map(([sec, rows]) => (
            <div key={sec} className="vox-surface p-4">
              <div className={cn(typography.label, "mb-3")}>{sec}</div>
              <div className="grid sm:grid-cols-3 gap-3">
                {rows.map((l) => (
                  <div
                    key={`${l.sector}-${l.ticker}`}
                    className="rounded-lg bg-muted/30 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        #{l.rank}
                      </span>
                      <span className="font-mono font-semibold">{l.ticker}</span>
                    </div>
                    <div
                      className={cn(
                        "mt-2 text-lg font-mono font-semibold tabular-nums",
                        (l.change_5d_pct || 0) >= 0 ? "text-profit" : "text-loss"
                      )}
                    >
                      {(l.change_5d_pct || 0) >= 0 ? "+" : ""}
                      {(l.change_5d_pct || 0).toFixed(2)}%
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Momentum {Number(l.momentum_score || 0).toFixed(1)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {!leaders.length && (
            <p className="text-sm text-muted-foreground">
              No sector leaders available yet
            </p>
          )}
        </div>
      )}

      {tab === "sectors" && (
        <div className="vox-surface p-4">
          <div className={cn(typography.label, "mb-4")}>
            Portfolio sector map
          </div>
          <div className="space-y-3">
            {sectors.map((s) => {
              const val = Number(s.portfolio_value || 0);
              return (
                <div key={s.sector}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium">{s.sector}</span>
                    <span className="font-mono text-muted-foreground tabular-nums">
                      ${val.toLocaleString()} · n={s.portfolio_count} · avg g
                      {s.portfolio_avg_grade ?? "—"}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-grade-buy/80"
                      style={{
                        width: `${Math.max(3, (val / maxSectorVal) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
            {!sectors.length && (
              <p className="text-sm text-muted-foreground">No sector data</p>
            )}
          </div>
        </div>
      )}
    </PageShell>
  );
}
