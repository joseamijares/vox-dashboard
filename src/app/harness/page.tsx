import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageShell } from "@/components/vox-nav";
import { VoxBadge } from "@/components/vox";
import { getCouncilAction } from "@/lib/council";
import { AlertCircle, CheckCircle2, Layers, TrendingUp, TrendingDown, Wind, CloudSun } from "lucide-react";

interface HarnessData {
  generated_at: string;
  layer0: {
    aum: number;
    total_positions: number;
    total_watchlist: number;
    graded_positions: number;
    weak_positions: number;
  };
  layer1: {
    sector_allocation: Record<string, number>;
    top_holdings: any[];
    weak_positions: any[];
  };
  layer2: {
    total_famous_traders: number;
    missing_from_portfolio: number;
    top_missing: any[];
  };
  layer3: {
    sector_momentum: any[];
    supply_chain: Record<string, any[]>;
  };
  layer4: {
    macro_signals: any[];
    weather_patterns: any[];
  };
  layer5: {
    regime: string;
    confidence: number;
    bullish_count: number;
    bearish_count: number;
    risk_off_count: number;
  };
  layer6: {
    latest_grades: any[];
  };
}

async function getHarnessData(): Promise<HarnessData> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://web-production-9e321.up.railway.app";
    const res = await fetch(`${baseUrl}/api/harness`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error("Failed to fetch harness data");
    return await res.json();
  } catch (error) {
    console.error("Harness fetch error:", error);
    return {
      generated_at: new Date().toISOString(),
      layer0: { aum: 0, total_positions: 0, total_watchlist: 0, graded_positions: 0, weak_positions: 0 },
      layer1: { sector_allocation: {}, top_holdings: [], weak_positions: [] },
      layer2: { total_famous_traders: 0, missing_from_portfolio: 0, top_missing: [] },
      layer3: { sector_momentum: [], supply_chain: {} },
      layer4: { macro_signals: [], weather_patterns: [] },
      layer5: { regime: "UNKNOWN", confidence: 0, bullish_count: 0, bearish_count: 0, risk_off_count: 0 },
      layer6: { latest_grades: [] },
    };
  }
}

