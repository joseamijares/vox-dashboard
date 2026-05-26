"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MobileHeader } from "@/components/mobile-header";
import { Sidebar } from "@/components/sidebar";

interface Prediction {
  ticker: string;
  direction: string;
  confidence: number;
  timeframe: string;
  target: string;
  reasons: string[];
  models_used: string[];
}

export default function PredictionsPage() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/vox_predictions.json")
      .then((r) => r.json())
      .then((data) => {
        setPredictions(data.predictions || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getDirectionColor = (dir: string) => {
    if (dir === "UP") return "bg-green-500/10 border-green-500/20";
    if (dir === "DOWN") return "bg-red-500/10 border-red-500/20";
    return "bg-yellow-500/10 border-yellow-500/20";
  };

  const getDirectionBadge = (dir: string) => {
    if (dir === "UP") return "bg-green-500/20 text-green-400 border-green-500/30";
    if (dir === "DOWN") return "bg-red-500/20 text-red-400 border-red-500/30";
    return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
  };

  const upCount = predictions.filter((p) => p.direction === "UP").length;
  const downCount = predictions.filter((p) => p.direction === "DOWN").length;

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader />
      <Sidebar />
      <main className="pt-14 lg:pt-0 lg:ml-64 p-4 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Predictions</h1>
          <p className="text-muted-foreground text-sm">
            AI forecasts based on patterns, technicals, and market regime
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="h-32 w-full bg-muted animate-pulse rounded" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-green-500/10 border-green-500/20">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-green-400">{upCount}</div>
                  <div className="text-sm text-muted-foreground">Bullish</div>
                </CardContent>
              </Card>
              <Card className="bg-red-500/10 border-red-500/20">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-red-400">{downCount}</div>
                  <div className="text-sm text-muted-foreground">Bearish</div>
                </CardContent>
              </Card>
              <Card className="bg-blue-500/10 border-blue-500/20">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-blue-400">{predictions.length}</div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </CardContent>
              </Card>
            </div>

            {/* Predictions */}
            <div className="space-y-3">
              {predictions.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    <p className="text-lg mb-2">No predictions yet</p>
                    <p className="text-sm">Run: python3 vox_predictive.py generate</p>
                  </CardContent>
                </Card>
              ) : (
                predictions.map((pred) => (
                  <Card key={pred.ticker} className={getDirectionColor(pred.direction)}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-lg">{pred.ticker}</span>
                          <Badge className={getDirectionBadge(pred.direction)}>
                            {pred.direction} ({pred.confidence}%)
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {pred.timeframe}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Target: <span className="font-mono font-medium">{pred.target}</span>
                      </p>
                      <div className="space-y-1">
                        {pred.reasons.map((reason, i) => (
                          <p key={i} className="text-sm text-muted-foreground">
                            • {reason}
                          </p>
                        ))}
                      </div>
                      <div className="flex gap-1 mt-2">
                        {pred.models_used.map((model) => (
                          <Badge key={model} variant="outline" className="text-xs">
                            {model}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
