"use client";

import { useState, useEffect } from "react";
import { PageShell } from "@/components/vox-nav";
import { VoxCard, VoxBadge, VoxKpi } from "@/components/vox-card";
import { colors, getGradeStyle } from "@/lib/design-system";
import { fmtCurrency } from "@/lib/format";
import { getTotalValue, getTotalPnL, gradeMap, dashboardMeta, calculateTotalValue, calculateTotalPnL, calculateBrokerBreakdown } from "@/lib/data";
import {
  TrendingUp, TrendingDown, Target, ShieldAlert, Zap,
  BarChart3, AlertTriangle, Clock, ChevronRight
} from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const [positions, setPositions] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [regime, setRegime] = useState({ regime: "UNKNOWN", confidence: 50, bullish: 0, bearish: 0 });

  useEffect(() => {
    async function loadData() {
      try {
        const [posRes, gradesRes, harnessRes] = await Promise.all([
          fetch("/api/positions"),
          fetch("/api/grades"),
          fetch("/api/harness"),
        ]);
        if (!posRes.ok) throw new Error("Failed to fetch positions");
        const posJson = await posRes.json();
        const gradesJson = await gradesRes.json();
        setPositions(posJson.positions || []);
        setGrades(gradesJson.grades || []);
        
        if (harnessRes.ok) {
          const harnessJson = await harnessRes.json();
          const l5 = harnessJson.layer5 || {};
          setRegime({
            regime: l5.regime || "UNKNOWN",
            confidence: l5.confidence || 50,
            bullish: l5.bullish_count || 0,
            bearish: l5.bearish_count || 0,
          });
        }
      } catch (e) {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalValue = positions.length > 0 ? calculateTotalValue(positions) : getTotalValue();
  const totalPnl = positions.length > 0 ? calculateTotalPnL(positions) : getTotalPnL();
  const liveBrokerBreakdown = positions.length > 0 ? calculateBrokerBreakdown(positions) : null;

  const dataAge = positions.length > 0 && positions[0]?.updated_at
    ? Math.round((Date.now() - new Date(positions[0].updated_at).getTime()) / (1000 * 60 * 60))
    : dashboardMeta.generatedAt
    ? Math.round((Date.now() - new Date(dashboardMeta.generatedAt).getTime()) / (1000 * 60 * 60))
    : null;
  const isStale = dataAge !== null && dataAge > 24;

  const enrichedPositions = positions.map((p: any) => ({
    ...p,
    grade: gradeMap[p.ticker]?.grade || p.grade || 0,
  }));

  // Merge with VOX grades for actions
  const gradeMapLive: Record<string, any> = {};
  grades.forEach((g: any) => {
    gradeMapLive[g.ticker] = g;
  });

  const positionsWithActions = enrichedPositions.map((p: any) => ({
    ...p,
    vox_grade: gradeMapLive[p.ticker]?.vox_grade || p.grade || 0,
    action: gradeMapLive[p.ticker]?.action || "HOLD",
    stop_loss: gradeMapLive[p.ticker]?.stop_loss || 0,
  }));

  const trimPositions = positionsWithActions.filter((p: any) => p.action === "TRIM").sort((a: any, b: any) => b.vox_grade - a.vox_grade);
  const newOpportunities = grades.filter((g: any) => g.action === "BUY" && (g.position_value || 0) === 0).sort((a: any, b: any) => b.vox_grade - a.vox_grade);

  const sellPositions = positionsWithActions.filter((p: any) => p.grade > 0 && p.grade < 50);
  const holdPositions = positionsWithActions.filter((p: any) => p.grade >= 50 && p.grade < 60);
  const corePositions = positionsWithActions.filter((p: any) => p.grade >= 70);
  const ungradedPositions = positionsWithActions.filter((p: any) => p.grade === 0);

  const sellValue = sellPositions.reduce((sum: number, p: any) => sum + (p.value || p.live_value || 0), 0);
  const topHoldings = [...enrichedPositions].sort((a: any, b: any) => (b.value || b.live_value || 0) - (a.value || a.live_value || 0)).slice(0, 10);

  const brokerBreakdown = liveBrokerBreakdown
    ? Object.entries(liveBrokerBreakdown).map(([broker, value]) => ({
        broker,
        value: value as number,
        stale: false,
      })).sort((a: any, b: any) => b.value - a.value)
    : (() => {
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

  if (loading) {
    return (
      <PageShell>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-6 w-6 border-2 rounded-full mx-auto"
            style={{ borderColor: colors.foreground, borderTopColor: "transparent" }}
          />
        </div>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-6 w-6 mx-auto mb-3" style={{ color: colors.loss }} />
            <p style={{ color: colors.foreground }}>{error}</p>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      {/* Header */}
      <div className="mb-10">
        <h1
          className="font-semibold"
          style={{
            fontSize: "40px",
            lineHeight: 1.2,
            letterSpacing: "-2.4px",
            color: colors.foreground,
          }}
        >
          Today&apos;s Command Center
        </h1>
        <div className="flex items-center gap-3 mt-2">
          <p style={{ color: colors.muted, fontSize: "14px" }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" })}
          </p>
          {isStale && (
            <span className="flex items-center gap-1 text-xs" style={{ color: colors.warning }}>
              <AlertTriangle className="h-3 w-3" />
              Data is {dataAge}h old
            </span>
          )}
          {!isStale && dashboardMeta.generatedAt && (
            <span className="flex items-center gap-1 text-xs" style={{ color: colors.profit }}>
              <Clock className="h-3 w-3" />
              Fresh — {dataAge}h ago
            </span>
          )}
        </div>
      </div>

      {/* URGENT ALERTS */}
      {sellPositions.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert className="h-4 w-4" style={{ color: colors.loss }} />
            <h2
              className="text-sm font-semibold uppercase"
              style={{ color: colors.loss, letterSpacing: "-0.32px" }}
            >
              {sellPositions.length} Positions Require Action
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {sellPositions.slice(0, 6).map((p: any) => {
              const gradeStyle = getGradeStyle(p.grade);
              return (
                <VoxCard key={p.ticker} hover>
                  <div className="p-3">
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-sm font-semibold" style={{ color: colors.foreground }}>
                        {p.ticker}
                      </span>
                      <span
                        className="text-[11px] font-mono font-medium px-1.5 py-0.5 rounded"
                        style={{ color: gradeStyle.color, background: gradeStyle.bg }}
                      >
                        {p.grade}
                      </span>
                    </div>
                    <p className="text-xs mt-1" style={{ color: colors.muted }}>
                      {fmtCurrency(p.value || p.live_value || 0)}
                    </p>
                  </div>
                </VoxCard>
              );
            })}
          </div>
          <div className="flex justify-between items-center mt-3">
            <span style={{ color: colors.muted, fontSize: "13px" }}>
              Cash freed if sold:{" "}
              <span className="font-mono font-semibold" style={{ color: colors.loss }}>
                {fmtCurrency(sellValue)} USD
              </span>
            </span>
            <Link
              href="/plays"
              className="flex items-center gap-1 text-sm hover:underline"
              style={{ color: colors.accent }}
            >
              Go to Plays <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}

      {/* NEW OPPORTUNITIES */}
      {newOpportunities.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-4 w-4" style={{ color: colors.accent }} />
            <h2 className="text-sm font-semibold uppercase" style={{ color: colors.accent, letterSpacing: "-0.32px" }}>
              Top {Math.min(newOpportunities.length, 6)} New Opportunities
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {newOpportunities.slice(0, 6).map((g: any) => {
              const gradeStyle = getGradeStyle(g.vox_grade);
              return (
                <VoxCard key={g.ticker} hover>
                  <div className="p-3">
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-sm font-semibold" style={{ color: colors.foreground }}>{g.ticker}</span>
                      <span className="text-[11px] font-mono font-medium px-1.5 py-0.5 rounded" style={{ color: gradeStyle.color, background: gradeStyle.bg }}>
                        {g.vox_grade}
                      </span>
                    </div>
                    <p className="text-xs mt-1" style={{ color: colors.muted }}>
                      Entry ${g.entry_point?.toFixed(2)} → Target ${(g.entry_point * 1.15)?.toFixed(2)}
                    </p>
                  </div>
                </VoxCard>
              );
            })}
          </div>
          <div className="flex justify-end mt-3">
            <Link href="/grades" className="flex items-center gap-1 text-sm hover:underline" style={{ color: colors.accent }}>
              View all opportunities <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}

      {/* KPI ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <VoxKpi
          label="Total AUM"
          value={fmtCurrency(totalValue)}
          sub={totalPnl >= 0 ? `+${fmtCurrency(totalPnl).replace("$", "")}` : `-${fmtCurrency(Math.abs(totalPnl)).replace("$", "")}`}
          subVariant={totalPnl >= 0 ? "profit" : "loss"}
          icon={totalPnl >= 0 ? <TrendingUp className="h-3 w-3" style={{ color: colors.profit }} /> : <TrendingDown className="h-3 w-3" style={{ color: colors.loss }} />}
        />
        <VoxKpi
          label="Positions"
          value={`${positions.length > 0 ? positions.length : dashboardMeta.totalPositions}`}
          sub={`${trimPositions.length} TRIM · ${newOpportunities.length} BUY`}
        />
        <VoxKpi
          label="USD / MXN"
          value={dashboardMeta.usdMxnRate.toFixed(2)}
          sub={dashboardMeta.usdMxnDate || "Today"}
        />
        <VoxKpi
          label="Market Regime"
          value={regime.regime}
          sub={regime.bearish > regime.bullish ? `${regime.bearish} bearish vs ${regime.bullish} bullish signals` : `${regime.bullish} bullish vs ${regime.bearish} bearish signals`}
        />
      </div>

      {/* HOLDINGS + DISTRIBUTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Top Holdings Table */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4" style={{ color: colors.accent }} />
            <h2
              className="font-semibold"
              style={{
                fontSize: "24px",
                letterSpacing: "-0.96px",
                color: colors.foreground,
              }}
            >
              Top 10 Holdings
            </h2>
          </div>
          <VoxCard variant="stack">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                  {["Ticker", "Value", "P&L", "Grade", "Broker"].map((h) => (
                    <th
                      key={h}
                      className="text-left p-3 font-medium"
                      style={{ color: colors.muted, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topHoldings.map((p: any) => {
                  const gradeStyle = getGradeStyle(p.grade);
                  return (
                    <tr
                      key={p.ticker}
                      style={{ borderBottom: `1px solid ${colors.border}` }}
                    >
                      <td className="p-3">
                        <span className="font-mono font-semibold text-sm" style={{ color: colors.foreground }}>{p.ticker}</span>
                      </td>
                      <td className="p-3 font-mono text-sm" style={{ color: colors.foreground }}>
                        {fmtCurrency(p.value || p.live_value || 0)}
                      </td>
                      <td className="p-3 text-right">
                        <span
                          className="text-sm"
                          style={{ color: (p.pnl_pct || 0) >= 0 ? colors.profit : colors.loss }}
                        >
                          {p.avg_cost > 0 ? `${(p.pnl_pct || 0) >= 0 ? "+" : ""}${p.pnl_pct || 0}%` : "N/A"}
                        </span>
                      </td>
                      <td className="p-3">
                        {p.grade > 0 ? (
                          <VoxBadge variant="grade" grade={p.grade}>{p.grade}</VoxBadge>
                        ) : (
                          <span style={{ color: colors.mutedLight, fontSize: "12px" }}>—</span>
                        )}
                      </td>
                      <td className="p-3 text-xs" style={{ color: colors.muted }}>
                        {(p.brokers || [p.broker]).join(", ")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <Link
              href="/portfolio"
              className="flex items-center gap-1 p-3 text-sm hover:underline transition-colors"
              style={{ color: colors.accent, borderTop: `1px solid ${colors.border}` }}
            >
              View all {positions.length} positions <ChevronRight className="h-3 w-3" />
            </Link>
          </VoxCard>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Grade Distribution */}
          <VoxCard className="p-4">
            <h3
              className="font-semibold mb-3"
              style={{ fontSize: "13px", letterSpacing: "-0.32px", color: colors.foreground }}
            >
              Grade Distribution
            </h3>
            <div className="space-y-2">
              {[
                { label: "Core (70+)", count: corePositions.length, color: colors.gradeCore },
                { label: "Buy (60-69)", count: holdPositions.length, color: colors.gradeBuy },
                { label: "Hold (50-59)", count: trimPositions.length, color: colors.gradeHold },
                { label: "Sell (<50)", count: sellPositions.length, color: colors.gradeSell },
                { label: "Ungraded", count: ungradedPositions.length, color: colors.gradeUngraded },
              ].map((bucket) => (
                <div key={bucket.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: bucket.color }} />
                    <span style={{ fontSize: "13px", color: colors.muted }}>{bucket.label}</span>
                  </div>
                  <span className="font-mono text-sm" style={{ color: colors.foreground }}>{bucket.count}</span>
                </div>
              ))}
            </div>
          </VoxCard>

          {/* By Broker */}
          <VoxCard className="p-4">
            <h3
              className="font-semibold mb-3"
              style={{ fontSize: "13px", letterSpacing: "-0.32px", color: colors.foreground }}
            >
              By Broker
            </h3>
            <div className="space-y-2">
              {brokerBreakdown.map((b: any) => (
                <div key={b.broker} className="flex items-center justify-between">
                  <span style={{ fontSize: "13px", color: colors.muted }}>{b.broker}</span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-sm" style={{ color: colors.foreground }}>
                      {fmtCurrency(b.value)}
                    </span>
                    {b.stale && <span style={{ color: colors.warning, fontSize: "11px" }}>⚠</span>}
                  </div>
                </div>
              ))}
            </div>
          </VoxCard>
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
            <VoxCard hover className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <link.icon className="h-4 w-4" style={{ color: colors.accent }} />
                <span style={{ fontSize: "14px", fontWeight: 500, color: colors.foreground }}>{link.label}</span>
              </div>
              <p style={{ fontSize: "12px", color: colors.muted }}>{link.desc}</p>
            </VoxCard>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
