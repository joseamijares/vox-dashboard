"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MobileHeader } from "@/components/mobile-header";
import { Sidebar } from "@/components/sidebar";
import { useState, useMemo, useEffect } from "react";
import { Eye, ArrowUpDown, TrendingUp, TrendingDown, Loader2, Target, Shield } from "lucide-react";

interface WatchItem {
  ticker: string;
  price: number;
  grade: number;
  signal: string;
  buy_zone: number;
  stop_loss: number;
  target_1: number;
  target_2: number;
  risk_reward: number;
  rsi: number;
  volume_ratio: number;
  position_size: string;
}

type SortKey = "ticker" | "grade" | "price" | "risk_reward";
type SortDir = "asc" | "desc";
type FilterType = "all" | "strong_buy" | "buy" | "hold" | "weak" | "trim" | "avoid";

export default function WatchlistPage() {
  const [items, setItems] = useState<WatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("grade");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/data/vox_watchlist_graded.json");
        if (res.ok) {
          const data = await res.json();
          setItems(data.results || []);
        }
      } catch (e) {
        console.error("Failed to load watchlist:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filtered = useMemo(() => {
    let result = [...items];
    
    if (filter === "strong_buy") result = result.filter((g) => g.signal === "STRONG_BUY");
    if (filter === "buy") result = result.filter((g) => g.signal === "BUY");
    if (filter === "hold") result = result.filter((g) => g.signal === "HOLD");
    if (filter === "weak") result = result.filter((g) => g.signal === "WEAK");
    if (filter === "trim") result = result.filter((g) => g.signal === "TRIM");
    if (filter === "avoid") result = result.filter((g) => g.signal === "AVOID" || g.signal === "SELL");
    
    result.sort((a: any, b: any) => {
      let valA: number | string = a[sortKey] || 0;
      let valB: number | string = b[sortKey] || 0;
      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();
      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return result;
  }, [items, sortKey, sortDir, filter]);

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

  const signalBadge = (signal: string) => {
    const s = signal.toUpperCase();
    if (s === "STRONG_BUY") return { label: "STRONG", class: "bg-green-500/20 text-green-400 border-green-500/30" };
    if (s === "BUY") return { label: "BUY", class: "bg-blue-500/20 text-blue-400 border-blue-500/30" };
    if (s === "HOLD") return { label: "HOLD", class: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" };
    if (s === "WEAK") return { label: "WEAK", class: "bg-amber-500/20 text-amber-400 border-amber-500/30" };
    if (s === "TRIM") return { label: "TRIM", class: "bg-orange-500/20 text-orange-400 border-orange-500/30" };
    if (s === "AVOID" || s === "SELL") return { label: "AVOID", class: "bg-red-500/20 text-red-400 border-red-500/30" };
    return { label: s, class: "bg-muted text-muted-foreground" };
  };

  const gradeColor = (grade: number) => {
    if (grade >= 70) return "text-green-400";
    if (grade >= 60) return "text-blue-400";
    if (grade >= 50) return "text-yellow-400";
    if (grade >= 40) return "text-orange-400";
    return "text-red-400";
  };

  // Stats
  const strong = items.filter((g) => g.signal === "STRONG_BUY");
  const buy = items.filter((g) => g.signal === "BUY");
  const hold = items.filter((g) => g.signal === "HOLD");
  const weak = items.filter((g) => g.signal === "WEAK");
  const trim = items.filter((g) => g.signal === "TRIM");
  const avoid = items.filter((g) => g.signal === "AVOID" || g.signal === "SELL");
  const avgGrade = items.length > 0 ? (items.reduce((s, g) => s + g.grade, 0) / items.length).toFixed(1) : "—";

  const fmt = (n: number) => `$${n?.toFixed?.(2) || n}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pt-14 lg:pt-0">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading watchlist...</p>
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
          <h1 className="text-2xl font-bold tracking-tight">Watchlist</h1>
          <p className="text-muted-foreground text-sm">
            {items.length} tickers graded | Avg: {avgGrade}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 mb-6">
          <Card className="vox-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Strong</p>
              <p className="text-xl font-bold font-mono text-green-400">{strong.length}</p>
            </CardContent>
          </Card>
          <Card className="vox-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Buy</p>
              <p className="text-xl font-bold font-mono text-blue-400">{buy.length}</p>
            </CardContent>
          </Card>
          <Card className="vox-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Hold</p>
              <p className="text-xl font-bold font-mono text-yellow-400">{hold.length}</p>
            </CardContent>
          </Card>
          <Card className="vox-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Weak</p>
              <p className="text-xl font-bold font-mono text-amber-400">{weak.length}</p>
            </CardContent>
          </Card>
          <Card className="vox-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Trim/Avoid</p>
              <p className="text-xl font-bold font-mono text-red-400">{trim.length + avoid.length}</p>
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
            { key: "all" as FilterType, label: `All (${items.length})` },
            { key: "strong_buy" as FilterType, label: `Strong (${strong.length})` },
            { key: "buy" as FilterType, label: `Buy (${buy.length})` },
            { key: "hold" as FilterType, label: `Hold (${hold.length})` },
            { key: "weak" as FilterType, label: `Weak (${weak.length})` },
            { key: "trim" as FilterType, label: `Trim (${trim.length})` },
            { key: "avoid" as FilterType, label: `Avoid (${avoid.length})` },
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
              <Eye className="h-5 w-5 text-primary" />
              Watchlist Targets
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-medium text-muted-foreground w-12">#</th>
                    <SortHeader label="Ticker" sortKey="ticker" />
                    <th className="text-left p-3 font-medium text-muted-foreground">Signal</th>
                    <SortHeader label="Grade" sortKey="grade" />
                    <th className="text-left p-3 font-medium text-muted-foreground">Price</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Buy Zone</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Stop</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Target 1</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Target 2</th>
                    <SortHeader label="R:R" sortKey="risk_reward" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((g, i) => {
                    const badge = signalBadge(g.signal);
                    return (
                      <tr key={g.ticker} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="p-3 text-muted-foreground">{i + 1}</td>
                        <td className="p-3">
                          <span className="font-bold font-mono">{g.ticker}</span>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className={badge.class}>
                            {badge.label}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <span className={`font-mono font-bold ${gradeColor(g.grade)}`}>
                            {g.grade}
                          </span>
                        </td>
                        <td className="p-3 font-mono">{fmt(g.price)}</td>
                        <td className="p-3 font-mono text-green-400">{fmt(g.buy_zone)}</td>
                        <td className="p-3 font-mono text-red-400">{fmt(g.stop_loss)}</td>
                        <td className="p-3 font-mono text-blue-400">{fmt(g.target_1)}</td>
                        <td className="p-3 font-mono text-purple-400">{fmt(g.target_2)}</td>
                        <td className="p-3 font-mono">{g.risk_reward}x</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No tickers match current filter</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Legend */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Target className="h-4 w-4 text-green-400" />
            <span>Buy Zone = entry target</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-4 w-4 text-red-400" />
            <span>Stop = stop loss</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <TrendingUp className="h-4 w-4 text-blue-400" />
            <span>Target 1 = near-term</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <TrendingUp className="h-4 w-4 text-purple-400" />
            <span>Target 2 = extended 3R</span>
          </div>
        </div>
      </main>
    </div>
  );
}
