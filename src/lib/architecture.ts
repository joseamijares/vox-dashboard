/**
 * VOX control-tower architecture catalog (product truth Jul 2026).
 * Keep in sync with ~/.hermes/scripts AGENTS.md + vox_cron_survival ALLOWLIST.
 */

export const architectureMeta = {
  product: "VOX Investment Intelligence — portfolio control tower",
  phase: "Phases 1–5 complete + Intel Spine + Radar (2026-07)",
  updated: "2026-07-23",
  mandate: "Balanced quality compounders · ~20% annual aim · not day-trading",
  decisionSsot: "Daily Ops Card Decision Object (Telegram)",
  workdirs: {
    scripts: "~/.hermes/scripts (+ vox_cron/)",
    dashboard: "~/dev/vox-dashboard",
    obsidian: "~/Documents/Obsidian/VOX/",
  },
} as const;

export const modelRouting = [
  {
    role: "Orchestrator / chat",
    model: "Grok 4.5",
    path: "xai-oauth",
    note: "Main Hermes + X research",
  },
  {
    role: "Soft advisor (cron)",
    model: "Kimi Coding k3 → DeepSeek fallback",
    path: "kimi-coding (KIMI_API_KEY); OpenRouter if 403",
    note: "M/W/F · never SSOT · bakeoff #2",
  },
  {
    role: "Soft advisor (hard)",
    model: "Claude Sonnet 5",
    path: "OpenRouter anthropic/claude-sonnet-5",
    note: "On demand · bakeoff winner · vox.py advisor --model sonnet5",
  },
  {
    role: "Soft advisor (draft)",
    model: "GLM 5.2",
    path: "OpenRouter z-ai/glm-5.2",
    note: "Optional speed only — failed grade-trap; never sole",
  },
  {
    role: "Subagents",
    model: "Kimi Coding k3",
    path: "kimi-coding",
    note: "Delegation workhorse",
  },
  {
    role: "Batch scripts",
    model: "DeepSeek v4 pro / flash",
    path: "OpenRouter",
    note: "Pinned models only — no auto-router for decisions",
  },
  {
    role: "X / Twitter",
    model: "x_search (Grok)",
    path: "Hermes tool",
    note: "Soft color only",
  },
] as const;

export type CronDeliver = "telegram" | "local" | "origin";
export type CronState = "allowlist" | "paused" | "never";

export interface CronJob {
  name: string;
  schedule: string;
  scheduleHuman: string;
  script: string;
  deliver: CronDeliver;
  state: CronState;
  feeds: string;
  category:
    | "decision"
    | "context"
    | "pricing"
    | "fund"
    | "hygiene"
    | "meta"
    | "soft";
}

