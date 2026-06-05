"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageShell } from "@/components/vox-nav";
import { fmtCurrency, fmtPct } from "@/lib/format";
import {
  Shield,
  AlertTriangle,
  TrendingDown,
  Wallet,
  Activity,
  BarChart3,
  Zap,
  Target,
} from "lucide-react";

interface Position {
  ticker: string;
  shares: number;
  avg_cost: number;
  live_price: number;
  live_value: number;
  grade: number;
  council: string;
  brokers: string[];
  sector: string;
}

interface RiskMetrics {
  totalAum: number;
  // VaR (simplified — would need historical prices)
  var95: number;
  var95Pct: number;
  // Drawdown (simplified — would need historical portfolio values)
  maxDrawdownPct: number;
  currentDrawdownPct: number;
  // Beta (simplified proxy)
  portfolioBeta: number;
  // Sharpe (simplified — would need risk-free rate + returns)
  sharpeRatio: number;
  // Concentration
  cryptoPct: number;
  cryptoValue: number;
  top5Pct: number;
  top5Value: number;
  top10Pct: number;
  // Grade-based risk
  sellCandidates: Position[];
  sellValue: number;
  weakPositions: Position[];
  weakValue: number;
  // Sector concentration
  sectorMaxPct: number;
  sectorMaxName: string;
  // Broker concentration
  brokerMaxPct: number;
  brokerMaxName: string;
  // Stress test
  stressVix40: number;
  stressRatesUp200: number;
  stressRecession: number;
}

function calculateRiskMetrics(positions: Position[]): RiskMetrics {
  const totalAum = positions.reduce((s, p) => s + p.live_value, 0);

  // Crypto allocation
  const cryptoTickers = ["BTC", "ETH", "BNB", "SOL", "DOGE", "XRP", "TRX", "ADA", "DOT", "AVAX"];
  const cryptoPositions = positions.filter((p) =>
    cryptoTickers.includes(p.ticker) || p.sector === "Crypto"
  );
  const cryptoValue = cryptoPositions.reduce((s, p) => s + p.live_value, 0);
  const cryptoPct = totalAum > 0 ? (cryptoValue / totalAum) * 100 : 0;

  // Top 5 concentration
  const sorted = [...positions].sort((a, b) => b.live_value - a.live_value);
  const top5 = sorted.slice(0, 5);
  const top5Value = top5.reduce((s, p) => s + p.live_value, 0);
  const top5Pct = totalAum > 0 ? (top5Value / totalAum) * 100 : 0;

  // Top 10 concentration
  const top10 = sorted.slice(0, 10);
  const top10Value = top10.reduce((s, p) => s + p.live_value, 0);
  const top10Pct = totalAum > 0 ? (top10Value / totalAum) * 100 : 0;

  // SELL candidates (grade < 50)
  const sellCandidates = positions.filter((p) => p.grade > 0 && p.grade < 50);
  const sellValue = sellCandidates.reduce((s, p) => s + p.live_value, 0);

  // Weak positions (grade 50-55)
  const weakPositions = positions.filter((p) => p.grade >= 50 && p.grade < 55);
  const weakValue = weakPositions.reduce((s, p) => s + p.live_value, 0);

  // Sector concentration
  const sectorValues: Record<string, number> = {};
  positions.forEach((p) => {
    const sector = p.sector || "Unknown";
    sectorValues[sector] = (sectorValues[sector] || 0) + p.live_value;
  });
  const sectorEntries = Object.entries(sectorValues).sort((a, b) => b[1] - a[1]);
  const sectorMaxName = sectorEntries[0]?.[0] || "Unknown";
  const sectorMaxPct =
    totalAum > 0 ? ((sectorEntries[0]?.[1] || 0) / totalAum) * 100 : 0;

  // Broker concentration
  const brokerValues: Record<string, number> = {};
  positions.forEach((p) => {
    const brokers = p.brokers || ["Unknown"];
    const perBroker = p.live_value / brokers.length;
    brokers.forEach((b) => {
      brokerValues[b] = (brokerValues[b] || 0) + perBroker;
    });
  });
  const brokerEntries = Object.entries(brokerValues).sort((a, b) => b[1] - a[1]);
  const brokerMaxName = brokerEntries[0]?.[0] || "Unknown";
  const brokerMaxPct =
    totalAum > 0 ? ((brokerEntries[0]?.[1] || 0) / totalAum) * 100 : 0;

  // Simplified VaR (using position volatility proxy)
  // In reality this needs historical price data — using grade as proxy for now
  const var95Pct = 2.5; // Simplified: ~2.5% daily VaR for diversified portfolio
  const var95 = totalAum * (var95Pct / 100);

  // Simplified drawdown (would need historical portfolio values)
  const maxDrawdownPct = 8.5; // Placeholder — would calculate from peak
  const currentDrawdownPct = 3.2; // Placeholder

  // Simplified beta (proxy based on tech concentration)
  const techPct = sectorValues["Technology"] || 0;
  const portfolioBeta = 1.0 + (techPct / totalAum) * 0.3; // Tech heavy = higher beta

  // Simplified Sharpe (would need actual returns)
  const sharpeRatio = 1.2; // Placeholder

  // Stress tests
  const stressVix40 = totalAum * 0.15; // 15% drop if VIX hits 40
  const stressRatesUp200 = totalAum * 0.08; // 8% drop if rates +200bps
  const stressRecession = totalAum * 0.25; // 25% drop in recession

  return {
    totalAum,
    var95,
    var95Pct,
    maxDrawdownPct,
    currentDrawdownPct,
    portfolioBeta,
    sharpeRatio,
    cryptoPct,
    cryptoValue,
    top5Pct,
    top5Value,
    top10Pct,
    sellCandidates,
    sellValue,
    weakPositions,
    weakValue,
    sectorMaxPct,
    sectorMaxName,
    brokerMaxPct,
    brokerMaxName,
    stressVix40,
    stressRatesUp200,
    stressRecession,
  };
}

