"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MobileHeader } from "@/components/mobile-header";
import { Sidebar } from "@/components/sidebar";
import { positions, getTotalValue, getGradeBuckets } from "@/lib/data";
import { RefreshCw, TrendingDown, TrendingUp, Minus } from "lucide-react";

export default function RebalancingPage() {
  const totalValue = getTotalValue();
  const buckets = getGradeBuckets();

  // Categorize by grade
  const strongBuy = positions.filter((p: any) => (p.grade || 0) >= 70);
  const buy = positions.filter((p: any) => (p.grade || 0) >= 60 && (p.grade || 0) < 70);
  const hold = positions.filter((p: any) => (p.grade || 0) >= 50 && (p.grade || 0) < 60);
  const weakHold = positions.filter((p: any) => (p.grade || 0) >= 40 && (p.grade || 0) < 50);
  const sell = positions.filter((p: any) => (p.grade || 0) > 0 && (p.grade || 0) < 40);

  const sellCandidates = [...weakHold, ...sell].sort((a: any, b: any) => b.value - a.value);
  const sellTotal = sellCandidates.reduce((s: number, p: any) => s + p.value, 0);

  const fmt = (n: number) => `$${Math.round(n).toLocaleString()}`;

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader />
      <Sidebar />
      <main className="pt-14 lg:pt-0 lg:ml-64 p-4 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Rebalancing</h1>
          <p className="text-muted-foreground text-sm">
            Grade-based rebalancing — sell weak, add to strong
          </p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="vox-card">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Portfolio</p>
              <p className="text-2xl font-bold font-mono">{fmt(totalValue)}</p>
            </CardContent>
          </Card>
          <Card className="vox-card border-red-500/30">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">SELL / TRIM</p>
              <p className="text-2xl font-bold font-mono text-red-400">{fmt(sellTotal)}</p>
              <p className="text-xs text-muted-foreground mt-2">{sellCandidates.length} positions</p>
            </CardContent>
          </Card>
          <Card className="vox-card border-green-500/30">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Strong Core</p>
              <p className="text-2xl font-bold font-mono text-green-400">
                {fmt(strongBuy.reduce((s: number, p: any) => s + p.value, 0))}
              </p>
              <p className="text-xs text-muted-foreground mt-2">{strongBuy.length} positions</p>
            </CardContent>
          </Card>
        </div>

        {/* Execution Plan */}
        <Card className="vox-card border-yellow-500/30 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-yellow-400" />
              Execution Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-red-400 mb-2">Step 1: SELL These</h4>
                <div className="space-y-2">
                  {sellCandidates.slice(0, 10).map((p: any) => (
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
                <p className="text-sm text-muted-foreground mt-3">
                  Cash freed: {fmt(sellTotal)}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-green-400 mb-2">Step 2: Add To These (Grade 70+)</h4>
                <div className="space-y-2">
                  {strongBuy.map((p: any) => (
                    <div key={p.ticker} className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                      <div>
                        <span className="font-semibold">{p.ticker}</span>
                        <span className="text-xs text-muted-foreground ml-2">{p.brokers?.join(", ")}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono">{fmt(p.value)}</span>
                        <Badge className="ml-2 bg-green-500/20 text-green-400">Grade {p.grade}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grade Distribution */}
        <Card className="vox-card">
          <CardHeader>
            <CardTitle>Grade Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {buckets.map((b) => (
                <div key={b.name} className="p-3 rounded-lg text-center" style={{ backgroundColor: `${b.color}20`, border: `1px solid ${b.color}40` }}>
                  <p className="text-xs" style={{ color: b.color }}>{b.name}</p>
                  <p className="text-2xl font-bold font-mono">{b.count}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