/** Phase 4 allowlist — single product truth for enabled fleet */
export const allowlistCrons: CronJob[] = [
  {
    name: "vox-daily-ops-card",
    schedule: "45 7 * * 1-5",
    scheduleHuman: "07:45 CT weekdays",
    script: "vox_cron/vox_daily_ops_card.py",
    deliver: "origin",
    state: "allowlist",
    feeds: "Decision Object SSOT (Telegram)",
    category: "decision",
  },
  {
    name: "vox-intel-breaking",
    schedule: "0 9,12,16 * * 1-5",
    scheduleHuman: "09/12/16 CT weekdays",
    script: "vox_cron/vox_intel_breaking_run.py",
    deliver: "origin",
    state: "allowlist",
    feeds: "Material shocks → TG if weight≥2.5%",
    category: "decision",
  },
  {
    name: "vox-intel-breaking-weekend",
    schedule: "0 9,17 * * 0,6",
    scheduleHuman: "09/17 CT weekend",
    script: "vox_cron/vox_intel_breaking_run.py",
    deliver: "origin",
    state: "allowlist",
    feeds: "Weekend gap risk",
    category: "decision",
  },
  {
    name: "vox-morning-context",
    schedule: "15 6 * * 1-5",
    scheduleHuman: "06:15 CT weekdays",
    script: "vox_cron/vox_morning_context.py",
    deliver: "local",
    state: "allowlist",
    feeds: "Morning pack + Finnhub news → Ops Card",
    category: "context",
  },
  {
    name: "vox-radar-board",
    schedule: "0 6 * * 1-5",
    scheduleHuman: "06:00 CT weekdays",
    script: "vox_cron/vox_radar_board.py",
    deliver: "local",
    state: "allowlist",
    feeds: "AUM/earnings/AI veto/shorts radar (not council)",
    category: "context",
  },
  {
    name: "vox-intel-ingest",
    schedule: "5 6,12 * * 1-5",
    scheduleHuman: "06:05 + 12:05 CT weekdays",
    script: "vox_cron/vox_intel_ingest.py",
    deliver: "local",
    state: "allowlist",
    feeds: "Finnhub+RSS events JSONL bus",
    category: "context",
  },
  {
    name: "vox-intel-distill",
    schedule: "12 6,12 * * 1-5",
    scheduleHuman: "06:12 + 12:12 CT weekdays",
    script: "vox_cron/vox_intel_distill.py",
    deliver: "local",
    state: "allowlist",
    feeds: "DeepSeek Intel-Digest (soft)",
    category: "soft",
  },
  {
    name: "vox-earnings-desk",
    schedule: "20 6 * * 1-5",
    scheduleHuman: "06:20 CT weekdays",
    script: "vox_cron/vox_earnings_desk.py",
    deliver: "local",
    state: "allowlist",
    feeds: "Held/watch earnings desk → Ops EVENT",
    category: "context",
  },
  {
    name: "vox-outside-ideas",
    schedule: "0 7 * * 1-5",
    scheduleHuman: "07:00 CT weekdays",
    script: "vox_cron/vox_outside_ideas_run.py",
    deliver: "local",
    state: "allowlist",
    feeds: "New names anti-chase + AI_VETO",
    category: "context",
  },
  {
    name: "vox-portfolio-brain-daily",
    schedule: "0 8 * * 1-5",
    scheduleHuman: "08:00 CT weekdays",
    script: "vox_cron/vox_portfolio_brain_run.py",
    deliver: "local",
    state: "allowlist",
    feeds: "Brain LATEST (local)",
    category: "context",
  },
  {
    name: "vox-obsidian-compound-pre",
    schedule: "30 6 * * 1-5",
    scheduleHuman: "06:30 CT weekdays",
    script: "vox_cron/vox_obsidian_compound.py",
    deliver: "local",
    state: "allowlist",
    feeds: "Vault compound write",
    category: "context",
  },
  {
    name: "vox-k3-advisor",
    schedule: "30 6 * * 1,3,5",
    scheduleHuman: "06:30 CT Mon/Wed/Fri",
    script: "vox_cron/vox_k3_advisor.py",
    deliver: "local",
    state: "allowlist",
    feeds: "Soft advisor (k3→DeepSeek fallback, not SSOT)",
    category: "soft",
  },
  {
    name: "vox-weekly-monitor",
    schedule: "0 8 * * 0",
    scheduleHuman: "Sun 08:00 CT",
    script: "vox_cron/vox_weekly_monitor.py",
    deliver: "local",
    state: "allowlist",
    feeds: "Broadcast bot AUM+radar (self-send TG)",
    category: "decision",
  },
  {
    name: "vox-pricing-held-intraday",
    schedule: "15 9-15 * * 1-5",
    scheduleHuman: ":15 hourly 09–15 CT",
    script: "vox_cron/vox_pricing_refresh_held_run.py",
    deliver: "local",
    state: "allowlist",
    feeds: "Price owner held book",
    category: "pricing",
  },
  {
    name: "vox-pricing-eod",
    schedule: "45 15 * * 1-5",
    scheduleHuman: "15:45 CT weekdays",
    script: "vox_cron/vox_pricing_refresh_eod_run.py",
    deliver: "local",
    state: "allowlist",
    feeds: "EOD history UPSERT",
    category: "pricing",
  },
  {
    name: "vox-etoro-price-sync-v3",
    schedule: "every 240m",
    scheduleHuman: "Every 4h",
    script: "vox_cron/vox_etoro_price_updater_v3.py",
    deliver: "local",
    state: "allowlist",
    feeds: "eToro adapter only",
    category: "pricing",
  },
  {
    name: "vox-crypto-broker-sync",
    schedule: "0 5,17 * * *",
    scheduleHuman: "05:00 + 17:00 CT daily",
    script: "vox_cron/vox_crypto_broker_sync_run.py",
    deliver: "local",
    state: "allowlist",
    feeds: "Binance+Bitso → broker_positions",
    category: "pricing",
  },
  {
    name: "vox-fmp-fund-enrich",
    schedule: "0 5 * * 1-5",
    scheduleHuman: "05:00 CT weekdays",
    script: "vox_cron/vox_fmp_fund_enrich.py",
    deliver: "local",
    state: "allowlist",
    feeds: "FMP free mega fund",
    category: "fund",
  },
  {
    name: "vox-portfolio-weekly-grade",
    schedule: "0 6 * * 0",
    scheduleHuman: "Sun 06:00 CT",
    script: "vox_cron/vox_portfolio_weekly_grade_run.py",
    deliver: "local",
    state: "allowlist",
    feeds: "Hygiene regrade",
    category: "hygiene",
  },
  {
    name: "vox-daily-health-check",
    schedule: "0 5 * * *",
    scheduleHuman: "05:00 CT daily",
    script: "vox_cron/vox_health_check.py",
    deliver: "local",
    state: "allowlist",
    feeds: "System health",
    category: "meta",
  },
  {
    name: "vox-repo-housekeeper",
    schedule: "0 0 * * *",
    scheduleHuman: "00:00 CT daily",
    script: "vox_cron/vox_repo_housekeeper_run.py",
    deliver: "local",
    state: "allowlist",
    feeds: "Repo hygiene",
    category: "meta",
  },
  {
    name: "vox-compound-weekly",
    schedule: "0 9 * * 0",
    scheduleHuman: "Sun 09:00 CT",
    script: "vox_cron/vox_compound_loop.py",
    deliver: "local",
    state: "allowlist",
    feeds: "Real breaks only",
    category: "meta",
  },
  {
    name: "vox-cron-survival-monthly",
    schedule: "0 5 1 * *",
    scheduleHuman: "1st 05:00 CT",
    script: "vox_cron/vox_cron_survival.py",
    deliver: "local",
    state: "allowlist",
    feeds: "Allowlist enforcement",
    category: "meta",
  },
];

