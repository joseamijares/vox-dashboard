"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sidebar } from "@/components/sidebar";
import { positions } from "@/lib/data";
import { PieChart, TrendingUp, TrendingDown } from "lucide-react";

export default function SectorsPage() {
  // Aggregate by sector
  const sectorMap: Record<string, { value: number; pnl: number; positions: number; tickers: string[] }> = {};
  
  positions.forEach((p) => {
    let sector = p.sector || "Unknown";
    if (sector.startsWith("Copy:")) sector = "Copy Trading";
    else if (sector.startsWith("Copy Cash:")) sector = "Copy Trading";
    else if (sector === "Crypto") sector = "Cryptocurrency";
    else if (sector === "Self-Traded") sector = "eToro Self-Traded";
    else if (sector === "SIC Global") sector = "SIC Global (GBM)";
    else if (sector === "USA Direct") sector = "USA Direct (GBM)";
    else if (sector === "Mexico") sector = "Mexico (GBM)";
    
    if (!sectorMap[sector]) {
      sectorMap[sector] = { value: 0, pnl: 0, positions: 0, tickers: [] };
    }
    sectorMap[sector].value += p.value;
    sectorMap[sector].pnl += p.unrealized_pnl || 0;
    sectorMap[sector].positions += 1;
    if (!sectorMap[sector].tickers.includes(p.ticker)) {
      sectorMap[sector].tickers.push(p.ticker);
    }
  });

  const totalValue = Object.values(sectorMap).reduce((s, x) => s + x.value, 0);
  const sectors = Object.entries(sectorMap)
    .map(([name, data]) => ({ name, ...data, pct: (data.value / totalValue) * 100 }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:ml-64 p-4 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Sector Rotation</h1>
          <p className="text-muted-foreground text-sm">Portfolio allocation by sector</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="vox-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Sectors</p>
                  <p className="text-2xl font-bold font-mono">{sectors.length}</p>
                </div>
                <PieChart className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="vox-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Top Sector</p>
                  <p className="text-lg font-bold font-mono">{sectors[0]?.name}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-400" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">{sectors[0]?.pct.toFixed(1)}% of portfolio</p>
            </CardContent>
          </Card>
          <Card className="vox-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Sector P&L</p>
                  <p className="text-2xl font-bold font-mono text-green-400">
                    +${sectors.reduce((s, x) => s + x.pnl, 0).toLocaleString()}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sector List */}
        <Card className="vox-card">
          <CardHeader>
            <CardTitle>Sector Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {sectors.map((s) => (
                <div key={s.name}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-semibold">{s.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">({s.positions} positions, {s.tickers.length} tickers)</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono">${s.value.toLocaleString()}</span>
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
                      {s.pnl >= 0 ? "+" : ""}${s.pnl.toLocaleString()}
                    </span>
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
