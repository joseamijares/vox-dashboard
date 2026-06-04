"use client";

import { useState, useEffect } from "react";
import { PageShell } from "@/components/vox-nav";
import { VoxCard } from "@/components/vox-card";
import { colors, getGradeStyle } from "@/lib/design-system";
import { fmtCurrency } from "@/lib/format";
import { Zap, TrendingUp, Target, AlertTriangle } from "lucide-react";

interface Grade {
  ticker: string;
  name: string;
  vox_grade: number;
  previous_grade: number;
  action: string;
  current_price: number;
  stop_loss: number;
  entry_point: number;
  position_value: number;
  shares: number;
  technical_score: number;
  fundamental_score: number;
  macro_score: number;
  sector_score: number;
  weather_score: number;
  sentiment_score: number;
  catalysts: string;
  weather_factors: string;
}

export default function GradesPage() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/grades");
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        setGrades(json.grades || []);
      } catch (e) {
        setError("Failed to load grades");
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

  const positions = grades.filter((g) => (g.position_value || 0) > 0);
  const opportunities = grades.filter((g) => (g.position_value || 0) === 0 && g.action === "BUY");

  const trimPositions = positions.filter((g) => g.action === "TRIM").sort((a, b) => b.vox_grade - a.vox_grade);
  const holdPositions = positions.filter((g) => g.action === "HOLD").sort((a, b) => b.vox_grade - a.vox_grade);

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
          VOX Grades
        </h1>
        <p style={{ color: colors.muted, fontSize: "14px" }}>
          {positions.length} positions graded · {opportunities.length} new opportunities
        </p>
      </div>

      {/* URGENT: TRIM */}
      {trimPositions.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4" style={{ color: colors.profit }} />
            <h2 className="text-sm font-semibold uppercase" style={{ color: colors.profit, letterSpacing: "-0.32px" }}>
              {trimPositions.length} Positions to TRIM — Strong but Extended
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {trimPositions.map((g) => {
              const style = getGradeStyle(g.vox_grade);
              return (
                <VoxCard key={g.ticker} hover>
                  <div className="p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-mono text-sm font-semibold" style={{ color: colors.foreground }}>{g.ticker}</span>
                        <p className="text-xs" style={{ color: colors.muted }}>{g.name}</p>
                      </div>
                      <span className="text-[11px] font-mono font-medium px-1.5 py-0.5 rounded" style={{ color: style.color, background: style.bg }}>
                        {g.vox_grade}
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                      <div><span style={{ color: colors.muted }}>Price:</span> <span className="font-mono" style={{ color: colors.foreground }}>${g.current_price?.toFixed(2)}</span></div>
                      <div><span style={{ color: colors.muted }}>Stop:</span> <span className="font-mono" style={{ color: colors.loss }}>${g.stop_loss?.toFixed(2)}</span></div>
                    </div>
                    <div className="mt-2 flex gap-1">
                      {["technical", "fundamental", "macro", "sector", "sentiment"].map((layer) => {
                        const score = g[`${layer}_score` as keyof Grade] as number;
                        return (
                          <div key={layer} className="flex-1 text-center">
                            <div className="text-[9px] uppercase" style={{ color: colors.muted }}>{layer.slice(0, 3)}</div>
                            <div className="text-[10px] font-mono" style={{ color: score >= 70 ? colors.profit : score >= 50 ? colors.foreground : colors.loss }}>{score}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </VoxCard>
              );
            })}
          </div>
        </div>
      )}

      {/* NEW OPPORTUNITIES */}
      {opportunities.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-4 w-4" style={{ color: colors.accent }} />
            <h2 className="text-sm font-semibold uppercase" style={{ color: colors.accent, letterSpacing: "-0.32px" }}>
              Top {opportunities.length} New Opportunities — 6-Layer Scan
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {opportunities.slice(0, 12).map((g) => {
              const style = getGradeStyle(g.vox_grade);
              return (
                <VoxCard key={g.ticker} hover>
                  <div className="p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-mono text-sm font-semibold" style={{ color: colors.foreground }}>{g.ticker}</span>
                        <p className="text-xs" style={{ color: colors.muted }}>{g.name}</p>
                      </div>
                      <span className="text-[11px] font-mono font-medium px-1.5 py-0.5 rounded" style={{ color: style.color, background: style.bg }}>
                        {g.vox_grade}
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                      <div><span style={{ color: colors.muted }}>Entry:</span> <span className="font-mono" style={{ color: colors.profit }}>${g.entry_point?.toFixed(2)}</span></div>
                      <div><span style={{ color: colors.muted }}>Stop:</span> <span className="font-mono" style={{ color: colors.loss }}>${g.stop_loss?.toFixed(2)}</span></div>
                    </div>
                    <div className="mt-2 flex gap-1">
                      {["technical", "fundamental", "macro", "sector", "sentiment"].map((layer) => {
                        const score = g[`${layer}_score` as keyof Grade] as number;
                        return (
                          <div key={layer} className="flex-1 text-center">
                            <div className="text-[9px] uppercase" style={{ color: colors.muted }}>{layer.slice(0, 3)}</div>
                            <div className="text-[10px] font-mono" style={{ color: score >= 70 ? colors.profit : score >= 50 ? colors.foreground : colors.loss }}>{score}</div>
                          </div>
                        );
                      })}
                    </div>
                    {g.weather_factors && g.weather_factors !== "None" && (
                      <p className="mt-2 text-[10px]" style={{ color: colors.warning }}>☀ {g.weather_factors}</p>
                    )}
                  </div>
                </VoxCard>
              );
            })}
          </div>
        </div>
      )}

      {/* ALL POSITIONS TABLE */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-4 w-4" style={{ color: colors.accent }} />
          <h2 className="font-semibold" style={{ fontSize: "24px", letterSpacing: "-0.96px", color: colors.foreground }}>
            All Positions
          </h2>
        </div>
        <VoxCard variant="stack">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                {["Ticker", "Grade", "Action", "Price", "Stop", "Value", "Tech", "Fund", "Macro", "Sect", "Sent"].map((h) => (
                  <th key={h} className="text-left p-3 font-medium" style={{ color: colors.muted, fontSize: "11px", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {positions.sort((a, b) => b.vox_grade - a.vox_grade).map((g) => {
                const style = getGradeStyle(g.vox_grade);
                return (
                  <tr key={g.ticker} style={{ borderBottom: `1px solid ${colors.border}` }}>
                    <td className="p-3">
                      <span className="font-mono font-semibold text-sm" style={{ color: colors.foreground }}>{g.ticker}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-[11px] font-mono font-medium px-1.5 py-0.5 rounded" style={{ color: style.color, background: style.bg }}>
                        {g.vox_grade}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-xs font-medium" style={{
                        color: g.action === "TRIM" ? colors.profit : g.action === "SELL" ? colors.loss : g.action === "BUY" ? colors.accent : colors.foreground
                      }}>
                        {g.action}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-sm" style={{ color: colors.foreground }}>${g.current_price?.toFixed(2)}</td>
                    <td className="p-3 font-mono text-sm" style={{ color: colors.loss }}>${g.stop_loss?.toFixed(2)}</td>
                    <td className="p-3 font-mono text-sm" style={{ color: colors.foreground }}>{fmtCurrency(g.position_value || 0)}</td>
                    <td className="p-3 font-mono text-xs" style={{ color: g.technical_score >= 70 ? colors.profit : colors.muted }}>{g.technical_score}</td>
                    <td className="p-3 font-mono text-xs" style={{ color: g.fundamental_score >= 70 ? colors.profit : colors.muted }}>{g.fundamental_score}</td>
                    <td className="p-3 font-mono text-xs" style={{ color: g.macro_score >= 70 ? colors.profit : colors.muted }}>{g.macro_score}</td>
                    <td className="p-3 font-mono text-xs" style={{ color: g.sector_score >= 70 ? colors.profit : colors.muted }}>{g.sector_score}</td>
                    <td className="p-3 font-mono text-xs" style={{ color: g.sentiment_score >= 70 ? colors.profit : colors.muted }}>{g.sentiment_score}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </VoxCard>
      </div>
    </PageShell>
  );
}
