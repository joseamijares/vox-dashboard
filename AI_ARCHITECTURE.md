# VOX AI Architecture v12.0 — Agentic Trading Intelligence

## Vision

Transform VOX from a data dashboard into an autonomous AI trading intelligence that:

1. **REMEMBERS** everything — RAG on Obsidian vault + trade history + market data
2. **CONNECTS** all signals — Harness unifies grades, news, earnings, macro, sentiment
3. **ACTS** autonomously — 10 agents generate plays, track outcomes, learn from mistakes
4. **SYNCS** all brokers — Unified portfolio view across 8 brokers with live FX conversion
5. **IMPROVES** continuously — Feedback loop: prediction → action → result → model update

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        VOX v12.0 PLATFORM                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │
│  │   BROKER    │  │  RESEARCH   │  │   ALERT     │  │ DASHBOARD  │ │
│  │    SYNC     │  │   AGENTS    │  │   SYSTEM    │  │   (UI)     │ │
│  │   (v2.0)    │  │   (10x)     │  │   (v8)      │  │  (Next.js) │ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └─────┬──────┘ │
│         │                │                │               │        │
│         └────────────────┴────────────────┴───────────────┘        │
│                              │                                       │
│                    ┌─────────▼──────────┐                           │
│                    │  UNIFIED DATA LAYER │                           │
│                    │  (JSON + Supabase)  │                           │
│                    └─────────────────────┘                           │
│                              │                                       │
│         ┌────────────────────┼────────────────────┐                 │
│         │                    │                    │                 │
│    ┌────▼────┐        ┌─────▼─────┐       ┌─────▼─────┐            │
│    │ Council │        │  RAG/LLM  │       │  Telegram │            │
│    │ Voting  │        │  Engine   │       │  Alerts   │            │
│    └─────────┘        └───────────┘       └───────────┘            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Layer 1: Broker Sync (v2.0)

### Unified Portfolio Aggregation

**8 Brokers, 1 View:**
- eToro (API) → Live positions
- GBM Main/USA (Manual) → MXN converted to USD
- Binance (Manual) → Crypto holdings
- Schwab, IBKR, Revolut, Bitso (Manual) → Legacy positions

**Key Features:**
- Retry logic (3 attempts, exponential backoff)
- Circuit breaker (auto-disable failing brokers)
- Health checks (per-broker timing + status)
- Live FX conversion (Polygon.io USD/MXN)
- Stale detection (7-day threshold)

**Output:** `unified_portfolio_current.json`
- 52 positions aggregated across brokers
- $192,677 AUM, $56,149 PnL

---

## Layer 2: Research Agents (10)

### Agent Ecosystem

| Agent | Purpose | Schedule | Output |
|-------|---------|----------|--------|
| **News** | Breaking news scanner | Every 4h | `vox_news_digest.json` |
| **Trump** | Trump statement monitor | Every 4h | `vox_trump_tracker.json` |
| **Reddit** | r/wsb, r/stocks tracker | Every 4h | `vox_reddit_report.json` |
| **X/Twitter** | Sentiment + mentions | Every 4h | `snapshots/x_momentum_latest.json` |
| **Volume** | Volume anomaly detection | Every 4h | `vox_volume_scan.json` |
| **Macro** | VIX, yields, DXY regime | Every 4h | `vox_macro_regime.json` |
| **Sector** | 11-sector rotation | Every 4h | `vox_sector_rankings.json` |
| **Stock Researcher** | Technical + fundamental | Every 4h | `vox_council_votes.json` |
| **Crypto Researcher** | On-chain metrics | Every 4h | `vox_crypto_analysis.json` |
| **Debrief** | Cross-signal aggregation | Every 4h | Supabase `intelligence_snapshots` |

### Pipeline Flow
```
Broker Sync → Live Prices → News → Trump → Reddit → X → Volume → Macro → Sector → Research → Debrief → Alerts → Supabase
```

---

## Layer 3: AI Harness (Signal Unification)

### Composite Scoring

