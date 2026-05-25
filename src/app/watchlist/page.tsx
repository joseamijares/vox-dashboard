"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sidebar } from "@/components/sidebar";
import { monitoredPlaysList } from "@/lib/data";
import { Eye, Target, AlertTriangle, CheckCircle } from "lucide-react";

export default function WatchlistPage() {
  const plays = monitoredPlaysList;

  const statusIcon = (status: string) => {
    switch (status) {
      case "TRIGGERED": return <CheckCircle className="h-4 w-4 text-green-400" />;
      case "NEAR": return <AlertTriangle className="h-4 w-4 text-amber-400" />;
      default: return <Target className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "TRIGGERED": return "default";
      case "NEAR": return "secondary";
      default: return "outline";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:ml-64 p-4 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Watchlist</h1>
          <p className="text-muted-foreground text-sm">
            {plays.length} monitored plays with entry triggers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plays.map((play: any) => (
            <Card key={play.ticker} className="vox-card">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold">{play.ticker}</span>
                      {statusIcon(play.alertStatus)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Grade: {play.grade} | RSI: {play.rsi}
                    </div>
                  </div>
                  <Badge variant={statusBadge(play.alertStatus)}>
                    {play.alertStatus}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Entry Progress</span>
                      <span className="font-mono">{play.progress}%</span>
                    </div>
                    <Progress value={play.progress} className="h-2" />
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-2 bg-muted/30 rounded">
                      <div className="text-xs text-muted-foreground">Current</div>
                      <div className="font-mono font-semibold">${play.currentPrice}</div>
                    </div>
                    <div className="p-2 bg-muted/30 rounded">
                      <div className="text-xs text-muted-foreground">Target</div>
                      <div className="font-mono font-semibold text-green-400">${play.entryTarget}</div>
                    </div>
                    <div className="p-2 bg-muted/30 rounded">
                      <div className="text-xs text-muted-foreground">Stop</div>
                      <div className="font-mono font-semibold text-red-400">${play.stopLoss}</div>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    EMA21: ${play.ema21} | Distance: {((play.currentPrice - play.ema21) / play.ema21 * 100).toFixed(1)}%
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
