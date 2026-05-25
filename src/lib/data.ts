export interface Position {
  ticker: string;
  name: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  value: number;
  pnl: number;
  pnlPercent: number;
  grade: number;
  broker: string;
  sector: string;
  action: "BUY" | "HOLD" | "TRIM" | "SELL" | "CUT";
}

export interface GradeBucket {
  name: string;
  range: string;
  count: number;
  color: string;
}

export interface MonitoredPlay {
  ticker: string;
  currentPrice: number;
  entryTarget: number;
  stopLoss: number;
  grade: number;
  rsi: number;
  ema21: number;
  alertStatus: "TRIGGERED" | "PENDING" | "NEAR";
  progress: number;
}

export interface MarketRegime {
  regime: string;
  confidence: number;
  cashTarget: number;
  maxPositions: number;
  stopStrategy: string;
  sectorBiases: { sector: string; bias: "BULLISH" | "BEARISH" | "NEUTRAL" }[];
}

export interface DailyBrief {
  date: string;
  macro: {
    fedRate: number;
    cpi: number;
    vix: number;
    yieldCurve: number;
  };
  alerts: string[];
  screenerSignals: string[];
  contrarianOpps: string[];
  checklist: string[];
}

export interface TradeIdea {
  ticker: string;
  compositeScore: number;
  grade: number;
  macroAlignment: number;
  sentiment: number;
  correlation: number;
  brokerCash: number;
  positionSize: number;
  riskAdjustedReturn: number;
  strategy: string;
}

export interface SectorData {
  symbol: string;
  name: string;
  performance: number;
  rsi: number;
  momentum: "LEADER" | "LAGGARD" | "NEUTRAL";
  userExposure: number;
  targetExposure: number;
}

export interface LLMVote {
  model: string;
  grade: number;
  direction: "BULL" | "BEAR" | "NEUTRAL";
  target: number;
  reasoning: string;
}

export interface LLMConsensus {
  ticker: string;
  consensusGrade: number;
  confidence: number;
  bullCount: number;
  bearCount: number;
  neutralCount: number;
  meanTarget: number;
  minTarget: number;
  maxTarget: number;
  votes: LLMVote[];
}

export interface MacroIndicator {
  name: string;
  value: number;
  change: number;
  status: "GOOD" | "WARNING" | "DANGER";
  description: string;
}

export interface CorrelationGroup {
  name: string;
  tickers: string[];
  correlation: number;
  exposure: number;
}

export interface TradeLog {
  date: string;
  ticker: string;
  action: "BUY" | "SELL" | "TRIM";
  shares: number;
  price: number;
  pnl: number;
  broker: string;
  gradeAtEntry: number;
  strategy: string;
  mistake: boolean;
}

export interface EarningsEvent {
  ticker: string;
  date: string;
  positionValue: number;
  grade: number;
  expectedMove: number;
  alert: string;
}

export interface DividendStock {
  ticker: string;
  shares: number;
  annualIncome: number;
  yield: number;
  paymentMonths: number[];
}

export interface AlertItem {
  id: string;
  type: "PRICE" | "GRADE" | "PULLBACK" | "TRUMP" | "EARNINGS";
  ticker: string;
  message: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  triggered: boolean;
  timestamp: string;
}