```
┌─────────────────────────────────────────────────────────────┐
│                    VOX AI HARNESS                            │
├─────────────────────────────────────────────────────────────┤
│  Signal Source          │  Weight  │  Current Value         │
├─────────────────────────────────────────────────────────────┤
│  Grade System (Polygon) │  25%     │  Per-ticker 0-100      │
│  Technical Analysis     │  15%     │  RSI, MACD, EMA        │
│  Fundamental (FMP)      │  15%     │  P/E, Revenue Growth   │
│  News Sentiment         │  10%     │  Bullish/Bearish score │
│  X/Twitter Sentiment    │  10%     │  Mention spikes        │
│  Macro Regime           │  10%     │  Risk-on/Risk-off      │
│  LLM Council            │  10%     │  Consensus vote        │
│  Volume Anomaly         │   5%     │  Spike detection       │
└─────────────────────────────────────────────────────────────┘
                         ↓
              Composite Signal Score (0-100)
                         ↓
              Confidence + Action Recommendation
```

### Signal Types

| Signal | Source | Update Freq | Weight |
|--------|--------|-------------|--------|
| Grade | `vox_batch_grade.py` v2.0 | Daily | 25% |
| Technical | Polygon aggregates | Real-time | 15% |
| Fundamental | FMP API | Quarterly | 15% |
| News Sentiment | `vox_news_agent.py` | Hourly | 10% |
| X Sentiment | `vox_x_intelligence.py` | Hourly | 10% |
| Macro | `vox_macro_agent.py` | Daily | 10% |
| LLM Council | `vox_council.py` | Weekly | 10% |
| Volume | `vox_volume_intelligence.py` | Hourly | 5% |

---

## Layer 4: Council Voting System

### Consensus Engine

**Input:** All research agent outputs
**Process:** Weighted voting by signal strength
**Output:** BUY / HOLD / SELL / STRONG_BUY / STRONG_SELL per ticker

**Integration with Alerts:**
- Council = HOLD/BUY → Suppress grade-based SELL/TRIM alerts
- Council = SELL → Boost alert priority
- No council data → Fall back to grade-only alerts

**Storage:** `vox_council_votes.json` + Supabase `watchlist_grades`

---

## Layer 5: Alert System (v8)

### Event-Driven, LLM-Enhanced

| Alert Type | Trigger | Cooldown | Priority |
|------------|---------|----------|----------|
| **STOP** | User-defined stop hit | None | Critical |
| **MOVE** | >10% daily move | 24h | High |
| **NEWS** | Relevance ≥65 | 6h | Medium |
| **TRUMP** | Mentions portfolio | Immediate | High |
| **VOLUME** | >2x avg + ±5% price | 4h | Medium |
| **X_MOMENTUM** | Extreme sentiment | 6h | Low |
| **DAILY DIGEST** | Market close | Daily | Info |

### Protections
- **SHOP**: Never sell (protected ticker)
- **PLTR**: Stop @ $115 (user-defined)
- **Max 5 alerts/day** with 24h dedup per ticker
- **NO grade-based SELL spam**

### LLM Enhancement Layer
- Analyzes portfolio context before sending
- Checks for conflicting signals
- Generates rich context messages
- Filters low-quality alerts

---

## Layer 6: RAG (Retrieval-Augmented Generation)

### Knowledge Base

```
📁 Vector Store (ChromaDB / Pinecone)
├── 📄 Obsidian Vault (119 files)
│   ├── Position theses (NVDA.md, BTC.md, etc.)
│   ├── Trade journal entries
│   ├── LLM Council decisions
│   ├── Mistake journal
│   └── Market regime notes
├── 📄 Portfolio Data (JSON embeddings)
│   ├── All positions with grades
│   ├── Historical P&L per position
│   ├── Sector allocation history
│   └── Broker performance over time
├── 📄 Market Intelligence
│   ├── Earnings transcripts
│   ├── SEC filings (10-K, 10-Q)
│   ├── News articles per ticker
│   └── Analyst reports
└── 📄 Trading Rules & Systems
    ├── VOX Operating Manual
    ├── Position sizing rules
    ├── Risk management rules
    └── Sector rotation playbook
```

