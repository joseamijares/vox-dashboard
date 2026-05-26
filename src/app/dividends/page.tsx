"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MobileHeader } from "@/components/mobile-header";
import { Sidebar } from "@/components/sidebar";
import { positions } from "@/lib/data";
import { Calendar, DollarSign } from "lucide-react";

// Known dividend payers in portfolio with approximate yields
const dividendData: Record<string, { yield: number; frequency: string }> = {
  VOO: { yield: 1.3, frequency: "Quarterly" },
  VTI: { yield: 1.5, frequency: "Quarterly" },
};

export default function DividendsPage() {
  const dividendPositions = positions
    .filter((p: any) => dividendData[p.ticker])
    .map((p: any) => ({
      ...p,
      ...dividendData[p.ticker],
      annualIncome: p.value * (dividendData[p.ticker].yield / 100),
    }));

  const totalAnnualIncome = dividendPositions.reduce((s: number, p: any) => s + p.annualIncome, 0);
  const totalValue = dividendPositions.reduce((s: number, p: any) => s + p.value, 0);
  const portfolioYield = totalValue > 0 ? (totalAnnualIncome / totalValue) * 100 : 0;

  const fmt = (n: number) => `$${Math.round(n).toLocaleString()}`;

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader />
      <Sidebar />
      <main className="pt-14 lg:pt-0 lg:ml-64 p-4 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Dividends</h1>
          <p className="text-muted-foreground text-sm">
            Dividend income from your holdings
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="vox-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Annual Income</p>
                  <p className="text-2xl font-bold font-mono text-green-400">
                    {fmt(totalAnnualIncome)}
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
                <Calendar className="h-8 w-8 text-primary" />
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
                <DollarSign className="h-8 w-8 text-primary" />
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
                .sort((a: any, b: any) => b.annualIncome - a.annualIncome)
                .map((p: any) => (
                  <div
                    key={p.ticker}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  >
                    <div>
                      <span className="font-semibold">{p.ticker}</span>
                      <span className="text-xs text-muted-foreground ml-2">{p.brokers?.join(", ")}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {p.frequency}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Yield {p.yield}%
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono">{fmt(p.value)}</p>
                      <p className="text-xs text-green-400">
                        {fmt(p.annualIncome)}/yr
                      </p>
                    </div>
                  </div>
                ))}
              {dividendPositions.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No dividend-paying positions found.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
