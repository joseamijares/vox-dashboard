# VOX AI Architecture v12.0 — Agentic Trading Intelligence

## Vision

Transform VOX from a data dashboard into an autonomous AI trading intelligence that:

1. **REMEMBERS** everything — Portfolio history, trade journal, market data in Railway Postgres
2. **CONNECTS** all signals — Grades, news, earnings, macro, sentiment unified
3. **ACTS** autonomously — Research agents generate plays, track outcomes, learn from mistakes
4. **SYNCS** all brokers — Unified portfolio view across 6 brokers with live FX conversion
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
│  │   (v2.0)    │  │   (Hybrid)  │  │   (v8)      │  │  (Next.js) │ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └─────┬──────┘ │
│         │                │                │               │        │
│         └────────────────┴────────────────┴───────────────┘        │
│                              │                                       │
│                    ┌─────────▼──────────┐                           │
│                    │   RAILWAY POSTGRES   │                           │
│                    │  (Single source of   │                           │
│                    │       truth)         │                           │
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

**6 Brokers, 1 View:**
- eToro (API) → Live positions
- GBM Main/USA (Manual JSON) → MXN converted to USD
- Binance (Manual JSON) → Crypto holdings
- Schwab, IBKR (Manual JSON) → Legacy positions

**Key Features:**
- eToro live API sync (real positions, real prices)
- FX conversion (Polygon.io USD/MXN)
- All data persisted to Railway Postgres
- Daily sync via grader service

**Output:** Railway Postgres `positions` table
- 70 positions aggregated across brokers
- $185,301 AUM

---

## Layer 2: Research Agents (Hybrid)

### Agent Ecosystem

Agents run both on Railway (grader service) and locally (Hermes cron):

| Agent | Purpose | Location | Output |
|-------|---------|----------|--------|
| **News** | Breaking news scanner | Local cron | `vox_news_digest.json` |
| **Trump** | Trump statement monitor | Local cron | `vox_trump_tracker.json` |
| **Reddit** | r/wsb, r/stocks tracker | Local cron | `vox_reddit_report.json` |
| **X/Twitter** | Sentiment + mentions | Local cron | `snapshots/x_momentum_latest.json` |
| **Volume** | Volume anomaly detection | Local cron | `vox_volume_scan.json` |
| **Macro** | VIX, yields, DXY regime | Local cron | `vox_macro_regime.json` |
| **Sector** | 11-sector rotation | Local cron | `vox_sector_rankings.json` |
| **Stock Researcher** | Technical + fundamental | Railway grader | DB `watchlist` table |
| **Crypto Researcher** | On-chain metrics | Local cron | `vox_crypto_analysis.json` |
| **Debrief** | Cross-signal aggregation | Local cron | Supabase `intelligence_snapshots` |

### Pipeline Flow
```
Broker Sync → Live Prices → News → Trump → Reddit → X → Volume → Macro → Sector → Research → Debrief → Alerts → Postgres
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

**Storage:** Railway Postgres `positions.council` column

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
📁 Railway Postgres
├── 📄 Positions (70 live positions)
├── 📄 Watchlist (277 tickers)
├── 📄 Plays (16 active/closed)
├── 📄 Journal (6 entries)
├── 📄 Alerts (39 alerts)
└── 📄 Intelligence snapshots

📁 Local Files (JSON)
├── 📄 Obsidian Vault (119 files)
│   ├── Position theses (NVDA.md, BTC.md, etc.)
│   ├── Trade journal entries
│   ├── LLM Council decisions
│   ├── Mistake journal
│   └── Market regime notes
├── 📄 Agent outputs
│   ├── News digests
│   ├── Trump tracker
│   ├── Reddit reports
│   └── Volume scans
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

### Primary Storage (Railway Postgres)
- `positions` — 70 live positions with grades
- `watchlist` — 277 tickers with entry/target/stop
- `alerts` — 39 alerts with severity
- `plays` — 16 plays (open + closed)
- `journal` — 6 journal entries

### Secondary Storage (Local JSON)
- Agent outputs in `~/.hermes/scripts/`
- News digests, Trump tracker, Reddit reports
- Volume scans, macro regimes, sector rankings

### File Locations
- Python agents: `~/.hermes/scripts/` (local) + `~/dev/vox-python/src/` (Railway)
- Dashboard: `~/dev/vox-dashboard/`
- Data: Railway Postgres (primary) + local JSON (agent outputs)

---

## Cron Pipeline Architecture

### Active Jobs (Hybrid)

```
7:30 AM CT  ┌────────────────────────────────────────┐
            │  vox-daily-sync (Railway grader)       │
            │  ├── Broker Sync (eToro API)           │
            │  ├── Live Prices (Polygon)             │
            │  ├── Grade Watchlist                   │
            │  ├── Grade Portfolio                   │
            │  └── Persist to Postgres               │
            └────────────────────────────────────────┘

