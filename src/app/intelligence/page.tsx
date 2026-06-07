"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageShell } from "@/components/vox-nav";
import { VoxBadge } from "@/components/vox";
import { useState, useMemo, useEffect } from "react";
import {
  Brain,
  Eye,
  BarChart3,
  Award,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  Loader2,
  Target,
  Shield,
  CheckCircle,
  Zap,
  Rocket,
  Atom,
  Globe,
  Landmark,
  Lock,
  Activity,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────

interface WatchItem {
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
  sector?: string;
}

interface SectorData {
  name: string;
  description: string;
  thesis: string;
  momentum: string;
  key_companies: string[];
  etfs: string[];
  portfolio_overlap: string[];
  watchlist_candidates: string[];
  alerts: Array<{
    level: string;
    message: string;
    action: string;
  }>;
}

interface SectorWatchlistData {
  timestamp: string;
  sectors: Record<string, SectorData>;
  summary: {
    total_sectors: number;
    strong_momentum: number;
    building_momentum: number;
    portfolio_coverage: Record<string, number>;
  };
}

type ViewMode = "watchlist" | "portfolio" | "sectors";
type SortKey = "ticker" | "grade" | "price" | "risk_reward" | "pnl_pct" | "value";
type SortDir = "asc" | "desc";
type FilterType = "all" | "strong" | "buy" | "hold" | "weak" | "trim" | "avoid" | "space" | "ai" | "quantum" | "banks" | "cyber" | "emerging";

// ─── Sector icon mapping ───────────────────────────────────────────

const sectorIcons: Record<string, React.ReactNode> = {
  Space: <Rocket className="h-4 w-4" />,
  "AI Infrastructure": <Zap className="h-4 w-4" />,
  Quantum: <Atom className="h-4 w-4" />,
  Banks: <Landmark className="h-4 w-4" />,
  Cybersecurity: <Lock className="h-4 w-4" />,
  "Emerging Markets": <Globe className="h-4 w-4" />,
};

// ─── Component ─────────────────────────────────────────────────────

export default function IntelligencePage() {
  // Data states
  const [watchlistData, setWatchlistData] = useState<WatchItem[]>([]);
  const [portfolioData, setPortfolioData] = useState<WatchItem[]>([]);
  const [sectorData, setSectorData] = useState<SectorWatchlistData | null>(null);
  const [loading, setLoading] = useState(true);

  // UI states
  const [viewMode, setViewMode] = useState<ViewMode>("watchlist");
  const [sortKey, setSortKey] = useState<SortKey>("grade");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [filter, setFilter] = useState<FilterType>("all");

  // Load all data + auto-refresh every 60s
  useEffect(() => {
    async function loadData() {
      try {
        const [wlRes, pfRes, secRes] = await Promise.all([
          fetch("/api/watchlist"),
          fetch("/api/positions"),
          fetch("/vox_sector_watchlist.json"),
        ]);

        if (wlRes.ok) {
          const wlJson = await wlRes.json();
          // Map API format to WatchItem format
          const mapped = (wlJson.watchlist || []).map((w: any) => ({
            ticker: w.ticker,
            price: w.entry_price || 0,
            grade: w.grade || 0,
            signal: w.council || "HOLD",
            rsi: 50,
            ema21: 0,
            buy_zone: w.entry_price || 0,
            add_on_zone: w.entry_price ? w.entry_price * 0.95 : 0,
            stop_loss: w.stop_loss || 0,
            trailing_stop: w.stop_loss ? w.stop_loss * 1.05 : 0,
            target_1: w.target_price || 0,
            target_2: w.target_price ? w.target_price * 1.15 : 0,
            take_profit_1: w.target_price || 0,
            take_profit_2: w.target_price ? w.target_price * 1.15 : 0,
            risk_reward: w.stop_loss && w.entry_price ? ((w.target_price - w.entry_price) / (w.entry_price - w.stop_loss)) : 0,
            position_size: "—",
            sector: w.sector || "Uncategorized",
          }));
          setWatchlistData(mapped);
        }
        if (pfRes.ok) {
          const pfJson = await pfRes.json();
          // Map API format to WatchItem format
          const mapped = (pfJson.positions || []).map((p: any) => ({
            ticker: p.ticker,
            price: p.live_price || 0,
            grade: p.grade || 0,
            signal: p.council || "HOLD",
            rsi: 50,
            ema21: 0,
            buy_zone: p.live_price ? p.live_price * 0.95 : 0,
            add_on_zone: p.live_price ? p.live_price * 0.90 : 0,
            stop_loss: p.stop_loss || p.live_price * 0.85 || 0,
            trailing_stop: p.live_price ? p.live_price * 0.90 : 0,
            target_1: p.target_price || p.live_price * 1.10 || 0,
            target_2: p.target_price ? p.target_price * 1.20 : p.live_price * 1.20 || 0,
            take_profit_1: p.target_price || p.live_price * 1.10 || 0,
            take_profit_2: p.target_price ? p.target_price * 1.20 : p.live_price * 1.20 || 0,
            risk_reward: 2,
            position_size: `${p.shares || 0} shares`,
            pnl_pct: p.avg_cost && p.live_price ? ((p.live_price - p.avg_cost) / p.avg_cost) * 100 : 0,
            live_value: p.live_value || 0,
            is_portfolio: true,
            sector: p.sector || "Uncategorized",
          }));
          setPortfolioData(mapped);
        }
        if (secRes.ok) {
          const secJson = await secRes.json();
          setSectorData(secJson);
        }
      } catch (e) {
        console.error("Failed to load intelligence data:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
    // Auto-refresh every 60 seconds
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  // ─── Helpers ─────────────────────────────────────────────────────

  const currentData = viewMode === "portfolio" ? portfolioData : watchlistData;

  const filtered = useMemo(() => {
    let result = [...currentData];

    // Signal filters
    if (filter === "strong") result = result.filter((g) => g.signal?.includes("STRONG"));
    if (filter === "buy") result = result.filter((g) => g.signal === "BUY" || g.signal === "HOLD");
    if (filter === "weak") result = result.filter((g) => g.signal === "WEAK");
    if (filter === "trim") result = result.filter((g) => g.signal === "TRIM" || g.signal === "CUT_LOSS");
    if (filter === "avoid") result = result.filter((g) => g.signal === "AVOID" || g.signal === "SELL");

    // Sector filters
    if (filter === "space") result = result.filter((g) =>
      ["CPSH", "LUNR", "SIDU", "RDW", "FLY", "DDD", "ASTS", "SPIR", "RKLB", "TSLA", "SPCE", "MNTS", "VORB", "AJRD", "NOC", "LHX", "RTX", "GD", "BA", "LMT"].includes(g.ticker)
    );
    if (filter === "ai") result = result.filter((g) =>
      ["TE", "APLD", "HIVE", "CLSK", "IREN", "BTDR", "RIOT", "CORZ", "WULF", "MARA", "CIFR", "GLXY", "HUT"].includes(g.ticker)
    );
    if (filter === "quantum") result = result.filter((g) =>
      ["IONQ", "RGTI", "QBTS", "QUBT", "IBM", "GOOGL", "MSFT", "NVDA", "HON", "TSM", "ASML", "MU", "LRCX", "AMAT", "KLAC", "FORM", "COHR", "CIEN", "LITE", "ARQQ", "BKSY"].includes(g.ticker)
    );
    if (filter === "banks") result = result.filter((g) =>
      ["GS", "MS", "JPM", "BAC", "C", "WFC", "USB", "PNC", "TFC", "COF", "SCHW", "BK", "STT", "BLK", "AXP"].includes(g.ticker)
    );
    if (filter === "cyber") result = result.filter((g) =>
      ["CRWD", "ARQQ", "GRRR", "PANW", "FTNT", "CYBR", "S", "OKTA", "ZS", "NET", "GEN", "QLYS", "RPD", "TENB", "VRNS"].includes(g.ticker)
    );
    if (filter === "emerging") result = result.filter((g) =>
      ["BABA", "TCEHY", "JD", "PDD", "NIO", "LI", "XPEV", "DIDI", "BEKE", "EDU", "MNSO", "FUTU", "VIPS", "BIDU", "KC"].includes(g.ticker)
    );

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
    const s = signal?.toUpperCase() || "";
    if (s.includes("STRONG")) return { label: s, class: "bg-green-500/20 text-green-400 border-green-500/30" };
    if (s === "BUY" || s === "HOLD") return { label: s, class: "bg-blue-500/20 text-blue-400 border-blue-500/30" };
    if (s === "WEAK") return { label: s, class: "bg-amber-500/20 text-amber-400 border-amber-500/30" };
    if (s === "TRIM" || s === "CUT_LOSS") return { label: s, class: "bg-orange-500/20 text-orange-400 border-orange-500/30" };
    if (s === "AVOID" || s === "SELL") return { label: s, class: "bg-red-500/20 text-red-400 border-red-500/30" };
    return { label: s || "—", class: "bg-muted text-muted-foreground" };
  };

  const gradeColor = (grade: number) => {
    if (grade >= 70) return "text-green-400";
    if (grade >= 60) return "text-blue-400";
    if (grade >= 50) return "text-yellow-400";
    if (grade >= 40) return "text-orange-400";
    return "text-red-400";
  };

  const getMomentumColor = (momentum: string) => {
    if (momentum === "STRONG") return "bg-green-500/20 text-green-400 border-green-500/30";
    if (momentum === "BUILDING") return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    return "bg-blue-500/20 text-blue-400 border-blue-500/30";
  };

  const fmt = (n: number) => `$${n?.toFixed?.(2) || n}`;

  // ─── Stats ───────────────────────────────────────────────────────

  const strong = currentData.filter((g) => g.signal?.includes("STRONG"));
  const buy = currentData.filter((g) => g.signal === "BUY" || g.signal === "HOLD");
  const weak = currentData.filter((g) => g.signal === "WEAK");
  const trim = currentData.filter((g) => g.signal === "TRIM" || g.signal === "CUT_LOSS");
  const avoid = currentData.filter((g) => g.signal === "AVOID" || g.signal === "SELL");
  const avgGrade = currentData.length > 0 ? (currentData.reduce((s, g) => s + (g.grade || 0), 0) / currentData.length).toFixed(1) : "—";

  // ─── Loading ─────────────────────────────────────────────────────

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

  // ─── Render ──────────────────────────────────────────────────────

  return (
    <PageShell>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            Intelligence
          </h1>
          <p className="text-muted-foreground text-sm">
            {watchlistData.length} watchlist + {portfolioData.length} portfolio graded | Avg: {avgGrade}
          </p>
        </div>

        {/* View Mode Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => { setViewMode("watchlist"); setFilter("all"); }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              viewMode === "watchlist"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <Eye className="h-4 w-4" />
            Watchlist ({watchlistData.length})
          </button>
          <button
            onClick={() => { setViewMode("portfolio"); setFilter("all"); }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              viewMode === "portfolio"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <Award className="h-4 w-4" />
            Portfolio ({portfolioData.length})
          </button>
          <button
            onClick={() => { setViewMode("sectors"); setFilter("all"); }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              viewMode === "sectors"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            Sectors ({sectorData?.summary?.total_sectors || 0})
          </button>
        </div>

        {/* ─── WATCHLIST / PORTFOLIO VIEW ─────────────────────────── */}
        {(viewMode === "watchlist" || viewMode === "portfolio") && (
          <>
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

            {/* Filter Tabs — Signal */}
            <div className="flex gap-2 mb-3 flex-wrap">
              {([
                { key: "all" as FilterType, label: `All (${currentData.length})` },
                { key: "strong" as FilterType, label: `Strong (${strong.length})` },
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

            {/* Filter Tabs — Thematic Sectors */}
            <div className="flex gap-2 mb-6 flex-wrap">
              <span className="text-xs text-muted-foreground self-center mr-1">Sectors:</span>
              {([
                { key: "space" as FilterType, label: "🚀 Space", icon: <Rocket className="h-3 w-3" /> },
                { key: "ai" as FilterType, label: "⚡ AI Infra", icon: <Zap className="h-3 w-3" /> },
                { key: "quantum" as FilterType, label: "⚛️ Quantum", icon: <Atom className="h-3 w-3" /> },
                { key: "banks" as FilterType, label: "🏦 Banks", icon: <Landmark className="h-3 w-3" /> },
                { key: "cyber" as FilterType, label: "🔒 Cyber", icon: <Lock className="h-3 w-3" /> },
                { key: "emerging" as FilterType, label: "🌏 Emerging", icon: <Globe className="h-3 w-3" /> },
              ]).map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    filter === f.key
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f.icon}
                  {f.label}
                </button>
              ))}
            </div>

            {/* Data Table */}
            <Card className="vox-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {viewMode === "watchlist" ? <Eye className="h-5 w-5 text-primary" /> : <Award className="h-5 w-5 text-primary" />}
                  {viewMode === "watchlist" ? "Watchlist Targets" : "Portfolio Positions"}
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
                        {viewMode === "portfolio" && (
                          <>
                            <SortHeader label="PnL%" sortKey="pnl_pct" />
                            <SortHeader label="Value" sortKey="value" />
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
                              <span className={`font-mono font-bold ${gradeColor(g.grade || 0)}`}>
                                {g.grade || "—"}
                              </span>
                            </td>
                            <td className="p-3 font-mono">{fmt(g.price)}</td>
                            <td className="p-3 font-mono text-green-400">
                              {viewMode === "watchlist" ? fmt(g.buy_zone) : fmt(g.add_on_zone || g.buy_zone)}
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
                            {viewMode === "portfolio" && (
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
          </>
        )}

        {/* ─── SECTORS VIEW ───────────────────────────────────────── */}
        {viewMode === "sectors" && sectorData && (
          <>
            {/* Sector Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{sectorData.summary.total_sectors}</div>
                  <div className="text-sm text-muted-foreground">Sectors Tracked</div>
                </CardContent>
              </Card>
              <Card className="bg-green-500/5 border-green-500/20">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-green-400">{sectorData.summary.strong_momentum}</div>
                  <div className="text-sm text-muted-foreground">Strong Momentum</div>
                </CardContent>
              </Card>
              <Card className="bg-amber-500/5 border-amber-500/20">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-amber-400">{sectorData.summary.building_momentum}</div>
                  <div className="text-sm text-muted-foreground">Building Momentum</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    {Object.values(sectorData.summary.portfolio_coverage).reduce((a, b) => a + b, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Portfolio Positions</div>
                </CardContent>
              </Card>
            </div>

            {/* Sector Cards */}
            <div className="space-y-4">
              {Object.entries(sectorData.sectors).map(([name, sector]) => (
                <Card key={name} className="vox-card">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-lg">{name}</span>
                          <Badge className={getMomentumColor(sector.momentum)}>
                            {sector.momentum}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{sector.description}</p>
                      </div>
                    </div>

                    <div className="text-sm mb-3">
                      <span className="font-medium">Thesis:</span> {sector.thesis}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">In Portfolio</p>
                        <div className="flex flex-wrap gap-1">
                          {sector.portfolio_overlap.length > 0 ? (
                            sector.portfolio_overlap.map((t) => (
                              <Badge key={t} variant="outline" className="text-green-400">
                                {t}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">None</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Watchlist</p>
                        <div className="flex flex-wrap gap-1">
                          {sector.watchlist_candidates.map((t) => (
                            <Badge key={t} variant="outline">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-2">
                      <span className="text-xs text-muted-foreground mr-2">ETFs:</span>
                      {sector.etfs.map((etf) => (
                        <Badge key={etf} variant="outline" className="text-xs">
                          {etf}
                        </Badge>
                      ))}
                    </div>

                    {sector.alerts.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-border">
                        {sector.alerts.map((alert, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="text-amber-400">🚨</span>
                            <span className="text-sm">{alert.message}</span>
                            <Badge variant="outline" className="text-amber-400">
                              {alert.action}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <p className="text-xs text-muted-foreground mt-6">
              Generated: {new Date(sectorData.timestamp).toLocaleString()}
            </p>
          </>
        )}
      </PageShell>
  );
}
