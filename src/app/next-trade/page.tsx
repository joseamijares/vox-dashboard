"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sidebar } from "@/components/sidebar";
import { TrendingUp, TrendingDown, Target, AlertTriangle, CheckCircle } from "lucide-react";

export default function NextTradePage() {
  const stockPlays = [
    { ticker: "CEG", action: "BUY", shares: 76, price: 294.07, value: 22349, broker: "Schwab", thesis: "Nuclear renaissance, AI power demand", stop: 250, grade: 59 },
    { ticker: "NVDA", action: "ADD", shares: 78, price: 215.33, value: 16796, broker: "Schwab", thesis: "AI chip leader, buy the dip", stop: 190, grade: 64 },
    { ticker: "XLF", action: "ADD", shares: 325, price: 51.94, value: 16880, broker: "Schwab", thesis: "Financials leading sector rotation", stop: 47, grade: 75 },
  ];

  const cryptoPlays = [
    { ticker: "BTC", action: "TRIM", shares: 0.38, price: 105520, value: 40098, broker: "Binance", thesis: "Trim to 5% target", stop: 95000, grade: 62 },
    { ticker: "ETH", action: "HOLD", shares: 2.1, price: 3150, value: 6615, broker: "Binance", thesis: "Hold, grade 58", stop: 2800, grade: 58 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:ml-64 p-4 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Next Trade</h1>
          <p className="text-muted-foreground text-sm">
            Tuesday May 27 execution plan
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stock Plays */}
          <Card className="vox-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-400">
                <TrendingUp className="h-5 w-5" />
                Stock Plays
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {stockPlays.map((play) => (
                <div key={play.ticker} className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{play.ticker}</span>
                        <Badge variant={play.action === "BUY" ? "default" : "secondary"}>{play.action}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">{play.broker}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold">${play.value.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">{play.shares} @ ${play.price}</div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{play.thesis}</p>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-red-400">Stop: ${play.stop}</span>
                    <span>Grade: {play.grade}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Crypto Plays */}
          <Card className="vox-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-400">
                <TrendingDown className="h-5 w-5" />
                Crypto Plays
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cryptoPlays.map((play) => (
                <div key={play.ticker} className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{play.ticker}</span>
                        <Badge variant={play.action === "TRIM" ? "outline" : "secondary"}>{play.action}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">{play.broker}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold">${play.value.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">{play.shares} @ ${play.price.toLocaleString()}</div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{play.thesis}</p>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-red-400">Stop: ${play.stop.toLocaleString()}</span>
                    <span>Grade: {play.grade}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
