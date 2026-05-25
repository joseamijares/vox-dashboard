"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sidebar } from "@/components/sidebar";
import { useState } from "react";
import { Search, TrendingUp, TrendingDown, Filter } from "lucide-react";

const watchlist = [
  { ticker: "XLF", price: 51.94, change: 1.2, grade: 72, signal: "BUY", reason: "Financials breakout on rate cut hopes" },
  { ticker: "CEG", price: 294.07, change: 3.5, grade: 71, signal: "BUY", reason: "Nuclear energy demand surge" },
  { ticker: "NVDA", price: 215.34, change: -1.2, grade: 78, signal: "BUY", reason: "Earnings May 28, AI demand strong" },
  { ticker: "PLTR", price: 118.45, change: -2.1, grade: 55, signal: "HOLD", reason: "Government contract delays" },
  { ticker: "COIN", price: 245.67, change: 5.2, grade: 62, signal: "WATCH", reason: "Crypto volume surge" },
  { ticker: "SMCI", price: 34.56, change: -3.4, grade: 45, signal: "AVOID", reason: "Accounting concerns persist" },
  { ticker: "MSTR", price: 412.89, change: 8.1, grade: 58, signal: "WATCH", reason: "Bitcoin proxy, high volatility" },
  { ticker: "OKLO", price: 65.88, change: -5.2, grade: 49, signal: "SELL", reason: "Nuclear sentiment shifting to CEG" },
];

export default function ScreenerPage() {
  const [filter, setFilter] = useState("");
  const filtered = watchlist.filter((w) =>
    w.ticker.toLowerCase().includes(filter.toLowerCase()) ||
    w.signal.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:ml-64 p-4 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Screener DB</h1>
          <p className="text-muted-foreground text-sm">Watchlist and screening signals</p>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter by ticker or signal..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10"
            />
          </div>
          <Filter className="h-5 w-5 text-muted-foreground" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((w) => (
            <Card key={w.ticker} className="vox-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xl font-bold font-mono">{w.ticker}</span>
                  <Badge
                    variant="outline"
                    className={
                      w.signal === "BUY"
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : w.signal === "SELL" || w.signal === "AVOID"
                        ? "bg-red-500/20 text-red-400 border-red-500/30"
                        : w.signal === "WATCH"
                        ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                        : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                    }
                  >
                    {w.signal}
                  </Badge>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold font-mono">${w.price}</span>
                  <span className={`text-sm ${w.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {w.change >= 0 ? "+" : ""}{w.change}%
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{w.reason}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Grade: {w.grade}</span>
                  {w.change >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-400" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-400" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
