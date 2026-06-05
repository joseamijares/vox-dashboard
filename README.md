# VOX Dashboard v12.0

**Railway-hosted React dashboard with Railway Postgres database.**

**URL:** https://web-production-9e321.up.railway.app

---

## Architecture

### Frontend (Next.js + TypeScript + Tailwind)
- **17 pages** in navigation (5 sections)
- Mobile-responsive with hamburger menu + sidebar drawer
- Light theme, real-time data from Railway Postgres
- Server-side API routes (no client-side DB connections)

### Backend (Python Grader Service)
- **Daily sync + grading** running on Railway
- eToro API live sync (real positions, real prices)
- 6-broker aggregation with FX conversion

### Database (Railway Postgres)
- **Single source of truth** — all data persisted
- 70 positions, 277 watchlist tickers, 39 alerts, 16 plays, 6 journal entries

---

## Active Pages (17)

| Section | Pages |
|---------|-------|
| **Command** | Dashboard, Plan, Intelligence |
| **Portfolio** | Positions, Brokers, Plays |
| **Agents** | Agents, Crons, Council, Sentiment, Regime, Risk |
| **Tools** | Sizer, Screener, Crypto |
| **Journal** | Journal, Logger |

---

## Broker Sync System

### Supported Brokers (6)

| Broker | Type | Currency | Status |
|--------|------|----------|--------|
| eToro | API | USD | 🟢 Live sync |
| GBM Main | Manual | MXN → USD | 🟡 Manual |
| GBM USA | Manual | USD | 🟡 Manual |
| Binance | Manual | USD | 🟡 Manual |
| IBKR | Manual | USD | 🟡 Manual |
| Schwab | Manual | USD | 🟡 Manual |

### Data Flow
```
Brokers (eToro API, Manual JSON)
    ↓
Python Grader Service (Railway)
    ↓
Railway Postgres (Single source of truth)
    ↓
Next.js API Routes (/api/positions, /api/watchlist, etc.)
    ↓
Dashboard UI
```

---

## API Routes

| Route | Data |
|-------|------|
| `/api/positions` | 70 live positions |
| `/api/watchlist` | 277 tickers |
| `/api/alerts` | 39 alerts |
| `/api/plays` | 16 plays |
| `/api/journal` | 6 entries |
| `/api/health` | Service health |

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

# eToro API
ETORO_USERNAME=***
ETORO_PASSWORD=***
ETORO_ACCOUNT_ID=***

# Other brokers (JSON fallback)
GBM_MAIN_JSON=***
GBM_USA_JSON=***
BINANCE_JSON=***
IBKR_JSON=***
SCHWAB_JSON=***

# APIs
POLYGON_API_KEY=***
OPENROUTER_API_KEY=***

# Telegram alerts
TELEGRAM_BOT_TOKEN=***
TELEGRAM_CHAT_ID=***
```

---

## Deployment

### Dashboard (Next.js)
```bash
cd ~/dev/vox-dashboard
git push origin main  # Auto-deploys to Railway
```

### Python Grader
```bash
cd ~/dev/vox-python
git push origin main  # Auto-deploys to Railway grader service
```

---

## Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Brokers   │────▶│   Grader    │────▶│   Railway   │
│  (6 total)  │     │  (Python)   │     │  Postgres   │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                          ┌────────────────────┼────────────────────┐
                          │                    │                    │
                    ┌─────▼─────┐      ┌──────▼──────┐      ┌─────▼─────┐
                    │  Next.js  │      │   Alerts    │      │   Grades  │
                    │  Dashboard│      │  (Telegram) │      │  (Council)│
                    └───────────┘      └─────────────┘      └───────────┘
```

---

## Documentation

| File | Content |
|------|---------|
| `README.md` | This file — platform overview |
| `BROKER_SYNC.md` | Broker sync architecture |
| `AI_ARCHITECTURE.md` | AI/agent system design |
| `CLAUDE.md` | Development rules |

---

## Portfolio Stats (Live)

- **Total AUM:** $185,301
- **Positions:** 70 across 6 brokers
- **Watchlist:** 277 tickers
- **Alerts:** 39
- **Plays:** 16
- **Journal:** 6 entries

---

## Infrastructure

| Resource | Provider | Status |
|----------|----------|--------|
| Dashboard | Railway (web service) | ✅ Online |
| Grader | Railway (grader service) | ✅ Online |
| Database | Railway (Postgres-fLPD) | ✅ Online |

**No Redis. No Supabase. No Vercel. No Streamlit.**

---

*Last updated: 2026-06-05*
*Version: 12.0*
