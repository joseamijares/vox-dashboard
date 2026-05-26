"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MobileHeader } from "@/components/mobile-header";
import { Sidebar } from "@/components/sidebar";
import { Bitcoin, TrendingUp, TrendingDown, Shield } from "lucide-react";

export default function CryptoPage() {
  const crypto = [
    { ticker: "BTC", name: "Bitcoin", shares: 0.38, price: 105520, value: 40098, avgCost: 98500, pnl: 1598, pnlPercent: 7.1, grade: 62, allocation: 14.2 },
    { ticker: "ETH", name: "Ethereum", shares: 2.1, price: 3150, value: 6615, avgCost: 2850, pnl: 630, pnlPercent: 10.5, grade: 58, allocation: 2.3 },
    { ticker: "USDC", name: "USD Coin", shares: 5000, price: 1, value: 5000, avgCost: 1, pnl: 0, pnlPercent: 0, grade: 50, allocation: 1.8 },
  ];

  const totalCrypto = crypto.reduce((s, c) => s + c.value, 0);
  const totalAum = 281669;
  const cryptoPercent = (totalCrypto / totalAum) * 100;

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader />
      <Sidebar />
      <main className="pt-14 lg:pt-0 lg:ml-64 p-4 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Crypto Portfolio</h1>
          <p className="text-muted-foreground text-sm">
            Binance + Bitso | Kill switches active
          </p>
        </div>

        {/* Kill Switches */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Card className={`vox-card ${cryptoPercent > 10 ? "border-red-500/30" : "border-green-500/30"}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Crypto Allocation</p>
                  <p className={`text-2xl font-bold font-mono ${cryptoPercent > 10 ? "text-red-400" : "text-green-400"}`}>
                    {cryptoPercent.toFixed(1)}%
                  </p>
                </div>
                <Shield className="h-8 w-8 text-muted-foreground" />
              </div>
              <Progress value={(cryptoPercent / 10) * 100} className="h-2 mt-2" />
              <p className="text-xs text-muted-foreground mt-1">Limit: 10% | Status: {cryptoPercent > 10 ? "BREACHED" : "OK"}</p>
            </CardContent>
          </Card>

          <Card className="vox-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Crypto Value</p>
                  <p className="text-2xl font-bold font-mono">${totalCrypto.toLocaleString()}</p>
                </div>
                <Bitcoin className="h-8 w-8 text-amber-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Positions */}
        <Card className="vox-card">
          <CardHeader>
            <CardTitle>Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {crypto.map((c) => (
                <div key={c.ticker} className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold">{c.ticker}</span>
                        <span className="text-sm text-muted-foreground">{c.name}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {c.shares} {c.ticker === "USDC" ? "tokens" : c.ticker} @ ${c.price.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold font-mono">${c.value.toLocaleString()}</div>
                      <div className={`flex items-center justify-end gap-1 text-sm ${c.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {c.pnl >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {c.pnlPercent}%
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center text-sm">
                    <div>
                      <div className="text-muted-foreground">Allocation</div>
                      <div className="font-mono">{c.allocation}%</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Grade</div>
                      <Badge variant="outline" className={c.grade >= 60 ? "text-green-400 border-green-500/30" : "text-amber-400 border-amber-500/30"}>
                        {c.grade}
                      </Badge>
                    </div>
                    <div>
                      <div className="text-muted-foreground">P&L</div>
                      <div className={`font-mono ${c.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {c.pnl >= 0 ? "+" : ""}${c.pnl.toLocaleString()}
                      </div>
                    </div>
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