### Use Cases
- "Why did I buy JMIA?" → Retrieves thesis + trade journal
- "What's my win rate on tech stocks?" → Queries position history
- "What did Council say about NVDA last month?" → Retrieves votes
- "Show me similar setups to TSLA" → Semantic search on past trades

---

## Layer 7: Play Generator

### Play Types

```typescript
interface Play {
  id: string;
  type: "BUY" | "SELL" | "TRIM" | "HOLD" | "WATCH";
  ticker: string;
  confidence: number;        // 0-100 from Harness
  conviction: "SPEC" | "CORE";
  thesis: string;
  entryPrice: number;
  stopLoss: number;
  targetPrice: number;
  timeHorizon: "SWING" | "POSITION" | "LONG_TERM";
  catalysts: string[];
  risks: string[];
  sourceSignals: string[];
  status: "HYPOTHESIS" | "ACTIVE" | "EXECUTED" | "CLOSED";
  createdAt: string;
  executedAt?: string;
  closedAt?: string;
  pnl?: number;
  lessons?: string;
}
```

### Generation Rules
1. Grade < 35 + Technical breakdown → SELL
2. Grade > 75 + Earnings setup → BUY
3. Grade 50-60 + No catalyst → WATCH
4. Duplicate across brokers → TRIM
5. Crypto > 10% portfolio → TRIM
6. Earnings in < 3 days → WATCH

---

## Layer 8: Tracking & Learning

### Closed Loop
```
Generate Play → Execute → Track → Measure → Learn → Update Model
     ↑_____________________________________________________↓
```

### Metrics

| Metric | How | Target |
|--------|-----|--------|
| Win Rate | Closed plays P&L > 0 | > 60% |
| Average R-Multiple | (Exit - Entry) / (Entry - Stop) | > 2.0 |
| Grade Accuracy | Did grade predict outcome? | Correlation > 0.7 |
| Signal Accuracy | Which signals were right? | Per-signal tracking |
| Time to Profit | How long until profitable? | < 30 days |
| Max Drawdown | Worst loss from entry | < 15% |

### Learning Mechanisms
1. **Grade Calibration**: If grade 70+ loses money, lower weights
2. **Signal Tuning**: If sentiment wrong, reduce weight
3. **Thesis Validation**: Compare pre-trade thesis to outcome
4. **Mistake Detection**: Auto-detect repeated mistake types
5. **Sector Learning**: Track sector performance by regime

---

## Data Architecture

### Primary Storage (JSON)
- `unified_portfolio_current.json` — Broker-aggregated positions
- `dashboard_positions_live.json` — Dashboard format
- `vox_watchlist_graded.json` — Watchlist with grades
- `vox_portfolio_graded.json` — Portfolio with grades
- `vox_council_votes.json` — Council consensus
- `broker_health.json` — Health check results

### Secondary Storage (Supabase)
- `watchlist_grades` — Graded tickers with metadata
- `portfolio_grades` — Position grades + targets
- `intelligence_snapshots` — Agent outputs
- `broker_sync_log` — Sync history

### File Locations
- Python agents: `~/.hermes/scripts/`
- Dashboard: `~/dev/vox-dashboard/`
- Data: `~/.hermes/scripts/` + `~/dev/vox-dashboard/public/data/`

---

## Cron Pipeline Architecture

### Active Jobs (4)

```
7:00 AM CT  ┌────────────────────────────────────────┐
            │  vox-broker-sync-pipeline.sh           │
            │  ├── Broker Sync (v2.0)                │
            │  ├── Live Prices                       │
            │  ├── Grade Watchlist                   │
            │  ├── Grade Portfolio                   │
            │  └── Pre-Market Briefing               │
            └────────────────────────────────────────┘

7:00 AM CT  ┌────────────────────────────────────────┐
            │  vox-premarket-pipeline.sh             │
            │  ├── News Digest                       │
            │  ├── Trump Tracker                     │
            │  └── Morning Briefing                  │
            └────────────────────────────────────────┘

9/12/15 CT  ┌────────────────────────────────────────┐
            │  vox-unified-pipeline-v3.sh            │
            │  ├── Live Prices                       │
            │  ├── Macro Agent (9 AM only)           │
            │  ├── News (12/15 PM)                   │
            │  └── Alert System v8                   │
            └────────────────────────────────────────┘

Every 4h    ┌────────────────────────────────────────┐
            │  vox-agentic-pipeline-v2.sh            │
            │  ├── All 10 Research Agents            │
            │  ├── Council Voting                    │
            │  ├── Debrief Agent                     │
            │  └── Supabase Sync                     │
            └────────────────────────────────────────┘
```

