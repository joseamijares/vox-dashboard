"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MobileHeader } from "@/components/mobile-header";
import { Sidebar } from "@/components/sidebar";
import { positions, getTotalValue } from "@/lib/data";
import { Flag, AlertTriangle, TrendingDown, TrendingUp, Minus, Target } from "lucide-react";

// Portfolio exposure by policy-sensitive sectors
function getPortfolioExposure() {
  const exposure = [
    { sector: "Semiconductors", tickers: ["NVDA", "AMD", "TSM", "AVGO"], risk: "HIGH" as const },
    { sector: "Crypto", tickers: ["BTC", "ETH", "SOL", "DOGE", "XRP", "ADA"], risk: "MEDIUM" as const },
    { sector: "Healthcare", tickers: ["OSCR", "SPRB", "HUMA"], risk: "MEDIUM" as const },
    { sector: "Energy", tickers: ["XLE", "VST", "CEG"], risk: "MEDIUM" as const },
    { sector: "Financials", tickers: ["JPM", "BAC", "C", "NEWT"], risk: "LOW" as const },
    { sector: "EV/Auto", tickers: ["TSLA"], risk: "MEDIUM" as const },
  ];

  return exposure.map((exp) => {
    const matching = positions.filter((p: any) => exp.tickers.includes(p.ticker));
    const value = matching.reduce((s: number, p: any) => s + p.value, 0);
    return { ...exp, value, matching };
  }).filter((e) => e.value > 0).sort((a: any, b: any) => b.value - a.value);
}

// Simulated Trump events (in production, this comes from trump_tracker.py)
const trumpEvents = [
  {
    date: "2026-05-20",
    event: "Tariff announcement on semiconductors",
    impact: "NEGATIVE" as const,
    affected: ["NVDA", "AMD", "TSM", "AVGO"],
    severity: 7,
    action: "Watch TSM — may gap down. Consider protective stop.",
  },
  {
    date: "2026-05-15",
    event: "Crypto regulatory clarity",
    impact: "POSITIVE" as const,
    affected: ["BTC", "ETH", "COIN"],
    severity: 6,
    action: "BTC/ETH may rally. Monitor for breakout entry.",
  },
  {
    date: "2026-05-10",
    event: "Healthcare deregulation push",
    impact: "MIXED" as const,
    affected: ["OSCR", "SPRB"],
    severity: 4,
    action: "Hold. Mixed impact on small-cap healthcare.",
  },
  {
    date: "2026-05-05",
    event: "Energy independence executive order",
    impact: "POSITIVE" as const,
    affected: ["XLE", "VST", "CEG"],
    severity: 8,
    action: "XLE/CEG bullish. Consider adding on dips.",
  },
];

export default function TrumpPage() {
  const exposure = getPortfolioExposure();
  const totalValue = getTotalValue();

  const fmt = (n: number) => `$${Math.round(n).toLocaleString()}`;

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader />
      <Sidebar />
      <main className="pt-14 lg:pt-0 lg:ml-64 p-4 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Trump Tracker</h1>
          <p className="text-muted-foreground text-sm">
            Policy events affecting your portfolio + suggested actions
          </p>
        </div>

        {/* Portfolio Exposure */}
        <Card className="vox-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-red-400" />
              Your Portfolio Policy Exposure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {exposure.map((exp: any) => (
                <div key={exp.sector} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <span className="font-semibold">{exp.sector}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {exp.matching.map((p: any) => p.ticker).join(", ")}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono">{fmt(exp.value)}</span>
                    <Badge
                      variant="outline"
                      className={`ml-2 ${
                        exp.risk === "HIGH"
                          ? "bg-red-500/20 text-red-400 border-red-500/30"
                          : exp.risk === "MEDIUM"
                          ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                          : "bg-green-500/20 text-green-400 border-green-500/30"
                      }`}
                    >
                      {exp.risk} RISK
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Event Timeline */}
        <Card className="vox-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              Policy Events + Action Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trumpEvents.map((event, i) => (
                <div key={i} className="flex gap-4 p-4 bg-muted/30 rounded-lg">
                  <div className="flex-shrink-0">
                    {event.impact === "POSITIVE" ? (
                      <TrendingUp className="h-5 w-5 text-green-400" />
                    ) : event.impact === "NEGATIVE" ? (
                      <TrendingDown className="h-5 w-5 text-red-400" />
                    ) : (
                      <Minus className="h-5 w-5 text-yellow-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold">{event.event}</span>
                      <span className="text-xs text-muted-foreground">{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs">Affected:</span>
                      {event.affected.map((ticker) => (
                        <Badge key={ticker} variant="outline" className="text-xs">
                          {ticker}
                        </Badge>
                      ))}
                      <Badge
                        variant="outline"
                        className={`text-xs ml-auto ${
                          event.severity >= 7
                            ? "bg-red-500/20 text-red-400 border-red-500/30"
                            : event.severity >= 4
                            ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                            : "bg-green-500/20 text-green-400 border-green-500/30"
                        }`}
                      >
                        Severity {event.severity}/10
                      </Badge>
                    </div>
                    <div className="p-2 bg-primary/10 rounded flex items-start gap-2">
                      <Target className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{event.action}</span>
                    </div>
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
