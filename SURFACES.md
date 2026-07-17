# Dashboard ↔ Obsidian surface map

See also vault note: `memory/brain/00-Surfaces-Dashboard-vs-Obsidian.md`

## Canonical dashboard nav
- Dashboard, Positions, Brokers, Grades, Sectors, Risk
- Screener, Alerts, Signals
- **Architecture** (Mermaid system maps + allowlist crons + pipelines)
- Crons, Journal

## Architecture page
- Route: `/architecture`
- Data: `src/lib/architecture.ts` (allowlist from `vox_cron_survival.py`)
- Charts: client Mermaid (`src/components/mermaid-chart.tsx`)

## Obsidian brain
- Brain-LATEST, SectorMap, Tracker, PortfolioGrades
- Daily log + PortfolioDashboard snapshots
- Breaking decisions + theses

Unlinked Next routes are intentional orphans for now — not product nav.
