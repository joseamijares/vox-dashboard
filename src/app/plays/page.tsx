"use client";

import { useState, useEffect } from "react";
import { MobileHeader } from "@/components/mobile-header";
import { Sidebar } from "@/components/sidebar";
import { Target, TrendingUp, TrendingDown, CheckCircle } from "lucide-react";
import { fmtCurrency } from "@/lib/format";

export default function PlaysPage() {
  const [plays, setPlays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/plays");
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        setPlays(json.plays || []);
      } catch (e) {
        console.error("Failed to load plays:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const openPlays = plays.filter((p: any) => !p.closed);
  const closedPlays = plays.filter((p: any) => p.closed);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <MobileHeader />
        <Sidebar />
        <main className="pt-14 lg:pt-0 lg:ml-64 p-4 lg:p-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
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
          <h1 className="text-2xl font-bold tracking-tight">Plays</h1>
          <p className="text-muted-foreground text-sm">{openPlays.length} open · {closedPlays.length} closed</p>
        </div>

        {openPlays.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-400" />
              Open Plays
            </h2>
            <div className="space-y-3">
              {openPlays.map((p: any) => (
                <div key={p.timestamp} className="p-4 rounded-lg border border-border bg-card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-semibold text-lg">{p.ticker}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        p.action === 'BUY' ? 'bg-green-500/20 text-green-400' :
                        p.action === 'SELL' ? 'bg-red-500/20 text-red-400' :
                        'bg-amber-500/20 text-amber-400'
                      }`}>
                        {p.action}
                      </span>
                    </div>
                    <span className="font-mono text-sm">{fmtCurrency(p.notional) || "—"}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{p.reason}</p>
                  <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                    <span>Shares: {p.shares}</span>
                    <span>Price: {fmtCurrency(p.price)}</span>
                    <span>Broker: {p.broker}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {closedPlays.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              Closed Plays
            </h2>
            <div className="space-y-3">
              {closedPlays.map((p: any) => (
                <div key={p.timestamp} className="p-4 rounded-lg border border-border bg-card/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-semibold">{p.ticker}</span>
                      <span className="text-xs text-muted-foreground">{p.action}</span>
                    </div>
                    <span className={`font-mono text-sm ${(p.pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {(p.pnl || 0) >= 0 ? '+' : ''}{fmtCurrency(p.pnl) || "—"} ({p.pnl_pct?.toFixed(1) || "—"}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