function LayerCard({
  number,
  title,
  status,
  children,
}: {
  number: number;
  title: string;
  status: "ok" | "warning" | "error";
  children: React.ReactNode;
}) {
  const statusColors = {
    ok: "bg-green-500",
    warning: "bg-amber-500",
    error: "bg-red-500",
  };
  return (
    <Card className="border-l-4 border-l-neutral-200">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full ${statusColors[status]} flex items-center justify-center text-white text-sm font-bold`}>
            {number}
          </div>
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );
}

function getGradeStyle(grade: number) {
  if (grade >= 70) return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (grade >= 60) return "bg-blue-100 text-blue-700 border-blue-200";
  if (grade >= 50) return "bg-amber-100 text-amber-700 border-amber-200";
  if (grade >= 45) return "bg-orange-100 text-orange-700 border-orange-200";
  return "bg-red-100 text-red-700 border-red-200";
}

export const dynamic = "force-dynamic";

export default async function HarnessPage() {
  const data = await getHarnessData();

  return (
    <PageShell>
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <Layers className="h-7 w-7 text-blue-600" />
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">VOX Trading Harness</h1>
        </div>
        <p className="text-sm text-neutral-500 mt-1">
          6-layer mandatory checklist — generated {new Date(data.generated_at).toLocaleString()}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {/* Layer 0 */}
        <LayerCard number={0} title="Data Audit" status={data.layer0.weak_positions > 5 ? "warning" : "ok"}>
          <div className="space-y-1 text-sm">
            <p><span className="text-neutral-500">AUM:</span> <span className="font-medium">${data.layer0.aum.toLocaleString()}</span></p>
            <p><span className="text-neutral-500">Positions:</span> {data.layer0.total_positions}</p>
            <p><span className="text-neutral-500">Watchlist:</span> {data.layer0.total_watchlist}</p>
            <p><span className="text-neutral-500">Graded:</span> {data.layer0.graded_positions}/{data.layer0.total_positions}</p>
            <p><span className="text-neutral-500">Weak (&lt;45):</span> {data.layer0.weak_positions}</p>
          </div>
        </LayerCard>

        {/* Layer 1 */}
        <LayerCard number={1} title="Portfolio State" status={Object.keys(data.layer1.sector_allocation).length > 5 ? "ok" : "warning"}>
          <div className="space-y-2 text-sm">
            <p className="text-neutral-500 text-xs uppercase tracking-wide">Sector Allocation</p>
            <div className="flex flex-wrap gap-1">
              {Object.entries(data.layer1.sector_allocation).map(([sector, pct]) => (
                <VoxBadge key={sector} variant="sector" label={`${sector}: ${pct}%`} />
              ))}
            </div>
            <p className="text-neutral-500 text-xs uppercase tracking-wide mt-2">Top Holdings</p>
            <div className="space-y-0.5">
              {data.layer1.top_holdings.slice(0, 5).map((p: any) => (
                <div key={p.ticker} className="flex justify-between">
                  <span>{p.ticker}</span>
                  <span className="text-neutral-500">${parseFloat(p.live_value).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </LayerCard>

        {/* Layer 2 */}
        <LayerCard number={2} title="Famous Traders" status={data.layer2.missing_from_portfolio > 0 ? "ok" : "warning"}>
          <div className="space-y-2 text-sm">
            <p><span className="text-neutral-500">Total FT tickers:</span> {data.layer2.total_famous_traders}</p>
            <p><span className="text-neutral-500">Missing from portfolio:</span> {data.layer2.missing_from_portfolio}</p>
            <p className="text-neutral-500 text-xs uppercase tracking-wide">Top Missing</p>
            <div className="space-y-0.5">
              {data.layer2.top_missing.slice(0, 5).map((w: any) => (
                <div key={w.ticker} className="flex justify-between">
                  <span>{w.ticker}</span>
                  <VoxBadge grade={parseFloat(w.grade) || 0} />
                </div>
              ))}
            </div>
          </div>
        </LayerCard>

        {/* Layer 3 */}
        <LayerCard number={3} title="Sector Momentum" status={(data.layer3?.sector_momentum?.length || 0) > 0 ? "ok" : "warning"}>
          <div className="space-y-2 text-sm max-h-64 overflow-y-auto">
            {(data.layer3?.sector_momentum || []).slice(0, 10).map((s: any) => (
              <div key={s.sector} className="flex items-center justify-between">
                <span className="truncate max-w-[140px]">{s.sector}</span>
                <div className="flex items-center gap-2">
                <VoxBadge grade={s.momentum_score} />
                <span className="text-xs text-neutral-500">{Array.isArray(s.top_tickers) ? s.top_tickers.slice(0, 3).join(", ") : ""}</span>
                </div>
              </div>
            ))}
          </div>
        </LayerCard>

        {/* Layer 4 — Weather */}
        <LayerCard number={4} title="Weather Patterns" status={(data.layer4?.weather_patterns?.length || 0) > 0 ? "warning" : "ok"}>
          <div className="space-y-2 text-sm">
            <p><span className="text-neutral-500">Active patterns:</span> {data.layer4?.weather_patterns?.length || 0}</p>
            {(data.layer4?.weather_patterns?.length || 0) === 0 && (
              <div className="flex items-center gap-2 text-green-600">
                <CloudSun className="h-4 w-4" />
                <span>No high-impact weather alerts</span>
              </div>
            )}
            {(data.layer4?.weather_patterns || []).slice(0, 5).map((r: any, i: number) => (
              <div key={i} className="flex items-start gap-2">
                <Wind className="h-4 w-4 text-amber-500 mt-0.5" />
                <div>
                  <p className="font-medium">{r.pattern_type}</p>
                  <p className="text-xs text-neutral-500">Severity {r.severity}/5 — {Array.isArray(r.affected_sectors) ? r.affected_sectors.slice(0, 3).join(", ") : ""}</p>
                </div>
              </div>
            ))}
          </div>
        </LayerCard>

        {/* Layer 5 — Macro */}
        <LayerCard number={5} title="Macro Trends" status={data.layer5?.regime !== "UNKNOWN" ? "ok" : "warning"}>
          <div className="space-y-1 text-sm">
            <p><span className="text-neutral-500">Regime:</span> <span className="font-medium">{data.layer5?.regime || "UNKNOWN"}</span></p>
            <p><span className="text-neutral-500">Confidence:</span> {data.layer5?.confidence || 0}%</p>
            <div className="flex items-center gap-2 mt-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-xs">{data.layer5?.bullish_count || 0} bullish</span>
              <TrendingDown className="h-4 w-4 text-red-600 ml-2" />
              <span className="text-xs">{data.layer5?.bearish_count || 0} bearish</span>
            </div>
            {(data.layer4?.macro_signals || []).slice(0, 4).map((s: any, i: number) => (
              <div key={i} className="flex items-center gap-2 text-xs mt-1">
                <span className={s.signal_direction === "BULLISH" ? "text-green-600" : s.signal_direction === "BEARISH" ? "text-red-600" : "text-amber-600"}>
                  {s.signal_direction === "BULLISH" ? "▲" : s.signal_direction === "BEARISH" ? "▼" : "◆"}
                </span>
                <span className="text-neutral-600">{s.signal_name}</span>
              </div>
            ))}
          </div>
        </LayerCard>
      </div>

      {/* Latest 6-layer grades */}
      {(data.layer6?.latest_grades?.length || 0) > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Latest 6-Layer Grades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-neutral-500 border-b">
                    <th className="pb-2">Ticker</th>
                    <th className="pb-2">Grade</th>
                    <th className="pb-2">Council</th>
                    <th className="pb-2">T</th>
                    <th className="pb-2">F</th>
                    <th className="pb-2">M</th>
                    <th className="pb-2">S</th>
                    <th className="pb-2">W</th>
                    <th className="pb-2">Se</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.layer6?.latest_grades || []).slice(0, 15).map((g: any) => (
                    <tr key={g.ticker} className="border-b last:border-0">
                      <td className="py-2 font-medium">{g.ticker}</td>
                      <td className="py-2">
                        <VoxBadge grade={parseFloat(g.vox_grade) || 0} />
                      </td>
                      <td className="py-2 text-neutral-600">{getCouncilAction(parseFloat(g.vox_grade) || 0)}</td>
                      <td className="py-2 text-neutral-500">{g.technical_score}</td>
                      <td className="py-2 text-neutral-500">{g.fundamental_score}</td>
                      <td className="py-2 text-neutral-500">{g.macro_score}</td>
                      <td className="py-2 text-neutral-500">{g.sector_score}</td>
                      <td className="py-2 text-neutral-500">{g.weather_score}</td>
                      <td className="py-2 text-neutral-500">{g.sentiment_score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Plan */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Harness Protocol</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-neutral-600 space-y-2">
          <p>This page shows the mandatory 6-layer checklist. Before any buy/sell recommendation, all layers must be checked and cross-layer synthesis applied.</p>
          <p className="font-medium text-neutral-900">Rule: Grade is base. Famous Traders / Hidden Gems / Macro / Weather / Sector are conviction overlays. Never single-signal decisions.</p>
        </CardContent>
      </Card>
    </PageShell>
  );
}
