"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/sidebar";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";

const forexPairs = [
  { pair: "USD/MXN", rate: 17.31, change: -0.15, trend: "DOWN", impact: "Peso strengthening — good for MXN purchases" },
  { pair: "USD/EUR", rate: 0.92, change: 0.02, trend: "UP", impact: "Dollar strength vs Euro" },
  { pair: "USD/CAD", rate: 1.36, change: 0.01, trend: "UP", impact: "Minor impact on portfolio" },
];

export default function ForexPage() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:ml-64 p-4 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Forex</h1>
          <p className="text-muted-foreground text-sm">Currency exposure and rates</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {forexPairs.map((f) => (
            <Card key={f.pair} className="vox-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">{f.pair}</span>
                  {f.trend === "UP" ? (
                    <TrendingUp className="h-5 w-5 text-green-400" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-400" />
                  )}
                </div>
                <p className="text-2xl font-bold font-mono">{f.rate}</p>
                <p className={`text-sm ${f.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {f.change >= 0 ? "+" : ""}{f.change}%
                </p>
                <p className="text-xs text-muted-foreground mt-2">{f.impact}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="vox-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Portfolio Currency Exposure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="font-semibold">USD-denominated</span>
                <span className="font-mono">~85% of portfolio</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="font-semibold">MXN-denominated (GBM)</span>
                <span className="font-mono">~15% of portfolio</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
