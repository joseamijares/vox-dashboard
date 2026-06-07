"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageShell } from "@/components/vox-nav";
import { positions } from "@/lib/data";
import { TrendingUp, TrendingDown, BarChart3, Award } from "lucide-react";

export default function PerformancePage() {
  const totalValue = positions.reduce((s: number, p: any) => s + p.value, 0);
  const totalPnl = positions.reduce((s: number, p: any) => s + (p.unrealized_pnl || 0), 0);
  const totalCost = positions.reduce((s: number, p: any) => s + (p.value - (p.unrealized_pnl || 0)), 0);
  const totalReturn = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

  // Winners vs Losers
  const winners = positions.filter((p: any) => (p.unrealized_pnl || 0) > 0);
  const losers = positions.filter((p: any) => (p.unrealized_pnl || 0) < 0);
  const winnerValue = winners.reduce((s: number, p: any) => s + p.value, 0);
  const loserValue = losers.reduce((s: number, p: any) => s + p.value, 0);
  const winnerPnl = winners.reduce((s: number, p: any) => s + (p.unrealized_pnl || 0), 0);
  const loserPnl = losers.reduce((s: number, p: any) => s + (p.unrealized_pnl || 0), 0);

  // Top performers
  const topWinners = [...positions]
    .filter((p: any) => (p.unrealized_pnl || 0) > 0)
    .sort((a: any, b: any) => (b.unrealized_pnl || 0) - (a.unrealized_pnl || 0))
    .slice(0, 10);

  const topLosers = [...positions]
    .filter((p: any) => (p.unrealized_pnl || 0) < 0)
    .sort((a: any, b: any) => (a.unrealized_pnl || 0) - (b.unrealized_pnl || 0))
    .slice(0, 10);

  // By broker P&L
  const brokerPnl: Record<string, { pnl: number; value: number; positions: number }> = {};
  positions.forEach((p: any) => {
    if (!brokerPnl[p.broker]) brokerPnl[p.broker] = { pnl: 0, value: 0, positions: 0 };
    brokerPnl[p.broker].pnl += p.unrealized_pnl || 0;
    brokerPnl[p.broker].value += p.value;
    brokerPnl[p.broker].positions += 1;
  });

  return (
    <PageShell>
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Performance</h1>
          <p className="text-muted-foreground text-sm">Portfolio P&L analysis</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="vox-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total P&L</p>
                  <p className={`text-2xl font-bold font-mono ${totalPnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {totalPnl >= 0 ? "+" : ""}${totalPnl.toLocaleString()}
                  </p>
                </div>
                <BarChart3 className={`h-8 w-8 ${totalPnl >= 0 ? "text-green-400" : "text-red-400"}`} />
              </div>
            </CardContent>
          </Card>
          <Card className="vox-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Return</p>
                  <p className={`text-2xl font-bold font-mono ${totalReturn >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {totalReturn >= 0 ? "+" : ""}{totalReturn.toFixed(1)}%
                  </p>
                </div>
                <TrendingUp className={`h-8 w-8 ${totalReturn >= 0 ? "text-green-400" : "text-red-400"}`} />
              </div>
            </CardContent>
          </Card>
          <Card className="vox-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Winners</p>
                  <p className="text-2xl font-bold font-mono text-green-400">{winners.length}</p>
                </div>
                <Award className="h-8 w-8 text-green-400" />
              </div>
              <p className="text-xs text-green-400 mt-2">+${winnerPnl.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="vox-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Losers</p>
                  <p className="text-2xl font-bold font-mono text-red-400">{losers.length}</p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-400" />
              </div>
              <p className="text-xs text-red-400 mt-2">${loserPnl.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        {/* Broker Performance */}
        <Card className="vox-card mb-8">
          <CardHeader>
            <CardTitle>Performance by Broker</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(brokerPnl)
                .sort((a: any, b: any) => b[1].pnl - a[1].pnl)
                .map(([broker, data]) => (
                  <div key={broker} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <span className="font-semibold">{broker}</span>
                      <span className="text-xs text-muted-foreground ml-2">{data.positions} positions</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono">${data.value.toLocaleString()}</span>
                      <span className={`ml-2 text-sm ${data.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {data.pnl >= 0 ? "+" : ""}${data.pnl.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Winners & Losers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="vox-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-400" />
                Top Winners
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {topWinners.map((p: any) => (
                  <div key={`${p.ticker}-${p.broker}`} className="flex items-center justify-between p-2 bg-green-500/10 rounded">
                    <div>
                      <span className="font-semibold text-sm">{p.ticker}</span>
                      <span className="text-xs text-muted-foreground ml-2">{p.broker}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-green-400 text-sm">+${(p.unrealized_pnl || 0).toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground ml-2">({p.unrealized_pnl_pct?.toFixed(1)}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="vox-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-400" />
                Top Losers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {topLosers.map((p: any) => (
                  <div key={`${p.ticker}-${p.broker}`} className="flex items-center justify-between p-2 bg-red-500/10 rounded">
                    <div>
                      <span className="font-semibold text-sm">{p.ticker}</span>
                      <span className="text-xs text-muted-foreground ml-2">{p.broker}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-red-400 text-sm">${(p.unrealized_pnl || 0).toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground ml-2">({p.unrealized_pnl_pct?.toFixed(1)}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </PageShell>
  );
}
