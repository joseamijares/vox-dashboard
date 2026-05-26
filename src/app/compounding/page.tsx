"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MobileHeader } from "@/components/mobile-header";
import { Sidebar } from "@/components/sidebar";
import { useState } from "react";
import { TrendingUp, Calculator } from "lucide-react";

export default function CompoundingPage() {
  const [principal, setPrincipal] = useState(195715);
  const [monthlyAdd, setMonthlyAdd] = useState(5000);
  const [rate, setRate] = useState(20);
  const [years, setYears] = useState(10);

  const r = rate / 100;
  const n = 12;
  const t = years;
  const P = principal;
  const PMT = monthlyAdd;

  const futureValue =
    P * Math.pow(1 + r / n, n * t) +
    PMT * ((Math.pow(1 + r / n, n * t) - 1) / (r / n));

  const totalContributed = P + PMT * n * t;
  const totalInterest = futureValue - totalContributed;

  const yearlyData = Array.from({ length: Math.min(years, 20) }, (_, i) => {
    const year = i + 1;
    const fv =
      P * Math.pow(1 + r / n, n * year) +
      PMT * ((Math.pow(1 + r / n, n * year) - 1) / (r / n));
    return { year, value: fv };
  });

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader />
      <Sidebar />
      <main className="pt-14 lg:pt-0 lg:ml-64 p-4 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Compounding</h1>
          <p className="text-muted-foreground text-sm">Wealth projection calculator</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="vox-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Current Portfolio ($)</Label>
                <Input
                  type="number"
                  value={principal}
                  onChange={(e) => setPrincipal(Number(e.target.value))}
                  className="font-mono"
                />
              </div>
              <div>
                <Label>Monthly Addition ($)</Label>
                <Input
                  type="number"
                  value={monthlyAdd}
                  onChange={(e) => setMonthlyAdd(Number(e.target.value))}
                  className="font-mono"
                />
              </div>
              <div>
                <Label>Annual Return (%)</Label>
                <Input
                  type="number"
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  className="font-mono"
                />
              </div>
              <div>
                <Label>Years</Label>
                <Input
                  type="number"
                  value={years}
                  onChange={(e) => setYears(Number(e.target.value))}
                  className="font-mono"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="vox-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-400" />
                Projection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                <p className="text-sm text-muted-foreground">Future Value</p>
                <p className="text-3xl font-bold font-mono text-green-400">
                  ${futureValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Contributed</p>
                <p className="text-xl font-bold font-mono">${totalContributed.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">Interest Earned</p>
                <p className="text-xl font-bold font-mono text-green-400">
                  ${totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="vox-card mt-8">
          <CardHeader>
            <CardTitle>Year-by-Year Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {yearlyData.map((d) => (
                <div key={d.year} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                  <span className="text-sm">Year {d.year}</span>
                  <span className="font-mono">${d.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
