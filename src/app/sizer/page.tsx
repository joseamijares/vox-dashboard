"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/sidebar";
import { useState } from "react";
import { Calculator, DollarSign, Percent } from "lucide-react";

export default function SizerPage() {
  const [portfolio, setPortfolio] = useState(195715);
  const [risk, setRisk] = useState(1);
  const [entry, setEntry] = useState(100);
  const [stop, setStop] = useState(90);

  const riskAmount = portfolio * (risk / 100);
  const stopDistance = entry - stop;
  const stopPct = (stopDistance / entry) * 100;
  const shares = stopDistance > 0 ? Math.floor(riskAmount / stopDistance) : 0;
  const positionValue = shares * entry;
  const positionPct = (positionValue / portfolio) * 100;
  const rMultiple = stopDistance > 0 ? ((entry * 1.5 - entry) / stopDistance) : 0;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:ml-64 p-4 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Position Sizer</h1>
          <p className="text-muted-foreground text-sm">
            Calculate optimal position size based on risk parameters
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Inputs */}
          <Card className="vox-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Portfolio Value ($)</Label>
                <Input
                  type="number"
                  value={portfolio}
                  onChange={(e) => setPortfolio(Number(e.target.value))}
                  className="font-mono"
                />
              </div>
              <div>
                <Label>Risk per Trade (%)</Label>
                <Input
                  type="number"
                  value={risk}
                  onChange={(e) => setRisk(Number(e.target.value))}
                  className="font-mono"
                />
              </div>
              <div>
                <Label>Entry Price ($)</Label>
                <Input
                  type="number"
                  value={entry}
                  onChange={(e) => setEntry(Number(e.target.value))}
                  className="font-mono"
                />
              </div>
              <div>
                <Label>Stop Loss ($)</Label>
                <Input
                  type="number"
                  value={stop}
                  onChange={(e) => setStop(Number(e.target.value))}
                  className="font-mono"
                />
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <Card className="vox-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-400" />
                Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">Risk Amount</p>
                <p className="text-2xl font-bold font-mono">${riskAmount.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">Stop Distance</p>
                <p className="text-2xl font-bold font-mono">
                  ${stopDistance.toFixed(2)} ({stopPct.toFixed(1)}%)
                </p>
              </div>
              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                <p className="text-sm text-muted-foreground">Shares to Buy</p>
                <p className="text-3xl font-bold font-mono text-green-400">{shares}</p>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">Position Value</p>
                <p className="text-2xl font-bold font-mono">${positionValue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{positionPct.toFixed(1)}% of portfolio</p>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">R-Multiple (1.5x target)</p>
                <p className="text-xl font-bold font-mono">{rMultiple.toFixed(1)}R</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