export const neverReenable = [
  "vox-daily-top10-claude",
  "vox-grade-alerts-claude",
  "vox-master-data-pipeline",
  "vox-unified-grading",
  "vox-market-regime",
  "vox-regrade-sp500-weekly",
  "vox-price-history-sync",
  "vox-ai-council",
  "llm_council",
] as const;

export interface Pipeline {
  id: string;
  name: string;
  purpose: string;
  steps: string[];
  ssot: boolean;
  surface: string;
}

export const pipelines: Pipeline[] = [
  {
    id: "daily-decision",
    name: "Daily decision spine",
    purpose: "Produce one Decision Object for human execution",
    steps: [
      "vault → env (local .env; no hung op in cron)",
      "pricing_refresh (owner) + crypto/etoro adapters",
      "radar-board + intel-ingest → distill + earnings-desk",
      "morning context + outside + brain",
      "Ops Card Decision Object (TG)",
      "vox.py log → you execute ≤5 actions",
      "weekly monitor broadcast + compound / survival",
    ],
    ssot: true,
    surface: "Telegram Ops Card",
  },
  {
    id: "price-owner",
    name: "Price owner",
    purpose: "Single owner for live marks + history bars",
    steps: [
      "Alpaca US primary",
      "Yahoo history / global / crypto",
      "held intraday refresh",
      "EOD universe UPSERT",
      "eToro adapter (not owner)",
    ],
    ssot: true,
    surface: "DB live_price / price_asof / day_chg_pct",
  },
  {
    id: "hygiene-grades",
    name: "Hygiene grades",
    purpose: "Rank book & outside — never auto-buy",
    steps: [
      "weekly portfolio grade run",
      "outside ideas scanner",
      "optional k3 soft audit",
      "Ops Bucket A/B + rejects",
    ],
    ssot: false,
    surface: "Grades page + Outside-Ideas-LATEST",
  },
  {
    id: "breaking",
    name: "Breaking shocks",
    purpose: "Map macro shocks to book when material",
    steps: [
      "geo / oil / war / disaster scan",
      "blast radius on held weights",
      "quiet unless material",
      "Telegram breaking (if alert)",
    ],
    ssot: false,
    surface: "Telegram Breaking + Breaking-LATEST",
  },
  {
    id: "storage",
    name: "Storage layers",
    purpose: "Truth hierarchy for book & memory",
    steps: [
      "1Password vault → env",
      "Railway Postgres (live API)",
      "~/.hermes/scripts pipelines",
      "Obsidian VOX LATEST brain",
      "Dashboard reads live API — not stale JSON",
    ],
    ssot: true,
    surface: "DB + Obsidian + Dashboard",
  },
];

export const hardRules = [
  "Grades = hygiene ranking, not auto-buy",
  "Material noise threshold ≥ 2.5% AUM (junk ≥ ~$500)",
  "Multi-broker ownership is never a sell reason",
  "Soft intel (X, politicians, 13F, weather) = color only — never ranks alone",
  "Buy new names first; add held only if best-of-best",
  "BUY hygiene on held ≠ add size",
  "K3 soft never overrides Ops / price owner",
  "Telegram only: Ops Card + Breaking (+ weekend)",
] as const;

