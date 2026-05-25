"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Sidebar } from "@/components/sidebar";
import {
  getPortfolioSummary,
  getPositions,
  getMonitoredPlays,
  getDailyBrief,
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
  const summary = getPortfolioSummary();
  const positions = getPositions();
  const plays = getMonitoredPlays();
  const brief = getDailyBrief();

  const sellPositions = positions.filter((p) => p.action === "SELL" || p.action === "CUT");
  const trimPositions = positions.filter((p) => p.action === "TRIM");
  const buyPositions = positions.filter((p) => p.action === "BUY");

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:ml-64 p-4 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground text-sm">
              Memorial Day — Markets Closed. Execute Tuesday May 27.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="destructive" className="animate-pulse">
              🔥 REBALANCE: TUE MAY 27
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
                    ${summary.totalAum.toLocaleString()}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-3 w-3 text-green-400" />
                <span className="text-xs text-green-400">
                  +${summary.totalPnl.toLocaleString()} (+{summary.pnlPercent}%)
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="vox-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Cash Position</p>
                  <p className="text-2xl font-bold font-mono text-blue-400">
                    ${summary.cash.toLocaleString()}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-blue-400" />
                </div>
              </div>
              <div className="mt-2">
                <Progress value={summary.cashPercent} className="h-1.5" />
                <p className="text-xs text-muted-foreground mt-1">
                  {summary.cashPercent}% (Target: 15-20%)
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="vox-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Grade</p>
                  <p className="text-2xl font-bold font-mono text-green-400">
                    {summary.avgGrade}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-green-400" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                +9 after rebalance
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

        {/* Rebalance Plan */}
        <Card className="vox-card mb-8 border-red-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="h-5 w-5" />
              REBALANCE PLAN — EXECUTE TUESDAY MAY 27
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* SELL */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-red-400 flex items-center gap-2">
                  <TrendingDown className="h-4 w-4" />
                  SELL (Grade &lt; 50)
                </h3>
                <div className="space-y-1 text-sm">
                  {sellPositions.map((p) => (
                    <div key={p.ticker} className="flex justify-between">
                      <span>{p.ticker}</span>
                      <span className="font-mono text-muted-foreground">
                        {p.shares} @ ${p.currentPrice}
                      </span>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-red-400">
                  <span>Total</span>
                  <span className="font-mono">
                    ${sellPositions.reduce((s, p) => s + p.value, 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* TRIM */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-amber-400 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  TRIM (Take Profits)
                </h3>
                <div className="space-y-1 text-sm">
                  {trimPositions.map((p) => (
                    <div key={p.ticker} className="flex justify-between">
                      <span>{p.ticker}</span>
                      <span className="font-mono text-muted-foreground">
                        {p.shares} @ ${p.currentPrice}
                      </span>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-amber-400">
                  <span>Total</span>
                  <span className="font-mono">
                    ${trimPositions.reduce((s, p) => s + p.value, 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* BUY */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-green-400 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  BUY (Deploy Capital)
                </h3>
                <div className="space-y-1 text-sm">
                  {buyPositions.map((p) => (
                    <div key={p.ticker} className="flex justify-between">
                      <span>{p.ticker}</span>
                      <span className="font-mono text-muted-foreground">
                        {p.shares} @ ${p.currentPrice}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between">
                    <span>NVDA (ADD)</span>
                    <span className="font-mono text-muted-foreground">78 @ $215.33</span>
                  </div>
                  <div className="flex justify-between">
                    <span>XLF (ADD)</span>
                    <span className="font-mono text-muted-foreground">325 @ $51.94</span>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-green-400">
                  <span>Total</span>
                  <span className="font-mono">$56,026</span>
                </div>
              </div>

              {/* CASH */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-blue-400 flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Cash Position
                </h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Starting</span>
                    <span className="font-mono">$56,000</span>
                  </div>
                  <div className="flex justify-between text-green-400">
                    <span>+ Sells</span>
                    <span className="font-mono">+$23,629</span>
                  </div>
                  <div className="flex justify-between text-green-400">
                    <span>+ Trims</span>
                    <span className="font-mono">+$63,286</span>
                  </div>
                  <div className="flex justify-between text-red-400">
                    <span>- Buys</span>
                    <span className="font-mono">-$56,026</span>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-blue-400">
                  <span>Final</span>
                  <span className="font-mono">$86,890 (30.8%)</span>
                </div>
              </div>
            </div>

            {/* Checklist */}
            <div className="mt-6 p-4 bg-muted/30 rounded-lg">
              <h4 className="text-sm font-semibold mb-3">Execution Checklist</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                {[
                  "SELL JMIA 200 @ market — eToro",
                  "SELL BILL 50 @ market — eToro",
                  "SELL INDA 150 @ market — Schwab",
                  "SELL EWZ 100 @ market — Schwab",
                  "SELL FXI 120 @ market — Schwab",
                  "SELL OKLO 80 @ market — Schwab",
                  "TRIM BTC 0.38 @ market — Binance",
                  "TRIM RKLB 75 @ market — Schwab",
                  "TRIM VST 40 @ market — Schwab",
                  "TRIM NET 17 @ market — eToro",
                  "TRIM ANET 20 @ market — Schwab",
                  "NEW CEG 76 @ limit $294 — Schwab",
                  "ADD NVDA 78 @ limit $215 — Schwab",
                  "ADD XLF 325 @ limit $51.94 — Schwab",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border border-muted-foreground/30" />
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
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
                {plays.slice(0, 5).map((play) => (
                  <div
                    key={play.ticker}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  >
                    <div>
                      <div className="font-semibold">{play.ticker}</div>
                      <div className="text-xs text-muted-foreground">
                        Target: ${play.entryTarget} | Stop: ${play.stopLoss}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono">${play.currentPrice}</div>
                      <Badge
                        variant={
                          play.alertStatus === "TRIGGERED"
                            ? "default"
                            : play.alertStatus === "NEAR"
                            ? "secondary"
                            : "outline"
                        }
                        className="text-xs"
                      >
                        {play.alertStatus}
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
                    {brief.alerts.map((alert, i) => (
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
                    {brief.screenerSignals.map((sig, i) => (
                      <li key={i} className="text-muted-foreground">
                        • {sig}
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
                    {brief.checklist.map((item, i) => (
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
