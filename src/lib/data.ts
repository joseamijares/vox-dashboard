// Client-safe data helpers. NO static public/*.json imports (API is source of truth).

export const fallbackPositions: any[] = [];

export const positions = fallbackPositions; // legacy export

export const dashboardMeta = {
  totalValue: 0,
  totalPositions: 0,
  generatedAt: null as string | null,
  brokerBreakdown: {} as Record<string, number>,
  brokerStatus: {} as Record<string, { stale?: boolean }>,
  usdMxnRate: 17.5,
  usdMxnDate: null as string | null,
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

export async function getPositions() {
  try {
    const res = await fetch("/api/positions", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch");
    const json = await res.json();
    return json.positions || [];
  } catch (e) {
    console.error("Failed to fetch positions from API:", e);
    return fallbackPositions;
  }
}

export function calculateTotalValue(positions: any[]): number {
  return positions.reduce(
    (sum: number, p: any) => sum + (p.live_value || p.value || 0),
    0
  );
}

export function calculateTotalPnL(positions: any[]): number {
  return positions.reduce((sum: number, p: any) => {
    const value = p.live_value || p.value || 0;
    const cost = (p.avg_cost || p.cost_basis || 0) * (p.shares || 0);
    if (cost > 0) return sum + (value - cost);
    return sum + (p.pnl || 0);
  }, 0);
}

export function calculateBrokerBreakdown(
  positions: any[]
): Record<string, number> {
  const breakdown: Record<string, number> = {};
  positions.forEach((p: any) => {
    const value = p.live_value || p.value || 0;
    const brokers = p.brokers || [p.broker || "Unknown"];
    const perBroker = value / Math.max(brokers.length, 1);
    brokers.forEach((broker: string) => {
      breakdown[broker] = (breakdown[broker] || 0) + perBroker;
    });
  });
  return breakdown;
}

export function getTotalValue(): number {
  return dashboardMeta.totalValue || 0;
}

export function getTotalPnL(): number {
  return 0;
}

export function getAvgGrade(): number {
  return 0;
}

export function getBrokerBreakdown(): Array<{
  broker: string;
  value: number;
  status: string;
  stale: boolean;
}> {
  return [];
}

export function getGradeColor(grade: number): string {
  if (grade >= 70) return "#4ade80";
  if (grade >= 60) return "#7c9cff";
  if (grade >= 50) return "#fbbf24";
  if (grade >= 40) return "#fb923c";
  return "#f87171";
}

export function getGradeLabel(grade: number): string {
  // Hygiene labels — not auto-trade instructions
  if (grade >= 70) return "Core";
  if (grade >= 60) return "Quality";
  if (grade >= 50) return "Hold";
  if (grade >= 40) return "Watch";
  return "Weak";
}

export function getGradeBuckets() {
  return [
    { name: "Core", range: [70, 100], count: 0, color: "#4ade80" },
    { name: "Quality", range: [60, 70], count: 0, color: "#7c9cff" },
    { name: "Hold", range: [50, 60], count: 0, color: "#fbbf24" },
    { name: "Watch", range: [40, 50], count: 0, color: "#fb923c" },
    { name: "Weak", range: [0, 40], count: 0, color: "#f87171" },
  ];
}

export const strongBuy: any[] = [];
export const moderateBuy: any[] = [];
export const avoid: any[] = [];
export const gradeMap: Record<string, { grade: number; category: string }> = {};

export const marketRegime = {
  regime: "UNKNOWN",
  confidence: 0,
  cashTarget: "2%",
  stopStrategy: "Mandate-based",
  bias: "Balanced book — no chase. Grades = hygiene only.",
  sectorBiases: [] as any[],
  macroIndicators: [] as any[],
};

export const alerts: any[] = [];

export const dailyBriefing = {
  date: new Date().toISOString().slice(0, 10),
  macro: { regime: "UNKNOWN", vix: 0, sp500: "—", nasdaq: "—" },
  alerts: [] as string[],
  screener: [] as any[],
  contrarian: [] as any[],
  checklist: [
    "Read Brain-LATEST + Outside-Ideas",
    "Execute only material plan items",
  ],
};
