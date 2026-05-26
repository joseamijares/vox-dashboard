"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MobileHeader } from "@/components/mobile-header";
import { Sidebar } from "@/components/sidebar";
import { positions } from "@/lib/data";
import { Shield, AlertTriangle, TrendingDown, Wallet } from "lucide-react";

export default function RiskPage() {
  const totalValue = positions.reduce((s: number, p: any) => s + p.value, 0);

  // Risk metrics
  const cryptoValue = positions
    .filter((p: any) => p.broker === "Binance" || ["BTC", "ETH", "BNB", "SOL", "DOGE", "XRP", "TRX"].includes(p.ticker))
    .reduce((s: number, p: any) => s + p.value, 0);
  const cryptoPct = (cryptoValue / totalValue) * 100;

  const etoroValue = positions
    .filter((p: any) => p.broker === "eToro")
    .reduce((s: number, p: any) => s + p.value, 0);
  const etoroPct = (etoroValue / totalValue) * 100;

  // Concentration risk - top 5 positions
  const sorted = [...positions].sort((a: any, b: any) => b.value - a.value);
  const top5 = sorted.slice(0, 5);
  const top5Value = top5.reduce((s: number, p: any) => s + p.value, 0);
  const top5Pct = (top5Value / totalValue) * 100;

  // SELL candidates (grade < 55)
  const sellCandidates = positions.filter((p: any) => (p.grade || 0) > 0 && (p.grade || 0) < 55);
  const sellValue = sellCandidates.reduce((s: number, p: any) => s + p.value, 0);

  // Negative P&L positions
  const losers = positions.filter((p: any) => (p.unrealized_pnl || 0) < -50);
  const loserValue = losers.reduce((s: number, p: any) => s + p.value, 0);
  const totalLoss = losers.reduce((s: number, p: any) => s + (p.unrealized_pnl || 0), 0);

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader />
      <Sidebar />
      <main className="pt-14 lg:pt-0 lg:ml-64 p-4 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Risk Management</h1>
          <p className="text-muted-foreground text-sm">Portfolio risk metrics and exposure analysis</p>
        </div>

        {/* Kill Switches */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className={`vox-card ${cryptoPct > 10 ? "border-red-500/50" : ""}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Crypto Allocation</p>
                  <p className="text-2xl font-bold font-mono">{cryptoPct.toFixed(1)}%</p>
                </div>
                <Shield className={`h-8 w-8 ${cryptoPct > 10 ? "text-red-400" : "text-green-400"}`} />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Limit: 10% | ${cryptoValue.toLocaleString()}</p>
              {cryptoPct > 10 && (
                <Badge variant="destructive" className="mt-2">OVER LIMIT</Badge>
              )}
            </CardContent>
          </Card>

          <Card className="vox-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">eToro Concentration</p>
                  <p className="text-2xl font-bold font-mono">{etoroPct.toFixed(1)}%</p>
                </div>
                <Wallet className="h-8 w-8 text-blue-400" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">${etoroValue.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card className={`vox-card ${top5Pct > 40 ? "border-yellow-500/50" : ""}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Top 5 Concentration</p>
                  <p className="text-2xl font-bold font-mono">{top5Pct.toFixed(1)}%</p>
                </div>
                <AlertTriangle className={`h-8 w-8 ${top5Pct > 40 ? "text-yellow-400" : "text-green-400"}`} />
              </div>
              <p className="text-xs text-muted-foreground mt-2">${top5Value.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card className={`vox-card ${losers.length > 0 ? "border-red-500/50" : ""}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Losers &gt; $50</p>
                  <p className="text-2xl font-bold font-mono text-red-400">{losers.length}</p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-400" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Unrealized: ${totalLoss.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        {/* SELL Candidates */}
        <Card className="vox-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              SELL Candidates (Grade &lt; 55)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Total value at risk: ${sellValue.toLocaleString()} across {sellCandidates.length} positions
            </p>
            <div className="space-y-2">
              {sellCandidates
                .sort((a: any, b: any) => b.value - a.value)
                .slice(0, 15)
                .map((p: any) => (
                  <div
                    key={`${p.ticker}-${p.broker}`}
                    className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/20"
                  >
                    <div>
                      <span className="font-semibold">{p.ticker}</span>
                      <span className="text-xs text-muted-foreground ml-2">{p.broker}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono">${p.value.toLocaleString()}</span>
                      <Badge variant="destructive" className="ml-2 text-xs">
                        Grade {p.grade}
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Losers */}
        {losers.length > 0 && (
          <Card className="vox-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-400" />
                Significant Losers (&gt; $50 loss)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {losers
                  .sort((a: any, b: any) => (a.unrealized_pnl || 0) - (b.unrealized_pnl || 0))
                  .map((p: any) => (
                    <div
                      key={`${p.ticker}-${p.broker}`}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                    >
                      <div>
                        <span className="font-semibold">{p.ticker}</span>
                        <span className="text-xs text-muted-foreground ml-2">{p.broker}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono">${p.value.toLocaleString()}</span>
                        <span className="text-red-400 text-sm ml-2">
                          ${(p.unrealized_pnl || 0).toLocaleString()} ({p.unrealized_pnl_pct?.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
