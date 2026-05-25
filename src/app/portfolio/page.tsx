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
import { Sidebar } from "@/components/sidebar";
import { positions, portfolioSummary, getTotalValue, getTotalPnL, getAvgGrade } from "@/lib/data";
import { useState, useMemo } from "react";
import { Search, ArrowUpDown, TrendingUp, TrendingDown } from "lucide-react";

export default function PortfolioPage() {
  const allPositions = positions;
  const summary = portfolioSummary;
  const [search, setSearch] = useState("");
  const [brokerFilter, setBrokerFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"value" | "pnl" | "grade">("value");

  const totalValue = getTotalValue();
  const totalPnl = getTotalPnL();
  const avgGrade = getAvgGrade();

  const filtered = useMemo(() => {
    let result = allPositions.filter((p) => {
      const matchesSearch = p.ticker.toLowerCase().includes(search.toLowerCase()) ||
        (p.name || "").toLowerCase().includes(search.toLowerCase());
      const matchesBroker = brokerFilter === "all" || p.broker === brokerFilter;
      return matchesSearch && matchesBroker;
    });

    result.sort((a, b) => {
      if (sortBy === "value") return b.value - a.value;
      if (sortBy === "pnl") return (b.pnlPct || b.unrealized_pnl_pct || 0) - (a.pnlPct || a.unrealized_pnl_pct || 0);
      return (b.grade || 0) - (a.grade || 0);
    });

    return result;
  }, [allPositions, search, brokerFilter, sortBy]);

  const brokers = [...new Set(allPositions.map((p) => p.broker))];

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

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:ml-64 p-4 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Portfolio</h1>
          <p className="text-muted-foreground text-sm">
            {allPositions.length} positions across {brokers.length} brokers
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="vox-card">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Total Value</p>
              <p className="text-2xl font-bold font-mono">${totalValue.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="vox-card">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Total P&L</p>
              <p className={`text-2xl font-bold font-mono ${totalPnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                {totalPnl >= 0 ? "+" : ""}${totalPnl.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card className="vox-card">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Avg Grade</p>
              <p className="text-2xl font-bold font-mono text-green-400">{avgGrade}</p>
            </CardContent>
          </Card>
          <Card className="vox-card">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Grand Total</p>
              <p className="text-2xl font-bold font-mono text-blue-400">${summary.totalAUM.toLocaleString()}</p>
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
              {brokers.map((b) => (
                <SelectItem key={b} value={b}>{b}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="value">Value</SelectItem>
              <SelectItem value="pnl">P&L %</SelectItem>
              <SelectItem value="grade">Grade</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Positions Table */}
        <Card className="vox-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-medium text-muted-foreground">Ticker</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Shares</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Price</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Value</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">P&L</th>
                  <th className="text-center p-4 font-medium text-muted-foreground">Grade</th>
                  <th className="text-center p-4 font-medium text-muted-foreground">Action</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Broker</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const pnl = p.unrealized_pnl || p.pnl || 0;
                  const pnlPct = p.unrealized_pnl_pct || p.pnlPct || 0;
                  const grade = p.grade || 0;
                  return (
                  <tr key={`${p.ticker}-${p.broker}`} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="p-4">
                      <div className="font-semibold">{p.ticker}</div>
                      <div className="text-xs text-muted-foreground">{p.name || p.sector}</div>
                    </td>
                    <td className="p-4 text-right font-mono">{p.shares}</td>
                    <td className="p-4 text-right font-mono">${p.price}</td>
                    <td className="p-4 text-right font-mono">${p.value.toLocaleString()}</td>
                    <td className="p-4 text-right">
                      <div className={`flex items-center justify-end gap-1 ${pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {pnl >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        <span className="font-mono">{pnlPct}%</span>
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">${pnl.toLocaleString()}</div>
                    </td>
                    <td className="p-4 text-center">
                      <Badge variant="outline" className={gradeColor(grade)}>
                        {grade || 'N/A'}
                      </Badge>
                    </td>
                    <td className="p-4 text-center">
                      <Badge variant={actionBadge(grade)}>{actionLabel(grade)}</Badge>
                    </td>
                    <td className="p-4 text-muted-foreground">{p.broker}</td>
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
