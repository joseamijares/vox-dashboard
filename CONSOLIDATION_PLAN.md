# VOX Dashboard Consolidation Plan

## Current Pages (34 total)

### What We Actually Use (Keep)
1. **Dashboard** (/) - Main overview with KPIs
2. **Portfolio** (/portfolio) - All positions with grades
3. **Brokers** (/brokers) - Per-broker breakdown
4. **Grades** (/grades) - VOX grading system
5. **Screener** (/screener) - Stock scanner
6. **Alerts** (/alerts) - Grade change alerts
7. **Watchlist** (/watchlist) - Tracking list
8. **Journal** (/journal) - Trade log
9. **Plays** (/plays) - Active trades

### What We Don't Use (Remove/Consolidate)
- analysis → Consolidate into grades
- briefing → Consolidate into dashboard
- council → Consolidate into grades
- council-plays → Consolidate into plays
- crons → Remove (internal only)
- debrief → Consolidate into journal
- digest → Consolidate into dashboard
- geopolitical → Remove (not used)
- harness → Consolidate into grades
- intelligence → Consolidate into dashboard
- logger → Remove (internal)
- paper-trading → Remove (not used)
- performance → Consolidate into portfolio
- plan → Consolidate into dashboard
- play-review → Consolidate into plays
- predictions → Remove (not accurate)
- regime → Consolidate into dashboard
- risk → Consolidate into portfolio
- sector-macro → Consolidate into grades
- sentiment → Consolidate into grades
- signals → Consolidate into screener
- supply-chain → Remove (not used)
- trump-tracker → Remove (not used)
- ultimate-plan → Consolidate into plan
- weather → Remove (not used)

## Simplified Structure (10 pages)

```
/
├── Dashboard (overview + briefing + digest + intelligence + regime)
├── Portfolio (positions + performance + risk)
├── Brokers (per-broker view)
├── Grades (grading + harness + council + sector-macro + sentiment)
├── Screener (scanner + signals)
├── Alerts (grade changes + notifications)
├── Watchlist (tracking + research)
├── Plays (active trades + play-review + council-plays)
├── Journal (trade log + debrief)
└── Settings (admin + crons + logger)
```

## Implementation

1. Create new simplified navigation
2. Move content from removed pages into consolidated pages
3. Add redirects from old URLs
4. Update sidebar/menu
