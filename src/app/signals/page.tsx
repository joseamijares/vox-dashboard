import { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageShell } from "@/components/vox-nav";
import { VoxLoading, VoxError } from "@/components/vox";
import { VoxBadge } from "@/components/vox";
import { ArrowUp, ArrowDown, Minus, Target, AlertCircle } from "lucide-react";
import { query } from "@/lib/db";

interface TradeSignal {
  id: number;
  ticker: string;
  signal_type: string;
  composite_score: number;
  technical_score: number;
  fundamental_score: number;
  macro_score: number;
  sector_score: number;
  weather_score: number;
  sentiment_score: number;
  rsi: number;
  grade: number;
  target_price: number;
  stop_price: number;
  rationale: string;
  created_at: string;
}

function parseNumeric(value: any): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}

function parseRow(row: Record<string, any>): TradeSignal {
  const parsed = { ...row };
  const numericFields = [
    "composite_score", "technical_score", "fundamental_score", "macro_score",
    "sector_score", "weather_score", "sentiment_score", "rsi", "grade",
    "target_price", "stop_price"
  ];
  for (const field of numericFields) {
    if (field in parsed) parsed[field] = parseNumeric(parsed[field]);
  }
  return parsed as TradeSignal;
}

async function getSignals(): Promise<TradeSignal[]> {
  try {
    const rows = await query(`
      SELECT id, ticker, signal_type, composite_score,
             technical_score, fundamental_score, macro_score,
             sector_score, weather_score, sentiment_score,
             rsi, grade, target_price, stop_price, rationale,
             created_at
      FROM trade_signals
      ORDER BY composite_score DESC, created_at DESC
      LIMIT 200
    `);
    return (rows || []).map(parseRow);
  } catch (error) {
    console.error("Failed to fetch trade signals:", error);
    return [];
  }
}

function signalColor(type: string) {
  if (type === "BUY" || type === "ADD") return "bg-green-500/20 text-green-400 border-green-500/30";
  if (type === "SELL") return "bg-red-500/20 text-red-400 border-red-500/30";
  if (type === "TRIM") return "bg-orange-500/20 text-orange-400 border-orange-500/30";
  return "bg-amber-500/20 text-amber-400 border-amber-500/30";
}

export const dynamic = "force-dynamic";

function signalIcon(type: string) {
  if (type === "BUY" || type === "ADD") return <ArrowUp className="h-4 w-4 text-green-400" />;
  if (type === "SELL") return <ArrowDown className="h-4 w-4 text-red-400" />;
  return <Minus className="h-4 w-4 text-amber-400" />;
}

function scoreBar(score: number, color: string) {
  const clamped = Math.max(0, Math.min(100, score));
  return (
    <div className="w-full bg-neutral-100 rounded-full h-1.5 mt-1">
      <div
        className="h-1.5 rounded-full transition-all"
        style={{ width: `${clamped}%`, backgroundColor: color }}
      />
    </div>
  );
}

function SignalsList({ signals }: { signals: TradeSignal[] }) {
  if (signals.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertCircle className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-700">No Active Trade Signals</h3>
          <p className="text-sm text-neutral-500 mt-2">Trade scorer will generate signals on next run</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {signals.map((s) => (
        <Card key={s.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="mt-1">{signalIcon(s.signal_type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-lg text-neutral-900">{s.ticker}</h3>
                  <Badge className={signalColor(s.signal_type)}>{s.signal_type}</Badge>
                  <Badge variant="outline" className="text-xs">Score: {s.composite_score}/100</Badge>
                </div>
                <p className="text-sm text-neutral-600 mt-1">{s.rationale}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-neutral-500 flex-wrap">
                  {s.target_price > 0 && (
                    <span className="flex items-center gap-1">
                      <Target className="h-3 w-3" /> Target: ${s.target_price.toFixed(2)}
                    </span>
                  )}
                  {s.stop_price > 0 && (
                    <span className="flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> Stop: ${s.stop_price.toFixed(2)}
                    </span>
                  )}
                  {s.rsi > 0 && <span>RSI: {s.rsi.toFixed(1)}</span>}
                  {s.grade > 0 && <span>Grade: {s.grade}</span>}
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-3">
                  {[
                    { label: "Tech", score: s.technical_score || 0, color: "#0072f5" },
                    { label: "Fund", score: s.fundamental_score || 0, color: "#00a86b" },
                    { label: "Macro", score: s.macro_score || 0, color: "#f59e0b" },
                    { label: "Sector", score: s.sector_score || 0, color: "#8b5cf6" },
                    { label: "Weather", score: s.weather_score || 0, color: "#06b6d4" },
                    { label: "Sentiment", score: s.sentiment_score || 0, color: "#f97316" },
                  ].map((layer) => (
                    <div key={layer.label}>
                      <div className="flex justify-between text-xs text-neutral-500">
                        <span>{layer.label}</span>
                        <span>{layer.score}</span>
                      </div>
                      {scoreBar(layer.score, layer.color)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default async function SignalsPage() {
  const signals = await getSignals();

  return (
    <PageShell>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Trade Signals</h1>
            <p className="text-sm text-neutral-500 mt-1">6-layer VOX composite scores — {signals.length} active signals</p>
          </div>

          <Suspense fallback={<div className="text-center py-12 text-neutral-400">Loading trade signals...</div>}>
            <SignalsList signals={signals} />
          </Suspense>
        </div>
      </PageShell>
  );
}
