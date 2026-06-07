import { PageShell } from "@/components/vox-nav";
import { VoxCard } from "@/components/vox-card";
import { VoxBadge } from "@/components/vox";
import { getGradeStyle } from "@/lib/design-system";
import { fmtCurrency } from "@/lib/format";
import { getVoxGrades } from "@/lib/db";
import { Zap, TrendingUp, Target } from "lucide-react";

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

export const dynamic = "force-dynamic";

export default async function GradesPage() {
  const grades = await getVoxGrades() as Grade[];

  const positions = grades.filter((g) => (g.position_value || 0) > 0);
  const opportunities = grades.filter((g) => (g.position_value || 0) === 0 && g.action === "BUY");

  const trimPositions = positions.filter((g) => g.action === "TRIM").sort((a, b) => b.vox_grade - a.vox_grade);
  const holdPositions = positions.filter((g) => g.action === "HOLD").sort((a, b) => b.vox_grade - a.vox_grade);

  return (
    <PageShell>
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">
          VOX Grades
        </h1>
        <p className="text-sm text-muted-foreground">
          {positions.length} positions graded · {opportunities.length} new opportunities
        </p>
      </div>

      {/* URGENT: TRIM */}
      {trimPositions.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-profit" />
            <h2 className="text-sm font-semibold uppercase text-profit tracking-tight">
              {trimPositions.length} Positions to TRIM — Strong but Extended
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {trimPositions.map((g) => {
              return (
                <VoxCard key={g.ticker} hover>
                  <div className="p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-mono text-sm font-semibold text-foreground">{g.ticker}</span>
                        <p className="text-xs text-muted-foreground">{g.name}</p>
                      </div>
                      <VoxBadge grade={g.vox_grade} />
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                      <div><span className="text-muted-foreground">Price:</span> <span className="font-mono text-foreground">${g.current_price?.toFixed(2)}</span></div>
                      <div><span className="text-muted-foreground">Stop:</span> <span className="font-mono text-loss">${g.stop_loss?.toFixed(2)}</span></div>
                    </div>
                    <div className="mt-2 flex gap-1">
                      {["technical", "fundamental", "macro", "sector", "sentiment"].map((layer) => {
                        const score = g[`${layer}_score` as keyof Grade] as number;
                        return (
                          <div key={layer} className="flex-1 text-center">
                            <div className="text-[9px] uppercase text-muted-foreground">{layer.slice(0, 3)}</div>
                            <div className={`text-[10px] font-mono ${score >= 70 ? "text-profit" : score >= 50 ? "text-foreground" : "text-loss"}`}>{score}</div>
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
            <Target className="h-4 w-4 text-accent" />
            <h2 className="text-sm font-semibold uppercase text-accent tracking-tight">
              Top {opportunities.length} New Opportunities — 6-Layer Scan
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {opportunities.slice(0, 12).map((g) => {
              return (
                <VoxCard key={g.ticker} hover>
                  <div className="p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-mono text-sm font-semibold text-foreground">{g.ticker}</span>
                        <p className="text-xs text-muted-foreground">{g.name}</p>
                      </div>
                      <VoxBadge grade={g.vox_grade} />
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                      <div><span className="text-muted-foreground">Entry:</span> <span className="font-mono text-profit">${g.entry_point?.toFixed(2)}</span></div>
                      <div><span className="text-muted-foreground">Stop:</span> <span className="font-mono text-loss">${g.stop_loss?.toFixed(2)}</span></div>
                    </div>
                    <div className="mt-2 flex gap-1">
                      {["technical", "fundamental", "macro", "sector", "sentiment"].map((layer) => {
                        const score = g[`${layer}_score` as keyof Grade] as number;
                        return (
                          <div key={layer} className="flex-1 text-center">
                            <div className="text-[9px] uppercase text-muted-foreground">{layer.slice(0, 3)}</div>
                            <div className={`text-[10px] font-mono ${score >= 70 ? "text-profit" : score >= 50 ? "text-foreground" : "text-loss"}`}>{score}</div>
                          </div>
                        );
                      })}
                    </div>
                    {g.weather_factors && g.weather_factors !== "None" && (
                      <p className="mt-2 text-[10px] text-warning">☀ {g.weather_factors}</p>
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
          <Zap className="h-4 w-4 text-accent" />
          <h2 className="font-semibold text-2xl font-semibold tracking-tight text-foreground">
            All Positions
          </h2>
        </div>
        <VoxCard variant="stack">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Ticker", "Grade", "Action", "Price", "Stop", "Value", "Tech", "Fund", "Macro", "Sect", "Sent"].map((h) => (
                  <th key={h} className="text-left p-3 font-medium text-muted-foreground text-[11px] uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {positions.sort((a, b) => b.vox_grade - a.vox_grade).map((g) => {
                return (
                  <tr key={g.ticker} className="border-b border-border">
                    <td className="p-3">
                      <span className="font-mono font-semibold text-sm text-foreground">{g.ticker}</span>
                    </td>
                    <td className="p-3">
                      <VoxBadge grade={g.vox_grade} />
                    </td>
                    <td className="p-3">
                      <VoxBadge grade={g.vox_grade} label={g.action} />
                    </td>
                    <td className="p-3 font-mono text-sm text-foreground">${g.current_price?.toFixed(2)}</td>
                    <td className="p-3 font-mono text-sm text-loss">${g.stop_loss?.toFixed(2)}</td>
                    <td className="p-3 font-mono text-sm text-foreground">{fmtCurrency(g.position_value || 0)}</td>
                    <td className={`p-3 font-mono text-xs ${g.technical_score >= 70 ? "text-profit" : "text-muted-foreground"}`}>{g.technical_score}</td>
                    <td className={`p-3 font-mono text-xs ${g.fundamental_score >= 70 ? "text-profit" : "text-muted-foreground"}`}>{g.fundamental_score}</td>
                    <td className={`p-3 font-mono text-xs ${g.macro_score >= 70 ? "text-profit" : "text-muted-foreground"}`}>{g.macro_score}</td>
                    <td className={`p-3 font-mono text-xs ${g.sector_score >= 70 ? "text-profit" : "text-muted-foreground"}`}>{g.sector_score}</td>
                    <td className={`p-3 font-mono text-xs ${g.sentiment_score >= 70 ? "text-profit" : "text-muted-foreground"}`}>{g.sentiment_score}</td>
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