### Paused Legacy Jobs (37)
All legacy jobs renamed to `.OLD` or paused. Only 4 active jobs run.

---

## Dashboard Pages (20 Active)

| Section | Pages |
|---------|-------|
| **Command** | Dashboard, Plan, Intelligence |
| **Portfolio** | Positions, Brokers, Watchlist, Sectors, Grades, Plays |
| **Agents** | Agents, Crons, Council, Sentiment, Regime, Risk |
| **Tools** | Sizer, Screener, Crypto |
| **Journal** | Journal, Logger |

### Key Pages
- `/` — Main dashboard with portfolio overview
- `/brokers` — Live broker sync status + health checks
- `/agents` — Agent Control Center with pipeline flow
- `/crons` — Cron monitor with active/paused jobs
- `/intelligence` — Cross-signal dashboard
- `/watchlist` — 46 tickers with grades + targets

---

## Environment Variables

Required in `~/.hermes/.env`:

```bash
# Data
POLYGON_API_KEY=xxx          # Live prices + FX rates
FMP_API_KEY=xxx              # Fundamentals

# Database
SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=xxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx

# Alerts
TELEGRAM_BOT_TOKEN=xxx
TELEGRAM_CHAT_ID=xxx

# Social
X_BEARER_TOKEN=xxx           # X/Twitter API

# Brokers
ETORO_API_KEY=xxx            # eToro live data
BINANCE_API_KEY=xxx          # Binance (optional)
```

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 14 + TypeScript + shadcn/ui |
| Styling | Tailwind CSS + Dark theme |
| Charts | Recharts |
| Icons | Lucide React |
| Backend | Python 3.11 |
| APIs | Polygon.io, FMP, NewsAPI, X API |
| Database | Supabase PostgreSQL |
| Vector DB | ChromaDB (local) |
| Embeddings | OpenAI text-embedding-3-small |
| LLM | OpenRouter (Grok, Claude, GPT-4) |
| Alerts | Telegram Bot API |
| Hosting | Vercel (static export) |
| Cron | Hermes Agent scheduler |

---

## Current Stats

- **Portfolio:** $192,677 AUM, $56,149 PnL, 52 positions
- **Brokers:** 8 aggregated (1 API + 7 manual)
- **Watchlist:** 46 tickers across 9 sectors
- **Universe:** 259 tickers
- **Agents:** 10 research agents
- **Cron Jobs:** 4 active, 37 paused
- **Dashboard Pages:** 20 active, 35 legacy

---

## Documentation

| File | Content |
|------|---------|
| `README.md` | Platform overview |
| `BROKER_SYNC.md` | Broker sync architecture |
| `AI_ARCHITECTURE.md` | This file — AI system design |
| `CLAUDE.md` | Claude-specific coding rules |

---

## Implementation Status

### ✅ Complete
- [x] Broker Sync v2.0 (8 brokers, retry, circuit breaker)
- [x] 10 Research Agents
- [x] Alert System v8 (event-driven, LLM-enhanced)
- [x] Council Voting System
- [x] Dashboard v12 (20 pages, mobile-responsive)
- [x] Cron Pipeline (4 active jobs)
- [x] Supabase Schema
- [x] FX Conversion (MXN → USD)

### 🔄 In Progress
- [ ] RAG vector store setup
- [ ] Play generator automation
- [ ] Learning feedback loop

### 📋 Backlog
- [ ] Schwab API integration (JOS-120)
- [ ] IBKR API integration (JOS-121)
- [ ] SSR API routes for real-time data
- [ ] Portfolio drift detection (JOS-128)
- [ ] Correlation heatmap (JOS-129)
- [ ] Position sizing optimizer (JOS-130)

---

*Last updated: 2026-05-26*
*Version: 12.0*
