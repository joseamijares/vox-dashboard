"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MobileHeader } from "@/components/mobile-header";
import { Sidebar } from "@/components/sidebar";
import { useState, useMemo, useEffect } from "react";
import { Brain, ArrowUpDown, TrendingUp, TrendingDown, Loader2, Target, Shield, AlertTriangle, CheckCircle } from "lucide-react";

interface GradedItem {
  ticker: string;
  price: number;
  grade: number;
  signal: string;
  rsi: number;
  ema21: number;
  buy_zone: number;
  add_on_zone?: number;
  stop_loss: number;
  trailing_stop?: number;
  target_1: number;
  target_2: number;
  take_profit_1?: number;
  take_profit_2?: number;
  risk_reward: number;
  position_size: string;
  pnl_pct?: number;
  live_value?: number;
  is_portfolio?: boolean;
}

type SortKey = "ticker" | "grade" | "price" | "risk_reward" | "pnl_pct";
type SortDir = "asc" | "desc";
type FilterType = "all" | "strong_buy" | "buy" | "hold" | "weak" | "trim" | "avoid" | "portfolio";

export default function IntelligencePage() {
  const [watchlistData, setWatchlistData] = useState<GradedItem[]>([]);
  const [portfolioData, setPortfolioData] = useState<GradedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("grade");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [filter, setFilter] = useState<FilterType>("all");
  const [activeTab, setActiveTab] = useState<"watchlist" | "portfolio">("watchlist");

  useEffect(() => {
    async function loadData() {
      try {
        // Load watchlist grades
        const wlRes = await fetch("/data/vox_watchlist_graded.json");
        if (wlRes.ok) {
          const wlJson = await wlRes.json();
          setWatchlistData(wlJson.results || []);
        }
        
        // Load portfolio grades
        const pfRes = await fetch("/data/vox_portfolio_graded.json");
        if (pfRes.ok) {
          const pfJson = await pfRes.json();
          setPortfolioData(pfJson.results || []);
        }
      } catch (e) {
        console.error("Failed to load intelligence data:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const currentData = activeTab === "watchlist" ? watchlistData : portfolioData;

  const filtered = useMemo(() => {
    let result = [...currentData];
    
    if (filter === "strong_buy") result = result.filter((g) => g.signal === "STRONG_BUY" || g.signal === "STRONG_HOLD");
    if (filter === "buy") result = result.filter((g) => g.signal === "BUY" || g.signal === "HOLD");
    if (filter === "weak") result = result.filter((g) => g.signal === "WEAK");
    if (filter === "trim") result = result.filter((g) => g.signal === "TRIM" || g.signal === "CUT_LOSS");
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
  }, [currentData, sortKey, sortDir, filter]);

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
    if (s.includes("STRONG")) return { label: s, class: "bg-green-500/20 text-green-400 border-green-500/30" };
    if (s === "BUY" || s === "HOLD") return { label: s, class: "bg-blue-500/20 text-blue-400 border-blue-500/30" };
    if (s === "WEAK") return { label: s, class: "bg-amber-500/20 text-amber-400 border-amber-500/30" };
    if (s === "TRIM" || s === "CUT_LOSS") return { label: s, class: "bg-orange-500/20 text-orange-400 border-orange-500/30" };
    if (s === "AVOID" || s === "SELL") return { label: s, class: "bg-red-500/20 text-red-400 border-red-500/30" };
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
  const strong = currentData.filter((g) => g.signal?.includes("STRONG"));
  const buy = currentData.filter((g) => g.signal === "BUY" || g.signal === "HOLD");
  const weak = currentData.filter((g) => g.signal === "WEAK");
  const trim = currentData.filter((g) => g.signal === "TRIM" || g.signal === "CUT_LOSS");
  const avoid = currentData.filter((g) => g.signal === "AVOID" || g.signal === "SELL");
  const avgGrade = currentData.length > 0 ? (currentData.reduce((s, g) => s + g.grade, 0) / currentData.length).toFixed(1) : "—";

  const fmt = (n: number) => `$${n?.toFixed?.(2) || n}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pt-14 lg:pt-0">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading intelligence data...</p>
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
          <h1 className="text-2xl font-bold tracking-tight">Intelligence Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            {watchlistData.length} watchlist + {portfolioData.length} portfolio graded | Avg: {avgGrade}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => { setActiveTab("watchlist"); setFilter("all"); }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "watchlist"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            Watchlist ({watchlistData.length})
          </button>
          <button
            onClick={() => { setActiveTab("portfolio"); setFilter("all"); }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "portfolio"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            Portfolio ({portfolioData.length})
          </button>
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
              <p className="text-xs text-muted-foreground">Buy/Hold</p>
              <p className="text-xl font-bold font-mono text-blue-400">{buy.length}</p>
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
              <p className="text-xs text-muted-foreground">Trim</p>
              <p className="text-xl font-bold font-mono text-orange-400">{trim.length}</p>
            </CardContent>
          </Card>
          <Card className="vox-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Avoid</p>
              <p className="text-xl font-bold font-mono text-red-400">{avoid.length}</p>
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
            { key: "all" as FilterType, label: `All (${currentData.length})` },
            { key: "strong_buy" as FilterType, label: `Strong (${strong.length})` },
            { key: "buy" as FilterType, label: `Buy/Hold (${buy.length})` },
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
              <Brain className="h-5 w-5 text-primary" />
              {activeTab === "watchlist" ? "Watchlist Targets" : "Portfolio Targets"}
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
                    <th className="text-left p-3 font-medium text-muted-foreground">Buy/Add</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Stop</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Target 1</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Target 2</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">R:R</th>
                    {activeTab === "portfolio" && (
                      <>
                        <th className="text-left p-3 font-medium text-muted-foreground">PnL%</th>
                        <th className="text-left p-3 font-medium text-muted-foreground">Value</th>
                      </>
                    )}
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
                        <td className="p-3 font-mono text-green-400">
                          {activeTab === "watchlist" ? fmt(g.buy_zone) : fmt(g.add_on_zone || g.buy_zone)}
                        </td>
                        <td className="p-3 font-mono text-red-400">
                          {fmt((g.stop_loss || g.trailing_stop || 0) as number)}
                        </td>
                        <td className="p-3 font-mono text-blue-400">
                          {fmt((g.target_1 || g.take_profit_1 || 0) as number)}
                        </td>
                        <td className="p-3 font-mono text-purple-400">
                          {fmt((g.target_2 || g.take_profit_2 || 0) as number)}
                        </td>
                        <td className="p-3 font-mono">{g.risk_reward}x</td>
                        {activeTab === "portfolio" && (
                          <>
                            <td className={`p-3 font-mono ${(g.pnl_pct || 0) >= 0 ? "text-green-400" : "text-red-400"}`}>
                              {g.pnl_pct?.toFixed?.(1) || 0}%
                            </td>
                            <td className="p-3 font-mono">
                              ${g.live_value?.toFixed?.(0) || 0}
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No tickers match current filter</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Legend */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Target className="h-4 w-4 text-green-400" />
            <span>Buy/Add Zone = entry target</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-4 w-4 text-red-400" />
            <span>Stop = trailing stop loss</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <TrendingUp className="h-4 w-4 text-blue-400" />
            <span>Target 1 = near-term resistance</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle className="h-4 w-4 text-purple-400" />
            <span>Target 2 = extended 3R target</span>
          </div>
        </div>
      </main>
    </div>
  );
}