// Mock data generators
export function getPositions(): Position[] {
  return [
    { ticker: "NVDA", name: "NVIDIA", shares: 45, avgCost: 185.5, currentPrice: 215.33, value: 9690, pnl: 1343, pnlPercent: 16.1, grade: 64, broker: "Schwab", sector: "Technology", action: "HOLD" },
    { ticker: "AAPL", name: "Apple", shares: 30, avgCost: 178.2, currentPrice: 195.4, value: 5862, pnl: 516, pnlPercent: 9.6, grade: 68, broker: "eToro", sector: "Technology", action: "HOLD" },
    { ticker: "BTC", name: "Bitcoin", shares: 0.45, avgCost: 98500, currentPrice: 105520, value: 47484, pnl: 3159, pnlPercent: 7.1, grade: 62, broker: "Binance", sector: "Crypto", action: "TRIM" },
    { ticker: "ETH", name: "Ethereum", shares: 2.1, avgCost: 2850, currentPrice: 3150, value: 6615, pnl: 630, pnlPercent: 10.5, grade: 58, broker: "Binance", sector: "Crypto", action: "HOLD" },
    { ticker: "CEG", name: "Constellation Energy", shares: 10, avgCost: 280, currentPrice: 294.07, value: 2941, pnl: 141, pnlPercent: 5.0, grade: 59, broker: "Schwab", sector: "Energy", action: "BUY" },
    { ticker: "RKLB", name: "Rocket Lab", shares: 150, avgCost: 17.5, currentPrice: 135.76, value: 20364, pnl: 17739, pnlPercent: 675.8, grade: 55, broker: "Schwab", sector: "Space", action: "TRIM" },
    { ticker: "VST", name: "Vistra", shares: 80, avgCost: 62, currentPrice: 156.27, value: 12502, pnl: 7542, pnlPercent: 151.9, grade: 57, broker: "Schwab", sector: "Energy", action: "TRIM" },
    { ticker: "JMIA", name: "Jumia", shares: 200, avgCost: 7.5, currentPrice: 6.97, value: 1394, pnl: -106, pnlPercent: -7.1, grade: 41, broker: "eToro", sector: "E-commerce", action: "CUT" },
    { ticker: "BILL", name: "Bill.com", shares: 50, avgCost: 95, currentPrice: 36.14, value: 1807, pnl: -2943, pnlPercent: -62.0, grade: 42, broker: "eToro", sector: "Fintech", action: "SELL" },
    { ticker: "INDA", name: "India ETF", shares: 150, avgCost: 52.3, currentPrice: 48.39, value: 7259, pnl: -587, pnlPercent: -7.5, grade: 46, broker: "Schwab", sector: "EM", action: "SELL" },
    { ticker: "EWZ", name: "Brazil ETF", shares: 100, avgCost: 42, currentPrice: 36.37, value: 3637, pnl: -563, pnlPercent: -13.4, grade: 44, broker: "Schwab", sector: "EM", action: "SELL" },
    { ticker: "FXI", name: "China ETF", shares: 120, avgCost: 38, currentPrice: 35.52, value: 4262, pnl: -298, pnlPercent: -6.5, grade: 44, broker: "Schwab", sector: "EM", action: "SELL" },
    { ticker: "OKLO", name: "Oklo", shares: 80, avgCost: 58, currentPrice: 65.88, value: 5270, pnl: 630, pnlPercent: 13.6, grade: 49, broker: "Schwab", sector: "Nuclear", action: "SELL" },
    { ticker: "NET", name: "Cloudflare", shares: 34, avgCost: 185, currentPrice: 216.17, value: 7350, pnl: 1060, pnlPercent: 16.8, grade: 58, broker: "eToro", sector: "Technology", action: "TRIM" },
    { ticker: "ANET", name: "Arista Networks", shares: 40, avgCost: 140, currentPrice: 154.03, value: 6161, pnl: 561, pnlPercent: 10.0, grade: 59, broker: "Schwab", sector: "Technology", action: "TRIM" },
  ];
}

export function getGradeBuckets(): GradeBucket[] {
  return [
    { name: "Strong Buy", range: "> 70", count: 17, color: "#22c55e" },
    { name: "Buy", range: "60-70", count: 23, color: "#3b82f6" },
    { name: "Hold", range: "50-60", count: 31, color: "#f59e0b" },
    { name: "Weak Hold", range: "40-50", count: 12, color: "#f97316" },
    { name: "Sell", range: "< 40", count: 5, color: "#ef4444" },
  ];
}

