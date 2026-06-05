# VOX Broker Sync Architecture

## Overview

The VOX Broker Sync system aggregates portfolio data from 6 brokers into Railway Postgres, runs daily via the grader service, and feeds the dashboard with real-time position data.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    BROKER SYNC PIPELINE                      │
│              (vox_postgres_sync.py + grader)                │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
   ┌────▼────┐          ┌────▼────┐          ┌────▼────┐
   │  API    │          │ Manual  │          │  FX     │
   │ Brokers │          │ Brokers │          │ Rate    │
   └────┬────┘          └────┬────┘          └────┬────┘
        │                     │                     │
   • eToro              • GBM Main           Polygon.io
   • (live API)          • GBM USA            USD/MXN
                        • Binance
                        • Schwab
                        • IBKR
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  RAILWAY POSTGRES                            │
│              (Single source of truth)                        │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
         ┌────▼────┐    ┌────▼────┐    ┌────▼────┐
         │Dashboard│    │ Alerts  │    │ Grades  │
         │         │    │         │    │         │
         └─────────┘    └─────────┘    └─────────┘
```

## Brokers

| Broker | Type | Currency | Status |
|--------|------|----------|--------|
| eToro | API | USD | 🟢 Live API sync |
| GBM Main | Manual JSON | MXN → USD | 🟡 Manual update |
| GBM USA | Manual JSON | USD | 🟡 Manual update |
| Binance | Manual JSON | USD | 🟡 Manual update |
| Schwab | Manual JSON | USD | 🟡 Manual update |
| IBKR | Manual JSON | USD | 🟡 Manual update |

## Key Features

- **eToro Live API**: Real positions, real prices via eToro API
- **FX Conversion**: MXN → USD via Polygon.io for GBM Main
- **Unified View**: Positions merged by ticker across brokers
- **Railway Postgres**: All data persisted to single database
- **Daily Sync**: Grader service runs daily at 7:30 AM CT

## Data Flow

1. **Fetch**: eToro API live; manual brokers from JSON env vars
2. **Transform**: GBM Main MXN values converted to USD
3. **Aggregate**: Positions merged by ticker across brokers
4. **Enrich**: Cost basis, PnL %, portfolio % calculated
5. **Persist**: Saved to Railway Postgres `positions` table

## Database Schema

```sql
-- positions table
CREATE TABLE positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker TEXT NOT NULL,
  shares DECIMAL(18,8),
  avg_cost DECIMAL(18,8),
  live_price DECIMAL(18,8),
  live_value DECIMAL(18,2),
  grade INTEGER,
  council TEXT,
  brokers TEXT[],
  sector TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- watchlist table
CREATE TABLE watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker TEXT NOT NULL,
  entry_price DECIMAL(18,8),
  target_price DECIMAL(18,8),
  stop_loss DECIMAL(18,8),
  grade INTEGER,
  sector TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Files

| File | Purpose |
|------|---------|
| `vox_postgres_sync.py` | PostgreSQL CRUD wrapper |
| `vox_broker_sync_v2.py` | Broker sync orchestrator |
| `etoro_api.py` | eToro API client |
| `vox_fx_rate.py` | USD/MXN rate fetcher |

## Cron Schedule

| Job | Schedule | Purpose |
|-----|----------|---------|
| `vox-daily-sync` | Daily 7:30 AM CT | Full broker sync + prices + grades |

## Dashboard Integration

### Brokers Page (`/brokers`)
- Real-time status for each broker
- Position counts and values
- Last sync timestamp

### Data Format (API)
```json
{
  "positions": [
    {
      "ticker": "VOO",
      "shares": 31.07,
      "avg_cost": 401.04,
      "live_price": 696.59,
      "live_value": 21518.16,
      "grade": 55,
      "council": "HOLD",
      "brokers": ["eToro", "GBM Main"],
      "sector": "",
      "updated_at": "2026-06-05T02:25:08Z"
    }
  ]
}
```

## Error Handling

### eToro API
- Login with username/password
- Fetch portfolio positions
- Fallback to last known data if API fails

### Manual Brokers
- JSON stored in environment variables
- Parsed and merged during sync
- Stale detection via timestamp

### Fallbacks
- FX rate: 17.31 (last known)
- Broker failure: Previous data retained
- Total calculation: Sum of successful brokers only

## Development

### Testing
```bash
# Run sync manually
cd ~/dev/vox-python
python3 src/sync/vox_postgres_sync.py

# Check positions
psql $DATABASE_URL -c "SELECT ticker, live_value FROM positions ORDER BY live_value DESC LIMIT 5;"

# Verify dashboard API
curl -s https://web-production-9e321.up.railway.app/api/positions | jq '.positions | length'
```

### Adding a New Broker
1. Add to `BROKERS` dict with type/currency
2. Create fetch function
3. Add to sync pipeline
4. Update dashboard broker display

---

*Last updated: 2026-06-05*
