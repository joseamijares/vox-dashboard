"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MobileHeader } from "@/components/mobile-header";
import { Sidebar } from "@/components/sidebar";

interface SellOrder {
  ticker: string;
  action: string;
  shares: number;
  value: number;
  brokers: string[];
  reason: string;
}

interface BuyOrder {
  ticker: string;
  cash: number;
  shares: number;
  price: number;
  broker: string;
  reason: string;
  timing: string;
  stop: string;
}

interface PlanData {
  timestamp: string;
  portfolio_value: number;
  cash_target_amount: number;
  sells: SellOrder[];
  buys: BuyOrder[];
  total_sell_cash: number;
  total_buy_cash: number;
  stops: Array<{ ticker: string; stop_pct: number }>;
  protected: string[];
}

export default function UltimatePlanPage() {
  const [plan, setPlan] = useState<PlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/vox_ultimate_plan.json")
      .then((r) => r.json())
      .then((data) => {
        setPlan(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const toggleComplete = (id: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
      <MobileHeader />
      <Sidebar />
        <main className="pt-14 lg:pt-0 lg:ml-64 p-4 lg:p-8">
          <div className="h-8 w-64 bg-muted animate-pulse rounded" />
        </main>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-background">
      <MobileHeader />
      <Sidebar />
        <main className="pt-14 lg:pt-0 lg:ml-64 p-4 lg:p-8">
          <p>No plan generated yet</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader />
      <Sidebar />
      <main className="pt-14 lg:pt-0 lg:ml-64 p-4 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Ultimate Action Plan</h1>
          <p className="text-muted-foreground text-sm">
            Exact amounts. Exact brokers. Exact tickers. No ambiguity.
          </p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="bg-red-500/10 border-red-500/20">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-400">${plan.total_sell_cash.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Sell</div>
            </CardContent>
          </Card>
          <Card className="bg-green-500/10 border-green-500/20">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-400">${plan.total_buy_cash.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Buy</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">${plan.cash_target_amount.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Cash Target (5%)</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{plan.sells.length + plan.buys.length}</div>
              <div className="text-sm text-muted-foreground">Total Orders</div>
            </CardContent>
          </Card>
        </div>

        {/* SELLS */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-red-500">🔴</span> SELL ORDERS (Morning)
          </h2>
          <div className="space-y-2">
            {plan.sells.map((sell, i) => (
              <Card key={i} className="bg-red-500/5 border-red-500/20">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-lg">{sell.ticker}</span>
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30">{sell.action}</Badge>
                        <Badge variant="outline" className="text-red-400 border-red-500/30">
                          ${sell.value.toLocaleString()}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Shares: {sell.shares.toFixed(4)}</p>
                        <p>Broker(s): {sell.brokers.join(", ")}</p>
                        <p>Why: {sell.reason}</p>
                      </div>
                    </div>
                    <div className="ml-4">
                      <button
                        onClick={() => toggleComplete(`sell-${i}`)}
                        className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                          completed.has(`sell-${i}`)
                            ? "bg-green-500 border-green-500"
                            : "border-muted-foreground"
                        }`}
                      >
                        {completed.has(`sell-${i}`) && <span className="text-white text-xs">✓</span>}
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* STOPS */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-amber-500">🟡</span> SET STOPS (Morning)
          </h2>
          <div className="space-y-2">
            {plan.stops.map((stop, i) => (
              <Card key={i} className="bg-amber-500/5 border-amber-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold">{stop.ticker}</span>
                      <span className="text-muted-foreground ml-2">
                        Stop at {stop.stop_pct}% — SELL ALL if hit
                      </span>
                    </div>
                    <button
                      onClick={() => toggleComplete(`stop-${i}`)}
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                        completed.has(`stop-${i}`)
                          ? "bg-green-500 border-green-500"
                          : "border-muted-foreground"
                      }`}
                    >
                      {completed.has(`stop-${i}`) && <span className="text-white text-xs">✓</span>}
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* PROTECTED */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-purple-500">🛒</span> PROTECTED (Do Not Sell)
          </h2>
          <div className="flex gap-2">
            {plan.protected.map((ticker) => (
              <Badge key={ticker} className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                {ticker}
              </Badge>
            ))}
          </div>
        </div>

        {/* BUYS */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-green-500">🟢</span> BUY ORDERS (Scale In)
          </h2>
          <div className="space-y-2">
            {plan.buys.map((buy, i) => (
              <Card key={i} className="bg-green-500/5 border-green-500/20">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-lg">{buy.ticker}</span>
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">BUY</Badge>
                        <Badge variant="outline" className="text-green-400 border-green-500/30">
                          ${buy.cash.toLocaleString()}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>~{buy.shares.toFixed(1)} shares @ ~${buy.price.toFixed(2)}</p>
                        <p>Broker: {buy.broker}</p>
                        <p>When: {buy.timing}</p>
                        <p>Why: {buy.reason}</p>
                        <p className="text-red-400">Stop: {buy.stop}</p>
                      </div>
                    </div>
                    <div className="ml-4">
                      <button
                        onClick={() => toggleComplete(`buy-${i}`)}
                        className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                          completed.has(`buy-${i}`)
                            ? "bg-green-500 border-green-500"
                            : "border-muted-foreground"
                        }`}
                      >
                        {completed.has(`buy-${i}`) && <span className="text-white text-xs">✓</span>}
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Progress */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Progress</span>
              <span className="text-muted-foreground">
                {completed.size} / {plan.sells.length + plan.stops.length + plan.buys.length} completed
              </span>
            </div>
            <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{
                  width: `${
                    ((completed.size / (plan.sells.length + plan.stops.length + plan.buys.length)) * 100) || 0
                  }%`,
                }}
              />
            </div>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground">
          Generated: {new Date(plan.timestamp).toLocaleString()} | Check off items as you execute
        </p>
      </main>
    </div>
  );
}
