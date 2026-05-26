# VOX Dashboard v12.0

Agentic trading platform with autonomous research agents, council voting, LLM-enhanced alerts, and multi-broker portfolio sync.

**URL:** https://vox-dashboard-five.vercel.app

---

## Architecture

### Frontend (Next.js + TypeScript + shadcn/ui)
- **55 pages** (20 in navigation, 35 legacy/hidden)
- Mobile-responsive with hamburger menu + sidebar
- Dark theme, real-time data from JSON + Supabase
- Static export (CDN-cached, free hosting)

### Backend (Python Agents)
- **10 autonomous research agents**
- **4 active cron pipelines**
- **37 paused legacy jobs**
- Supabase PostgreSQL backend (optional)

### Broker Sync (v2.0)
- **8 brokers** aggregated into unified view
- Live FX conversion (MXN → USD)
- Retry logic + circuit breaker + health checks
- Runs 2x daily: 7 AM + 12 PM CT

---

## Active Agents (10)

| Agent | File | Schedule | Purpose |
|-------|------|----------|---------|
| News Intelligence | `vox_news_agent.py` | Every 4h | Breaking news scanner |
| Trump Tracker | `vox_trump_agent.py` | Every 4h | Trump statement monitor |
| Reddit Intelligence | `vox_reddit_intelligence.py` | Every 4h | r/wsb, r/stocks tracker |
| X Intelligence | `vox_x_intelligence.py` | Every 4h | Twitter sentiment |
| Volume Intelligence | `vox_volume_intelligence.py` | Every 4h | Volume anomaly detection |
| Debrief Agent | `vox_debrief_agent.py` | Every 4h | Cross-signal aggregation |
| Stock Researcher | `vox_stock_researcher.py` | Every 4h | Technical + fundamental grades |
| Crypto Researcher | `vox_crypto_researcher.py` | Every 4h | On-chain metrics |
| Macro Agent | `vox_macro_agent.py` | Every 4h | VIX, yields, DXY |
| Sector Agent | `vox_sector_agent.py` | Every 4h | 11-sector rotation |

### Pipeline Flow (Every 4 Hours)
```
Live Prices → News → Trump → Reddit → X → Volume → Macro → Sector → Research → Debrief → Alerts → Supabase
```

---

## Active Cron Jobs (4)

| Job | Schedule | Script | Purpose |
|-----|----------|--------|---------|
| Broker Sync | 7:00 AM + 12:00 PM CT | `vox_broker_sync_pipeline.sh` | Full sync + prices + grades |
| Pre-Market | 7:00 AM CT | `vox_premarket_pipeline.sh` | News + briefing |
| Alert Pipeline v3 | 9/12/15 CT weekdays | `vox_unified_pipeline_v3.sh` | Live prices + alerts |
| Research Orchestrator v2 | Every 4 hours | `vox_agentic_pipeline_v2.sh` | Full agentic pipeline |

---

## Broker Sync System (v2.0)

### Supported Brokers

| Broker | Type | Currency | Status | Weight |
|--------|------|----------|--------|--------|
| eToro | API | USD | 🟢 Live | 43% |
| Binance | Manual | USD | 🟡 Manual | 10% |
| GBM Main | Manual | MXN → USD | 🟡 Manual | 38% |
| GBM USA | Manual | USD | 🟡 Manual | 7% |
| Schwab | Manual | USD | 🟡 Manual | 1% |
| IBKR | Manual | USD | 🟡 Manual | 1% |
| Revolut | Manual | MXN | 🟡 Manual | 0% |
| Bitso | Manual | USD | 🟡 Manual | 0% |

### Features
- **Retry Logic**: 3 attempts with exponential backoff
- **Circuit Breaker**: Auto-disables failing brokers (5min recovery)
- **Health Checks**: Per-broker timing + status tracking
- **FX Conversion**: Live USD/MXN from Polygon.io
- **Stale Detection**: 7-day threshold with visual indicators

### Files
| File | Purpose |
|------|---------|
| `vox_broker_sync_v2.py` | Main orchestrator |
| `vox_broker_sync.py` | Legacy v1.0 |
| `vox_fx_rate.py` | USD/MXN rate fetcher |
| `etoro_api.py` | eToro API client |

---

## Alert System v8

**Event-driven, LLM-enhanced:**
- **STOP**: User-defined stops (no cooldown) — PLTR @ $115
- **MOVE**: >10% daily moves (24h dedup)
- **NEWS**: Breaking news relevance ≥65 (6h dedup)
- **TRUMP**: Trump mentions portfolio (immediate)
- **DAILY DIGEST**: At market close

**Protected:** SHOP (never sell)
**Max 5 alerts/day with 24h dedup per ticker**

**NO grade-based SELL spam. NO repetitive alerts.**

---

## Navigation (20 Pages)

| Section | Pages |
|---------|-------|
| Command | Dashboard, Plan, Intelligence |
| Portfolio | Positions, **Brokers**, Watchlist, Sectors, Grades, Plays |
| Agents | Agents, Crons, Council, Sentiment, Regime, Risk |
| Tools | Sizer, Screener, Crypto |
| Journal | Journal, Logger |

---

## Key Files

| File | Purpose |
|------|---------|
| `vox_smart_alerts_v8.py` | Main alert system with LLM layer |
| `vox_broker_sync_v2.py` | Broker sync orchestrator |
| `vox_agentic_pipeline_v2.sh` | Research orchestrator pipeline |
| `vox_unified_pipeline_v3.sh` | Alert pipeline |
| `vox_premarket_pipeline.sh` | Pre-market briefing |
| `vox_broker_sync_pipeline.sh` | Broker sync + prices + grades |
| `vox_supabase_sync.py` | Supabase data sync |
| `vox_council.py` | Council voting system |

---

## Environment

Required in `~/.hermes/.env`:
- `POLYGON_API_KEY` — Live prices + FX rates
- `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` — Database
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Dashboard Supabase client
- `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` — Alerts
- `X_BEARER_TOKEN` — X/Twitter API
- `ETORO_API_KEY` — eToro live data

---

## Deployment

### Dashboard
```bash
cd ~/dev/vox-dashboard
npm run build
npx vercel --prod
```

### Python Agents
```bash
cd ~/.hermes/scripts
python3 vox_broker_sync_v2.py      # Manual broker sync
python3 vox_smart_alerts_v8.py     # Manual alert check
```

---

## Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Brokers   │────▶│    Sync     │────▶│   Unified   │
│  (8 total)  │     │   Engine    │     │  Portfolio  │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                          ┌────────────────────┼────────────────────┐
                          │                    │                    │
                    ┌─────▼─────┐      ┌──────▼──────┐      ┌─────▼─────┐
                    │ Dashboard │      │   Alerts    │      │  Grades   │
                    │  (/data)  │      │  (Telegram) │      │ (Council) │
                    └───────────┘      └─────────────┘      └───────────┘
```

---

## Documentation

| File | Content |
|------|---------|
| `README.md` | This file — overview |
| `BROKER_SYNC.md` | Broker sync architecture |
| `AI_ARCHITECTURE.md` | Agent system design |
| `CLAUDE.md` | Claude-specific rules |

---

## Portfolio Stats (Live)

- **Total AUM:** $192,677
- **Total PnL:** $56,149
- **Positions:** 52 across 8 brokers
- **Watchlist:** 46 tickers
- **Universe:** 259 tickers

---

*Last updated: 2026-05-26*
