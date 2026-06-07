// ── VOX Design System ──
// Single source of truth for colors, typography, spacing, shadows
// No hardcoded values anywhere in components

export const colors = {
  // Canvas
  background: "#ffffff",
  foreground: "#171717",

  // Semantic
  primary: "#171717",
  primaryForeground: "#ffffff",
  secondary: "#fafafa",
  muted: "#666666",
  mutedLight: "#999999",
  border: "rgba(0, 0, 0, 0.08)",

  // Accent
  accent: "#0072f5",
  accentSoft: "#ebf5ff",

  // Trading
  profit: "#00a86b",
  profitSoft: "rgba(0, 168, 107, 0.10)",
  loss: "#dc2626",
  lossSoft: "rgba(220, 38, 38, 0.10)",

  // Grades
  gradeCore: "#00a86b",
  gradeCoreSoft: "rgba(0, 168, 107, 0.10)",
  gradeBuy: "#0072f5",
  gradeBuySoft: "rgba(0, 114, 245, 0.10)",
  gradeHold: "#f59e0b",
  gradeHoldSoft: "rgba(245, 158, 11, 0.10)",
  gradeTrim: "#f97316",
  gradeTrimSoft: "rgba(249, 115, 22, 0.10)",
  gradeSell: "#dc2626",
  gradeSellSoft: "rgba(220, 38, 38, 0.10)",
  gradeUngraded: "#666666",
  gradeUngradedSoft: "rgba(0, 0, 0, 0.04)",

  // Status
  warning: "#f59e0b",
  info: "#0072f5",
} as const;

export const typography = {
  display: {
    fontSize: "40px",
    fontWeight: 600,
    lineHeight: 1.2,
    letterSpacing: "-2.4px",
  },
  heading: {
    fontSize: "24px",
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: "-0.96px",
  },
  subheading: {
    fontSize: "18px",
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: "-0.32px",
  },
  body: {
    fontSize: "14px",
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: "0",
  },
  caption: {
    fontSize: "12px",
    fontWeight: 500,
    lineHeight: 1.4,
    letterSpacing: "0.5px",
  },
  label: {
    fontSize: "11px",
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: "1.2px",
    textTransform: "uppercase" as const,
  },
  mono: {
    fontFamily: "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    fontFeatureSettings: '"liga" 1, "tnum" 1',
  },
} as const;

export const spacing = {
  xs: "4px",
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "24px",
  "2xl": "32px",
  "3xl": "40px",
  "4xl": "64px",
} as const;

export const shadows = {
  border: "rgba(0, 0, 0, 0.08) 0px 0px 0px 1px",
  borderLight: "rgb(235, 235, 235) 0px 0px 0px 1px",
  card: "rgba(0,0,0,0.08) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 2px",
  cardHover: "rgba(0,0,0,0.08) 0px 0px 0px 1px, rgba(0,0,0,0.06) 0px 4px 4px",
  cardStack: "rgba(0,0,0,0.08) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 2px, rgba(0,0,0,0.04) 0px 8px 8px -8px, #fafafa 0px 0px 0px 1px",
  cardStackHover: "rgba(0,0,0,0.08) 0px 0px 0px 1px, rgba(0,0,0,0.06) 0px 4px 4px, rgba(0,0,0,0.06) 0px 12px 12px -8px, #fafafa 0px 0px 0px 1px",
} as const;

export const radius = {
  sm: "6px",
  md: "8px",
  lg: "12px",
  xl: "16px",
  full: "9999px",
} as const;

// ── Grade System ──
export function getGradeStyle(grade: number) {
  if (grade >= 70) return { color: colors.gradeCore, bg: colors.gradeCoreSoft, label: "Core" };
  if (grade >= 60) return { color: colors.gradeBuy, bg: colors.gradeBuySoft, label: "Buy" };
  if (grade >= 50) return { color: colors.gradeHold, bg: colors.gradeHoldSoft, label: "Hold" };
  if (grade >= 40) return { color: colors.gradeTrim, bg: colors.gradeTrimSoft, label: "Trim" };
  return { color: colors.gradeSell, bg: colors.gradeSellSoft, label: "Sell" };
}

// ── Navigation Data (single source) ──
export const navSections = [
  {
    title: "Command",
    items: [
      { href: "/", label: "Dashboard" },
      { href: "/plan", label: "Plan" },
      { href: "/intelligence", label: "Intelligence" },
    ],
  },
  {
    title: "Portfolio",
    items: [
      { href: "/portfolio", label: "Positions" },
      { href: "/brokers", label: "Brokers" },
      { href: "/plays", label: "Plays" },
      { href: "/performance", label: "Performance" },
      { href: "/watchlist", label: "Watchlist" },
      { href: "/paper-trading", label: "Paper Trading" },
    ],
  },
  {
    title: "Analysis",
    items: [
      { href: "/screener", label: "Screener" },
      { href: "/grades", label: "Grades" },
      { href: "/analysis", label: "Analysis" },
      { href: "/alerts", label: "Alerts" },
      { href: "/predictions", label: "Predictions" },
    ],
  },
  {
    title: "Agents",
    items: [
      { href: "/agents", label: "Agents" },
      { href: "/crons", label: "Crons" },
      { href: "/council", label: "Council" },
      { href: "/council-plays", label: "Council Plays" },
      { href: "/sentiment", label: "Sentiment" },
      { href: "/regime", label: "Regime" },
      { href: "/risk", label: "Risk" },
    ],
  },
  {
    title: "Macro",
    items: [
      { href: "/weather", label: "Weather" },
      { href: "/geopolitical", label: "Geopolitical" },
      { href: "/supply-chain", label: "Supply Chain" },
      { href: "/sector-macro", label: "Sector Macro" },
      { href: "/signals", label: "Signals" },
      { href: "/harness", label: "Harness" },
    ],
  },
  {
    title: "Journal",
    items: [
      { href: "/journal", label: "Journal" },
      { href: "/digest", label: "Digest" },
      { href: "/briefing", label: "Briefing" },
      { href: "/logger", label: "Logger" },
      { href: "/debrief", label: "Debrief" },
    ],
  },
] as const;

// ── Reusable Component Styles ──
export const styles = {
  card: {
    background: colors.background,
    boxShadow: shadows.card,
    borderRadius: radius.md,
    transition: "all 0.15s ease",
  },
  cardHover: {
    boxShadow: shadows.cardHover,
    transform: "translateY(-1px)",
  },
  cardStack: {
    background: colors.background,
    boxShadow: shadows.cardStack,
    borderRadius: radius.md,
  },
  pageContainer: {
    minHeight: "100vh",
    background: colors.background,
  },
  pageMain: {
    paddingTop: "56px", // mobile header height
  },
  pageMainDesktop: {
    paddingTop: "0",
    marginLeft: "256px", // sidebar width
  },
} as const;
