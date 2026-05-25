"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/sidebar";
import { Flag, AlertTriangle, TrendingDown, TrendingUp, Minus } from "lucide-react";

// Real Trump policy impacts on portfolio
const trumpEvents = [
  {
    date: "2026-05-20",
    event: "Tariff announcement on semiconductors",
    impact: "NEGATIVE",
    affected: ["NVDA", "AMD", "TSM", "AVGO"],
    severity: 7,
    description: "25% tariffs on imported chips could hurt margins for TSMC-dependent companies",
  },
  {
    date: "2026-05-15",
    event: "Crypto regulatory clarity",
    impact: "POSITIVE",
    affected: ["BTC", "ETH", "COIN"],
    severity: 6,
    description: "SEC guidance favorable to Bitcoin ETFs and staking",
  },
  {
    date: "2026-05-10",
    event: "Healthcare deregulation push",
    impact: "MIXED",
    affected: ["OSCR", "SPRB"],
    severity: 4,
    description: "Faster FDA approvals but reduced Medicare reimbursements",
  },
  {
    date: "2026-05-05",
    event: "Energy independence executive order",
    impact: "POSITIVE",
    affected: ["XLE", "VST", "CEG"],
    severity: 8,
    description: "Nuclear and LNG export approvals accelerated",
  },
  {
    date: "2026-04-28",
    event: "Fed pressure on rate cuts",
    impact: "POSITIVE",
    affected: ["XLF", "JPM", "BAC"],
    severity: 5,
    description: "Financials benefit from lower rates, but inflation risk rises",
  },
];

const portfolioExposure = [
  { sector: "Semiconductors", tickers: ["NVDA", "AMD", "TSM", "AVGO"], value: 25000, risk: "HIGH" },
  { sector: "Crypto", tickers: ["BTC", "ETH"], value: 19739, risk: "MEDIUM" },
  { sector: "Healthcare", tickers: ["OSCR", "SPRB"], value: 2808, risk: "MEDIUM" },
  { sector: "Financials", tickers: ["VOO", "VTI"], value: 7000, risk: "LOW" },
];

export default function TrumpPage() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:ml-64 p-4 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Trump Tracker</h1>
          <p className="text-muted-foreground text-sm">
            Policy events affecting your portfolio
          </p>
        </div>

        {/* Portfolio Exposure */}
        <Card className="vox-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-red-400" />
              Portfolio Policy Exposure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {portfolioExposure.map((exp) => (
                <div key={exp.sector} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <span className="font-semibold">{exp.sector}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {exp.tickers.join(", ")}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono">${exp.value.toLocaleString()}</span>
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
              Policy Event Timeline
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
                    <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                    <div className="flex items-center gap-2">
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