export function getMonitoredPlays(): MonitoredPlay[] {
  return [
    { ticker: "NVDA", currentPrice: 215.33, entryTarget: 200, stopLoss: 190, grade: 64, rsi: 45, ema21: 210, alertStatus: "NEAR", progress: 76 },
    { ticker: "CEG", currentPrice: 294.07, entryTarget: 270, stopLoss: 250, grade: 59, rsi: 52, ema21: 285, alertStatus: "TRIGGERED", progress: 100 },
    { ticker: "AMAT", currentPrice: 425, entryTarget: 400, stopLoss: 380, grade: 63, rsi: 48, ema21: 415, alertStatus: "NEAR", progress: 83 },
    { ticker: "LLY", currentPrice: 780, entryTarget: 750, stopLoss: 700, grade: 72, rsi: 42, ema21: 770, alertStatus: "NEAR", progress: 90 },
    { ticker: "XLF", currentPrice: 51.94, entryTarget: 50, stopLoss: 47, grade: 75, rsi: 55, ema21: 50.5, alertStatus: "TRIGGERED", progress: 100 },
    { ticker: "BTC", currentPrice: 105520, entryTarget: 100000, stopLoss: 95000, grade: 62, rsi: 58, ema21: 102000, alertStatus: "TRIGGERED", progress: 100 },
    { ticker: "ETH", currentPrice: 3150, entryTarget: 3000, stopLoss: 2800, grade: 58, rsi: 51, ema21: 3100, alertStatus: "TRIGGERED", progress: 100 },
    { ticker: "COIN", currentPrice: 245, entryTarget: 220, stopLoss: 200, grade: 56, rsi: 62, ema21: 235, alertStatus: "PENDING", progress: 60 },
  ];
}

export function getMarketRegime(): MarketRegime {
  return {
    regime: "EARLY_BULL",
    confidence: 100,
    cashTarget: 15,
    maxPositions: 25,
    stopStrategy: "Tight 10% stops on new positions",
    sectorBiases: [
      { sector: "Technology", bias: "BULLISH" },
      { sector: "Energy", bias: "BULLISH" },
      { sector: "Financials", bias: "BULLISH" },
      { sector: "Healthcare", bias: "NEUTRAL" },
      { sector: "REITs", bias: "BEARISH" },
      { sector: "Emerging Markets", bias: "BEARISH" },
    ],
  };
}

export function getDailyBrief(): DailyBrief {
  return {
    date: "2026-05-27",
    macro: { fedRate: 5.25, cpi: 3.2, vix: 14.2, yieldCurve: -0.35 },
    alerts: [
      "NVDA earnings May 28 — position size $9,690",
      "BTC trimmed to 5% target — realized $17,322 profit",
      "JMIA grade dropped to 41 — SELL signal",
    ],
    screenerSignals: [
      "XLF breakout — financials leading rotation",
      "CEG pullback to $270 — entry opportunity",
      "AMAT approaching $400 support",
    ],
    contrarianOpps: [
      "CEG: bearish sentiment + grade 59 + RSI 52 = NEUTRAL",
      "NVDA: neutral sentiment + grade 64 + RSI 45 = WATCH",
    ],
    checklist: [
      "Execute rebalancing plan (6 sells, 5 trims, 3 buys)",
      "Set alerts for NVDA $200, AMAT $400, CEG $270",
      "Review position review queue",
      "Check daily briefing at 8 AM",
    ],
  };
}

