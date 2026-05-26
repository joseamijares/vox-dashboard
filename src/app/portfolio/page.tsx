"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MobileHeader } from "@/components/mobile-header";
import { Sidebar } from "@/components/sidebar";
import { getPositions, getTotalValue, getTotalPnL, getAvgGrade, getBrokerBreakdown, dashboardMeta } from "@/lib/data";
import { useState, useMemo, useEffect } from "react";
import { Search, TrendingUp, TrendingDown, AlertTriangle, Loader2 } from "lucide-react";

export default function PortfolioPage() {
  const [allPositions, setAllPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [brokerFilter, setBrokerFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"value" | "pnl" | "grade" | "ticker" | "broker">("value");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getPositions();
        setAllPositions(data);
      } catch (e) {
        console.error("Failed to load positions:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalValue = getTotalValue();
  const totalPnl = getTotalPnL();
  const avgGrade = getAvgGrade();
  const brokerBreakdown = getBrokerBreakdown();

  // Extract unique brokers from positions
  const allBrokers = useMemo(() => {
    const brokerSet = new Set<string>();
    allPositions.forEach((p: any) => {
      const brokers = p.brokers || (p.broker ? [p.broker] : []);
      brokers.forEach((b: string) => brokerSet.add(b));
    });
    return Array.from(brokerSet).sort();
  }, [allPositions]);

  const filtered = useMemo(() => {
    let result = allPositions.filter((p: any) => {
      const matchesSearch = p.ticker.toLowerCase().includes(search.toLowerCase()) ||
        (p.name || "").toLowerCase().includes(search.toLowerCase());
      const matchesBroker = brokerFilter === "all" || 
        (p.brokers && p.brokers.includes(brokerFilter)) ||
        p.broker === brokerFilter;
      return matchesSearch && matchesBroker;
    });

    result.sort((a: any, b: any) => {
      let valA: number | string, valB: number | string;
      switch (sortBy) {
        case "value": valA = a.value; valB = b.value; break;
        case "pnl": valA = a.pnlPct || a.unrealized_pnl_pct || 0; valB = b.pnlPct || b.unrealized_pnl_pct || 0; break;
        case "grade": valA = a.grade || 0; valB = b.grade || 0; break;
        case "ticker": valA = a.ticker.toLowerCase(); valB = b.ticker.toLowerCase(); break;
        case "broker": valA = (a.brokers || [a.broker]).join(',').toLowerCase(); valB = (b.brokers || [b.broker]).join(',').toLowerCase(); break;
        default: valA = a.value; valB = b.value;
      }
      if (typeof valA === "string" && typeof valB === "string") {
        return sortDir === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortDir === "asc" ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
    });

    return result;
  }, [allPositions, search, brokerFilter, sortBy, sortDir]);

  const gradeColor = (grade: number) => {
    if (grade >= 70) return "bg-green-500/20 text-green-400 border-green-500/30";
    if (grade >= 60) return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    if (grade >= 50) return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    if (grade >= 40) return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    return "bg-red-500/20 text-red-400 border-red-500/30";
  };

  const actionBadge = (grade: number) => {
    if (grade >= 70) return "default";
    if (grade >= 60) return "secondary";
    if (grade >= 50) return "outline";
    return "destructive";
  };

  const actionLabel = (grade: number) => {
    if (grade >= 70) return "BUY";
    if (grade >= 60) return "HOLD";
    if (grade >= 50) return "HOLD";
    if (grade >= 40) return "TRIM";
    return "SELL";
  };

  // Format currency without decimals
  const fmt = (n: number) => `$${Math.round(n).toLocaleString()}`;

  // Data freshness
  const dataAge = dashboardMeta.generatedAt 
    ? Math.round((Date.now() - new Date(dashboardMeta.generatedAt).getTime()) / 3600000)
    : null;

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader />
      <Sidebar />
      <main className="pt-14 lg:pt-0 lg:ml-64 p-4 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Portfolio</h1>
          <p className="text-muted-foreground text-sm">
            {allPositions.length} positions across {allBrokers.length} brokers
            {dataAge !== null && (
              <span className="ml-2 text-xs">
                • Data {dataAge}h old
              </span>
            )}
          </p>
        </div>

        {/* Broker Summary Table — REAL VALUES from broker_breakdown */}
        <Card className="vox-card mb-6">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              Broker Breakdown
              {brokerBreakdown.some(b => b.stale) && (
                <Badge variant="outline" className="text-amber-400 border-amber-500/30 bg-amber-500/20 text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Some data stale
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-medium text-muted-foreground">Broker</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Value</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">% of Total</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {brokerBreakdown.map((b) => (
                    <tr key={b.broker} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="p-3 font-semibold">{b.broker}</td>
                      <td className="p-3 text-right font-mono">{fmt(b.value)}</td>
                      <td className="p-3 text-right font-mono">
                        {totalValue > 0 ? ((b.value / totalValue) * 100).toFixed(1) : 0}%
                      </td>
                      <td className="p-3 text-center">
                        {b.stale ? (
                          <Badge variant="outline" className="text-amber-400 border-amber-500/30 bg-amber-500/20 text-xs">
                            Stale
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-green-400 border-green-500/30 bg-green-500/20 text-xs">
                            Live
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-muted/30">
                    <td className="p-3">TOTAL</td>
                    <td className="p-3 text-right font-mono">{fmt(totalValue)}</td>
                    <td className="p-3 text-right font-mono">100%</td>
                    <td className="p-3"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <Card className="vox-card">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Total Value</p>
              <p className="text-2xl font-bold font-mono">{fmt(totalValue)}</p>
            </CardContent>
          </Card>
          <Card className="vox-card">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Total P&L</p>
              <p className={`text-2xl font-bold font-mono ${totalPnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                {totalPnl >= 0 ? "+" : ""}{fmt(totalPnl)}
              </p>
            </CardContent>
          </Card>
          <Card className="vox-card">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Avg Grade</p>
              <p className="text-2xl font-bold font-mono text-green-400">{avgGrade || '—'}</p>
            </CardContent>
          </Card>
          <Card className="vox-card">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">USD / MXN</p>
              <p className="text-2xl font-bold font-mono">{dashboardMeta.usdMxnRate.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">{dashboardMeta.usdMxnDate || 'Today'}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search ticker or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={brokerFilter} onValueChange={(v) => setBrokerFilter(v || "all")}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Broker" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Brokers</SelectItem>
              {allBrokers.map((b) => (
                <SelectItem key={b} value={b}>{b}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(v) => {
            if (sortBy === v) {
              setSortDir(sortDir === "asc" ? "desc" : "asc");
            } else {
              setSortBy(v as typeof sortBy);
              setSortDir("desc");
            }
          }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="value">Value {sortBy === "value" && (sortDir === "asc" ? "↑" : "↓")}</SelectItem>
              <SelectItem value="pnl">P&L % {sortBy === "pnl" && (sortDir === "asc" ? "↑" : "↓")}</SelectItem>
              <SelectItem value="grade">Grade {sortBy === "grade" && (sortDir === "asc" ? "↑" : "↓")}</SelectItem>
              <SelectItem value="ticker">Ticker {sortBy === "ticker" && (sortDir === "asc" ? "↑" : "↓")}</SelectItem>
              <SelectItem value="broker">Broker {sortBy === "broker" && (sortDir === "asc" ? "↑" : "↓")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Positions Table */}
        <Card className="vox-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-medium text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => { if (sortBy === "ticker") setSortDir(sortDir === "asc" ? "desc" : "asc"); else { setSortBy("ticker"); setSortDir("asc"); }}}>Ticker {sortBy === "ticker" && (sortDir === "asc" ? "↑" : "↓")}</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Shares</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Price</th>
                  <th className="text-right p-4 font-medium text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => { if (sortBy === "value") setSortDir(sortDir === "asc" ? "desc" : "asc"); else { setSortBy("value"); setSortDir("desc"); }}}>Value {sortBy === "value" && (sortDir === "asc" ? "↑" : "↓")}</th>
                  <th className="text-right p-4 font-medium text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => { if (sortBy === "pnl") setSortDir(sortDir === "asc" ? "desc" : "asc"); else { setSortBy("pnl"); setSortDir("desc"); }}}>P&L {sortBy === "pnl" && (sortDir === "asc" ? "↑" : "↓")}</th>
                  <th className="text-center p-4 font-medium text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => { if (sortBy === "grade") setSortDir(sortDir === "asc" ? "desc" : "asc"); else { setSortBy("grade"); setSortDir("desc"); }}}>Grade {sortBy === "grade" && (sortDir === "asc" ? "↑" : "↓")}</th>
                  <th className="text-center p-4 font-medium text-muted-foreground">Action</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Brokers</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p: any) => {
                  const pnl = p.pnl || 0;
                  const grade = p.grade || 0;
                  const brokerList = p.brokers || (p.broker ? [p.broker] : []);
                  return (
                  <tr key={p.ticker} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="p-4">
                      <div className="font-semibold">{p.ticker}</div>
                      <div className="text-xs text-muted-foreground">{p.name || p.sector}</div>
                    </td>
                    <td className="p-4 text-right font-mono">{p.shares?.toFixed ? p.shares.toFixed(2) : p.shares}</td>
                    <td className="p-4 text-right font-mono">${p.price?.toFixed ? p.price.toFixed(2) : p.price}</td>
                    <td className="p-4 text-right font-mono">{fmt(p.value)}</td>
                    <td className="p-4 text-right">
                      <div className={`flex items-center justify-end gap-1 ${pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {pnl >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        <span className="font-mono">{fmt(pnl)}</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <Badge variant="outline" className={gradeColor(grade)}>
                        {grade || '—'}
                      </Badge>
                    </td>
                    <td className="p-4 text-center">
                      <Badge variant={actionBadge(grade)}>{grade ? actionLabel(grade) : '—'}</Badge>
                    </td>
                    <td className="p-4 text-muted-foreground text-xs">{brokerList.join(', ')}</td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  );
}