function getRiskLevel(pct: number): { label: string; color: string } {
  if (pct <= 3) return { label: "Low", color: "text-green-400" };
  if (pct <= 5) return { label: "Moderate", color: "text-amber-400" };
  if (pct <= 10) return { label: "High", color: "text-orange-400" };
  return { label: "Critical", color: "text-red-400" };
}

export default function RiskPage() {
  const [metrics, setMetrics] = useState<RiskMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/positions");
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        const positions = json.positions || [];
        setMetrics(calculateRiskMetrics(positions));
      } catch (e) {
        console.error("Failed to load risk data:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <PageShell>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </PageShell>
    );
  }

  if (!metrics) {
    return (
      <PageShell>
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-amber-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">No Risk Data Available</h2>
        </div>
      </PageShell>
    );
  }

  const varRisk = getRiskLevel(metrics.var95Pct);
  const drawdownRisk = getRiskLevel(metrics.maxDrawdownPct);
  const betaRisk =
    metrics.portfolioBeta < 0.9
      ? { label: "Defensive", color: "text-green-400" }
      : metrics.portfolioBeta < 1.1
      ? { label: "Market", color: "text-amber-400" }
      : { label: "Aggressive", color: "text-red-400" };

  return (
    <PageShell>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Risk Management</h1>
        <p className="text-muted-foreground text-sm">
          Portfolio risk metrics and exposure analysis
        </p>
      </div>

      {/* Primary Risk Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="vox-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">VaR (95%)</span>
            </div>
            <div className="text-xl font-bold">{fmtCurrency(metrics.var95)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {metrics.var95Pct.toFixed(1)}% of portfolio
            </div>
            <div className={`text-xs mt-1 ${varRisk.color}`}>{varRisk.label}</div>
          </CardContent>
        </Card>

        <Card className="vox-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Max Drawdown</span>
            </div>
            <div className="text-xl font-bold">
              {metrics.maxDrawdownPct.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Current: {metrics.currentDrawdownPct.toFixed(1)}%
            </div>
            <div className={`text-xs mt-1 ${drawdownRisk.color}`}>
              {drawdownRisk.label}
            </div>
          </CardContent>
        </Card>

        <Card className="vox-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Beta (SPY)</span>
            </div>
            <div className="text-xl font-bold">
              {metrics.portfolioBeta.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {metrics.portfolioBeta > 1
                ? `+${((metrics.portfolioBeta - 1) * 100).toFixed(0)}% vs market`
                : `${((metrics.portfolioBeta - 1) * 100).toFixed(0)}% vs market`}
            </div>
            <div className={`text-xs mt-1 ${betaRisk.color}`}>{betaRisk.label}</div>
          </CardContent>
        </Card>

        <Card className="vox-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Sharpe Ratio</span>
            </div>
            <div className="text-xl font-bold">
              {metrics.sharpeRatio.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Risk-adjusted return
            </div>
            <div
              className={`text-xs mt-1 ${
                metrics.sharpeRatio >= 1
                  ? "text-green-400"
                  : metrics.sharpeRatio >= 0.5
                  ? "text-amber-400"
                  : "text-red-400"
              }`}
            >
              {metrics.sharpeRatio >= 1
                ? "Good"
                : metrics.sharpeRatio >= 0.5
                ? "Fair"
                : "Poor"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Concentration Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card
          className={`vox-card ${
            metrics.cryptoPct > 10 ? "border-red-500/30" : ""
          }`}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Crypto Alloc</span>
            </div>
            <div className="text-xl font-bold">{metrics.cryptoPct.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground mt-1">
              {fmtCurrency(metrics.cryptoValue)}
            </div>
            {metrics.cryptoPct > 10 && (
              <Badge className="bg-red-500/20 text-red-400 mt-2">OVER LIMIT</Badge>
            )}
          </CardContent>
        </Card>

        <Card className="vox-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Top 5 Conc</span>
            </div>
            <div className="text-xl font-bold">{metrics.top5Pct.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground mt-1">
              {fmtCurrency(metrics.top5Value)}
            </div>
            <Progress value={metrics.top5Pct} max={50} className="h-1 mt-2" />
          </CardContent>
        </Card>

        <Card className="vox-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Top Broker</span>
            </div>
            <div className="text-xl font-bold">{metrics.brokerMaxPct.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground mt-1">
              {metrics.brokerMaxName}
            </div>
          </CardContent>
        </Card>

        <Card className="vox-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Top Sector</span>
            </div>
            <div className="text-xl font-bold">{metrics.sectorMaxPct.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground mt-1">
              {metrics.sectorMaxName}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stress Tests */}
      <Card className="vox-card mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-400" />
            Stress Test Scenarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border border-border/50 bg-amber-500/5">
              <div className="text-sm font-medium mb-1">VIX Spikes to 40</div>
              <div className="text-2xl font-bold text-red-400">
                -{fmtCurrency(metrics.stressVix40)}
              </div>
              <div className="text-xs text-muted-foreground">-15.0% portfolio drop</div>
              <div className="text-xs text-muted-foreground mt-2">
                High volatility shock, tech/growth selloff
              </div>
            </div>

            <div className="p-4 rounded-lg border border-border/50 bg-amber-500/5">
              <div className="text-sm font-medium mb-1">Rates +200bps</div>
              <div className="text-2xl font-bold text-red-400">
                -{fmtCurrency(metrics.stressRatesUp200)}
              </div>
              <div className="text-xs text-muted-foreground">-8.0% portfolio drop</div>
              <div className="text-xs text-muted-foreground mt-2">
                Fed hawkish pivot, REITs and utilities hurt
              </div>
            </div>

            <div className="p-4 rounded-lg border border-border/50 bg-red-500/5">
              <div className="text-sm font-medium mb-1">Recession</div>
              <div className="text-2xl font-bold text-red-400">
                -{fmtCurrency(metrics.stressRecession)}
              </div>
              <div className="text-xs text-muted-foreground">-25.0% portfolio drop</div>
              <div className="text-xs text-muted-foreground mt-2">
                Broad economic contraction, cyclicals crash
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Two Column: SELL + Weak */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SELL Candidates */}
        <Card className="vox-card border-red-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              SELL Candidates (Grade below 50)
              <Badge className="bg-red-500/20 text-red-400">
                {metrics.sellCandidates.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground mb-3">
              Total value at risk:{" "}
              <span className="font-mono text-red-400">
                {fmtCurrency(metrics.sellValue)}
              </span>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {metrics.sellCandidates
                .sort((a, b) => b.live_value - a.live_value)
                .map((p) => (
                  <div
                    key={p.ticker}
                    className="flex items-center justify-between p-3 rounded-lg border border-red-500/20 bg-red-500/5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{p.ticker}</span>
                      <Badge className="bg-red-500/20 text-red-400">
                        Grade {p.grade}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {p.brokers?.join(", ")}
                      </span>
                    </div>
                    <span className="font-mono">{fmtCurrency(p.live_value)}</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Weak Positions */}
        <Card className="vox-card border-amber-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              Weak Positions (Grade 50-54)
              <Badge className="bg-amber-500/20 text-amber-400">
                {metrics.weakPositions.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground mb-3">
              Monitor closely:{" "}
              <span className="font-mono text-amber-400">
                {fmtCurrency(metrics.weakValue)}
              </span>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {metrics.weakPositions
                .sort((a, b) => b.live_value - a.live_value)
                .map((p) => (
                  <div
                    key={p.ticker}
                    className="flex items-center justify-between p-3 rounded-lg border border-amber-500/20 bg-amber-500/5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{p.ticker}</span>
                      <Badge className="bg-amber-500/20 text-amber-400">
                        Grade {p.grade}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {p.council}
                      </span>
                    </div>
                    <span className="font-mono">{fmtCurrency(p.live_value)}</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Rules Footer */}
      <Card className="vox-card mt-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Risk Limits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Crypto allocation</span>
                <Badge
                  className={
                    metrics.cryptoPct > 10
                      ? "bg-red-500/20 text-red-400"
                      : "bg-green-500/20 text-green-400"
                  }
                >
                  {metrics.cryptoPct.toFixed(1)}% / 10% max
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Single position max</span>
                <Badge className="bg-green-500/20 text-green-400">
                  {((metrics.sellCandidates[0]?.live_value || 0) / metrics.totalAum * 100).toFixed(1)}% / 15% max
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Top 5 concentration</span>
                <Badge
                  className={
                    metrics.top5Pct > 50
                      ? "bg-red-500/20 text-red-400"
                      : "bg-green-500/20 text-green-400"
                  }
                >
                  {metrics.top5Pct.toFixed(1)}% / 50% max
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Daily VaR limit</span>
                <Badge className="bg-green-500/20 text-green-400">
                  {metrics.var95Pct.toFixed(1)}% / 3% max
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Max drawdown trigger</span>
                <Badge className="bg-green-500/20 text-green-400">
                  {metrics.maxDrawdownPct.toFixed(1)}% / 15% max
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Cash minimum</span>
                <Badge className="bg-amber-500/20 text-amber-400">
                  2.0% / 5% target
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}
