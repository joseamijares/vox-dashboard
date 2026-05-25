"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/sidebar";
import { positions } from "@/lib/data";
import { Calendar, DollarSign, TrendingUp } from "lucide-react";

// Known dividend payers in portfolio
const dividendData: Record<string, { yield: number; frequency: string; nextExDate: string }> = {
  VOO: { yield: 1.3, frequency: "Quarterly", nextExDate: "2026-06-15" },
  VTI: { yield: 1.5, frequency: "Quarterly", nextExDate: "2026-06-15" },
  SCHD: { yield: 3.5, frequency: "Quarterly", nextExDate: "2026-06-10" },
  JEPQ: { yield: 11.2, frequency: "Monthly", nextExDate: "2026-06-01" },
  JEPI: { yield: 9.8, frequency: "Monthly", nextExDate: "2026-06-01" },
  QYLD: { yield: 12.5, frequency: "Monthly", nextExDate: "2026-06-20" },
  O: { yield: 5.8, frequency: "Monthly", nextExDate: "2026-06-01" },
  SPY: { yield: 1.2, frequency: "Quarterly", nextExDate: "2026-06-15" },
};

export default function DividendsPage() {
  const dividendPositions = positions
    .filter((p) => dividendData[p.ticker])
    .map((p) => ({
      ...p,
      ...dividendData[p.ticker],
      annualIncome: p.value * (dividendData[p.ticker].yield / 100),
    }));

  const totalAnnualIncome = dividendPositions.reduce((s, p) => s + p.annualIncome, 0);
  const totalValue = dividendPositions.reduce((s, p) => s + p.value, 0);
  const portfolioYield = totalValue > 0 ? (totalAnnualIncome / totalValue) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:ml-64 p-4 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Dividends</h1>
          <p className="text-muted-foreground text-sm">Dividend income tracker</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="vox-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Annual Income</p>
                  <p className="text-2xl font-bold font-mono text-green-400">
                    ${totalAnnualIncome.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="vox-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Portfolio Yield</p>
                  <p className="text-2xl font-bold font-mono">{portfolioYield.toFixed(2)}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="vox-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Dividend Positions</p>
                  <p className="text-2xl font-bold font-mono">{dividendPositions.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="vox-card">
          <CardHeader>
            <CardTitle>Dividend Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dividendPositions
                .sort((a, b) => b.annualIncome - a.annualIncome)
                .map((p) => (
                  <div
                    key={`${p.ticker}-${p.broker}`}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  >
                    <div>
                      <span className="font-semibold">{p.ticker}</span>
                      <span className="text-xs text-muted-foreground ml-2">{p.broker}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {p.frequency}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Next: {p.nextExDate}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono">${p.value.toLocaleString()}</p>
                      <p className="text-xs text-green-400">
                        Yield {p.yield}% | ${p.annualIncome.toFixed(0)}/yr
                      </p>
                    </div>
                  </div>
                ))}
              {dividendPositions.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No dividend-paying positions found in current portfolio.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
