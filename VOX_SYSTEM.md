# VOX Portfolio System Documentation

## Overview

VOX is a multi-broker portfolio tracking and grading system with automated analysis, dashboard, and alerting.

## Architecture

### Repositories

| Repo | Service | Technology | URL |
|------|---------|------------|-----|
| `vox-dashboard` | web | Next.js 15 + React 19 | https://web-production-9e321.up.railway.app |
| `vox-grader` | grader | Python 3.11 + PostgreSQL | Railway internal |

### Database (Railway PostgreSQL)

**Primary Tables:**
- `broker_positions` — Single source of truth for all positions (UNIQUE broker+ticker)
- `vox_grades` — 6-layer grades for all tickers
- `sp500_grades` — S&P 500 universe grades
- `sp500_universe` — S&P 500 constituent list
- `macro_signals` — Macro trend signals
- `sector_momentum` — Sector analysis
- `weather_alerts` — Weather pattern alerts
- `cron_runs` — Cron execution log (status='ok' NOT 'success')

## Broker Configuration

### API-Connected Brokers (Auto-Sync)

| Broker | Method | Sync Frequency | Status |
|--------|--------|----------------|--------|
| **eToro** | REST API (`public-api.etoro.com/api/v1/`) | Weekly cron | ✅ Active |
| **Binance** | REST API (`api.binance.com`) | Weekly cron | ✅ Active |
| **Bitso** | REST API (`api.bitso.com/v3/`) | Weekly cron | ✅ Active |

**API Credentials:**
- eToro: `ETORO_API_KEY` + `ETORO_USER_KEY` headers
- Binance: `BINANCE_API_KEY` + `BINANCE_SECRET_KEY` HMAC-SHA256
- Bitso: `BITSO_API_KEY` + `BITSO_SECRET` HMAC-SHA256, nonce=Unix ms

### Manual-Import Brokers

| Broker | Method | Last Updated | Status |
|--------|--------|--------------|--------|
| **GBM Main** | CSV import | 2026-06-15 | ⚠️ Stale |
| **GBM USA** | CSV import | 2026-06-15 | ⚠️ Stale |
| **Schwab** | Screenshot/image | 2026-06-15 | ✅ Current |
| **IBKR** | Screenshot/image | 2026-06-15 | ⚠️ Stale |

## Data Flow

```
Broker APIs → Python sync scripts → PostgreSQL → Next.js dashboard
     ↑                                              ↓
     └──────── Weekly cron (Mon 9 AM) ←─────────────┘
```

## Currency Handling

- **MXN positions**: `live_value / 17.5` → USD
- **USD positions**: `live_value` as-is
- `live_value_usd` column is deprecated and unreliable
- Always compute USD fresh from `live_value` + `currency`

## Current Portfolio (2026-06-15)

| Broker | Value USD | % | Method | Status |
|--------|-----------|---|--------|--------|
| eToro | $84,937 | 42.9% | API | ✅ Live |
| GBM Main | $74,672 | 37.7% | CSV | ⚠️ Stale |
| Binance | $20,146 | 10.2% | API | ✅ Live |
| GBM USA | $14,932 | 7.5% | CSV | ⚠️ Stale |
| Schwab | $1,630 | 0.8% | Image | ✅ Current |
| IBKR | $1,260 | 0.6% | Image | ⚠️ Stale |
| Bitso | $241 | 0.1% | API | ✅ Live |
| **TOTAL** | **$197,818** | **100%** | | |

## Grading System

### 6-Layer VOX Score

1. **Technical** (25%): RSI, MACD, trend, support/resistance
2. **Fundamental** (20%): P/E, FCF yield, revenue growth
3. **Macro** (15%): Yield curve, VIX, DXY, oil, gold
4. **Sector** (15%): Relative momentum, sector trends
5. **Weather** (15%): Agricultural alerts, supply chain
6. **Sentiment** (10%): News sentiment (synthetic default, AV fallback)

### Grade Scale

| Grade | Council | Action |
|-------|---------|--------|
| 70-100 | BUY | Strong Buy / Add |
| 60-69 | BUY | Buy / Hold |
| 50-59 | HOLD | Hold / Monitor |
| 40-49 | SELL | Trim / Weak Hold |
| 0-39 | SELL | Sell / Avoid |

## Cron Jobs (Active)

| Job | Schedule | Purpose |
|-----|----------|---------|
| `weekly-portfolio-sync` | Mondays 9 AM | Sync Binance + eToro + Bitso |
| `portfolio-dashboard-update` | Every 6 hours | Generate dashboard JSON |
| `grade-alert-check` | Every 12 hours | Check for grade changes |
| `sp500-weekly-grader` | Sundays 6 PM | Grade all 500 S&P tickers |
| `vox-macro-snapshot` | Daily 6 AM | Fetch FRED macro data |
| `vox-morning-digest` | Weekdays 7:30 AM | Pre-market briefing |
| `vox-evening-digest` | Weekdays 4:30 PM | Post-market summary |
| `vox-council-daily-doc` | Weekdays 8 AM | Council deliberation |
| `vox-massive-opportunity` | Weekdays 10 AM + 4 PM | Opportunity scanner |

## Deployment

### Railway Services

```bash
# Deploy dashboard (from vox-dashboard repo)
cd ~/dev/vox-dashboard
railway service link web
railway up --service=web

# Deploy grader (from vox-grader repo)
cd ~/dev/vox-grader
railway service link grader
railway up --service=grader
```

### Environment Variables

**vox-dashboard (web):**
- `DATABASE_URL` — Railway Postgres connection
- `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`

**vox-grader (grader):**
- `DB_PASSWORD` — PostgreSQL password
- `ETORO_API_KEY`, `ETORO_USER_KEY`
- `BINANCE_API_KEY`, `BINANCE_SECRET_KEY`
- `BITSO_API_KEY`, `BITSO_SECRET`

## Known Issues

1. **GBM/IBKR stale data** — Need manual CSV/image re-import
2. **Grader crashes** — `StringDataRightTruncation` on council column (varchar(10) too short)
3. **eToro API** — Requires valid credentials, falls back to JSON if unavailable
4. **Alpha Vantage** — Rate limited, synthetic sentiment used as default

## Development

### Local Setup

```bash
# Dashboard
cd ~/dev/vox-dashboard
npm install
npm run dev

# Grader
cd ~/dev/vox-grader
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python scripts/grader_service.py
```

### Database Scripts

```bash
# Run Python DB script (use heredoc, NOT execute_code)
cat > /tmp/script.py << 'PYEOF'
import psycopg2
# ... script content
PYEOF
python3 /tmp/script.py
```

## Contact

- **Dashboard**: https://web-production-9e321.up.railway.app
- **Railway Project**: Vox Dashboard
- **User**: Jose Antonio Mijares
