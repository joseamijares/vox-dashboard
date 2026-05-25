import dashboardPositionsRaw from "../../public/dashboard_positions.json";
import monitoredPlaysData from "../../public/vox_monitored_plays.json";
import portfolioGrades from "../../public/portfolio_grades.json";

// Real positions from broker files (dashboard_positions.json has {positions: [...]} wrapper)
const dashboardData = dashboardPositionsRaw as unknown as { positions: Position[], total_value: number, total_positions: number, broker_summary: Record<string, {positions: number, value: number}> };
export const positions = dashboardData.positions || [];

export interface Position {
  ticker: string;
  name?: string;
  shares: number;
  price: number;
  value: number;
  pnl?: number;
  pnlPct?: number;
  unrealized_pnl?: number;
  unrealized_pnl_pct?: number;
  grade?: number;
  broker: string;
  sector: string;
}

// Calculate portfolio summary from REAL positions
export const portfolioSummary = {
  totalAUM: dashboardData.total_value || getTotalValue(),
  totalMXN: (dashboardData.total_value || getTotalValue()) * 17.31,
  usdMXN: 17.31,
  byBroker: (() => {
    const brokerMap: Record<string, { value_usd: number; positions: number; pct_of_total: number }> = {};
    const total = dashboardData.total_value || getTotalValue();
    
    // Aggregate by broker
    const brokerAgg: Record<string, { value: number; positions: number }> = {};
    positions.forEach((p) => {
      if (!brokerAgg[p.broker]) brokerAgg[p.broker] = { value: 0, positions: 0 };
      brokerAgg[p.broker].value += p.value || 0;
      brokerAgg[p.broker].positions += 1;
    });
    
    Object.entries(brokerAgg).forEach(([broker, data]) => {
      brokerMap[broker] = {
        value_usd: Math.round(data.value),
        positions: data.positions,
        pct_of_total: total > 0 ? Math.round((data.value / total) * 100) : 0,
      };
    });
    
    return brokerMap;
  })(),
};

// Calculate totals from real positions
export function getTotalValue(): number {
  return positions.reduce((sum, p) => sum + (p.value || 0), 0);
}

export function getTotalPnL(): number {
  return positions.reduce((sum, p) => sum + (p.unrealized_pnl || p.pnl || 0), 0);
}

export function getAvgGrade(): number {
  const graded = positions.filter((p) => (p.grade || 0) > 0);
  return graded.length > 0
    ? Math.round(graded.reduce((sum, p) => sum + (p.grade || 0), 0) / graded.length)
    : 0;
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

  positions.forEach((p) => {
    const grade = p.grade || 0;
    const bucket = buckets.find(
      (b) => grade >= b.range[0] && grade < b.range[1]
    );
    if (bucket) bucket.count++;
  });

  return buckets;
}

// Monitored plays from vox_monitored_plays.json
export const monitoredPlaysList = (monitoredPlaysData as any).plays || [];

// Grade data
export const strongBuy = (portfolioGrades as any).strong_buy || [];
export const moderateBuy = (portfolioGrades as any).moderate_buy || [];
export const avoid = (portfolioGrades as any).avoid || [];

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

// Alert data
export const alerts = [
  {
    ticker: "NVDA",
    type: "price",
    severity: "medium",
    status: "pending",
    message: "Price dropped to $215, approaching entry target",
    timestamp: "2026-05-27 09:30",
  },
  {
    ticker: "JMIA",
    type: "grade",
    severity: "high",
    status: "triggered",
    message: "Grade dropped to 41. SELL threshold reached",
    timestamp: "2026-05-27 08:15",
  },
  {
    ticker: "CEG",
    type: "technical",
    severity: "medium",
    status: "pending",
    message: "RSI at 62. Approaching entry target",
    timestamp: "2026-05-27 10:00",
  },
  {
    ticker: "XLF",
    type: "policy",
    severity: "high",
    status: "triggered",
    message: "Tariff policy update. Financials benefit",
    timestamp: "2026-05-27 07:00",
  },
  {
    ticker: "NVDA",
    type: "earnings",
    severity: "high",
    status: "pending",
    message: "Earnings May 28. Expect 10%+ move",
    timestamp: "2026-05-27 11:00",
  },
  {
    ticker: "BTC",
    type: "position",
    severity: "medium",
    status: "triggered",
    message: "Trim executed. 5% target reached",
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
    "NVDA earnings May 28 — expect 10%+ move",
    "JMIA grade 41 — SELL threshold",
    "XLF breakout — financials leading",
  ],
  screener: [
    { ticker: "XLF", signal: "Breakout", confidence: 85 },
    { ticker: "CEG", signal: "Entry", confidence: 72 },
    { ticker: "NVDA", signal: "Pullback", confidence: 68 },
  ],
  contrarian: [
    { ticker: "BTC", signal: "Oversold", rsi: 38 },
    { ticker: "ETH", signal: "Oversold", rsi: 35 },
  ],
  checklist: [
    "Check market regime",
    "Review position grades",
    "Set alerts for entries",
    "Log yesterday's trades",
  ],
};

// LLM Council data
export const llmCouncil = {
  consensus: [
    {
      ticker: "NVDA",
      grade: 64,
      confidence: 78,
      bull: 2,
      bear: 0,
      neutral: 2,
      priceTarget: { min: 220, mean: 250, max: 280 },
      models: [
        { name: "GPT-4o", signal: "bullish", target: 260, reason: "AI demand accelerating" },
        { name: "Claude 3.5", signal: "neutral", target: 240, reason: "Valuation stretched" },
        { name: "Gemini Pro", signal: "bullish", target: 270, reason: "Strong guidance expected" },
        { name: "Grok", signal: "neutral", target: 230, reason: "Market volatility concern" },
      ],
    },
    {
      ticker: "CEG",
      grade: 59,
      confidence: 65,
      bull: 3,
      bear: 1,
      neutral: 0,
      priceTarget: { min: 280, mean: 320, max: 360 },
      models: [
        { name: "GPT-4o", signal: "bullish", target: 330, reason: "Nuclear renaissance" },
        { name: "Claude 3.5", signal: "bullish", target: 310, reason: "Best positioned nuclear utility" },
        { name: "Gemini Pro", signal: "bearish", target: 280, reason: "Regulatory risks remain" },
        { name: "Grok", signal: "bullish", target: 340, reason: "Government contracts expanding" },
      ],
    },
  ],
};

// Crypto data
export const cryptoPositions = [
  { symbol: "BTC", name: "Bitcoin", shares: 0.06, price: 75621.26, value: 4791.89, pnl: -1304.13, pnlPct: -21.4, grade: 50, allocation: 6.6 },
  { symbol: "ETH", name: "Ethereum", shares: 1.49, price: 2069.04, value: 3079.15, pnl: -2590.70, pnlPct: -45.7, grade: 50, allocation: 4.2 },
  { symbol: "TRX", name: "TRON", shares: 4341.25, price: 0.36, value: 1574.81, pnl: 1152.09, pnlPct: 272.5, grade: 50, allocation: 2.2 },
];

export const cryptoKillSwitches = {
  totalCrypto: 9445.85,
  portfolioValue: 72184.39,
  allocation: 13.1,
  limit: 10.0,
  status: "WARNING",
  singleCryptoLimit: 5.0,
  btcAllocation: 6.6,
  ethAllocation: 4.2,
};
