import dashboardPositionsRaw from "../../public/dashboard_positions.json";
import portfolioGrades from "../../public/portfolio_grades.json";
import { getPositions as getSupabasePositions } from "./supabase";

// Fallback data from JSON (used during SSR or if Supabase fails)
const dashboardData = dashboardPositionsRaw as unknown as any;
export const fallbackPositions = dashboardData.positions || (Array.isArray(dashboardData) ? dashboardData : []);
export const positions = fallbackPositions; // Legacy export for compatibility
export const dashboardMeta = {
  totalValue: dashboardData.total_value || 0,
  totalPositions: dashboardData.total_positions || 0,
  generatedAt: dashboardData.generated_at || null,
  brokerBreakdown: dashboardData.broker_breakdown || {},
  brokerStatus: dashboardData.broker_status || {},
  usdMxnRate: dashboardData.usd_mxn_rate || 17.31,
  usdMxnDate: dashboardData.usd_mxn_date || null,
};

export interface Position {
  ticker: string;
  shares: number;
  price: number;
  value: number;
  pnl?: number;
  pnlPct?: number;
  broker: string;
  grade?: number;
}

// Async function to get positions from Supabase
export async function getPositions() {
  try {
    const positions = await getSupabasePositions();
    if (positions && positions.length > 0) {
      return positions;
    }
  } catch (e) {
    console.error("Failed to fetch from Supabase, using fallback:", e);
  }
  return fallbackPositions;
}

// Calculate totals from LIVE positions data (not stale JSON)
export function calculateTotalValue(positions: any[]): number {
  return positions.reduce((sum: number, p: any) => sum + (p.live_value || p.value || 0), 0);
}

export function calculateTotalPnL(positions: any[]): number {
  return positions.reduce((sum: number, p: any) => {
    const value = p.live_value || p.value || 0;
    const cost = (p.avg_cost || p.cost_basis || 0) * (p.shares || 0);
    if (cost > 0) {
      return sum + (value - cost);
    }
    return sum + (p.pnl || 0);
  }, 0);
}

export function calculateBrokerBreakdown(positions: any[]): Record<string, number> {
  const breakdown: Record<string, number> = {};
  positions.forEach((p: any) => {
    const value = p.live_value || p.value || 0;
    const brokers = p.brokers || [p.broker || 'Unknown'];
    // Split value equally across brokers if multiple
    const perBroker = value / brokers.length;
    brokers.forEach((broker: string) => {
      breakdown[broker] = (breakdown[broker] || 0) + perBroker;
    });
  });
  return breakdown;
}

// Legacy: Calculate totals from REAL broker breakdown (not position sums)
export function getTotalValue(): number {
  return dashboardMeta.totalValue || 0;
}

export function getTotalPnL(): number {
  return fallbackPositions.reduce((sum: number, p: any) => sum + (p.pnl || 0), 0);
}

export function getAvgGrade(): number {
  const graded = fallbackPositions.filter((p: any) => (p.grade || 0) > 0);
  return graded.length > 0
    ? Math.round(graded.reduce((sum: number, p: any) => sum + (p.grade || 0), 0) / graded.length)
    : 0;
}

// Get broker breakdown from the REAL data (not calculated from positions)
export function getBrokerBreakdown(): Array<{ broker: string; value: number; status: string; stale: boolean }> {
  const breakdown = dashboardMeta.brokerBreakdown;
  const status = dashboardMeta.brokerStatus;
  
  return Object.entries(breakdown)
    .map(([broker, value]) => ({
      broker,
      value: value as number,
      status: status[broker]?.stale ? 'stale' : 'fresh',
      stale: status[broker]?.stale || false,
    }))
    .sort((a, b) => b.value - a.value);
}

export function getGradeColor(grade: number): string {
  if (grade >= 70) return "#22c55e";
  if (grade >= 60) return "#3b82f6";
  if (grade >= 50) return "#f59e0b";
  if (grade >= 40) return "#f97316";
  return "#ef4444";
}

export function getGradeLabel(grade: number): string {
  if (grade >= 70) return "Strong Buy";
  if (grade >= 60) return "Buy";
  if (grade >= 50) return "Hold";
  if (grade >= 40) return "Weak Hold";
  return "Sell";
}

export function getGradeBuckets() {
  const buckets = [
    { name: "Strong Buy", range: [70, 100], count: 0, color: "#22c55e" },
    { name: "Buy", range: [60, 70], count: 0, color: "#3b82f6" },
    { name: "Hold", range: [50, 60], count: 0, color: "#f59e0b" },
    { name: "Weak Hold", range: [40, 50], count: 0, color: "#f97316" },
    { name: "Sell", range: [0, 40], count: 0, color: "#ef4444" },
  ];

  fallbackPositions.forEach((p: any) => {
    const grade = p.grade || 0;
    const bucket = buckets.find(
      (b) => grade >= b.range[0] && grade < b.range[1]
    );
    if (bucket) bucket.count++;
  });

  return buckets;
}

