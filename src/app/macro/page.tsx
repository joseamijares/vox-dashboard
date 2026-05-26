"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MobileHeader } from "@/components/mobile-header";
import { Sidebar } from "@/components/sidebar";
import { TrendingUp, TrendingDown, DollarSign, Globe, Activity } from "lucide-react";

const macroIndicators = [
  { name: "Fed Funds Rate", value: "4.25%", trend: "HOLD", impact: "NEUTRAL", description: "No change expected at next meeting" },
  { name: "10Y Treasury", value: "4.42%", trend: "UP", impact: "NEGATIVE", description: "Rising yields pressure growth stocks" },
  { name: "USD/MXN", value: "17.31", trend: "DOWN", impact: "POSITIVE", description: "Peso strengthening vs USD" },
  { name: "VIX", value: "14.2", trend: "DOWN", impact: "POSITIVE", description: "Low volatility, complacency risk" },
  { name: "CPI YoY", value: "2.8%", trend: "DOWN", impact: "POSITIVE", description: "Inflation cooling toward 2% target" },
  { name: "GDP Growth", value: "2.1%", trend: "STABLE", impact: "NEUTRAL", description: "Moderate growth, no recession signals" },
];

const sectorRotation = [
  { sector: "Technology", momentum: "STRONG", leaders: ["NVDA", "MSFT", "GOOGL"], laggards: ["SNOW", "DDOG"] },
  { sector: "Semiconductors", momentum: "MIXED", leaders: ["TSM", "AVGO"], laggards: ["AMD"] },
  { sector: "Crypto", momentum: "STRONG", leaders: ["BTC", "ETH"], laggards: [] },
  { sector: "Healthcare", momentum: "WEAK", leaders: [], laggards: ["OSCR", "SPRB"] },
  { sector: "Financials", momentum: "STABLE", leaders: ["JPM", "XLF"], laggards: [] },
];

export default function MacroPage() {
  return (
    <div className="min-h-screen bg-background">
      <MobileHeader />
      <Sidebar />
      <main className="pt-14 lg:pt-0 lg:ml-64 p-4 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Macro Dashboard</h1>
          <p className="text-muted-foreground text-sm">Economic indicators and sector rotation</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {macroIndicators.map((ind) => (
            <Card key={ind.name} className="vox-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">{ind.name}</span>
                  {ind.trend === "UP" ? (
                    <TrendingUp className="h-4 w-4 text-green-400" />
                  ) : ind.trend === "DOWN" ? (
                    <TrendingDown className="h-4 w-4 text-red-400" />
                  ) : (
                    <Activity className="h-4 w-4 text-yellow-400" />
                  )}
                </div>
                <p className="text-2xl font-bold font-mono">{ind.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{ind.description}</p>
                <Badge
                  variant="outline"
                  className={`mt-2 text-xs ${
                    ind.impact === "POSITIVE"
                      ? "bg-green-500/20 text-green-400 border-green-500/30"
                      : ind.impact === "NEGATIVE"
                      ? "bg-red-500/20 text-red-400 border-red-500/30"
                      : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                  }`}
                >
                  {ind.impact}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="vox-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Sector Rotation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sectorRotation.map((s) => (
                <div key={s.sector} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <span className="font-semibold">{s.sector}</span>
                    <div className="flex gap-1 mt-1">
                      {s.leaders.map((t) => (
                        <Badge key={t} variant="outline" className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
                          {t}
                        </Badge>
                      ))}
                      {s.laggards.map((t) => (
                        <Badge key={t} variant="outline" className="text-xs bg-red-500/20 text-red-400 border-red-500/30">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`${
                      s.momentum === "STRONG"
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : s.momentum === "MIXED"
                        ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                        : s.momentum === "WEAK"
                        ? "bg-red-500/20 text-red-400 border-red-500/30"
                        : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                    }`}
                  >
                    {s.momentum}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