/** Mermaid diagrams — dark-friendly node labels */
export const mermaidDiagrams = {
  systemFlow: `flowchart TB
  subgraph Secrets
    V["1Password<br/>Vox Hermes Vault"]
    E["env / .env.generated"]
  end
  subgraph Data
    P["Price Owner<br/>pricing_refresh"]
    F["FMP free<br/>mega fund"]
    DB[("Railway Postgres")]
  end
  subgraph Research
    M["Morning Context"]
    O["Outside Ideas"]
    B["Portfolio Brain"]
    K["K3 Advisor soft"]
    X["Breaking / X soft"]
  end
  subgraph Decision
    OPS["Daily Ops Card<br/>Decision Object"]
    TG["Telegram<br/>Ops + Breaking"]
  end
  subgraph Human
    U["You · ≤5 broker actions"]
  end
  subgraph Memory
    OBS["Obsidian VOX<br/>LATEST brain"]
    DASH["Dashboard<br/>live API"]
  end
  V --> E
  E --> P
  E --> F
  P --> DB
  F --> DB
  DB --> M
  DB --> O
  DB --> B
  M --> OPS
  O --> OPS
  B --> OPS
  K -.->|soft never SSOT| OPS
  X -.->|color only| OPS
  OPS --> TG
  TG --> U
  OPS --> OBS
  DB --> DASH
  U --> OBS`,

  dailyCadence: `flowchart TB
  subgraph Morning["Morning CT"]
    H05["05:00 health + FMP"]
    H0615["06:15 morning context"]
    H0630["06:30 obsidian + K3 M/W/F"]
    H0700["07:00 outside ideas"]
    H0745["07:45 Ops Card TG SSOT"]
    H0800["08:00 brain daily local"]
  end
  subgraph Session["Session CT"]
    P["09-15 :15 pricing held"]
    BR["09/12/16 breaking"]
    EOD["15:45 pricing EOD"]
  end
  subgraph Weekly["Weekend / monthly"]
    WG["Sun weekly grade"]
    WC["Sun compound"]
    WS["1st survival"]
  end
  H05 --> H0615 --> H0630 --> H0700 --> H0745 --> H0800
  H0800 --> P
  H0800 --> BR
  P --> EOD
  BR --> EOD
  EOD --> WG
  WG --> WC
  WC --> WS`,

  modelRouting: `flowchart LR
  U[User / Cron] --> H[Hermes]
  H --> G["Grok 4.5<br/>xai-oauth<br/>chat + X"]
  H --> K["Kimi k3<br/>kimi-coding<br/>advisor + subagents"]
  H --> D["DeepSeek<br/>OpenRouter<br/>batch only"]
  G --> DO[Decision Object]
  K -.->|soft| DO
  D --> FILES[Files / grades batch]
  FILES --> DO
  BAD["no auto-beta<br/>on decision path"]
  BAD -.-> DO`,

  dataStorage: `flowchart TB
  subgraph Truth
    BR["Broker sources<br/>eToro / GBM / IBKR / Binance…"]
    PO["Price owner"]
    PG[("Postgres live")]
  end
  subgraph Outputs
    OPS["Ops Card LATEST"]
    OUT["Outside-Ideas LATEST"]
    BRN["Brain LATEST"]
    GR["PortfolioGrades LATEST"]
  end
  subgraph Surfaces
    TG["Telegram"]
    DASH["Dashboard pages"]
    OBS["Obsidian VOX"]
  end
  BR --> PG
  PO --> PG
  PG --> OPS
  PG --> OUT
  PG --> BRN
  PG --> GR
  OPS --> TG
  OPS --> OBS
  OUT --> OBS
  BRN --> OBS
  GR --> OBS
  PG --> DASH
  OPS -.->|SSOT for actions| DASH`,

  decisionObject: `flowchart TB
  G1[book gate] --> DO{Decision Object}
  G2[pricing gate] --> DO
  G3[morning gate] --> DO
  G4[outside gate] --> DO
  G5[grades_fresh] --> DO
  DO -->|GREEN/YELLOW/RED| A[Bucket A owned / structure]
  DO --> B[Bucket B new capital Outside]
  DO --> R[Rejects anti-chase]
  A --> T[Human ticket ≤5]
  B --> T
  R --> SKIP[Do not market-buy]`,
} as const;
