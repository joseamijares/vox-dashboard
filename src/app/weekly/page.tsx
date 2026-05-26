"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MobileHeader } from "@/components/mobile-header";
import { Sidebar } from "@/components/sidebar";
import { positions } from "@/lib/data";
import { Calendar, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react";

export default function WeeklyPage() {
  const totalValue = positions.reduce((s: number, p: any) => s + p.value, 0);
  const totalPnl = positions.reduce((s: number, p: any) => s + (p.unrealized_pnl || 0), 0);

  // Top movers this week (simulated from P&L data)
  const movers = [...positions]
    .filter((p: any) => Math.abs(p.unrealized_pnl_pct || 0) > 5)
    .sort((a: any, b: any) => (b.unrealized_pnl_pct || 0) - (a.unrealized_pnl_pct || 0));

  const winners = movers.filter((p: any) => (p.unrealized_pnl_pct || 0) > 0).slice(0, 5);
  const losers = movers.filter((p: any) => (p.unrealized_pnl_pct || 0) < 0).slice(0, 5);

  // Alerts triggered
  const alerts = [
    { ticker: "NVDA", type: "EARNINGS", date: "May 28", action: "WATCH" },
    { ticker: "CRWD", type: "GRADE_UP", date: "May 27", action: "HOLD" },
    { ticker: "JMIA", type: "SELL_SIGNAL", date: "May 27", action: "SELL" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader />
      <Sidebar />
      <main className="pt-14 lg:pt-0 lg:ml-64 p-4 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Weekly Summary</h1>
          <p className="text-muted-foreground text-sm">Week of May 26 — June 1, 2026</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="vox-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Portfolio Value</p>
                  <p className="text-2xl font-bold font-mono">${totalValue.toLocaleString()}</p>
                </div>
                <Calendar className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="vox-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Week P&L</p>
                  <p className={`text-2xl font-bold font-mono ${totalPnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {totalPnl >= 0 ? "+" : ""}${totalPnl.toLocaleString()}
                  </p>
                </div>
                {totalPnl >= 0 ? <TrendingUp className="h-8 w-8 text-green-400" /> : <TrendingDown className="h-8 w-8 text-red-400" />}
              </div>
            </CardContent>
          </Card>
          <Card className="vox-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Alerts</p>
                  <p className="text-2xl font-bold font-mono text-yellow-400">{alerts.length}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="vox-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-400" />
                Top Weekly Gainers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {winners.map((p: any) => (
                  <div key={`${p.ticker}-${p.broker}`} className="flex items-center justify-between p-2 bg-green-500/10 rounded">
                    <span className="font-semibold text-sm">{p.ticker} <span className="text-muted-foreground">({p.broker})</span></span>
                    <span className="text-green-400 text-sm">+{p.unrealized_pnl_pct?.toFixed(1)}%</span>
                  </div>
                ))}
                {winners.length === 0 && <p className="text-sm text-muted-foreground">No significant gainers this week.</p>}
              </div>
            </CardContent>
          </Card>

          <Card className="vox-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-400" />
                Top Weekly Losers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {losers.map((p: any) => (
                  <div key={`${p.ticker}-${p.broker}`} className="flex items-center justify-between p-2 bg-red-500/10 rounded">
                    <span className="font-semibold text-sm">{p.ticker} <span className="text-muted-foreground">({p.broker})</span></span>
                    <span className="text-red-400 text-sm">{p.unrealized_pnl_pct?.toFixed(1)}%</span>
                  </div>
                ))}
                {losers.length === 0 && <p className="text-sm text-muted-foreground">No significant losers this week.</p>}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="vox-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              This Week's Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.map((a, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <span className="font-semibold">{a.ticker}</span>
                    <Badge variant="outline" className="ml-2 text-xs">{a.type}</Badge>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground">{a.date}</span>
                    <Badge className="ml-2 text-xs">{a.action}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
