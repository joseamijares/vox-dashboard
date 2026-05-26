"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MobileHeader } from "@/components/mobile-header";
import { Sidebar } from "@/components/sidebar";
import { positions, getTotalValue, dashboardMeta } from "@/lib/data";
import { AlertTriangle, Bell, TrendingDown, TrendingUp, Shield } from "lucide-react";

export default function AlertsPage() {
  const totalValue = getTotalValue();
  
  // Generate REAL alerts from portfolio data
  const sellAlerts = positions
    .filter((p: any) => (p.grade || 0) > 0 && (p.grade || 0) < 50)
    .sort((a: any, b: any) => b.value - a.value);
  
  const trimAlerts = positions
    .filter((p: any) => (p.grade || 0) >= 50 && (p.grade || 0) < 55)
    .sort((a: any, b: any) => b.value - a.value);
  
  const bigLosers = positions
    .filter((p: any) => (p.pnl || 0) < -500)
    .sort((a: any, b: any) => a.pnl - b.pnl);
  
  const cryptoPositions = positions.filter((p: any) => 
    ["BTC", "ETH", "BNB", "SOL", "DOGE", "XRP", "ADA", "TRX", "SUI"].includes(p.ticker)
  );
  const cryptoValue = cryptoPositions.reduce((s: number, p: any) => s + p.value, 0);
  const cryptoPct = (cryptoValue / totalValue) * 100;
  
  const fmt = (n: number) => `$${Math.round(n).toLocaleString()}`;

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader />
      <Sidebar />
      <main className="pt-14 lg:pt-0 lg:ml-64 p-4 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Alerts</h1>
          <p className="text-muted-foreground text-sm">
            Actionable alerts generated from your portfolio — no noise
          </p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <Card className={`vox-card ${sellAlerts.length > 0 ? "border-red-500/30" : ""}`}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">SELL Now</p>
              <p className="text-2xl font-bold font-mono text-red-400">{sellAlerts.length}</p>
            </CardContent>
          </Card>
          <Card className={`vox-card ${trimAlerts.length > 0 ? "border-orange-500/30" : ""}`}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">TRIM</p>
              <p className="text-2xl font-bold font-mono text-orange-400">{trimAlerts.length}</p>
            </CardContent>
          </Card>
          <Card className={`vox-card ${bigLosers.length > 0 ? "border-yellow-500/30" : ""}`}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Big Losers</p>
              <p className="text-2xl font-bold font-mono text-yellow-400">{bigLosers.length}</p>
            </CardContent>
          </Card>
          <Card className={`vox-card ${cryptoPct > 10 ? "border-red-500/30" : ""}`}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Crypto %</p>
              <p className="text-2xl font-bold font-mono">{cryptoPct.toFixed(1)}%</p>
            </CardContent>
          </Card>
        </div>

        {/* SELL Alerts */}
        {sellAlerts.length > 0 && (
          <Card className="vox-card border-red-500/30 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-400">
                <AlertTriangle className="h-5 w-5" />
                SELL Immediately — Grade &lt; 50
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sellAlerts.map((p: any) => (
                  <div key={p.ticker} className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg">
                    <div>
                      <span className="font-semibold">{p.ticker}</span>
                      <span className="text-xs text-muted-foreground ml-2">{p.brokers?.join(", ")}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono">{fmt(p.value)}</span>
                      <Badge variant="destructive" className="ml-2">Grade {p.grade}</Badge>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Cash freed: {fmt(sellAlerts.reduce((s: number, p: any) => s + p.value, 0))}
              </p>
            </CardContent>
          </Card>
        )}

        {/* TRIM Alerts */}
        {trimAlerts.length > 0 && (
          <Card className="vox-card border-orange-500/30 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-400">
                <TrendingDown className="h-5 w-5" />
                TRIM — Grade 50-54
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {trimAlerts.map((p: any) => (
                  <div key={p.ticker} className="flex items-center justify-between p-3 bg-orange-500/10 rounded-lg">
                    <div>
                      <span className="font-semibold">{p.ticker}</span>
                      <span className="text-xs text-muted-foreground ml-2">{p.brokers?.join(", ")}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono">{fmt(p.value)}</span>
                      <Badge className="ml-2 bg-orange-500/20 text-orange-400">Grade {p.grade}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Big Losers */}
        {bigLosers.length > 0 && (
          <Card className="vox-card border-yellow-500/30 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-400">
                <TrendingDown className="h-5 w-5" />
                Big Losers (&gt; $500 loss)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {bigLosers.map((p: any) => (
                  <div key={p.ticker} className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg">
                    <div>
                      <span className="font-semibold">{p.ticker}</span>
                      <span className="text-xs text-muted-foreground ml-2">{p.brokers?.join(", ")}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono">{fmt(p.value)}</span>
                      <span className="text-red-400 ml-2">{fmt(p.pnl)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Crypto Limit */}
        {cryptoPct > 10 && (
          <Card className="vox-card border-red-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-400">
                <Shield className="h-5 w-5" />
                Crypto Over Limit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Crypto is {cryptoPct.toFixed(1)}% of portfolio (limit: 10%). Consider trimming.
              </p>
              <div className="space-y-2">
                {cryptoPositions.sort((a: any, b: any) => b.value - a.value).map((p: any) => (
                  <div key={p.ticker} className="flex justify-between p-2 bg-muted/30 rounded">
                    <span>{p.ticker}</span>
                    <span className="font-mono">{fmt(p.value)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {sellAlerts.length === 0 && trimAlerts.length === 0 && bigLosers.length === 0 && cryptoPct <= 10 && (
          <Card className="vox-card">
            <CardContent className="p-8 text-center">
              <Bell className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <p className="text-lg font-semibold text-green-400">All Clear</p>
              <p className="text-sm text-muted-foreground mt-2">
                No alerts. Portfolio looks healthy.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
