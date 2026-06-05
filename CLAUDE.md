# Claude Development Rules for VOX Dashboard

## Project Context

VOX is an agentic trading platform with:
- **Frontend:** Next.js 15 + TypeScript + Tailwind CSS
- **Backend:** Python agents in `~/dev/vox-python/src/`
- **Data:** Railway Postgres (single source of truth)
- **Hosting:** Railway (web + grader services)
- **Cron:** Hybrid — Railway grader (daily sync) + Hermes Agent (local agents)

## Critical Rules

### 1. NEVER Use These Patterns
- ❌ `use client` in server components
- ❌ `os.getenv()` without `load_dotenv()`
- ❌ Hardcoded API keys (always from `.env`)
- ❌ `python-dotenv` dependency (not installed)
- ❌ Grade-based SELL alerts (v8 is event-driven only)
- ❌ Repetitive alerts (max 5/day, 24h dedup)
- ❌ Old alert scripts (`vox_alert_system.py` etc. — all renamed to `.OLD`)
- ❌ Supabase client in browser (use API routes)
- ❌ `pg` module in client bundle (causes build errors)

### 2. ALWAYS Use These Patterns
- ✅ `from dotenv import load_dotenv; load_dotenv()` — then `os.getenv()`
- ✅ Manual `.env` parsing as fallback
- ✅ Event-driven alerts (STOP, MOVE, NEWS, TRUMP)
- ✅ Council consensus check before grade-based alerts
- ✅ Protected tickers: `PROTECTED_TICKERS = {"SHOP"}`
- ✅ User stops: `USER_STOPS = {"PLTR": 115.00}`
- ✅ Dust filter: positions <$500 skipped
- ✅ API routes for DB access (`/api/positions`, etc.)
- ✅ `pg` Pool only in API routes (server-side only)

### 3. Python Agent Rules
- Scripts live in `~/dev/vox-python/src/` (Railway) or `~/.hermes/scripts/` (local)
- Read `.env` from `Path.home() / ".hermes" / ".env"`
- Output JSON to `~/.hermes/scripts/` (local agents)
- Persist to Railway Postgres (grader service)
- Use `#!/usr/bin/env python3` shebang
- Make executable: `chmod +x script.py`
- No external dependencies unless confirmed installed

### 4. Dashboard Rules
- Pages in `src/app/[page]/page.tsx`
- Components in `src/components/`
- Data in `src/lib/data.ts` (fetches from `/api/*`)
- API routes in `src/app/api/[route]/route.ts`
- Mobile-first: `pt-14 lg:pt-0 lg:ml-64`
- Mobile header + sidebar on all pages
- Light theme (design system in `src/lib/design-system.ts`)
- Use `VoxCard`, `VoxBadge`, `VoxKpi` from `src/components/vox-card.tsx`
- Lucide icons only

### 5. Navigation Sync
When adding a page:
1. Create `src/app/[page]/page.tsx`
2. Add to `src/lib/design-system.ts` `navSections` array
3. Both `Sidebar` and `MobileHeader` consume `navSections` automatically

### 6. Data Flow
```
Python Agent → Railway Postgres → Next.js API Route → Dashboard UI
     ↓
Local JSON (agent outputs only)
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
- 6 brokers aggregated
- eToro API live sync
- FX: MXN → USD via Polygon.io
- All data to Railway Postgres

### 9. File Naming
- Agents: `vox_[name]_agent.py` or `vox_[name].py`
- Pipelines: `vox_[name]_pipeline.sh`
- Alerts: `vox_smart_alerts_v[N].py`
- Data: `[name].json` in scripts dir (local)
- API routes: `src/app/api/[name]/route.ts`

### 10. Git Rules
- Dashboard repo: `~/dev/vox-dashboard` → `github.com/joseamijares/vox-dashboard`
- Python repo: `~/dev/vox-python` → `github.com/joseamijares/vox-python`
- Commit message format: `[area] description`
- Examples: `[broker] fix eToro aggregation`, `[alerts] add volume spike detection`

## Common Tasks

### Add New Dashboard Page
```bash
# 1. Create page
cat > src/app/my-page/page.tsx << 'EOF'
import { PageShell } from "@/components/vox-nav";
export default function MyPage() {
  return (
    <PageShell title="My Page">
      {/* Content */}
    </PageShell>
  );
}
EOF

# 2. Add to navSections in src/lib/design-system.ts
# 3. Build + deploy
git add . && git commit -m "[dashboard] add my page" && git push
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
cd ~/dev/vox-python

# Broker sync (Railway grader)
python3 src/brokers/vox_broker_sync_v2.py

# Local agents
cd ~/.hermes/scripts
python3 vox_research_orchestrator.py

# Alerts
python3 vox_smart_alerts_v8.py
```

## Environment

Required in Railway dashboard:
```bash
PGHOST=postgres-flpd.railway.internal
PGPORT=5432
PGDATABASE=railway
PGUSER=railway
PGPASSWORD=xxx

POLYGON_API_KEY=xxx
FMP_API_KEY=xxx
ETORO_USERNAME=xxx
ETORO_PASSWORD=xxx
E...n
TELEGRAM_BOT_TOKEN=xxx
T...
```

Required locally (`~/.hermes/.env`):
```bash
POLYGON_API_KEY=xxx
FMP_API_KEY=xxx
T...
## Key Files Reference

| File | Purpose |
|------|---------|
| `vox_smart_alerts_v8.py` | Alert system |
| `vox_broker_sync_v2.py` | Broker sync |
| `vox_research_orchestrator.py` | Agent orchestrator |
| `vox_council.py` | Council voting |
| `vox_postgres_sync.py` | Railway Postgres client |
| `src/lib/data.ts` | Dashboard data loader |
| `src/lib/design-system.ts` | Design tokens |
| `src/components/vox-nav.tsx` | Navigation (sidebar + mobile) |
| `src/components/vox-card.tsx` | Reusable card components |

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
- Check Railway Postgres: `psql $DATABASE_URL -c "SELECT COUNT(*) FROM positions;"`
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