export function getTradeIdeas(): TradeIdea[] {
  return [
    { ticker: "CEG", compositeScore: 87, grade: 59, macroAlignment: 85, sentiment: 70, correlation: 80, brokerCash: 90, positionSize: 8, riskAdjustedReturn: 22, strategy: "Pullback" },
    { ticker: "NVDA", compositeScore: 82, grade: 64, macroAlignment: 90, sentiment: 75, correlation: 70, brokerCash: 85, positionSize: 7, riskAdjustedReturn: 18, strategy: "Earnings Dip" },
    { ticker: "XLF", compositeScore: 79, grade: 75, macroAlignment: 80, sentiment: 65, correlation: 85, brokerCash: 95, positionSize: 6, riskAdjustedReturn: 15, strategy: "Sector Rotation" },
    { ticker: "AMAT", compositeScore: 76, grade: 63, macroAlignment: 85, sentiment: 60, correlation: 75, brokerCash: 80, positionSize: 6, riskAdjustedReturn: 16, strategy: "Pullback" },
    { ticker: "LLY", compositeScore: 74, grade: 72, macroAlignment: 70, sentiment: 55, correlation: 80, brokerCash: 75, positionSize: 5, riskAdjustedReturn: 14, strategy: "Defensive" },
  ];
}

export function getSectors(): SectorData[] {
  return [
    { symbol: "XLF", name: "Financials", performance: 8.2, rsi: 62, momentum: "LEADER", userExposure: 12, targetExposure: 15 },
    { symbol: "XLK", name: "Technology", performance: 5.1, rsi: 68, momentum: "LEADER", userExposure: 35, targetExposure: 28 },
    { symbol: "XLE", name: "Energy", performance: 4.3, rsi: 58, momentum: "NEUTRAL", userExposure: 8, targetExposure: 10 },
    { symbol: "XLI", name: "Industrials", performance: 2.1, rsi: 55, momentum: "NEUTRAL", userExposure: 5, targetExposure: 8 },
    { symbol: "XLP", name: "Consumer Staples", performance: -0.5, rsi: 48, momentum: "LAGGARD", userExposure: 3, targetExposure: 5 },
    { symbol: "XLV", name: "Healthcare", performance: 1.2, rsi: 52, momentum: "NEUTRAL", userExposure: 6, targetExposure: 10 },
    { symbol: "XLU", name: "Utilities", performance: -1.2, rsi: 45, momentum: "LAGGARD", userExposure: 2, targetExposure: 5 },
    { symbol: "XLB", name: "Materials", performance: 0.8, rsi: 50, momentum: "NEUTRAL", userExposure: 2, targetExposure: 4 },
    { symbol: "XLRE", name: "Real Estate", performance: -2.5, rsi: 42, momentum: "LAGGARD", userExposure: 1, targetExposure: 3 },
    { symbol: "XBI", name: "Biotech", performance: 3.1, rsi: 56, momentum: "NEUTRAL", userExposure: 3, targetExposure: 5 },
  ];
}

export function getLLMConsensus(): LLMConsensus[] {
  return [
    {
      ticker: "NVDA",
      consensusGrade: 64,
      confidence: 78,
      bullCount: 2,
      bearCount: 0,
      neutralCount: 2,
      meanTarget: 250,
      minTarget: 220,
      maxTarget: 280,
      votes: [
        { model: "GPT-4o", grade: 68, direction: "BULL", target: 260, reasoning: "AI demand accelerating, data center growth" },
        { model: "Claude 3.5", grade: 62, direction: "NEUTRAL", target: 240, reasoning: "Valuation stretched, wait for dip" },
        { model: "Gemini Pro", grade: 65, direction: "BULL", target: 270, reasoning: "Strong guidance expected" },
        { model: "Grok", grade: 60, direction: "NEUTRAL", target: 230, reasoning: "Market volatility concern" },
      ],
    },
    {
      ticker: "CEG",
      consensusGrade: 59,
      confidence: 65,
      bullCount: 3,
      bearCount: 1,
      neutralCount: 0,
      meanTarget: 320,
      minTarget: 280,
      maxTarget: 360,
      votes: [
        { model: "GPT-4o", grade: 62, direction: "BULL", target: 330, reasoning: "Nuclear renaissance, AI power demand" },
        { model: "Claude 3.5", grade: 58, direction: "BULL", target: 310, reasoning: "Best positioned nuclear utility" },
        { model: "Gemini Pro", grade: 55, direction: "BEAR", target: 280, reasoning: "Regulatory risks remain" },
        { model: "Grok", grade: 60, direction: "BULL", target: 340, reasoning: "Government contracts expanding" },
      ],
    },
  ];
}

