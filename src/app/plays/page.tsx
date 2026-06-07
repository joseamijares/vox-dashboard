"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageShell } from "@/components/vox-nav";
import { VoxLoading, VoxError } from "@/components/vox";
import { VoxBadge } from "@/components/vox";
import { fmtCurrency, fmtPct } from "@/lib/format";
import {
  Target,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Clock,
  Trophy,
  AlertTriangle,
  BarChart3,
  Calendar,
} from "lucide-react";

interface Play {
  timestamp: string;
  ticker: string;
  action: string;
  shares: number;
  price: number;
  notional: number;
  broker: string;
  reason: string;
  grade_at_entry: number;
  council_at_entry: string;
  notes: string;
  closed: boolean;
  exit_price: number;
  exit_date: string;
  pnl: number;
  pnl_pct: number;
}

interface PlayStats {
  totalOpen: number;
  totalClosed: number;
  winRate: number;
  avgReturn: number;
  totalRealizedPnl: number;
  bestPlay: Play | null;
  worstPlay: Play | null;
  avgHoldingDays: number;
  wins: number;
  losses: number;
}

function calculateStats(plays: Play[]): PlayStats {
  const open = plays.filter((p) => !p.closed);
  const closed = plays.filter((p) => p.closed);

  if (closed.length === 0) {
    return {
      totalOpen: open.length,
      totalClosed: 0,
      winRate: 0,
      avgReturn: 0,
      totalRealizedPnl: 0,
      bestPlay: null,
      worstPlay: null,
      avgHoldingDays: 0,
      wins: 0,
      losses: 0,
    };
  }

  const wins = closed.filter((p) => (p.pnl || 0) > 0);
  const losses = closed.filter((p) => (p.pnl || 0) <= 0);
  const winRate = (wins.length / closed.length) * 100;

  const avgReturn =
    closed.reduce((s, p) => s + (p.pnl_pct || 0), 0) / closed.length;

  const totalRealizedPnl = closed.reduce((s, p) => s + (p.pnl || 0), 0);

  const sortedByPnl = [...closed].sort((a, b) => (b.pnl || 0) - (a.pnl || 0));
  const bestPlay = sortedByPnl[0];
  const worstPlay = sortedByPnl[sortedByPnl.length - 1];

  // Calculate average holding period
  const holdingDays = closed
    .filter((p) => p.exit_date)
    .map((p) => {
      const entry = new Date(p.timestamp);
      const exit = new Date(p.exit_date);
      return Math.max(0, (exit.getTime() - entry.getTime()) / (1000 * 60 * 60 * 24));
    });
  const avgHoldingDays =
    holdingDays.length > 0
      ? holdingDays.reduce((s, d) => s + d, 0) / holdingDays.length
      : 0;

  return {
    totalOpen: open.length,
    totalClosed: closed.length,
    winRate,
    avgReturn,
    totalRealizedPnl,
    bestPlay,
    worstPlay,
    avgHoldingDays,
    wins: wins.length,
    losses: losses.length,
  };
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function PlaysPage() {
  const [plays, setPlays] = useState<Play[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PlayStats | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/plays");
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        const playsData = json.plays || [];
        setPlays(playsData);
        setStats(calculateStats(playsData));
      } catch (e) {
        console.error("Failed to load plays:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const openPlays = plays.filter((p) => !p.closed);
  const closedPlays = plays.filter((p) => p.closed);

  if (loading) {
    return (
      <PageShell>
        <VoxLoading text="Loading plays..." />
      </PageShell>
    );
  }

  return (
    <PageShell>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Plays</h1>
        <p className="text-muted-foreground text-sm">
          {stats?.totalOpen || 0} open · {stats?.totalClosed || 0} closed
          {stats && stats.totalClosed > 0 &&
            ` · Win rate: ${stats.winRate.toFixed(0)}%`}
        </p>
      </div>

      {/* Stats Cards */}
      {stats && stats.totalClosed > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="vox-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">Win Rate</span>
              </div>
              <div className="text-xl font-bold">{stats.winRate.toFixed(0)}%</div>
              <div className="text-xs text-muted-foreground mt-1">
                {stats.wins}W / {stats.losses}L
              </div>
            </CardContent>
          </Card>

          <Card className="vox-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">Avg Return</span>
              </div>
              <div
                className={`text-xl font-bold ${
                  stats.avgReturn >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {stats.avgReturn >= 0 ? "+" : ""}
                {stats.avgReturn.toFixed(1)}%
              </div>
            </CardContent>
          </Card>

          <Card className="vox-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">Realized P&L</span>
              </div>
              <div
                className={`text-xl font-bold ${
                  stats.totalRealizedPnl >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {stats.totalRealizedPnl >= 0 ? "+" : ""}
                {fmtCurrency(stats.totalRealizedPnl)}
              </div>
            </CardContent>
          </Card>

          <Card className="vox-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">Avg Hold</span>
              </div>
              <div className="text-xl font-bold">
                {stats.avgHoldingDays.toFixed(0)}d
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Best/Worst */}
      {stats?.bestPlay && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <Card className="vox-card border-green-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Trophy className="h-4 w-4 text-green-400" />
                Best Play
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="font-bold text-lg">{stats.bestPlay.ticker}</span>
                <span className="text-green-400 font-mono">
                  +{fmtCurrency(stats.bestPlay.pnl)} (
                  {stats.bestPlay.pnl_pct?.toFixed(1)}%)
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.bestPlay.reason}
              </p>
            </CardContent>
          </Card>

          <Card className="vox-card border-red-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                Worst Play
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="font-bold text-lg">{stats.worstPlay?.ticker}</span>
                <span className="text-red-400 font-mono">
                  {fmtCurrency(stats.worstPlay?.pnl || 0)} (
                  {stats.worstPlay?.pnl_pct?.toFixed(1) || 0}%)
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.worstPlay?.reason}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Open Plays */}
      {openPlays.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-400" />
            Open Plays
            <Badge className="bg-blue-500/20 text-blue-400">{openPlays.length}</Badge>
          </h2>
          <div className="space-y-3">
            {openPlays.map((p) => (
              <Card
                key={p.timestamp}
                className="vox-card hover:border-primary/30 transition-colors"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-semibold text-lg">
                        {p.ticker}
                      </span>
                      <Badge
                        className={
                          p.action === "BUY"
                            ? "bg-green-500/20 text-green-400"
                            : p.action === "SELL"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-amber-500/20 text-amber-400"
                        }
                      >
                        {p.action}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Grade {p.grade_at_entry}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="font-mono">
                        {fmtCurrency(p.notional)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {p.shares} @ {fmtCurrency(p.price)}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{p.reason}</p>
                  <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(p.timestamp)}
                    </span>
                    <span>Broker: {p.broker}</span>
                    <span>Council: {p.council_at_entry}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Closed Plays */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-400" />
          Closed Plays
          <Badge className="bg-green-500/20 text-green-400">
            {closedPlays.length}
          </Badge>
        </h2>

        {closedPlays.length === 0 ? (
          <Card className="vox-card">
            <CardContent className="py-8 text-center">
              <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                No closed plays yet. When you exit positions, they will appear
                here with full P&L analytics.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {closedPlays.map((p) => (
              <Card
                key={p.timestamp}
                className={`vox-card ${
                  (p.pnl || 0) >= 0
                    ? "border-green-500/10"
                    : "border-red-500/10"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-semibold">{p.ticker}</span>
                      <span className="text-xs text-muted-foreground">
                        {p.action}
                      </span>
                      <Badge
                        className={
                          (p.pnl || 0) >= 0
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }
                      >
                        {(p.pnl || 0) >= 0 ? "WIN" : "LOSS"}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div
                        className={`font-mono ${
                          (p.pnl || 0) >= 0
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {(p.pnl || 0) >= 0 ? "+" : ""}
                        {fmtCurrency(p.pnl)} ({p.pnl_pct?.toFixed(1) || 0}%)
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Exit: {formatDate(p.exit_date)}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {p.reason}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
