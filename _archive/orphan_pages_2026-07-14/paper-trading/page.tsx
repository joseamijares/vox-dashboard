"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageShell } from "@/components/vox-nav";

interface PaperPosition {
  ticker: string;
  shares: number;
  avg_price: number;
  entry_date: string;
}

interface PaperStatus {
  cash: number;
  positions: PaperPosition[];
  total_value: number;
  total_pnl: number;
  total_trades: number;
  win_rate: number;
  return_pct: number;
}

export default function PaperTradingPage() {
  const [status, setStatus] = useState<PaperStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/vox_paper_portfolio.json")
      .then((r) => r.json())
      .then((data) => {
        // Transform to status format
        const positions = Object.entries(data.positions || {}).map(([ticker, pos]: [string, any]) => ({
          ticker,
          shares: pos.shares,
          avg_price: pos.avg_price,
          entry_date: pos.entry_date,
        }));
        
        setStatus({
          cash: data.cash,
          positions,
          total_value: data.total_value,
          total_pnl: data.total_pnl || 0,
          total_trades: 0,
          win_rate: 0,
          return_pct: (data.total_value / 100000 - 1) * 100,
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <PageShell>
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Paper Trading</h1>
          <p className="text-muted-foreground text-sm">
            Virtual portfolio to test strategies risk-free
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="h-32 w-full bg-muted animate-pulse rounded" />
          </div>
        ) : status ? (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold font-mono">${status.total_value.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Total Value</div>
                </CardContent>
              </Card>
              <Card className={status.total_pnl >= 0 ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20"}>
                <CardContent className="pt-6">
                  <div className={`text-2xl font-bold font-mono ${status.total_pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {status.total_pnl >= 0 ? "+" : ""}${status.total_pnl.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">P&L ({status.return_pct.toFixed(1)}%)</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold font-mono">${status.cash.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Cash</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{status.positions.length}</div>
                  <div className="text-sm text-muted-foreground">Positions</div>
                </CardContent>
              </Card>
            </div>

            {/* Positions */}
            <Card>
              <CardHeader>
                <CardTitle>Paper Positions</CardTitle>
              </CardHeader>
              <CardContent>
                {status.positions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No paper positions yet</p>
                ) : (
                  <div className="space-y-2">
                    {status.positions.map((pos) => (
                      <div key={pos.ticker} className="flex items-center justify-between p-3 bg-muted rounded">
                        <div className="flex items-center gap-3">
                          <span className="font-bold">{pos.ticker}</span>
                          <span className="text-sm text-muted-foreground">{pos.shares.toFixed(2)} shares</span>
                        </div>
                        <div className="text-right">
                          <div className="font-mono">@${pos.avg_price.toFixed(2)}</div>
                          <div className="text-xs text-muted-foreground">Entry: {new Date(pos.entry_date).toLocaleDateString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <p className="text-lg mb-2">Paper trading not initialized</p>
              <p className="text-sm">Run: python3 vox_paper_trader.py status</p>
            </CardContent>
          </Card>
        )}
      </PageShell>
  );
}
