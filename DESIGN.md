# VOX Dashboard Design System

**Style:** Dark-first institutional fintech · Linear density · muted pastels  
**Stack:** Next.js 16 · Tailwind v4 · CSS variables · Geist

## Principles

1. **Dark is default** (`defaultTheme="dark"`)
2. **Background defines cards** — no heavy white borders, no glassmorphism
3. **One accent** (`--vox-accent` / grade-buy blue) + profit/loss/warning
4. **Tabular mono** for money and scores
5. **No hardcoded light hex** in components — use CSS vars / semantic Tailwind
6. **Slim nav** — only real product surfaces

## Tokens (dark)

| Token | Value |
|-------|-------|
| Background | `#0b0e11` |
| Card | `#15181d` |
| Text | `#f0f2f5` |
| Muted | `#8b929e` |
| Border | `rgba(255,255,255,0.06)` |
| Profit | `#4ade80` |
| Loss | `#f87171` |
| Accent | `#7c9cff` |

## Components (SSOT)

| Component | Path | Use |
|-----------|------|-----|
| `PageShell` | `components/vox-nav.tsx` | Every page layout |
| `VoxKpi` | `components/vox/VoxKpi.tsx` | Metrics |
| `VoxBadge` | `components/vox/VoxBadge.tsx` | Grades / status |
| `VoxTable` | `components/vox/VoxTable.tsx` | Data tables |
| `VoxCard` | `components/vox-card.tsx` | Surfaces |
| `VoxLoading` / `VoxError` | `components/vox/` | States |
| `navSections` | `lib/design-system.ts` | Navigation only |

## Grades

| Band | Label | Color token |
|------|-------|-------------|
| ≥70 | Core | `--vox-grade-core` |
| 60–69 | Buy | `--vox-grade-buy` |
| 50–59 | Hold | `--vox-grade-hold` |
| 40–49 | Trim | `--vox-grade-trim` |
| <40 | Sell | `--vox-grade-sell` |

## Nav (canonical)

- Overview: Dashboard
- Portfolio: Positions, Brokers, Grades
- Research: Screener, Alerts, Signals
- System: Crons, Journal

Orphan routes may still exist on disk but are **not linked**.

## Do not

- Hardcode `#ffffff` card stacks
- Rainbow icons per nav item
- Neon chart spam
- Day-trader clutter on overview
