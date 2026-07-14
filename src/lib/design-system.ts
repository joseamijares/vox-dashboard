// ── VOX Design System ──
// Dark-first Linear/fintech tokens. Prefer CSS variables + Tailwind semantic classes.
// Avoid hardcoded light hex in components.

export const tokens = {
  // Canvas (Linear-style)
  bgBase: "#0b0e11",
  bgElevated: "#111418",
  bgCard: "#15181d",
  bgCardHover: "#1a1e25",
  bgMuted: "#1c2129",
  textPrimary: "#f0f2f5",
  textSecondary: "#8b929e",
  textTertiary: "#5c6570",
  borderSubtle: "rgba(255,255,255,0.06)",
  borderDefault: "rgba(255,255,255,0.08)",
  // Accents (muted pastels — not neon)
  accent: "#7c9cff",
  accentSoft: "rgba(124,156,255,0.12)",
  profit: "#4ade80",
  profitSoft: "rgba(74,222,128,0.12)",
  loss: "#f87171",
  lossSoft: "rgba(248,113,113,0.12)",
  warning: "#fbbf24",
  warningSoft: "rgba(251,191,36,0.12)",
  // Grades
  gradeCore: "#4ade80",
  gradeBuy: "#7c9cff",
  gradeHold: "#fbbf24",
  gradeTrim: "#fb923c",
  gradeSell: "#f87171",
} as const;

/** @deprecated use semantic Tailwind classes; kept for gradual migration */
export const colors = {
  background: "var(--background)",
  foreground: "var(--foreground)",
  primary: "var(--primary)",
  primaryForeground: "var(--primary-foreground)",
  secondary: "var(--secondary)",
  muted: "var(--muted-foreground)",
  mutedLight: "var(--muted-foreground)",
  border: "var(--border)",
  accent: "var(--vox-accent)",
  accentSoft: "var(--vox-accent-soft)",
  profit: "var(--vox-profit)",
  profitSoft: "var(--vox-profit-soft)",
  loss: "var(--vox-loss)",
  lossSoft: "var(--vox-loss-soft)",
  gradeCore: "var(--vox-grade-core)",
  gradeCoreSoft: "var(--vox-grade-core-soft)",
  gradeBuy: "var(--vox-grade-buy)",
  gradeBuySoft: "var(--vox-grade-buy-soft)",
  gradeHold: "var(--vox-grade-hold)",
  gradeHoldSoft: "var(--vox-grade-hold-soft)",
  gradeTrim: "var(--vox-grade-trim)",
  gradeTrimSoft: "var(--vox-grade-trim-soft)",
  gradeSell: "var(--vox-grade-sell)",
  gradeSellSoft: "var(--vox-grade-sell-soft)",
  gradeUngraded: "var(--muted-foreground)",
  gradeUngradedSoft: "var(--muted)",
  warning: "var(--vox-warning)",
  info: "var(--vox-accent)",
} as const;

export const typography = {
  display: "text-3xl lg:text-4xl font-semibold tracking-tight text-foreground",
  heading: "text-xl lg:text-2xl font-semibold tracking-tight text-foreground",
  subheading: "text-base font-semibold text-foreground",
  body: "text-sm text-foreground",
  caption: "text-xs text-muted-foreground",
  label: "text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground",
  mono: "font-mono tabular-nums",
  metric: "text-2xl font-semibold tracking-tight font-mono tabular-nums text-foreground",
} as const;

export const spacing = {
  page: "p-4 lg:p-8",
  section: "space-y-6",
  card: "p-4 lg:p-5",
  gap: "gap-3 lg:gap-4",
} as const;

export const radius = {
  sm: "rounded-md",
  md: "rounded-lg",
  lg: "rounded-xl",
  full: "rounded-full",
} as const;

export function getGradeStyle(grade: number) {
  if (grade >= 70)
    return { color: "var(--vox-grade-core)", bg: "var(--vox-grade-core-soft)", label: "Core", className: "text-grade-core bg-grade-core-soft" };
  if (grade >= 60)
    return { color: "var(--vox-grade-buy)", bg: "var(--vox-grade-buy-soft)", label: "Buy", className: "text-grade-buy bg-grade-buy-soft" };
  if (grade >= 50)
    return { color: "var(--vox-grade-hold)", bg: "var(--vox-grade-hold-soft)", label: "Hold", className: "text-grade-hold bg-grade-hold-soft" };
  if (grade >= 40)
    return { color: "var(--vox-grade-trim)", bg: "var(--vox-grade-trim-soft)", label: "Trim", className: "text-grade-trim bg-grade-trim-soft" };
  return { color: "var(--vox-grade-sell)", bg: "var(--vox-grade-sell-soft)", label: "Sell", className: "text-grade-sell bg-grade-sell-soft" };
}

export function getGradeClass(grade: number | null | undefined): string {
  if (grade == null || Number.isNaN(grade)) return "text-muted-foreground bg-muted";
  return getGradeStyle(grade).className;
}

/** Slim navigation — only real product surfaces */
export const navSections = [
  {
    title: "Overview",
    items: [
      { href: "/", label: "Dashboard", icon: "Dashboard" },
    ],
  },
  {
    title: "Portfolio",
    items: [
      { href: "/portfolio", label: "Positions", icon: "Positions" },
      { href: "/brokers", label: "Brokers", icon: "Brokers" },
      { href: "/grades", label: "Grades", icon: "Grades" },
      { href: "/sectors", label: "Sectors", icon: "Sectors" },
    ],
  },
  {
    title: "Research",
    items: [
      { href: "/screener", label: "Screener", icon: "Screener" },
      { href: "/alerts", label: "Alerts", icon: "Alerts" },
      { href: "/signals", label: "Signals", icon: "Signals" },
    ],
  },
  {
    title: "System",
    items: [
      { href: "/crons", label: "Crons", icon: "Crons" },
      { href: "/journal", label: "Journal", icon: "Journal" },
    ],
  },
] as const;

export const styles = {
  page: "min-h-screen bg-background text-foreground",
  card: "rounded-lg bg-card text-card-foreground transition-colors",
  cardInteractive: "rounded-lg bg-card text-card-foreground transition-colors hover:bg-muted/40",
  kpi: "rounded-lg bg-card p-4 lg:p-5 flex flex-col gap-1.5",
  tableWrap: "rounded-lg bg-card overflow-hidden",
  tableHead: "text-[11px] uppercase tracking-wider text-muted-foreground font-medium",
  pill: "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
  pageHeader: "mb-6 lg:mb-8",
} as const;
