# VOX Design System & Page Consolidation Plan

## Phase 0: Audit Complete ✅

### Current State
- **55 total pages** in src/app
- **19 linked** in sidebar (5 use PageShell, 14 use old sidebar)
- **15 unlinked** with real content
- **18 placeholders** (delete candidates)
- **Multiple design systems**: PageShell (new) vs old Sidebar
- **Inconsistent tables**: Some use shadcn Table, some custom, some inline

---

## Phase 1: Consolidation (Delete & Merge)

### DELETE (18 placeholders — no real data)
| Page | Lines | Reason |
|------|-------|--------|
| /ai-insights | 90 | Empty placeholder, /intelligence has real content |
| /commander | 100 | Empty placeholder |
| /compounding | 142 | Empty placeholder |
| /correlation | 132 | Empty placeholder |
| /crypto | 118 | Empty placeholder |
| /dividends | 125 | Empty placeholder |
| /earnings | 112 | Empty placeholder |
| /forex | 71 | Empty placeholder |
| /macro | 118 | Empty placeholder (weather+regime cover this) |
| /mistakes | 133 | Empty placeholder |
| /next-trade | 106 | Empty placeholder |
| /options | 54 | Empty placeholder |
| /rag | 214 | Empty placeholder |
| /rebalancing | 135 | Empty placeholder |
| /scorer | 124 | Empty placeholder |
| /sizer | 96 | Empty placeholder |
| /trump | 180 | Merge into /geopolitical |
| /weekly | 146 | Empty placeholder |

### MERGE (duplicates)
| Keep | Delete | Reason |
|------|--------|--------|
| /portfolio | /positions | Nearly identical, portfolio is linked |
| /intelligence | /insights, /intel | intelligence has 681 lines of real content |
| /geopolitical | /trump | Merge trump content into geopolitical |

### AFTER CONSOLIDATION: 34 pages

---

## Phase 2: Sidebar Reorganization

### New Structure (6 sections, 34 pages)

**Command** (3 pages)
- Dashboard `/`
- Plan `/plan`
- Intelligence `/intelligence`

**Portfolio** (6 pages)
- Positions `/portfolio`
- Brokers `/brokers`
- Plays `/plays`
- Performance `/performance` (add)
- Watchlist `/watchlist` (add)
- Paper Trading `/paper-trading` (add)

**Analysis** (5 pages)
- Screener `/screener` (add)
- Grades `/grades` (add)
- Analysis `/analysis` (add)
- Alerts `/alerts` (add)
- Predictions `/predictions` (add)

**Agents** (7 pages)
- Agents `/agents`
- Crons `/crons`
- Council `/council`
- Council Plays `/council-plays` (add)
- Sentiment `/sentiment`
- Regime `/regime`
- Risk `/risk`

**Macro** (6 pages)
- Weather `/weather`
- Geopolitical `/geopolitical`
- Supply Chain `/supply-chain`
- Sector Macro `/sector-macro` (add)
- Signals `/signals`
- Harness `/harness`

**Journal** (5 pages)
- Journal `/journal`
- Digest `/digest` (add)
- Briefing `/briefing` (add)
- Logger `/logger`
- Debrief `/debrief` (add)

---

## Phase 3: Design System Components

### New Components to Create

#### 1. VoxTable
```tsx
// Reusable table with sorting, filtering, pagination
// Props: data, columns, searchable?, sortable?, pageSize?
// Uses shadcn Table under the hood
// Consistent: header styling, row hover, grade badges, empty state
```

#### 2. VoxCard
```tsx
// Already exists but needs standardization
// Props: title, children, action?, loading?, error?
// Consistent: padding, shadow, border-radius, header style
```

#### 3. VoxBadge
```tsx
// Grade badge: SELL (red), TRIM (orange), HOLD (yellow), BUY (green), CORE (blue)
// Sector badge: consistent colors per sector
// Status badge: active, paused, error, success
```

#### 4. VoxKpi
```tsx
// KPI card with label, value, change indicator
// Props: label, value, change?, changeType?, prefix?, suffix?
// Consistent: number formatting, color coding
```

