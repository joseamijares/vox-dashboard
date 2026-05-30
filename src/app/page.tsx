"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MobileHeader } from "@/components/mobile-header";
import { Sidebar } from "@/components/sidebar";
import { getPositions, getTotalValue, getTotalPnL, gradeMap, dashboardMeta, calculateTotalValue, calculateTotalPnL, calculateBrokerBreakdown } from "@/lib/data";
import {
  TrendingUp, TrendingDown, Target, ArrowRight,
  ShieldAlert, Zap, BarChart3, AlertTriangle, Clock,
  ChevronRight
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

  // Use LIVE data for totals, fallback to JSON only if no positions loaded
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
    gradeCategory: gradeMap[p.ticker]?.category || "ungraded",
  }));

  const sellPositions = enrichedPositions.filter((p: any) => p.grade > 0 && p.grade < 50);
  const trimPositions = enrichedPositions.filter((p: any) => p.grade >= 50 && p.grade < 60);
  const holdPositions = enrichedPositions.filter((p: any) => p.grade >= 60 && p.grade < 70);
  const corePositions = enrichedPositions.filter((p: any) => p.grade >= 70);
  const ungradedPositions = enrichedPositions.filter((p: any) => p.grade === 0);

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

  const staleCount = brokerBreakdown.filter((b: any) => b.stale).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-14 lg:pt-0" style={{ background: '#ffffff' }}>
        <div className="text-center">
          <div className="animate-spin h-6 w-6 border-2 border-[#171717] border-t-transparent rounded-full mx-auto mb-3"></div>
          <p style={{ color: '#666666', fontSize: '14px' }}>Loading portfolio data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-14 lg:pt-0" style={{ background: '#ffffff' }}>
        <div className="text-center">
          <AlertTriangle className="h-6 w-6 mx-auto mb-3" style={{ color: '#dc2626' }} />
          <p style={{ color: '#171717', fontSize: '14px' }}>{error}</p>
          <p style={{ color: '#666666', fontSize: '12px', marginTop: '4px' }}>Using fallback data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#ffffff' }}>
      <MobileHeader />
      <Sidebar />
      <main className="pt-14 lg:pt-0 lg:ml-64 p-6 lg:p-10">
        {/* Header */}
        <div className="mb-10">
          <h1 style={{
            fontSize: '40px',
            fontWeight: 600,
            lineHeight: 1.2,
            letterSpacing: '-2.4px',
            color: '#171717',
          }}>
            Today's Command Center
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <p style={{ color: '#666666', fontSize: '14px' }}>
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" })}
            </p>
            {isStale && (
              <span className="flex items-center gap-1 text-xs" style={{ color: '#f59e0b' }}>
                <AlertTriangle className="h-3 w-3" />
                Data is {dataAge}h old
              </span>
            )}
            {!isStale && dashboardMeta.generatedAt && (
              <span className="flex items-center gap-1 text-xs" style={{ color: '#00a86b' }}>
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
              <ShieldAlert className="h-4 w-4" style={{ color: '#dc2626' }} />
              <h2 style={{
                fontSize: '14px',
                fontWeight: 600,
                letterSpacing: '-0.32px',
                color: '#dc2626',
                textTransform: 'uppercase',
              }}>
                {sellPositions.length} Positions Require Action
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {sellPositions.slice(0, 6).map((p: any) => (
                <div
                  key={p.ticker}
                  className="p-3 rounded-lg transition-all hover:translate-y-[-1px]"
                  style={{
                    background: '#ffffff',
                    boxShadow: 'rgba(0,0,0,0.08) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 2px',
                  }}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-sm font-semibold" style={{ color: '#171717' }}>
                      {p.ticker}
                    </span>
                    <span
                      className="text-[11px] font-mono font-medium px-1.5 py-0.5 rounded"
                      style={{ color: '#dc2626', background: 'rgba(220,38,38,0.08)' }}
                    >
                      {p.grade}
                    </span>
                  </div>
                  <p className="text-xs mt-1" style={{ color: '#666666' }}>
                    ${(p.value || p.live_value || 0).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center mt-3">
              <span style={{ color: '#666666', fontSize: '13px' }}>
                Cash freed if sold: <span className="font-mono font-semibold" style={{ color: '#dc2626' }}>${sellValue.toLocaleString()}</span>
              </span>
              <Link href="/plays" className="flex items-center gap-1 text-sm hover:underline" style={{ color: '#0072f5' }}>
                Go to Plays <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        )}

        {/* KPI ROW */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Total AUM",
              value: `$${totalValue.toLocaleString()}`,
              sub: totalPnl >= 0 ? `+$${totalPnl.toLocaleString()}` : `-$${Math.abs(totalPnl).toLocaleString()}`,
              subColor: totalPnl >= 0 ? '#00a86b' : '#dc2626',
              icon: totalPnl >= 0 ? TrendingUp : TrendingDown,
            },
            {
              label: "Positions",
              value: `${positions.length > 0 ? positions.length : dashboardMeta.totalPositions}`,
              sub: `Across ${brokerBreakdown.length} brokers`,
              subColor: '#666666',
              icon: null,
            },
            {
              label: "USD / MXN",
              value: dashboardMeta.usdMxnRate.toFixed(2),
              sub: dashboardMeta.usdMxnDate || 'Today',
              subColor: '#666666',
              icon: null,
            },
            {
              label: "Market Regime",
              value: "EARLY_BULL",
              sub: "Buy pullbacks, tight stops",
              subColor: '#666666',
              icon: null,
            },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="p-4 rounded-lg"
              style={{
                background: '#ffffff',
                boxShadow: 'rgba(0,0,0,0.08) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 2px, #fafafa 0px 0px 0px 1px',
              }}
            >
              <p style={{ color: '#666666', fontSize: '12px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {kpi.label}
              </p>
              <p className="font-mono text-xl font-semibold mt-1" style={{ color: '#171717', letterSpacing: '-0.96px' }}>
                {kpi.value}
              </p>
              {kpi.sub && (
                <div className="flex items-center gap-1 mt-1">
                  {kpi.icon && <kpi.icon className="h-3 w-3" style={{ color: kpi.subColor }} />}
                  <span className="text-xs" style={{ color: kpi.subColor }}>{kpi.sub}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* HOLDINGS + DISTRIBUTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Top Holdings Table */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-4 w-4" style={{ color: '#0072f5' }} />
              <h2 style={{
                fontSize: '24px',
                fontWeight: 600,
                letterSpacing: '-0.96px',
                color: '#171717',
              }}>
                Top 10 Holdings
              </h2>
            </div>
            <div
              className="rounded-lg overflow-hidden"
              style={{
                background: '#ffffff',
                boxShadow: 'rgba(0,0,0,0.08) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 2px, rgba(0,0,0,0.04) 0px 8px 8px -8px, #fafafa 0px 0px 0px 1px',
              }}
            >
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                    {['Ticker', 'Value', 'P&L', 'Grade', 'Broker'].map((h) => (
                      <th key={h} className="text-left p-3 font-medium" style={{ color: '#666666', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {topHoldings.map((p: any) => (
                    <tr
                      key={p.ticker}
                      className="transition-colors"
                      style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}
                    >
                      <td className="p-3">
                        <span className="font-mono font-semibold text-sm" style={{ color: '#171717' }}>{p.ticker}</span>
                      </td>
                      <td className="p-3 font-mono text-sm" style={{ color: '#171717' }}>
                        ${(p.value || p.live_value || 0).toLocaleString()}
                      </td>
                      <td className="p-3">
                        <span className="text-sm" style={{ color: (p.pnl_pct || 0) >= 0 ? '#00a86b' : '#dc2626' }}>
                          {(p.pnl_pct || 0) >= 0 ? '+' : ''}{p.pnl_pct || 0}%
                        </span>
                      </td>
                      <td className="p-3">
                        {p.grade > 0 ? (
                          <span
                            className="text-xs font-mono font-medium px-2 py-0.5 rounded"
                            style={
                              p.grade >= 70 ? { color: '#00a86b', background: 'rgba(0,168,107,0.08)' } :
                              p.grade >= 60 ? { color: '#0072f5', background: 'rgba(0,114,245,0.08)' } :
                              p.grade >= 50 ? { color: '#f59e0b', background: 'rgba(245,158,11,0.08)' } :
                              { color: '#dc2626', background: 'rgba(220,38,38,0.08)' }
                            }
                          >
                            {p.grade}
                          </span>
                        ) : (
                          <span style={{ color: '#808080', fontSize: '12px' }}>—</span>
                        )}
                      </td>
                      <td className="p-3 text-xs" style={{ color: '#666666' }}>
                        {(p.brokers || [p.broker]).join(', ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Link
                href="/portfolio"
                className="flex items-center gap-1 p-3 text-sm hover:underline transition-colors"
                style={{ color: '#0072f5', borderTop: '1px solid rgba(0,0,0,0.08)' }}
              >
                View all {positions.length} positions <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Grade Distribution */}
            <div
              className="p-4 rounded-lg"
              style={{
                background: '#ffffff',
                boxShadow: 'rgba(0,0,0,0.08) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 2px, #fafafa 0px 0px 0px 1px',
              }}
            >
              <h3 style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '-0.32px', color: '#171717', marginBottom: '12px' }}>
                Grade Distribution
              </h3>
              <div className="space-y-2">
                {[
                  { label: "Core (70+)", count: corePositions.length, color: '#00a86b' },
                  { label: "Buy (60-69)", count: holdPositions.length, color: '#0072f5' },
                  { label: "Hold (50-59)", count: trimPositions.length, color: '#f59e0b' },
                  { label: "Sell (<50)", count: sellPositions.length, color: '#dc2626' },
                  { label: "Ungraded", count: ungradedPositions.length, color: '#808080' },
                ].map((bucket) => (
                  <div key={bucket.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: bucket.color }} />
                      <span style={{ fontSize: '13px', color: '#4d4d4d' }}>{bucket.label}</span>
                    </div>
                    <span className="font-mono text-sm" style={{ color: '#171717' }}>{bucket.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* By Broker */}
            <div
              className="p-4 rounded-lg"
              style={{
                background: '#ffffff',
                boxShadow: 'rgba(0,0,0,0.08) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 2px, #fafafa 0px 0px 0px 1px',
              }}
            >
              <h3 style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '-0.32px', color: '#171717', marginBottom: '12px' }}>
                By Broker
              </h3>
              <div className="space-y-2">
                {brokerBreakdown.map((b: any) => (
                  <div key={b.broker} className="flex items-center justify-between">
                    <span style={{ fontSize: '13px', color: '#4d4d4d' }}>{b.broker}</span>
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-sm" style={{ color: '#171717' }}>
                        ${b.value.toLocaleString()}
                      </span>
                      {b.stale && <span style={{ color: '#f59e0b', fontSize: '11px' }}>⚠</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
              <div
                className="p-4 rounded-lg transition-all hover:translate-y-[-1px] cursor-pointer"
                style={{
                  background: '#ffffff',
                  boxShadow: 'rgba(0,0,0,0.08) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 2px',
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <link.icon className="h-4 w-4" style={{ color: '#0072f5' }} />
                  <span style={{ fontSize: '14px', fontWeight: 500, color: '#171717' }}>{link.label}</span>
                </div>
                <p style={{ fontSize: '12px', color: '#666666' }}>{link.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
