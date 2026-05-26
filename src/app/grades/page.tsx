"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MobileHeader } from "@/components/mobile-header";
import { Sidebar } from "@/components/sidebar";
import { getPositions } from "@/lib/data";
import { useState, useMemo, useEffect } from "react";
import { Zap, ArrowUpDown, TrendingUp, TrendingDown, Loader2 } from "lucide-react";

type SortKey = "ticker" | "grade" | "value" | "pnl";
type SortDir = "asc" | "desc";
type FilterType = "all" | "strong" | "moderate" | "weak" | "ungraded";

export default function GradesPage() {
  const [positions, setPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("grade");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getPositions();
        setPositions(data);
      } catch (e) {
        console.error("Failed to load positions:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Positions already have grades merged from vox_data_validator.py
  const enriched = useMemo(() => {
    return positions.map((p: any) => ({
      ...p,
      grade: p.grade || 0,
    }));
  }, [positions]);

  const filtered = useMemo(() => {
    let result = [...enriched];
    
    if (filter === "strong") result = result.filter((p: any) => p.grade >= 70);
    if (filter === "moderate") result = result.filter((p: any) => p.grade >= 55 && p.grade < 70);
    if (filter === "weak") result = result.filter((p: any) => p.grade > 0 && p.grade < 55);
    if (filter === "ungraded") result = result.filter((p: any) => p.grade === 0);
    
    result.sort((a: any, b: any) => {
      let valA: number | string = a[sortKey];
      let valB: number | string = b[sortKey];
      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();
      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return result;
  }, [enriched, sortKey, sortDir, filter]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir(key === "ticker" ? "asc" : "desc");
    }
  };

  const SortHeader = ({ label, sortKey: key }: { label: string; sortKey: SortKey }) => (
    <th
      className="text-left p-3 font-medium text-muted-foreground cursor-pointer hover:text-foreground select-none"
      onClick={() => toggleSort(key)}
    >
      <div className="flex items-center gap-1">
        {label}
        {sortKey === key && (
          <span className="text-xs text-primary">{sortDir === "asc" ? "↑" : "↓"}</span>
        )}
      </div>
    </th>
  );

  const gradeBadge = (grade: number) => {
    if (grade >= 70) return { label: "STRONG", class: "bg-green-500/20 text-green-400 border-green-500/30" };
    if (grade >= 60) return { label: "BUY", class: "bg-blue-500/20 text-blue-400 border-blue-500/30" };
    if (grade >= 50) return { label: "HOLD", class: "bg-amber-500/20 text-amber-400 border-amber-500/30" };
    if (grade >= 40) return { label: "TRIM", class: "bg-orange-500/20 text-orange-400 border-orange-500/30" };
    if (grade > 0) return { label: "SELL", class: "bg-red-500/20 text-red-400 border-red-500/30" };
    return { label: "—", class: "bg-muted text-muted-foreground" };
  };

  // Stats
  const graded = enriched.filter((p: any) => p.grade > 0);
  const strong = enriched.filter((p: any) => p.grade >= 70);
  const moderate = enriched.filter((p: any) => p.grade >= 55 && p.grade < 70);
  const weak = enriched.filter((p: any) => p.grade > 0 && p.grade < 55);
  const ungraded = enriched.filter((p: any) => p.grade === 0);
  const avgGrade = graded.length > 0 ? (graded.reduce((s: number, p: any) => s + p.grade, 0) / graded.length).toFixed(1) : "—";

  const fmt = (n: number) => `$${Math.round(n).toLocaleString()}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading grades from Supabase...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader />
      <Sidebar />
      <main className="pt-14 lg:pt-0 lg:ml-64 p-4 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Grade Scanner</h1>
          <p className="text-muted-foreground text-sm">
            {graded.length} graded / {ungraded.length} ungraded | Avg: {avgGrade}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          <Card className="vox-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Strong (70+)</p>
              <p className="text-xl font-bold font-mono text-green-400">{strong.length}</p>
            </CardContent>
          </Card>
          <Card className="vox-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Moderate (55-69)</p>
              <p className="text-xl font-bold font-mono text-blue-400">{moderate.length}</p>
            </CardContent>
          </Card>
          <Card className="vox-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Weak (&lt;55)</p>
              <p className="text-xl font-bold font-mono text-red-400">{weak.length}</p>
            </CardContent>
          </Card>
          <Card className="vox-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Ungraded</p>
              <p className="text-xl font-bold font-mono text-muted-foreground">{ungraded.length}</p>
            </CardContent>
          </Card>
          <Card className="vox-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Avg Grade</p>
              <p className="text-xl font-bold font-mono">{avgGrade}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {([
            { key: "all" as FilterType, label: `All (${enriched.length})` },
            { key: "strong" as FilterType, label: `Strong (${strong.length})` },
            { key: "moderate" as FilterType, label: `Moderate (${moderate.length})` },
            { key: "weak" as FilterType, label: `Weak (${weak.length})` },
            { key: "ungraded" as FilterType, label: `Ungraded (${ungraded.length})` },
          ]).map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filter === f.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <Card className="vox-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Positions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-medium text-muted-foreground w-12">#</th>
                    <SortHeader label="Ticker" sortKey="ticker" />
                    <th className="text-left p-3 font-medium text-muted-foreground">Grade</th>
                    <SortHeader label="Value" sortKey="value" />
                    <th className="text-right p-3 font-medium text-muted-foreground">P&L</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Brokers</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p: any, i: number) => {
                    const badge = gradeBadge(p.grade);
                    const pnl = p.pnl || 0;
                    const brokerList = p.brokers || (p.broker ? [p.broker] : []);
                    return (
                      <tr key={p.ticker} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="p-3 text-muted-foreground">{i + 1}</td>
                        <td className="p-3">
                          <span className="font-bold font-mono">{p.ticker}</span>
                          <div className="text-xs text-muted-foreground">{p.name || p.sector}</div>
                        </td>
                        <td className="p-3">
                          {p.grade > 0 ? (
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={badge.class}>
                                {badge.label}
                              </Badge>
                              <span className="font-mono font-bold">{p.grade}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="p-3 text-right font-mono">{fmt(p.value)}</td>
                        <td className="p-3 text-right">
                          <div className={`flex items-center justify-end gap-1 ${pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                            {pnl >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            <span className="font-mono">{fmt(pnl)}</span>
                          </div>
                        </td>
                        <td className="p-3 text-muted-foreground text-xs">{brokerList.join(", ")}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
