"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/sidebar";
import { useState, useEffect } from "react";
import { Target, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock } from "lucide-react";

interface Play {
  id: string;
  ticker: string;
  type: string;
  confidence: number;
  conviction: string;
  thesis: string;
  entry_price?: number;
  stop_loss?: number;
  target_price?: number;
  time_horizon: string;
  catalysts: string[];
  risks: string[];
  source_signals: string[];
  status: string;
  created_at: string;
}

export default function PlaysPage() {
  const [plays, setPlays] = useState<Play[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load plays from the generated JSON
    fetch("/vox_generated_plays.json")
      .then((res) => res.json().catch(() => []))
      .then((data) => {
        setPlays(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setPlays([]);
        setLoading(false);
      });
  }, []);

  const buyPlays = plays.filter((p) => p.type === "BUY");
  const sellPlays = plays.filter((p) => p.type === "SELL");
  const trimPlays = plays.filter((p) => p.type === "TRIM");
  const watchPlays = plays.filter((p) => p.type === "HOLD" || p.type === "WATCH");

  const PlayCard = ({ play }: { play: Play }) => (
    <Card className={`vox-card mb-3 ${
      play.type === "BUY" ? "border-green-500/30" :
      play.type === "SELL" ? "border-red-500/30" :
      play.type === "TRIM" ? "border-yellow-500/30" :
      "border-blue-500/30"
    }`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold font-mono">{play.ticker}</span>
            <Badge variant="outline" className={
              play.type === "BUY" ? "bg-green-500/20 text-green-400 border-green-500/30" :
              play.type === "SELL" ? "bg-red-500/20 text-red-400 border-red-500/30" :
              play.type === "TRIM" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" :
              "bg-blue-500/20 text-blue-400 border-blue-500/30"
            }>
              {play.type}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {play.conviction}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Target className="h-4 w-4 text-primary" />
            <span className="font-mono">{play.confidence.toFixed(0)}%</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-3">{play.thesis}</p>

        {play.entry_price && (
          <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
            <div className="bg-muted/30 rounded p-2 text-center">
              <span className="text-muted-foreground">Entry</span>
              <p className="font-mono">${play.entry_price.toFixed(2)}</p>
            </div>
            <div className="bg-red-500/10 rounded p-2 text-center">
              <span className="text-muted-foreground">Stop</span>
              <p className="font-mono text-red-400">${play.stop_loss?.toFixed(2)}</p>
            </div>
            <div className="bg-green-500/10 rounded p-2 text-center">
              <span className="text-muted-foreground">Target</span>
              <p className="font-mono text-green-400">${play.target_price?.toFixed(2)}</p>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-1 mb-2">
          {play.source_signals.map((sig) => (
            <Badge key={sig} variant="outline" className="text-xs bg-muted/30">
              {sig}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {new Date(play.created_at).toLocaleDateString()}
          </div>
          <div className="flex gap-2">
            {play.catalysts.length > 0 && (
              <span className="flex items-center gap-1 text-green-400">
                <TrendingUp className="h-3 w-3" />
                {play.catalysts.length} catalysts
              </span>
            )}
            {play.risks.length > 0 && (
              <span className="flex items-center gap-1 text-red-400">
                <AlertTriangle className="h-3 w-3" />
                {play.risks.length} risks
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:ml-64 p-4 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Plays</h1>
          <p className="text-muted-foreground text-sm">
            AI-generated actionable trades from the Harness
          </p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <Card className="vox-card border-green-500/30">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">BUY</p>
              <p className="text-2xl font-bold font-mono text-green-400">{buyPlays.length}</p>
            </CardContent>
          </Card>
          <Card className="vox-card border-red-500/30">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">SELL</p>
              <p className="text-2xl font-bold font-mono text-red-400">{sellPlays.length}</p>
            </CardContent>
          </Card>
          <Card className="vox-card border-yellow-500/30">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">TRIM</p>
              <p className="text-2xl font-bold font-mono text-yellow-400">{trimPlays.length}</p>
            </CardContent>
          </Card>
          <Card className="vox-card border-blue-500/30">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">WATCH</p>
              <p className="text-2xl font-bold font-mono text-blue-400">{watchPlays.length}</p>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading plays...</p>
        ) : plays.length === 0 ? (
          <Card className="vox-card">
            <CardContent className="p-8 text-center">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No plays generated yet. Run the AI Harness to generate plays.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                python3 vox_ai_harness.py --plays
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* BUY Plays */}
            {buyPlays.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                  BUY Plays
                </h2>
                {buyPlays.map((p) => (
                  <PlayCard key={p.id} play={p} />
                ))}
              </div>
            )}

            {/* SELL Plays */}
            {sellPlays.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-red-400" />
                  SELL Plays
                </h2>
                {sellPlays.map((p) => (
                  <PlayCard key={p.id} play={p} />
                ))}
              </div>
            )}

            {/* TRIM Plays */}
            {trimPlays.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  TRIM Plays
                </h2>
                {trimPlays.map((p) => (
                  <PlayCard key={p.id} play={p} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
