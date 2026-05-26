"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MobileHeader } from "@/components/mobile-header";
import { Sidebar } from "@/components/sidebar";
import { positions, getTotalValue, dashboardMeta } from "@/lib/data";
import { PieChart, TrendingUp, TrendingDown, Activity, Globe } from "lucide-react";

export default function SectorMacroPage() {
  const totalValue = getTotalValue();

  // Aggregate by sector
  const sectorMap: Record<string, { value: number; pnl: number; positions: number; tickers: string[] }> = {};

  positions.forEach((p: any) => {
    const sector = p.sector || "Other";
    if (!sectorMap[sector]) {
      sectorMap[sector] = { value: 0, pnl: 0, positions: 0, tickers: [] };
    }
    sectorMap[sector].value += p.value;
    sectorMap[sector].pnl += p.pnl || 0;
    sectorMap[sector].positions += 1;
    if (!sectorMap[sector].tickers.includes(p.ticker)) {
      sectorMap[sector].tickers.push(p.ticker);
    }
  });

  const sectors = Object.entries(sectorMap)
    .map(([name, data]) => ({ name, ...data, pct: (data.value / totalValue) * 100 }))
    .sort((a: any, b: any) => b.value - a.value);

  const fmt = (n: number) => `$${Math.round(n).toLocaleString()}`;

  // Macro indicators
  const macroIndicators = [
    { name: "Fed Policy", value: "5.25% (HOLD)", trend: "neutral", impact: "Rates stable" },
    { name: "CPI YoY", value: "3.2%", trend: "down", impact: "Cooling" },
    { name: "Unemployment", value: "3.9%", trend: "neutral", impact: "Stable" },
    { name: "10Y Treasury", value: "4.42%", trend: "up", impact: "Rates rising" },
    { name: "VIX", value: "16.2", trend: "down", impact: "Low fear" },
    { name: "USD/MXN", value: dashboardMeta.usdMxnRate.toFixed(2), trend: "neutral", impact: "Stable" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader />
      <Sidebar />
      <main className="pt-14 lg:pt-0 lg:ml-64 p-4 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Sector & Macro</h1>
          <p className="text-muted-foreground text-sm">
            Portfolio allocation by sector + macro environment
          </p>
        </div>

        {/* Sector Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <Card className="vox-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Sectors</p>
              <p className="text-xl font-bold font-mono">{sectors.length}</p>
            </CardContent>
          </Card>
          <Card className="vox-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Top Sector</p>
              <p className="text-lg font-bold font-mono">{sectors[0]?.name}</p>
            </CardContent>
          </Card>
          <Card className="vox-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Top Sector %</p>
              <p className="text-xl font-bold font-mono">{sectors[0]?.pct.toFixed(1)}%</p>
            </CardContent>
          </Card>
          <Card className="vox-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Sector P&L</p>
              <p className="text-xl font-bold font-mono text-green-400">
                +{fmt(sectors.reduce((s, x) => s + x.pnl, 0))}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sector Breakdown */}
          <Card className="vox-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary" />
                Sector Allocation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sectors.map((s) => (
                  <div key={s.name}>
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <span className="font-semibold">{s.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {s.positions} pos, {s.tickers.length} tickers
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono">{fmt(s.value)}</span>
                        <span className="text-xs text-muted-foreground ml-2">{s.pct.toFixed(1)}%</span>
                      </div>
                    </div>
                    <Progress value={s.pct} className="h-2" />
                    <div className="flex items-center gap-1 mt-1">
                      {s.pnl >= 0 ? (
                        <TrendingUp className="h-3 w-3 text-green-400" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-400" />
                      )}
                      <span className={`text-xs ${s.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {s.pnl >= 0 ? "+" : ""}{fmt(s.pnl)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Macro Environment */}
          <Card className="vox-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Macro Environment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {macroIndicators.map((ind) => (
                  <div key={ind.name} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <span className="font-semibold text-sm">{ind.name}</span>
                      <p className="text-xs text-muted-foreground">{ind.impact}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono">{ind.value}</span>
                      <Badge
                        variant="outline"
                        className={`ml-2 text-xs ${
                          ind.trend === "up"
                            ? "bg-green-500/20 text-green-400"
                            : ind.trend === "down"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {ind.trend}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-green-400" />
                  <span className="font-semibold text-green-400">Market Regime: EARLY_BULL</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Buy pullbacks in quality. Tight stops. Cash target 15-20%.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
