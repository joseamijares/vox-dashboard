"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageShell } from "@/components/vox-nav";
import { marketRegime } from "@/lib/data";
import { TrendingUp, Target, Shield, AlertTriangle } from "lucide-react";

export default function RegimePage() {
  const regime = marketRegime;
  const indicators = marketRegime.macroIndicators;

  const regimeConfig: Record<string, { color: string; emoji: string; description: string }> = {
    EARLY_BULL: { color: "text-green-400", emoji: "🌱", description: "Buy quality pullbacks. Tight stops." },
    BULL: { color: "text-green-500", emoji: "🐂", description: "Let winners run. Add on dips." },
    LATE_BULL: { color: "text-amber-400", emoji: "⚠️", description: "Trim overvalued. Raise cash." },
    SIDEWAYS: { color: "text-blue-400", emoji: "↔️", description: "Range trade. Sell premium." },
    BEAR: { color: "text-red-400", emoji: "🐻", description: "Defensive. Short overvalued." },
    CRASH: { color: "text-red-500", emoji: "💥", description: "Max cash. Buy fear." },
    RECOVERY: { color: "text-green-400", emoji: "🌿", description: "Early cycle plays. Small size." },
  };

  const config = regimeConfig[regime.regime] || regimeConfig.EARLY_BULL;

  return (
    <PageShell>
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Market Regime</h1>
          <p className="text-muted-foreground text-sm">
            Current regime detection and strategy adjustments
          </p>
        </div>

        {/* Regime Hero */}
        <Card className="vox-card mb-8 border-green-500/30">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl">{config.emoji}</span>
                  <div>
                    <h2 className={`text-3xl font-bold ${config.color}`}>
                      {regime.regime}
                    </h2>
                    <p className="text-muted-foreground">{config.description}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Confidence</div>
                  <div className="text-2xl font-bold font-mono">{regime.confidence}%</div>
                </div>
                <div className="w-px h-12 bg-border" />
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Cash Target</div>
                  <div className="text-2xl font-bold font-mono text-blue-400">{regime.cashTarget}</div>
                </div>
                <div className="w-px h-12 bg-border" />
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Stop Strategy</div>
                  <div className="text-2xl font-bold font-mono">{regime.stopStrategy}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Strategy + Sector Biases */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="vox-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Strategy Bias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-lg font-medium">{regime.bias}</p>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <span>Never move stops down on winning positions</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <span>Hard stops at entry price after +20% gain</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <span>Trim 50% if grade drops below 50</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="vox-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Sector Biases
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {regime.sectorBiases.map((bias: any) => (
                  <div key={bias.sector} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <span className="font-medium">{bias.sector}</span>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={bias.sentiment === "bullish" ? "default" : bias.sentiment === "bearish" ? "destructive" : "secondary"}
                      >
                        {bias.bias}
                      </Badge>
                      <div className="w-16">
                        <Progress value={bias.strength} className="h-1.5" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Macro Indicators */}
        <Card className="vox-card">
          <CardHeader>
            <CardTitle>Macro Indicators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {indicators.map((ind: any) => (
                <div key={ind.name} className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm text-muted-foreground">{ind.name}</span>
                    <Badge
                      variant={ind.trend === "down" ? "default" : ind.trend === "up" ? "destructive" : "secondary"}
                      className="text-xs"
                    >
                      {ind.trend}
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold font-mono">
                    {ind.value}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{ind.impact}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </PageShell>
  );
}
