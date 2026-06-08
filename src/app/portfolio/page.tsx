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
import { PageShell } from "@/components/vox-nav";
import { VoxBadge } from "@/components/vox";
import { getCouncilAction } from "@/lib/council";
import { getPositions, getTotalValue, getTotalPnL, getAvgGrade, getBrokerBreakdown, dashboardMeta, calculateTotalValue, calculateTotalPnL, calculateBrokerBreakdown } from "@/lib/data";
import { useState, useMemo, useEffect } from "react";
import { Search, TrendingUp, TrendingDown, AlertTriangle, Loader2 } from "lucide-react";
import { fmtCurrency } from "@/lib/format";
import { VoxKpi } from "@/components/vox";
import { VoxTable } from "@/components/vox";

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

  const totalValue = allPositions.length > 0 ? calculateTotalValue(allPositions) : getTotalValue();
  const totalPnl = allPositions.length > 0 ? calculateTotalPnL(allPositions) : getTotalPnL();
  const avgGrade = allPositions.length > 0 
    ? Math.round(allPositions.reduce((sum: number, p: any) => sum + (p.grade || 0), 0) / allPositions.filter((p: any) => (p.grade || 0) > 0).length) || 0
    : getAvgGrade();
  const brokerBreakdown = allPositions.length > 0 
    ? Object.entries(calculateBrokerBreakdown(allPositions)).map(([broker, value]) => ({
        broker,
        value: value as number,
        status: 'fresh' as string,
        stale: false,
      })).sort((a, b) => b.value - a.value)
    : getBrokerBreakdown();

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
    return getCouncilAction(grade);
  };

  // Format currency with 2 decimal places
  const fmt = (n: number) => fmtCurrency(n);

  // Data freshness - use most recent position update
  const dataAge = allPositions.length > 0 && allPositions[0]?.updated_at
    ? Math.round((Date.now() - new Date(allPositions[0].updated_at).getTime()) / 3600000)
    : dashboardMeta.generatedAt 
    ? Math.round((Date.now() - new Date(dashboardMeta.generatedAt).getTime()) / 3600000)
    : null;

  // VoxTable columns for positions
  const positionColumns = [
    {
      key: "ticker",
      header: "Ticker",
      accessor: (p: any) => (
        <div>
          <div className="font-semibold">{p.ticker}</div>
          <div className="text-xs text-muted-foreground">{p.name || p.sector}</div>
        </div>
      ),
      sortable: true,
      sortFn: (a: any, b: any) => a.ticker.localeCompare(b.ticker),
    },
    {
      key: "shares",
      header: "Shares",
      accessor: (p: any) => <span className="font-mono">{p.shares?.toFixed ? p.shares.toFixed(2) : p.shares}</span>,
      align: "right" as const,
    },
    {
      key: "price",
      header: "Price",
      accessor: (p: any) => {
        const price = p.live_price || p.price || 0;
        return <span className="font-mono">${price?.toFixed ? price.toFixed(2) : price}</span>;
      },
      align: "right" as const,
    },
    {
      key: "value",
      header: "Value",
      accessor: (p: any) => <span className="font-mono">{fmt(p.live_value || p.value || 0)}</span>,
      sortable: true,
      sortFn: (a: any, b: any) => (a.live_value || a.value || 0) - (b.live_value || b.value || 0),
      align: "right" as const,
    },
    {
      key: "pnl",
      header: "P&L",
      accessor: (p: any) => {
        const pnl = p.pnl || p.unrealized_pnl || 0;
        const pnlPct = p.pnl_pct || p.unrealized_pnl_pct || 0;
        return (
          <div className={`flex items-center justify-end gap-1 ${pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
            {pnl >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            <span className="font-mono">{fmt(pnl)} ({pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(1)}%)</span>
          </div>
        );
      },
      sortable: true,
      sortFn: (a: any, b: any) => (a.pnl_pct || a.unrealized_pnl_pct || 0) - (b.pnl_pct || b.unrealized_pnl_pct || 0),
      align: "right" as const,
    },
    {
      key: "grade",
      header: "Grade",
      accessor: (p: any) => <VoxBadge grade={p.grade || 0} />,
      sortable: true,
      sortFn: (a: any, b: any) => (a.grade || 0) - (b.grade || 0),
      align: "center" as const,
    },
    {
      key: "action",
      header: "Action",
      accessor: (p: any) => <VoxBadge grade={p.grade || 0} label={actionLabel(p.grade || 0)} />,
      align: "center" as const,
    },
    {
      key: "brokers",
      header: "Brokers",
      accessor: (p: any) => <span className="text-muted-foreground text-xs">{(p.brokers || (p.broker ? [p.broker] : [])).join(', ')}</span>,
    },
  ];

  return (
    <PageShell>
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

        {/* Summary Cards - using VoxKpi */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <VoxKpi label="Total Value" value={fmt(totalValue)} />
          <VoxKpi 
            label="Total P&L" 
            value={`${totalPnl >= 0 ? "+" : ""}${fmt(totalPnl)}`}
            change={totalPnl / (totalValue - totalPnl) * 100}
            changeType={totalPnl >= 0 ? "positive" : "negative"}
          />
          <VoxKpi label="Avg Grade" value={avgGrade || '—'} />
          <VoxKpi label="USD / MXN" value={dashboardMeta.usdMxnRate.toFixed(2)} suffix="" />
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

        {/* Positions Table - using VoxTable */}
        <VoxTable
          data={filtered}
          columns={positionColumns}
          keyExtractor={(p) => p.ticker}
          searchable={false}
          pageSize={50}
          emptyMessage="No positions match your filters"
        />
      </PageShell>
  );
}
