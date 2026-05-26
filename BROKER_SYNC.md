# VOX Broker Sync Architecture

## Overview

The VOX Broker Sync system aggregates portfolio data from 8 brokers into a unified view, runs twice daily (7 AM + 12 PM CT), and feeds the dashboard with real-time position data.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    BROKER SYNC PIPELINE                      │
│                   (vox_broker_sync_v2.py)                   │
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
   • Binance            • GBM USA            USD/MXN
                        • Schwab
                        • IBKR
                        • Revolut
                        • Bitso
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  UNIFIED PORTFOLIO VIEW                      │
│              (unified_portfolio_current.json)               │
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

## Key Features

### v2.0 Enhancements
- **Retry Logic**: 3 attempts with exponential backoff for API calls
- **Circuit Breaker**: Auto-disables failing brokers for 5 minutes
- **Health Checks**: Per-broker timing and status tracking
- **FX Conversion**: Live USD/MXN rate from Polygon.io
- **Stale Detection**: 7-day threshold with visual indicators

### Data Flow
1. **Fetch**: Each broker fetched in parallel with health checks
2. **Transform**: GBM Main MXN values converted to USD
3. **Aggregate**: Positions merged by ticker across brokers
4. **Enrich**: Cost basis, PnL %, portfolio % calculated
5. **Export**: Saved to JSON + copied to dashboard

## Files

| File | Purpose |
|------|---------|
| `vox_broker_sync_v2.py` | Main orchestrator with retry/circuit breaker |
| `vox_broker_sync.py` | Legacy version (v1.0) |
| `vox_fx_rate.py` | USD/MXN rate fetcher |
| `etoro_api.py` | eToro API client |
| `unified_portfolio_current.json` | Aggregated output |
| `dashboard_positions_live.json` | Dashboard format |
| `broker_health.json` | Health check results |

## Cron Schedule

| Job | Schedule | Purpose |
|-----|----------|---------|
| `vox-broker-sync` | 7:00 AM + 12:00 PM CT | Full sync + prices + grades |
| `vox-premarket-pipeline` | 7:00 AM CT | News + briefing |
| `vox-alert-pipeline-unified` | 9/12/15 CT | Alerts |
| `vox-research-orchestrator-v2` | Every 4h | Background research |

## Dashboard Integration

### Brokers Page (`/brokers`)
- Real-time status cards for each broker
- Health check timing display
- Sync schedule visualization
- Auto-refresh every 30 seconds

### Data Format
```json
{
  "timestamp": "2026-05-26T23:05:02Z",
  "total_value": 192677.44,
  "total_pnl": 56149.17,
  "broker_breakdown": {
    "etoro": 74170.27,
    "binance": 19920.56,
    ...
  },
  "broker_status": {
    "etoro": {
      "value": 74170.27,
      "status": "connected",
      "stale": false,
      "position_count": 41
    }
  },
  "health": {
    "overall": "healthy",
    "healthy_count": 8,
    "total_count": 8
  }
}
```

## Error Handling

### Retry Strategy
- API brokers: 3 attempts, 2s base delay
- Manual brokers: 2 attempts, 1s base delay
- Exponential backoff: delay × 2^attempt

### Circuit Breaker
- Failure threshold: 2 consecutive failures
- Recovery timeout: 5 minutes
- States: CLOSED → OPEN → HALF_OPEN → CLOSED

### Fallbacks
- FX rate: 17.31 (last known)
- Broker failure: Marked stale, previous data retained
- Total calculation: Sum of successful brokers only

## Supabase Integration

### Schema
```sql
-- broker_sync_log
CREATE TABLE broker_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_time TIMESTAMPTZ DEFAULT NOW(),
  broker TEXT NOT NULL,
  status TEXT NOT NULL,
  duration_ms INTEGER,
  error TEXT,
  positions_count INTEGER,
  total_value DECIMAL(12,2)
);
```

### Setup
1. Add `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env`
2. Run `vox_supabase_setup.sql` in SQL Editor
3. Enable RLS policies

## Monitoring

### Health Metrics
- Response time per broker (target <3s)
- Success rate (target >95%)
- Stale data detection (max 7 days)
- FX rate freshness (max 24h)

### Alerts
- Broker failure → Telegram notification
- Stale data → Dashboard warning badge
- FX rate failure → Use last known rate

## Development

### Testing
```bash
# Run sync manually
cd ~/.hermes/scripts
python3 vox_broker_sync_v2.py

# Check health
cat broker_health.json

# Verify dashboard data
cat dashboard_positions_live.json | jq '.total_value'
```

### Adding a New Broker
1. Add to `BROKERS` dict with type/currency/weight
2. Create fetch function with `@retry` decorator
3. Add to health check loop
4. Update dashboard broker names mapping
5. Add to sidebar navigation

## Future Enhancements

- [ ] Schwab API integration (JOS-120)
- [ ] IBKR API integration (JOS-121)
- [ ] Real-time WebSocket updates
- [ ] Portfolio drift detection (JOS-128)
- [ ] Correlation heatmap (JOS-129)
- [ ] Position sizing optimizer (JOS-130)
