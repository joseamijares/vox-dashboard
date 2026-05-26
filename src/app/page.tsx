"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MobileHeader } from "@/components/mobile-header";
import { Sidebar } from "@/components/sidebar";
import { getPositions, getTotalValue, getTotalPnL, gradeMap, dashboardMeta } from "@/lib/data";
import {
  TrendingUp, TrendingDown, Target, ArrowRight,
  ShieldAlert, Zap, BarChart3, AlertTriangle, Clock
} from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const [positions, setPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getPositions();
        setPositions(data);
      } catch (e) {
        setError("Failed to load positions");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalValue = getTotalValue();
  const totalPnl = getTotalPnL();

  // Data freshness check
  const dataAge = dashboardMeta.generatedAt
    ? Math.round((Date.now() - new Date(dashboardMeta.generatedAt).getTime()) / (1000 * 60 * 60))
    : null;
  const isStale = dataAge !== null && dataAge > 24;

  const enrichedPositions = positions.map((p: any) => ({
    ...p,
    grade: gradeMap[p.ticker]?.grade || p.grade || 0,
    gradeCategory: gradeMap[p.ticker]?.category || "ungraded",
  }));

  const sellPositions = enrichedPositions.filter((p: any) => p.grade > 0 && p.grade < 50);
  const trimPositions = enrichedPositions.filter((p: any) => p.grade >= 50 && p.grade < 60);
  const holdPositions = enrichedPositions.filter((p: any) => p.grade >= 60 && p.grade < 70);
  const corePositions = enrichedPositions.filter((p: any) => p.grade >= 70);
  const ungradedPositions = enrichedPositions.filter((p: any) => p.grade === 0);

  const sellValue = sellPositions.reduce((sum: number, p: any) => sum + (p.value || p.live_value || 0), 0);
  const topHoldings = [...enrichedPositions].sort((a: any, b: any) => (b.value || b.live_value || 0) - (a.value || a.live_value || 0)).slice(0, 10);

  // Use REAL broker breakdown from source of truth
  const brokerBreakdown = (() => {
    const breakdown = dashboardMeta.brokerBreakdown;
    const status = dashboardMeta.brokerStatus;
    return Object.entries(breakdown)
      .map(([broker, value]: [string, any]) => ({
        broker,
        value: value as number,
        stale: status[broker]?.stale || false,
      }))
      .sort((a: any, b: any) => b.value - a.value);
  })();

  // Stale broker count
  const staleCount = brokerBreakdown.filter((b: any) => b.stale).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pt-14 lg:pt-0">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading from Supabase...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pt-14 lg:pt-0">
        <div className="text-center text-red-400">
          <AlertTriangle className="h-8 w-8 mx-auto mb-4" />
          <p>{error}</p>
          <p className="text-sm text-muted-foreground mt-2">Using fallback data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader />
      <Sidebar />
      <main className="pt-14 lg:pt-0 lg:ml-64 p-4 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Today's Command Center</h1>
          <p className="text-muted-foreground text-sm">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
          </p>
          {isStale && (
            <div className="mt-2 flex items-center gap-2 text-amber-400 text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span>Data is {dataAge}h old — run validation harness</span>
            </div>
          )}
          {!isStale && dashboardMeta.generatedAt && (
            <div className="mt-2 flex items-center gap-2 text-green-400 text-sm">
              <Clock className="h-4 w-4" />
              <span>Data fresh — {dataAge}h ago</span>
            </div>
          )}
          <div className="mt-2 flex items-center gap-2 text-blue-400 text-sm">
            <Zap className="h-4 w-4" />
            <span>Live from Supabase</span>
          </div>
        </div>

        {/* URGENT ALERTS */}
        {sellPositions.length > 0 && (
          <Card className="vox-card border-red-500/30 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-400">
                <ShieldAlert className="h-5 w-5" />
                URGENT: {sellPositions.length} Positions Grade &lt; 50 — SELL TODAY
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {sellPositions.map((p: any) => (
                  <div key={p.ticker} className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold font-mono">{p.ticker}</div>
                        <div className="text-xs text-muted-foreground">{(p.shares || p.quantity || 0).toFixed(2)} sh @ {(p.brokers || [p.broker]).join(', ') || p.broker}</div>
                      </div>
                      <Badge className="bg-red-500/20 text-red-400">Grade {p.grade}</Badge>
                    </div>
                    <div className="mt-2 flex justify-between">
                      <span className="font-mono">${(p.value || p.live_value || 0).toLocaleString()}</span>
                      <span className={`text-xs ${(p.pnl_pct || 0) >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {(p.pnl_pct || 0) >= 0 ? "+" : ""}{p.pnl_pct || 0}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Cash freed if sold: <span className="font-mono text-red-400">${sellValue.toLocaleString()}</span>
                </span>
                <Link href="/plays" className="text-sm text-primary hover:underline flex items-center gap-1">
                  Go to Plays <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* KPI ROW */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="vox-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Total AUM</p>
              <p className="text-xl font-bold font-mono">${totalValue.toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-1">
                {totalPnl >= 0 ? <TrendingUp className="h-3 w-3 text-green-400" /> : <TrendingDown className="h-3 w-3 text-red-400" />}
                <span className={`text-xs ${totalPnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {totalPnl >= 0 ? "+" : ""}${totalPnl.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="vox-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Positions</p>
              <p className="text-xl font-bold font-mono">{dashboardMeta.totalPositions}</p>
              <p className="text-xs text-muted-foreground mt-1">Across {brokerBreakdown.length} brokers</p>
              {staleCount > 0 && (
                <p className="text-xs text-amber-400 mt-1">⚠️ {staleCount} stale</p>
              )}
            </CardContent>
          </Card>

          <Card className="vox-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">USD / MXN</p>
              <p className="text-xl font-bold font-mono">{dashboardMeta.usdMxnRate.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">{dashboardMeta.usdMxnDate || 'Today'}</p>
            </CardContent>
          </Card>

          <Card className="vox-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Market Regime</p>
              <p className="text-xl font-bold font-mono text-green-400">EARLY_BULL</p>
              <p className="text-xs text-muted-foreground mt-1">Buy pullbacks, tight stops</p>
            </CardContent>
          </Card>
        </div>

        {/* HOLDINGS + DISTRIBUTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="vox-card lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Top 10 Holdings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 font-medium text-muted-foreground">Ticker</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Value</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">P&L</th>
                      <th className="text-center p-3 font-medium text-muted-foreground">Grade</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Broker</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topHoldings.map((p: any) => (
                      <tr key={p.ticker} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="p-3">
                          <span className="font-bold font-mono">{p.ticker}</span>
                        </td>
                        <td className="p-3 text-right font-mono">${(p.value || p.live_value || 0).toLocaleString()}</td>
                        <td className="p-3 text-right">
                          <span className={`${(p.pnl_pct || 0) >= 0 ? "text-green-400" : "text-red-400"}`}>
                            {(p.pnl_pct || 0) >= 0 ? "+" : ""}{p.pnl_pct || 0}%
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          {p.grade > 0 ? (
                            <Badge variant="outline" className={
                              p.grade >= 70 ? "bg-green-500/20 text-green-400" :
                              p.grade >= 60 ? "bg-blue-500/20 text-blue-400" :
                              p.grade >= 50 ? "bg-yellow-500/20 text-yellow-400" :
                              "bg-red-500/20 text-red-400"
                            }>
                              {p.grade}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="p-3 text-muted-foreground text-xs">{(p.brokers || [p.broker]).join(', ') || p.broker}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Link href="/portfolio" className="text-sm text-primary hover:underline p-4 block">
                View all {positions.length} positions →
              </Link>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="vox-card">
              <CardHeader>
                <CardTitle className="text-sm">Grade Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { label: "CORE (70+)", count: corePositions.length, text: "text-green-400" },
                    { label: "BUY (60-69)", count: holdPositions.length, text: "text-blue-400" },
                    { label: "HOLD (50-59)", count: trimPositions.length, text: "text-yellow-400" },
                    { label: "SELL (<50)", count: sellPositions.length, text: "text-red-400" },
                    { label: "Ungraded", count: ungradedPositions.length, text: "text-muted-foreground" },
                  ].map((bucket) => (
                    <div key={bucket.label} className="flex items-center justify-between">
                      <span className={`text-xs ${bucket.text}`}>{bucket.label}</span>
                      <span className="text-xs font-mono">{bucket.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="vox-card">
              <CardHeader>
                <CardTitle className="text-sm">By Broker</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {brokerBreakdown.map((b: any) => (
                    <div key={b.broker} className="flex items-center justify-between">
                      <span className="text-xs">{b.broker}</span>
                      <div className="text-right">
                        <span className="text-xs font-mono">${b.value.toLocaleString()}</span>
                        {b.stale && <span className="text-xs text-amber-400 ml-1">⚠️</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* QUICK LINKS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Plays", href: "/plays", icon: Target, desc: `${sellPositions.length} urgent actions` },
            { label: "Portfolio", href: "/portfolio", icon: BarChart3, desc: `${positions.length} positions` },
            { label: "Grades", href: "/grades", icon: Zap, desc: "AI grading system" },
            { label: "Watchlist", href: "/watchlist", icon: ShieldAlert, desc: "Entry triggers" },
          ].map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className="vox-card hover:border-primary/50 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <link.icon className="h-4 w-4 text-primary" />
                    <span className="font-semibold">{link.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{link.desc}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