export function getMacroIndicators(): MacroIndicator[] {
  return [
    { name: "Fed Funds Rate", value: 5.25, change: 0, status: "WARNING", description: "Holding steady, cuts expected Q3" },
    { name: "CPI Inflation", value: 3.2, change: -0.1, status: "WARNING", description: "Above 2% target but declining" },
    { name: "Yield Curve (10Y-2Y)", value: -0.35, change: 0.05, status: "DANGER", description: "Inverted 180 days — recession signal" },
    { name: "VIX", value: 14.2, change: -1.2, status: "GOOD", description: "Low volatility, complacency risk" },
    { name: "Unemployment", value: 3.8, change: 0.1, status: "GOOD", description: "Near full employment" },
    { name: "GDP Growth", value: 2.1, change: 0.3, status: "GOOD", description: "Moderate growth, no recession" },
  ];
}

export function getCorrelationGroups(): CorrelationGroup[] {
  return [
    { name: "AI / Tech", tickers: ["NVDA", "AMD", "ANET", "NET", "SMCI"], correlation: 0.85, exposure: 18 },
    { name: "Crypto", tickers: ["BTC", "ETH", "COIN"], correlation: 0.92, exposure: 11 },
    { name: "Nuclear / Energy", tickers: ["CEG", "VST", "OKLO", "GEV"], correlation: 0.65, exposure: 8 },
    { name: "EM / International", tickers: ["INDA", "EWZ", "FXI"], correlation: 0.70, exposure: 6 },
    { name: "Fintech", tickers: ["SQ", "HOOD", "UPST", "BILL"], correlation: 0.75, exposure: 4 },
  ];
}

export function getTradeLogs(): TradeLog[] {
  return [
    { date: "2026-05-20", ticker: "RKLB", action: "BUY", shares: 50, price: 125, pnl: 0, broker: "Schwab", gradeAtEntry: 55, strategy: "Momentum", mistake: false },
    { date: "2026-05-15", ticker: "BTC", action: "TRIM", shares: 0.2, price: 102000, pnl: 3400, broker: "Binance", gradeAtEntry: 62, strategy: "Rebalance", mistake: false },
    { date: "2026-05-10", ticker: "JMIA", action: "BUY", shares: 100, price: 7.2, pnl: -23, broker: "eToro", gradeAtEntry: 48, strategy: "Speculative", mistake: true },
    { date: "2026-05-05", ticker: "CEG", action: "BUY", shares: 10, price: 280, pnl: 141, broker: "Schwab", gradeAtEntry: 59, strategy: "Thesis", mistake: false },
    { date: "2026-04-28", ticker: "BILL", action: "BUY", shares: 25, price: 42, pnl: -147, broker: "eToro", gradeAtEntry: 52, strategy: "FOMO", mistake: true },
  ];
}

export function getEarningsEvents(): EarningsEvent[] {
  return [
    { ticker: "NVDA", date: "2026-05-28", positionValue: 9690, grade: 64, expectedMove: 8.5, alert: "HIGH IMPACT — AI demand guidance" },
    { ticker: "AMAT", date: "2026-05-29", positionValue: 0, grade: 63, expectedMove: 6.2, alert: "WATCH — Semiconductor equipment" },
    { ticker: "CRWD", date: "2026-06-03", positionValue: 2500, grade: 58, expectedMove: 7.8, alert: "MEDIUM — Cybersecurity growth" },
    { ticker: "OSCR", date: "2026-06-12", positionValue: 4056, grade: 52, expectedMove: 12.3, alert: "HIGH — Insurtech profitability" },
    { ticker: "AAPL", date: "2026-06-05", positionValue: 5862, grade: 68, expectedMove: 4.2, alert: "WWDC AI announcements" },
    { ticker: "MSFT", date: "2026-07-22", positionValue: 1400, grade: 72, expectedMove: 3.8, alert: "Cloud growth guidance" },
  ];
}

