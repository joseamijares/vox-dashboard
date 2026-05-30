"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MobileHeader } from "@/components/mobile-header";
import { Sidebar } from "@/components/sidebar";
import { getPositions, calculateTotalValue, calculateTotalPnL } from "@/lib/data";
import { useState, useEffect } from "react";
import { Search, TrendingUp, TrendingDown } from "lucide-react";

export default function PositionsPage() {
  const [positions, setPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [brokerFilter, setBrokerFilter] = useState("ALL");

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

  const brokers = ["ALL", ...Array.from(new Set(positions.map((p: any) => p.broker || (p.brokers?.[0] || 'Unknown'))))] as string[];

  const filtered = positions.filter((p: any) => {
    const matchesSearch = p.ticker.toLowerCase().includes(filter.toLowerCase());
    const matchesBroker = brokerFilter === "ALL" || p.broker === brokerFilter || p.brokers?.includes(brokerFilter);
    return matchesSearch && matchesBroker;
  });

  const totalValue = calculateTotalValue(filtered);
  const totalPnl = calculateTotalPnL(filtered);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-muted-foreground text-sm">Loading positions...</p>
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
          <h1 className="text-2xl font-bold tracking-tight">All Positions</h1>
          <p className="text-muted-foreground text-sm">
            {filtered.length} positions | ${totalValue.toLocaleString()} | P&L: ${totalPnl.toLocaleString()}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search ticker..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={brokerFilter}
            onChange={(e) => setBrokerFilter(e.target.value)}
          >
            {brokers.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        <Card className="vox-card">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4">Ticker</th>
                    <th className="text-left p-4">Broker</th>
                    <th className="text-right p-4">Value</th>
                    <th className="text-right p-4">P&L</th>
                    <th className="text-right p-4">P&L %</th>
                    <th className="text-right p-4">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered
                    .sort((a: any, b: any) => (b.live_value || b.value || 0) - (a.live_value || a.value || 0))
                    .map((p: any) => (
                      <tr key={`${p.ticker}-${p.broker || p.brokers?.join('-')}`} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="p-4 font-semibold">{p.ticker}</td>
                        <td className="p-4">
                          <Badge variant="outline" className="text-xs">{p.broker || p.brokers?.join(', ') || 'Unknown'}</Badge>
                        </td>
                        <td className="p-4 text-right font-mono">${(p.live_value || p.value || 0).toLocaleString()}</td>
                        <td className={`p-4 text-right font-mono ${(p.pnl || p.unrealized_pnl || 0) >= 0 ? "text-green-400" : "text-red-400"}`}>
                          {(p.pnl || p.unrealized_pnl || 0) >= 0 ? "+" : ""}${(p.pnl || p.unrealized_pnl || 0).toLocaleString()}
                        </td>
                        <td className={`p-4 text-right font-mono ${(p.pnl_pct || p.unrealized_pnl_pct || 0) >= 0 ? "text-green-400" : "text-red-400"}`}>
                          {(p.pnl_pct || p.unrealized_pnl_pct || 0) >= 0 ? "+" : ""}{(p.pnl_pct || p.unrealized_pnl_pct || 0).toFixed(1)}%
                        </td>
                        <td className="p-4 text-right">
                          {p.grade ? (
                            <Badge variant="outline" className={
                              p.grade >= 70 ? "bg-green-500/20 text-green-400 border-green-500/30" :
                              p.grade >= 50 ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" :
                              "bg-red-500/20 text-red-400 border-red-500/30"
                            }>
                              {p.grade}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