Every 4h    ┌────────────────────────────────────────┐
            │  vox-agentic-pipeline-v2.sh (Local)    │
            │  ├── All 10 Research Agents            │
            │  ├── Council Voting                    │
            │  ├── Debrief Agent                     │
            │  └── Supabase/Postgres Sync            │
            └────────────────────────────────────────┘
```

---

## Dashboard Pages (17 Active)

| Section | Pages |
|---------|-------|
| **Command** | Dashboard, Plan, Intelligence |
| **Portfolio** | Positions, Brokers, Plays |
| **Agents** | Agents, Crons, Council, Sentiment, Regime, Risk |
| **Tools** | Sizer, Screener, Crypto |
| **Journal** | Journal, Logger |

### Key Pages
- `/` — Main dashboard with portfolio overview
- `/brokers` — Live broker sync status
- `/agents` — Agent Control Center
- `/crons` — Cron monitor with active/paused jobs
- `/intelligence` — Cross-signal dashboard
- `/watchlist` — 277 tickers with grades + targets

---

## Environment Variables

Required in Railway dashboard:

```bash
# Database
PGHOST=postgres-flpd.railway.internal
PGPORT=5432
PGDATABASE=railway
PGUSER=railway
PGPASSWORD=***

# APIs
POLYGON_API_KEY=xxx          # Live prices + FX rates
FMP_API_KEY=xxx              # Fundamentals

# eToro
ETORO_USERNAME=xxx
ETORO_PASSWORD=xxx
ETORO_ACCOUNT_ID=xxx

# Telegram
TELEGRAM_BOT_TOKEN=xxx
TELEGRAM_CHAT_ID=xxx

# Social
X_BEARER_TOKEN=xxx           # X/Twitter API
```

Required locally (`~/.hermes/.env`):
```bash
# Same APIs for local agents
POLYGON_API_KEY=xxx
FMP_API_KEY=xxx
TELEGRAM_BOT_TOKEN=xxx
TELEGRAM_CHAT_ID=xxx
X_BEARER_TOKEN=xxx
```

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 15 + TypeScript + Tailwind CSS |
| Styling | Tailwind CSS + Custom design system |
| Charts | Recharts |
| Icons | Lucide React |
| Backend | Python 3.11 |
| APIs | Polygon.io, FMP, NewsAPI, X API |
| Database | Railway Postgres |
| Vector DB | ChromaDB (local) |
| Embeddings | OpenAI text-embedding-3-small |
| LLM | OpenRouter (Grok, Claude, GPT-4) |
| Alerts | Telegram Bot API |
| Hosting | Railway (web + grader services) |
| Cron | Hermes Agent scheduler (local) + Railway (grader) |

---

## Current Stats

- **Portfolio:** $185,301 AUM, 70 positions
- **Brokers:** 6 aggregated (1 API + 5 manual)
- **Watchlist:** 277 tickers
- **Alerts:** 39
- **Plays:** 16
- **Journal:** 6 entries
- **Agents:** 10 research agents
- **Cron Jobs:** Hybrid (Railway + local)
- **Dashboard Pages:** 17 active

---

## Documentation

| File | Content |
|------|---------|
| `README.md` | Platform overview |
| `BROKER_SYNC.md` | Broker sync architecture |
| `AI_ARCHITECTURE.md` | This file — AI system design |
| `CLAUDE.md` | Development rules |

---

## Implementation Status

### ✅ Complete
- [x] Broker Sync v2.0 (6 brokers, eToro API live)
- [x] 10 Research Agents
- [x] Alert System v8 (event-driven, LLM-enhanced)
- [x] Council Voting System
- [x] Dashboard v12 (17 pages, mobile-responsive)
- [x] Railway Postgres migration
- [x] Daily sync pipeline (Railway grader)
- [x] FX Conversion (MXN → USD)

### 🔄 In Progress
- [ ] RAG vector store setup
- [ ] Play generator automation
- [ ] Learning feedback loop

### 📋 Backlog
- [ ] Schwab API integration
- [ ] IBKR API integration
- [ ] Real-time WebSocket updates
- [ ] Portfolio drift detection
- [ ] Correlation heatmap
- [ ] Position sizing optimizer

---

*Last updated: 2026-06-05*
*Version: 12.0*
