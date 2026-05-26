# Claude Development Rules for VOX Dashboard

## Project Context

VOX is an agentic trading platform with:
- **Frontend:** Next.js 14 + TypeScript + shadcn/ui + Tailwind
- **Backend:** Python agents in `~/.hermes/scripts/`
- **Data:** JSON files + Supabase PostgreSQL
- **Hosting:** Vercel static export
- **Cron:** Hermes Agent scheduler

## Critical Rules

### 1. NEVER Use These Patterns
- ❌ `use client` in server components
- ❌ `os.getenv()` without `load_dotenv()`
- ❌ Hardcoded API keys (always from `.env`)
- ❌ `python-dotenv` dependency (not installed)
- ❌ Grade-based SELL alerts (v8 is event-driven only)
- ❌ Repetitive alerts (max 5/day, 24h dedup)
- ❌ Old alert scripts (`vox_alert_system.py` etc. — all renamed to `.OLD`)

### 2. ALWAYS Use These Patterns
- ✅ `from dotenv import load_dotenv; load_dotenv()` — then `os.getenv()`
- ✅ Manual `.env` parsing as fallback
- ✅ Event-driven alerts (STOP, MOVE, NEWS, TRUMP)
- ✅ Council consensus check before grade-based alerts
- ✅ Protected tickers: `PROTECTED_TICKERS = {"SHOP"}`
- ✅ User stops: `USER_STOPS = {"PLTR": 115.00}`
- ✅ Dust filter: positions <$500 skipped

### 3. Python Agent Rules
- Scripts live in `~/.hermes/scripts/`
- Read `.env` from `Path.home() / ".hermes" / ".env"`
- Output JSON to `~/.hermes/scripts/`
- Copy dashboard data to `~/dev/vox-dashboard/public/data/`
- Use `#!/usr/bin/env python3` shebang
- Make executable: `chmod +x script.py`
- No external dependencies unless confirmed installed

### 4. Dashboard Rules
- Pages in `src/app/[page]/page.tsx`
- Components in `src/components/`
- Data in `src/lib/data.ts`
- Static JSON in `public/data/`
- Mobile-first: `pt-14 lg:pt-0 lg:ml-64`
- Mobile header + sidebar on all pages
- Dark theme only
- Use `vox-card` class for cards
- Lucide icons only

### 5. Navigation Sync
When adding a page:
1. Create `src/app/[page]/page.tsx`
2. Add to `src/components/sidebar.tsx` (with icon)
3. Add to `src/components/mobile-header.tsx` (no icon)
4. Ensure both show same sections + order

### 6. Data Flow
```
Python Agent → JSON file → public/data/ → Dashboard reads
     ↓
Supabase sync (optional, secondary)
```

### 7. Alert Rules
- v8 only: `vox_smart_alerts_v8.py`
- Event types: STOP, MOVE, NEWS, TRUMP, DIGEST
- STOP alerts: No cooldown, immediate
- Other alerts: 24h dedup per ticker
- Max 5 alerts/day total
- LLM layer analyzes context before sending

### 8. Broker Sync Rules
- v2.0: `vox_broker_sync_v2.py`
- 8 brokers aggregated
- FX: MXN → USD via Polygon.io
- Retry: 3 attempts, exponential backoff
- Circuit breaker: 2 failures → 5min cooldown
- Health checks: Per-broker timing

### 9. File Naming
- Agents: `vox_[name]_agent.py` or `vox_[name].py`
- Pipelines: `vox_[name]_pipeline.sh`
- Alerts: `vox_smart_alerts_v[N].py`
- Data: `[name].json` in scripts dir
- Dashboard data: `public/data/[name].json`

### 10. Git Rules
- Dashboard repo: `~/dev/vox-dashboard`
- Scripts: Not in git (local only)
- Commit message format: `[area] description`
- Examples: `[broker] fix eToro aggregation`, `[alerts] add volume spike detection`

## Common Tasks

### Add New Dashboard Page
```bash
# 1. Create page
cat > src/app/my-page/page.tsx << 'EOF'
"use client";
import { MobileHeader } from "@/components/mobile-header";
import { Sidebar } from "@/components/sidebar";
export default function MyPage() {
  return (
    <div className="min-h-screen bg-background">
      <MobileHeader />
      <Sidebar />
      <main className="pt-14 lg:pt-0 lg:ml-64 p-4 lg:p-8">
        {/* Content */}
      </main>
    </div>
  );
}
EOF

# 2. Add to sidebar + mobile header
# 3. Build + deploy
npm run build && npx vercel --prod
```

### Add New Python Agent
```python
#!/usr/bin/env python3
"""VOX [Name] Agent v1.0"""
import json
from pathlib import Path
from datetime import datetime, timezone

SCRIPT_DIR = Path.home() / ".hermes" / "scripts"

def load_env():
    env_path = Path.home() / ".hermes" / ".env"
    keys = {}
    if env_path.exists():
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    keys[k] = v.strip('"').strip("'")
    return keys

ENV = load_env()
API_KEY = ENV.get("POLYGON_API_KEY")

def main():
    # Agent logic here
    result = {"timestamp": datetime.now(timezone.utc).isoformat()}
    with open(SCRIPT_DIR / "vox_my_agent.json", "w") as f:
        json.dump(result, f, indent=2)

if __name__ == "__main__":
    main()
```

### Run Pipeline Manually
```bash
cd ~/.hermes/scripts

# Broker sync
python3 vox_broker_sync_v2.py

# Research agents
python3 vox_research_orchestrator.py

# Alerts
python3 vox_smart_alerts_v8.py

# Copy to dashboard
cp *.json ~/dev/vox-dashboard/public/data/
```

## Environment

Required variables in `~/.hermes/.env`:
```bash
POLYGON_API_KEY=xxx
SUPABASE_URL=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
TELEGRAM_BOT_TOKEN=xxx
TELEGRAM_CHAT_ID=xxx
X_BEARER_TOKEN=xxx
ETORO_API_KEY=xxx
```

## Key Files Reference

| File | Purpose |
|------|---------|
| `vox_smart_alerts_v8.py` | Alert system |
| `vox_broker_sync_v2.py` | Broker sync |
| `vox_research_orchestrator.py` | Agent orchestrator |
| `vox_council.py` | Council voting |
| `src/lib/data.ts` | Dashboard data loader |
| `src/components/sidebar.tsx` | Desktop nav |
| `src/components/mobile-header.tsx` | Mobile nav |

## Troubleshooting

### Build fails
```bash
cd ~/dev/vox-dashboard
rm -rf .next node_modules/.cache
npm run build
```

### Alert spam
- Check `~/.hermes/scripts/.vox_alert_state_v5.json`
- Verify only v8 is running: `ps aux | grep vox_smart_alerts`
- Check cron: `hermes cron list`

### Stale data
- Run broker sync manually
- Check `broker_health.json`
- Verify FX rate: `python3 vox_fx_rate.py`

### Missing dependencies
- Python: Use stdlib only, no pip installs
- Node: `npm install` in dashboard dir
- Check `package.json` for available packages

## Contact

For issues with VOX systems, check:
1. `README.md` — Overview
2. `BROKER_SYNC.md` — Broker sync docs
3. `AI_ARCHITECTURE.md` — AI system design
4. This file — Development rules
