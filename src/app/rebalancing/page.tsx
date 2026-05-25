"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/sidebar";
import { positions } from "@/lib/data";
import { RefreshCw, TrendingDown, TrendingUp, Minus } from "lucide-react";

export default function RebalancingPage() {
  const totalValue = positions.reduce((s, p) => s + p.value, 0);

  // Categorize by grade
  const strongBuy = positions.filter((p) => (p.grade || 0) >= 70);
  const buy = positions.filter((p) => (p.grade || 0) >= 60 && (p.grade || 0) < 70);
  const hold = positions.filter((p) => (p.grade || 0) >= 50 && (p.grade || 0) < 60);
  const weakHold = positions.filter((p) => (p.grade || 0) >= 40 && (p.grade || 0) < 50);
  const sell = positions.filter((p) => (p.grade || 0) > 0 && (p.grade || 0) < 40);
  const ungraded = positions.filter((p) => (p.grade || 0) === 0);

  const categories = [
    { name: "Strong Buy (70+)", positions: strongBuy, color: "bg-green-500/20 text-green-400 border-green-500/30", icon: TrendingUp },
    { name: "Buy (60-69)", positions: buy, color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: TrendingUp },
    { name: "Hold (50-59)", positions: hold, color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: Minus },
    { name: "Weak Hold (40-49)", positions: weakHold, color: "bg-orange-500/20 text-orange-400 border-orange-500/30", icon: TrendingDown },
    { name: "Sell (<40)", positions: sell, color: "bg-red-500/20 text-red-400 border-red-500/30", icon: TrendingDown },
    { name: "Ungraded", positions: ungraded, color: "bg-gray-500/20 text-gray-400 border-gray-500/30", icon: Minus },
  ];

  // Calculate recommended actions
  const sellCandidates = [...weakHold, ...sell].sort((a, b) => b.value - a.value);
  const sellTotal = sellCandidates.reduce((s, p) => s + p.value, 0);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:ml-64 p-4 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Rebalancing</h1>
          <p className="text-muted-foreground text-sm">
            Grade-based portfolio rebalancing recommendations
          </p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="vox-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Portfolio Value</p>
                  <p className="text-2xl font-bold font-mono">${totalValue.toLocaleString()}</p>
                </div>
                <RefreshCw className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="vox-card border-red-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">SELL / TRIM Value</p>
                  <p className="text-2xl font-bold font-mono text-red-400">${sellTotal.toLocaleString()}</p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-400" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {sellCandidates.length} positions below grade 50
              </p>
            </CardContent>
          </Card>
          <Card className="vox-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Cash if Sold</p>
                  <p className="text-2xl font-bold font-mono text-green-400">
                    ${(totalValue * 0.15 + sellTotal).toLocaleString()}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-400" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Estimated 15% current cash</p>
            </CardContent>
          </Card>
        </div>

        {/* Grade Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {categories.map((cat) => (
            <Card key={cat.name} className="vox-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <cat.icon className="h-4 w-4" />
                  {cat.name}
                  <Badge variant="outline" className={`ml-auto ${cat.color}`}>
                    {cat.positions.length} positions
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-bold font-mono mb-3">
                  ${cat.positions.reduce((s, p) => s + p.value, 0).toLocaleString()}
                </p>
                {cat.positions.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {cat.positions
                      .sort((a, b) => b.value - a.value)
                      .slice(0, 10)
                      .map((p) => (
                        <div
                          key={`${p.ticker}-${p.broker}`}
                          className="flex items-center justify-between p-2 bg-muted/30 rounded"
                        >
                          <div>
                            <span className="font-semibold text-sm">{p.ticker}</span>
                            <span className="text-xs text-muted-foreground ml-2">{p.broker}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-mono text-sm">${p.value.toLocaleString()}</span>
                            <span className="text-xs text-muted-foreground ml-2">Grade {p.grade}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No positions in this category</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Execution Plan */}
        <Card className="vox-card border-yellow-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-yellow-400" />
              Suggested Execution Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-red-400 mb-2">Step 1: SELL / TRIM</h4>
                <div className="space-y-2">
                  {sellCandidates.slice(0, 10).map((p) => (
                    <div key={`${p.ticker}-${p.broker}`} className="flex items-center justify-between p-2 bg-red-500/10 rounded">
                      <span className="text-sm">{p.ticker} ({p.broker})</span>
                      <span className="font-mono text-sm">${p.value.toLocaleString()} — Grade {p.grade}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-green-400 mb-2">Step 2: REDEPLOY TO</h4>
                <p className="text-sm text-muted-foreground">
                  Top graded holdings: CRWD (65), AAPL (65), TSLA (64), NVDA (64), TSM (63)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