export function getDividendStocks(): DividendStock[] {
  return [
    { ticker: "VOO", shares: 25, annualIncome: 137.5, yield: 1.35, paymentMonths: [3, 6, 9, 12] },
    { ticker: "VZ", shares: 50, annualIncome: 135, yield: 6.5, paymentMonths: [2, 5, 8, 11] },
    { ticker: "MO", shares: 30, annualIncome: 128, yield: 8.2, paymentMonths: [1, 4, 7, 10] },
    { ticker: "O", shares: 40, annualIncome: 126, yield: 5.8, paymentMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
    { ticker: "JNJ", shares: 15, annualIncome: 98, yield: 3.1, paymentMonths: [3, 6, 9, 12] },
    { ticker: "ABBV", shares: 12, annualIncome: 92, yield: 3.5, paymentMonths: [2, 5, 8, 11] },
    { ticker: "XOM", shares: 20, annualIncome: 88, yield: 3.2, paymentMonths: [3, 6, 9, 12] },
    { ticker: "BAC", shares: 35, annualIncome: 85, yield: 2.8, paymentMonths: [3, 6, 9, 12] },
    { ticker: "VST", shares: 80, annualIncome: 72, yield: 0.6, paymentMonths: [3, 6, 9, 12] },
    { ticker: "CEG", shares: 10, annualIncome: 14, yield: 0.5, paymentMonths: [3, 6, 9, 12] },
  ];
}

export function getAlerts(): AlertItem[] {
  return [
    { id: "1", type: "PRICE", ticker: "NVDA", message: "Price dropped to $215 (support at $200)", severity: "MEDIUM", triggered: false, timestamp: "2026-05-27T09:30:00Z" },
    { id: "2", type: "GRADE", ticker: "JMIA", message: "Grade dropped to 41 (SELL threshold)", severity: "HIGH", triggered: true, timestamp: "2026-05-26T16:00:00Z" },
    { id: "3", type: "PULLBACK", ticker: "CEG", message: "RSI 52, approaching $270 entry target", severity: "MEDIUM", triggered: false, timestamp: "2026-05-27T10:15:00Z" },
    { id: "4", type: "TRUMP", ticker: "XLF", message: "Tariff policy update — financials positive", severity: "HIGH", triggered: true, timestamp: "2026-05-27T08:00:00Z" },
    { id: "5", type: "EARNINGS", ticker: "NVDA", message: "Earnings May 28 — expected move 8.5%", severity: "HIGH", triggered: false, timestamp: "2026-05-27T00:00:00Z" },
    { id: "6", type: "PRICE", ticker: "BTC", message: "Trim executed at $105,520 (5% target reached)", severity: "MEDIUM", triggered: true, timestamp: "2026-05-27T09:00:00Z" },
  ];
}

export function getPortfolioSummary() {
  const positions = getPositions();
  const totalValue = positions.reduce((sum, p) => sum + p.value, 0);
  const totalPnl = positions.reduce((sum, p) => sum + p.pnl, 0);
  const avgGrade = Math.round(positions.reduce((sum, p) => sum + p.grade, 0) / positions.length);
  const cash = 86890;
  const totalAum = totalValue + cash;
  
  return {
    totalAum,
    totalValue,
    cash,
    cashPercent: Math.round((cash / totalAum) * 100),
    totalPnl,
    pnlPercent: Math.round((totalPnl / (totalAum - totalPnl)) * 100 * 10) / 10,
    avgGrade,
    positionCount: positions.length,
    brokers: ["eToro", "Schwab", "Binance", "GBM", "IBKR"],
  };
}