// Grade data from portfolio_grades.json
export const strongBuy = (portfolioGrades as any).strong_buy || [];
export const moderateBuy = (portfolioGrades as any).moderate_buy || [];
export const avoid = (portfolioGrades as any).avoid || [];

// Build a complete grade map
export const gradeMap: Record<string, { grade: number; category: string }> = {};
["strong_buy", "moderate_buy", "avoid"].forEach((cat) => {
  const items = (portfolioGrades as any)[cat] || [];
  items.forEach((item: any) => {
    gradeMap[item.ticker] = { grade: item.grade, category: cat };
  });
});

// Market regime data
export const marketRegime = {
  regime: "EARLY_BULL",
  confidence: 72,
  cashTarget: "15-20%",
  stopStrategy: "Tight 10%",
  bias: "Buy pullbacks in quality. Avoid chasing.",
  sectorBiases: [
    { sector: "Financials (XLF)", bias: "Overweight", sentiment: "bullish", strength: 85 },
    { sector: "Energy (XLE)", bias: "Overweight", sentiment: "bullish", strength: 78 },
    { sector: "Tech (XLK)", bias: "Neutral", sentiment: "neutral", strength: 55 },
    { sector: "Healthcare (XLV)", bias: "Underweight", sentiment: "bearish", strength: 35 },
  ],
  macroIndicators: [
    { name: "Fed Policy", value: "5.25% (HOLD)", trend: "neutral", impact: "Rates stable" },
    { name: "CPI YoY", value: "3.2%", trend: "down", impact: "Cooling" },
    { name: "Unemployment", value: "3.9%", trend: "neutral", impact: "Stable" },
    { name: "10Y Treasury", value: "4.42%", trend: "up", impact: "Rates rising" },
    { name: "VIX", value: "16.2", trend: "down", impact: "Low fear" },
    { name: "USD/MXN", value: "17.31", trend: "neutral", impact: "Stable" },
  ],
};

// Alert data - now fetched from Supabase dynamically
export const alerts = [
  {
    ticker: "JMIA",
    type: "grade",
    severity: "high",
    status: "triggered",
    message: "Grade 40. SELL immediately",
    timestamp: "2026-05-27 08:15",
  },
  {
    ticker: "META",
    type: "grade",
    severity: "high",
    status: "triggered",
    message: "Grade 40. SELL immediately",
    timestamp: "2026-05-27 08:15",
  },
  {
    ticker: "PLTR",
    type: "grade",
    severity: "high",
    status: "triggered",
    message: "Grade 40. SELL immediately",
    timestamp: "2026-05-27 08:15",
  },
  {
    ticker: "SHOP",
    type: "grade",
    severity: "high",
    status: "triggered",
    message: "Grade 40. SELL immediately",
    timestamp: "2026-05-27 08:15",
  },
  {
    ticker: "AMD",
    type: "grade",
    severity: "medium",
    status: "pending",
    message: "Grade 55. TRIM 50%",
    timestamp: "2026-05-27 09:00",
  },
  {
    ticker: "OKLO",
    type: "grade",
    severity: "medium",
    status: "pending",
    message: "Grade 50. TRIM 50%",
    timestamp: "2026-05-27 09:00",
  },
];

// Daily briefing
export const dailyBriefing = {
  date: "2026-05-27",
  macro: {
    regime: "EARLY_BULL",
    vix: 16.2,
    sp500: "+0.8%",
    nasdaq: "+1.2%",
  },
  alerts: [
    "4 positions grade < 50 — SELL immediately",
    "AMD grade 55 — TRIM 50%",
    "XLF strong buy grade 75 — add to watchlist",
  ],
  screener: [
    { ticker: "XLF", signal: "Breakout", confidence: 85 },
    { ticker: "JPM", signal: "Strong Buy", confidence: 70 },
    { ticker: "GOOGL", signal: "Strong Buy", confidence: 70 },
  ],
  contrarian: [
    { ticker: "BTC", signal: "Oversold", rsi: 38 },
    { ticker: "ETH", signal: "Oversold", rsi: 35 },
  ],
  checklist: [
    "Execute SELL orders for grade < 50",
    "TRIM 50% AMD, OKLO, COIN",
    "Review XLF/JPM/GOOGL entry points",
    "Check crypto allocation vs 10% limit",
  ],
};
