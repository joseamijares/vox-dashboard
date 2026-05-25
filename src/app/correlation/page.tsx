"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/sidebar";
import { positions } from "@/lib/data";
import { GitBranch, AlertTriangle } from "lucide-react";

export default function CorrelationPage() {
  // Find duplicate tickers across brokers
  const tickerMap: Record<string, { broker: string; value: number }[]> = {};
  positions.forEach((p) => {
    if (!tickerMap[p.ticker]) tickerMap[p.ticker] = [];
    tickerMap[p.ticker].push({ broker: p.broker, value: p.value });
  });

  const duplicates = Object.entries(tickerMap)
    .filter(([_, entries]) => entries.length > 1)
    .sort((a, b) => b[1].reduce((s, e) => s + e.value, 0) - a[1].reduce((s, e) => s + e.value, 0));

  // Highly correlated sectors
  const sectorGroups = [
    { name: "Semiconductors", tickers: ["NVDA", "AMD", "TSM", "AVGO", "QCOM"], risk: "HIGH" },
    { name: "Big Tech", tickers: ["AAPL", "GOOGL", "MSFT", "AMZN", "META"], risk: "MEDIUM" },
    { name: "Crypto", tickers: ["BTC", "ETH", "SOL"], risk: "HIGH" },
    { name: "Healthcare", tickers: ["OSCR", "SPRB"], risk: "MEDIUM" },
  ];

  const portfolioSectors = sectorGroups.map((g) => {
    const sectorPositions = positions.filter((p) => g.tickers.includes(p.ticker));
    const value = sectorPositions.reduce((s, p) => s + p.value, 0);
    return { ...g, value, positions: sectorPositions };
  }).filter((g) => g.value > 0).sort((a, b) => b.value - a.value);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:ml-64 p-4 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Correlation</h1>
          <p className="text-muted-foreground text-sm">
            Portfolio overlap and concentration risk
          </p>
        </div>

        {/* Duplicate Holdings */}
        <Card className="vox-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-yellow-400" />
              Duplicate Holdings Across Brokers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {duplicates.length > 0 ? (
              <div className="space-y-3">
                {duplicates.map(([ticker, entries]) => {
                  const totalValue = entries.reduce((s, e) => s + e.value, 0);
                  return (
                    <div key={ticker} className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                      <div>
                        <span className="font-semibold">{ticker}</span>
                        <div className="flex gap-2 mt-1">
                          {entries.map((e) => (
                            <Badge key={e.broker} variant="outline" className="text-xs">
                              {e.broker}: ${e.value.toLocaleString()}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono">${totalValue.toLocaleString()}</span>
                        <Badge variant="outline" className="ml-2 text-xs bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                          OVERLAP
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No duplicate holdings found.</p>
            )}
          </CardContent>
        </Card>

        {/* Sector Concentration */}
        <Card className="vox-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              Sector Concentration Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {portfolioSectors.map((g) => (
                <div key={g.name} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <span className="font-semibold">{g.name}</span>
                    <div className="flex gap-1 mt-1">
                      {g.positions.map((p) => (
                        <Badge key={`${p.ticker}-${p.broker}`} variant="outline" className="text-xs">
                          {p.ticker}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono">${g.value.toLocaleString()}</span>
                    <Badge
                      variant="outline"
                      className={`ml-2 text-xs ${
                        g.risk === "HIGH"
                          ? "bg-red-500/20 text-red-400 border-red-500/30"
                          : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                      }`}
                    >
                      {g.risk} RISK
                    </Badge>
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
