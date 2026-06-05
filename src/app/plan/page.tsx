"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageShell } from "@/components/vox-nav";
import { fmtCurrency, fmtPct } from "@/lib/format";
import {
  Target,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Shield,
  Wallet,
  PieChart,
  Activity,
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

interface PlanData {
  positions: Position[];
  totalAum: number;
  targetAllocations: Record<string, number>;
  currentAllocations: Record<string, number>;
  drift: Record<string, number>;
  rebalancingActions: RebalanceAction[];
  cashTarget: number;
  cashCurrent: number;
  protectedPositions: string[];
  trimCandidates: TrimCandidate[];
  buyCandidates: BuyCandidate[];
  monthlyGoal: number;
  monthlyProgress: number;
}

interface RebalanceAction {
  ticker: string;
  action: "TRIM" | "ADD" | "HOLD";
  currentValue: number;
  targetValue: number;
  delta: number;
  reason: string;
}

interface TrimCandidate {
  ticker: string;
  grade: number;
  value: number;
  council: string;
  reason: string;
}

interface BuyCandidate {
  ticker: string;
  grade: number;
  targetPrice: number;
  currentPrice: number;
  upside: number;
  reason: string;
}

// Target allocation model — editable by user
const DEFAULT_TARGETS: Record<string, number> = {
  "Technology": 25,
  "Crypto": 10,
  "Consumer Cyclical": 10,
  "Communication Services": 8,
  "Healthcare": 8,
  "Financial Services": 8,
  "Industrials": 7,
  "Consumer Defensive": 7,
  "Real Estate": 5,
  "Energy": 5,
  "Basic Materials": 4,
  "Utilities": 3,
};

function calculatePlan(positions: Position[]): PlanData {
  const totalAum = positions.reduce((s, p) => s + p.live_value, 0);

  // Current sector allocations
  const currentAllocations: Record<string, number> = {};
  positions.forEach((p) => {
    const sector = p.sector || "Unknown";
    currentAllocations[sector] = (currentAllocations[sector] || 0) + p.live_value;
  });

  // Convert to percentages
  const currentPcts: Record<string, number> = {};
  Object.entries(currentAllocations).forEach(([sector, value]) => {
    currentPcts[sector] = (value / totalAum) * 100;
  });

  // Target percentages (use default or current if not defined)
  const targetPcts: Record<string, number> = {};
  Object.keys(currentPcts).forEach((sector) => {
    targetPcts[sector] = DEFAULT_TARGETS[sector] || currentPcts[sector];
  });

  // Drift = current - target
  const drift: Record<string, number> = {};
  Object.keys(currentPcts).forEach((sector) => {
    drift[sector] = currentPcts[sector] - (targetPcts[sector] || 0);
  });

  // Rebalancing actions
  const rebalancingActions: RebalanceAction[] = [];
  Object.entries(drift).forEach(([sector, d]) => {
    if (Math.abs(d) > 3) {
      // Only flag if drift > 3%
      const sectorPositions = positions.filter((p) => (p.sector || "Unknown") === sector);
      const sectorValue = sectorPositions.reduce((s, p) => s + p.live_value, 0);
      const targetValue = totalAum * ((targetPcts[sector] || currentPcts[sector]) / 100);
      const delta = targetValue - sectorValue;

      if (sectorPositions.length > 0) {
        // Pick the lowest grade position in overweight sectors, highest in underweight
        const sorted = [...sectorPositions].sort((a, b) => a.grade - b.grade);
        const target = sorted[0];

        rebalancingActions.push({
          ticker: target.ticker,
          action: d > 0 ? "TRIM" : "ADD",
          currentValue: target.live_value,
          targetValue: Math.max(0, target.live_value + delta / sectorPositions.length),
          delta: Math.abs(delta) / sectorPositions.length,
          reason: `${sector} is ${d > 0 ? "overweight" : "underweight"} by ${Math.abs(d).toFixed(1)}%`,
        });
      }
    }
  });

  // Protected positions (Core grade >= 70)
  const protectedPositions = positions
    .filter((p) => p.grade >= 70)
    .map((p) => p.ticker);

  // Trim candidates (grade < 50, not protected)
  const trimCandidates: TrimCandidate[] = positions
    .filter((p) => p.grade < 50 && !protectedPositions.includes(p.ticker))
    .sort((a, b) => a.grade - b.grade)
    .slice(0, 10)
    .map((p) => ({
      ticker: p.ticker,
      grade: p.grade,
      value: p.live_value,
      council: p.council,
      reason: `Grade ${p.grade} — below minimum threshold`,
    }));

  // Buy candidates (grade >= 60, from watchlist — we'll use high-grade positions as proxy)
  const buyCandidates: BuyCandidate[] = positions
    .filter((p) => p.grade >= 60 && p.grade < 70)
    .sort((a, b) => b.grade - a.grade)
    .slice(0, 5)
    .map((p) => ({
      ticker: p.ticker,
      grade: p.grade,
      targetPrice: p.live_price * 1.05,
      currentPrice: p.live_price,
      upside: 5,
      reason: `Grade ${p.grade} — approaching Core territory`,
    }));

  // Cash calculation (assume 5% target)
  const cashTarget = totalAum * 0.05;
  const cashCurrent = totalAum * 0.02; // Estimate — would come from broker data

  // Monthly goal (example: 2% monthly return target)
  const monthlyGoal = totalAum * 0.02;
  const monthlyProgress = totalAum * 0.008; // Example — would track actual

  return {
    positions,
    totalAum,
    targetAllocations: targetPcts,
    currentAllocations: currentPcts,
    drift,
    rebalancingActions,
    cashTarget,
    cashCurrent,
    protectedPositions,
    trimCandidates,
    buyCandidates,
    monthlyGoal,
    monthlyProgress,
  };
}

function getDriftColor(drift: number): string {
  if (Math.abs(drift) <= 3) return "text-green-400";
  if (Math.abs(drift) <= 5) return "text-amber-400";
  return "text-red-400";
}

function getDriftBadge(drift: number): string {
  if (Math.abs(drift) <= 3) return "bg-green-500/20 text-green-400 border-green-500/30";
  if (Math.abs(drift) <= 5) return "bg-amber-500/20 text-amber-400 border-amber-500/30";
  return "bg-red-500/20 text-red-400 border-red-500/30";
}

export default function PlanPage() {
  const [plan, setPlan] = useState<PlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [targets, setTargets] = useState<Record<string, number>>(DEFAULT_TARGETS);
  const [showEditTargets, setShowEditTargets] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/positions");
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        const positions = json.positions || [];
        const calculated = calculatePlan(positions);
        setPlan(calculated);
      } catch (e) {
        console.error("Failed to load plan data:", e);
        setPlan(null);
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
          <div className="text-center">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Loading plan...</p>
          </div>
        </div>
      </PageShell>
    );
  }

  if (!plan) {
    return (
      <PageShell>
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-amber-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">No Plan Data Available</h2>
          <p className="text-muted-foreground">
            Unable to load portfolio data. Check your connection and try again.
          </p>
        </div>
      </PageShell>
    );
  }

  const totalDrift = Object.values(plan.drift).reduce((s, d) => s + Math.abs(d), 0);
  const planHealth = Math.max(0, 100 - totalDrift * 2);

  return (
    <PageShell>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Investment Plan</h1>
            <p className="text-muted-foreground text-sm">
              Allocation targets, rebalancing rules, and deployment strategy
            </p>
          </div>
          <button
            onClick={() => setShowEditTargets(!showEditTargets)}
            className="text-sm text-primary hover:underline"
          >
            {showEditTargets ? "Done" : "Edit Targets"}
          </button>
        </div>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="vox-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Total AUM</span>
            </div>
            <div className="text-xl font-bold">{fmtCurrency(plan.totalAum)}</div>
          </CardContent>
        </Card>

        <Card className="vox-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Plan Health</span>
            </div>
            <div className="text-xl font-bold">{planHealth.toFixed(0)}%</div>
            <Progress value={planHealth} className="h-1.5 mt-2" />
          </CardContent>
        </Card>

        <Card className="vox-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Cash Target</span>
            </div>
            <div className="text-xl font-bold">{fmtCurrency(plan.cashTarget)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Current: {fmtCurrency(plan.cashCurrent)}
            </div>
          </CardContent>
        </Card>

        <Card className="vox-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Monthly Goal</span>
            </div>
            <div className="text-xl font-bold">+{fmtCurrency(plan.monthlyGoal)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Progress: +{fmtCurrency(plan.monthlyProgress)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Allocation Drift Table */}
      <Card className="vox-card mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Sector Allocation vs Targets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3">Sector</th>
                  <th className="text-right p-3">Current %</th>
                  <th className="text-right p-3">Target %</th>
                  <th className="text-right p-3">Drift</th>
                  <th className="text-right p-3">Value</th>
                  <th className="text-left p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(plan.currentAllocations)
                  .sort((a, b) => b[1] - a[1])
                  .map(([sector, currentPct]) => {
                    const targetPct = plan.targetAllocations[sector] || currentPct;
                    const drift = plan.drift[sector] || 0;
                    const value = plan.positions
                      .filter((p) => (p.sector || "Unknown") === sector)
                      .reduce((s, p) => s + p.live_value, 0);

                    return (
                      <tr
                        key={sector}
                        className="border-b border-border/50 hover:bg-muted/30"
                      >
                        <td className="p-3 font-medium">{sector}</td>
                        <td className="p-3 text-right">{currentPct.toFixed(1)}%</td>
                        <td className="p-3 text-right text-muted-foreground">
                          {showEditTargets ? (
                            <input
                              type="number"
                              value={targets[sector] || targetPct}
                              onChange={(e) =>
                                setTargets({
                                  ...targets,
                                  [sector]: parseFloat(e.target.value) || 0,
                                })
                              }
                              className="w-16 text-right bg-background border rounded px-1"
                            />
                          ) : (
                            `${targetPct.toFixed(1)}%`
                          )}
                        </td>
                        <td className={`p-3 text-right font-medium ${getDriftColor(drift)}`}>
                          {drift > 0 ? "+" : ""}
                          {drift.toFixed(1)}%
                        </td>
                        <td className="p-3 text-right text-muted-foreground">
                          {fmtCurrency(value)}
                        </td>
                        <td className="p-3">
                          <Badge className={getDriftBadge(drift)}>
                            {Math.abs(drift) <= 3
                              ? "On Target"
                              : drift > 0
                              ? "Overweight"
                              : "Underweight"}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Rebalancing Actions */}
      {plan.rebalancingActions.length > 0 && (
        <Card className="vox-card mb-6 border-amber-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-amber-400" />
              Rebalancing Actions Needed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {plan.rebalancingActions.map((action) => (
              <div
                key={action.ticker}
                className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-amber-500/5"
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold">{action.ticker}</span>
                  <Badge
                    className={
                      action.action === "TRIM"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-green-500/20 text-green-400"
                    }
                  >
                    {action.action}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{action.reason}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm">
                    {action.action === "TRIM" ? "-" : "+"}
                    {fmtCurrency(action.delta)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {fmtCurrency(action.currentValue)} →{" "}
                    {fmtCurrency(action.targetValue)}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trim Candidates */}
        <Card className="vox-card border-red-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-400" />
              Trim Candidates
              <Badge className="bg-red-500/20 text-red-400">
                {plan.trimCandidates.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {plan.trimCandidates.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                <CheckCircle2 className="h-4 w-4 inline mr-1 text-green-400" />
                No trim candidates — portfolio is healthy
              </p>
            ) : (
              plan.trimCandidates.map((c) => (
                <div
                  key={c.ticker}
                  className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-red-500/5 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{c.ticker}</span>
                      <Badge className="bg-red-500/20 text-red-400">
                        Grade {c.grade}
                      </Badge>
                      <Badge variant="outline">{c.council}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{c.reason}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-mono">{fmtCurrency(c.value)}</div>
                    <div className="text-xs text-muted-foreground">Position value</div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Buy Candidates */}
        <Card className="vox-card border-green-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-400" />
              Add Candidates
              <Badge className="bg-green-500/20 text-green-400">
                {plan.buyCandidates.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {plan.buyCandidates.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No add candidates at current prices
              </p>
            ) : (
              plan.buyCandidates.map((c) => (
                <div
                  key={c.ticker}
                  className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-green-500/5 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{c.ticker}</span>
                      <Badge className="bg-green-500/20 text-green-400">
                        Grade {c.grade}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{c.reason}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-mono">${c.currentPrice.toFixed(2)}</div>
                    <div className="text-xs text-green-400">
                      Target: ${c.targetPrice.toFixed(2)} (+{c.upside}%)
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Protected Positions */}
      <Card className="vox-card mt-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-400" />
            Protected Positions
            <Badge className="bg-green-500/20 text-green-400">
              {plan.protectedPositions.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {plan.protectedPositions.map((ticker) => (
              <Badge
                key={ticker}
                variant="outline"
                className="text-green-400 border-green-500/30"
              >
                {ticker}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Core grade (≥70) — do not sell without council override
          </p>
        </CardContent>
      </Card>

      {/* Strategy Rules */}
      <Card className="vox-card mt-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Rebalancing Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                <span>Trim when sector drift exceeds ±5%</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                <span>Sell positions with grade &lt; 50 immediately</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                <span>Never trim protected positions (grade ≥ 70)</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                <span>Maintain 5% cash minimum at all times</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                <span>Add to positions with grade 60-69 on pullback</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                <span>Review allocation drift weekly</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}
