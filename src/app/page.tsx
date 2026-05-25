"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Sidebar } from "@/components/sidebar";
import {
  portfolioSummary,
  positions,
  monitoredPlaysList,
  dailyBriefing,
  getTotalValue,
  getTotalPnL,
  getAvgGrade,
} from "@/lib/data";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  BarChart3,
  Target,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Eye,
} from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const summary = portfolioSummary;
  const allPositions = positions;
  const plays = monitoredPlaysList;
  const brief = dailyBriefing;

  const totalValue = getTotalValue();
  const totalPnl = getTotalPnL();
  const avgGrade = getAvgGrade();

  // Get top positions by value
  const topPositions = [...allPositions].sort((a, b) => b.value - a.value).slice(0, 10);

  // Calculate cash from unified portfolio
  const cash = summary.byBroker?.eToro?.value_usd * 0.15 || 12000; // Estimate 15% cash

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:ml-64 p-4 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground text-sm">
              {brief.date} — Markets Open
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              USD/MXN {summary.usdMXN}
            </Badge>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="vox-card vox-glow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total AUM</p>
                  <p className="text-2xl font-bold font-mono">
                    ${summary.totalAUM.toLocaleString()}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-3 w-3 text-green-400" />
                <span className="text-xs text-green-400">
                  +${totalPnl.toLocaleString()} YTD
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="vox-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">eToro Value</p>
                  <p className="text-2xl font-bold font-mono text-blue-400">
                    ${summary.byBroker?.eToro?.value_usd?.toLocaleString() || "N/A"}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-blue-400" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {summary.byBroker?.eToro?.pct_of_total || 0}% of portfolio
              </p>
            </CardContent>
          </Card>

          <Card className="vox-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Positions</p>
                  <p className="text-2xl font-bold font-mono text-green-400">
                    {allPositions.length}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-green-400" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Avg Grade: {avgGrade}
              </p>
            </CardContent>
          </Card>

          <Card className="vox-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Market Regime</p>
                  <p className="text-2xl font-bold font-mono text-green-400">
                    EARLY_BULL
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Target className="h-5 w-5 text-green-400" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Buy pullbacks, tight stops
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Top Holdings */}
        <Card className="vox-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              Top Holdings (Real Positions)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topPositions.map((p) => {
                const pnl = p.unrealized_pnl || p.pnl || 0;
                const pnlPct = p.unrealized_pnl_pct || p.pnlPct || 0;
                return (
                <div
                  key={`${p.ticker}-${p.broker}`}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="font-semibold">{p.ticker}</div>
                      <div className="text-xs text-muted-foreground">{p.name || p.broker}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono">${p.value.toLocaleString()}</div>
                    <div className={`text-xs ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {pnl >= 0 ? '+' : ''}${pnl.toLocaleString()} ({pnlPct >= 0 ? '+' : ''}{pnlPct}%)
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
            <Link
              href="/portfolio"
              className="text-sm text-primary hover:underline mt-4 block"
            >
              View all {allPositions.length} positions →
            </Link>
          </CardContent>
        </Card>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Monitored Plays */}
          <Card className="vox-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                Monitored Plays
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {plays.slice(0, 5).map((play: any) => (
                  <div
                    key={play.ticker}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  >
                    <div>
                      <div className="font-semibold">{play.ticker}</div>
                      <div className="text-xs text-muted-foreground">
                        Entry: ${play.entry_price} | Grade: {play.grade}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono">${play.current_price}</div>
                      <Badge
                        variant={play.urgency === "HIGH" ? "destructive" : "outline"}
                        className="text-xs"
                      >
                        {play.action}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/watchlist"
                className="text-sm text-primary hover:underline mt-4 block"
              >
                View all plays →
              </Link>
            </CardContent>
          </Card>

          {/* Daily Brief */}
          <Card className="vox-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Daily Brief — {brief.date}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-red-400 mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Alerts
                  </h4>
                  <ul className="space-y-1 text-sm">
                    {brief.alerts.map((alert: string, i: number) => (
                      <li key={i} className="text-muted-foreground">
                        • {alert}
                      </li>
                    ))}
                  </ul>
                </div>
                <Separator />
                <div>
                  <h4 className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Screener Signals
                  </h4>
                  <ul className="space-y-1 text-sm">
                    {brief.screener.map((sig: any, i: number) => (
                      <li key={i} className="text-muted-foreground">
                        • {sig.ticker}: {sig.signal} ({sig.confidence}%)
                      </li>
                    ))}
                  </ul>
                </div>
                <Separator />
                <div>
                  <h4 className="text-sm font-semibold text-blue-400 mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Action Checklist
                  </h4>
                  <ul className="space-y-1 text-sm">
                    {brief.checklist.map((item: string, i: number) => (
                      <li key={i} className="text-muted-foreground">
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <Link
                href="/briefing"
                className="text-sm text-primary hover:underline mt-4 block"
              >
                Full briefing →
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