#### 5. VoxPageShell
```tsx
// Already exists as PageShell
// Standardize: all pages must use this
// Remove old Sidebar component entirely
```

#### 6. VoxLoading
```tsx
// Loading state for pages and cards
// Consistent spinner, skeleton option
```

#### 7. VoxError
```tsx
// Error state for pages and cards
// Consistent error message, retry button
```

---

## Phase 4: Page Migration Priority

### Priority 1: Core Pages (used daily)
1. Dashboard `/` — already uses PageShell ✅
2. Portfolio `/portfolio` — migrate to PageShell
3. Screener `/screener` — add to sidebar, migrate to PageShell
4. Grades `/grades` — already uses PageShell ✅
5. Harness `/harness` — already uses PageShell ✅

### Priority 2: Analysis Pages
6. Analysis `/analysis` — add to sidebar, migrate
7. Alerts `/alerts` — add to sidebar, migrate
8. Watchlist `/watchlist` — add to sidebar, migrate
9. Predictions `/predictions` — add to sidebar, migrate

### Priority 3: Agent Pages
10. Agents `/agents` — migrate
11. Council `/council` — migrate
12. Council Plays `/council-plays` — add to sidebar, migrate
13. Sentiment `/sentiment` — migrate
14. Regime `/regime` — migrate
15. Risk `/risk` — already uses PageShell ✅

### Priority 4: Macro Pages
16. Weather `/weather` — migrate
17. Geopolitical `/geopolitical` — migrate
18. Supply Chain `/supply-chain` — migrate
19. Sector Macro `/sector-macro` — add to sidebar, migrate
20. Signals `/signals` — migrate

### Priority 5: Journal & Misc
21. Journal `/journal` — migrate
22. Digest `/digest` — add to sidebar, migrate
23. Briefing `/briefing` — add to sidebar, migrate
24. Logger `/logger` — migrate
25. Debrief `/debrief` — add to sidebar, migrate
26. Plan `/plan` — already uses PageShell ✅
27. Plays `/plays` — already uses PageShell ✅
28. Brokers `/brokers` — migrate
29. Crons `/crons` — migrate
30. Performance `/performance` — add to sidebar, migrate
31. Paper Trading `/paper-trading` — add to sidebar, migrate

---

## Phase 5: Execution Order

1. **Delete placeholders** (18 pages)
2. **Merge duplicates** (3 merges)
3. **Create design system components** (VoxTable, VoxBadge, VoxKpi, VoxLoading, VoxError)
4. **Update sidebar** (add 15 pages, reorganize sections)
5. **Migrate Priority 1 pages** (5 pages)
6. **Migrate Priority 2 pages** (4 pages)
7. **Migrate Priority 3 pages** (6 pages)
8. **Migrate Priority 4 pages** (5 pages)
9. **Migrate Priority 5 pages** (11 pages)
10. **Delete old Sidebar component**
11. **Final test & deploy**

---

## Design System Spec

### Colors (from existing design-system.ts)
- Background: `#ffffff`
- Foreground: `#171717`
- Muted: `#666666`
- Secondary: `#fafafa`
- Border: `rgba(0,0,0,0.08)`

### Grade Colors
- SELL (<45): `#dc2626` (red-600)
- TRIM (45-49): `#ea580c` (orange-600)
- HOLD (50-59): `#ca8a04` (yellow-600)
- BUY (60-69): `#16a34a` (green-600)
- CORE (70+): `#2563eb` (blue-600)

### Typography
- Page title: `text-2xl font-semibold tracking-tight`
- Section title: `text-sm font-semibold uppercase tracking-wider`
- Body: `text-sm`
- Mono/numbers: `font-mono text-xs`

### Spacing
- Page padding: `p-4 lg:p-8`
- Card padding: `p-4`
- Card gap: `gap-4`
- Section gap: `space-y-6`

### Table Spec
- Header: `text-xs font-medium uppercase tracking-wider text-muted-foreground`
- Row hover: `hover:bg-secondary/50`
- Cell padding: `py-3 px-4`
- Border: `border-b`
- Empty state: centered icon + message
