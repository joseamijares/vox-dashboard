# VOX AI Architecture v9.0 — RAG + Harness + Agentic System

## Vision
Transform VOX from a data dashboard into an autonomous AI trading intelligence that:
1. **REMEMBERS** everything (RAG on Obsidian vault + trade history + market data)
2. **CONNECTS** all signals (Harness unifies grades, news, earnings, macro, sentiment)
3. **ACTS** autonomously (Agent generates plays, tracks outcomes, learns from mistakes)
4. **IMPROVES** continuously (Feedback loop: prediction → action → result → model update)

---

## Layer 1: RAG (Retrieval-Augmented Generation)

### Knowledge Base
```
📁 Vector Store (ChromaDB / Pinecone)
├── 📄 Obsidian Vault (119 files)
│   ├── Position theses (NVDA.md, BTC.md, etc.)
│   ├── Trade journal entries
│   ├── LLM Council decisions
│   ├── Mistake journal
│   └── Market regime notes
├── 📄 Portfolio Data (JSON embeddings)
│   ├── All 1,344 positions with grades
│   ├── Historical P&L per position
│   ├── Sector allocation history
│   └── Broker performance over time
├── 📄 Market Intelligence
│   ├── Earnings transcripts (embedded)
│   ├── SEC filings (10-K, 10-Q)
│   ├── News articles per ticker
│   └── Analyst reports
└── 📄 Trading Rules & Systems
    ├── VOX Operating Manual
    ├── Position sizing rules
    ├── Risk management rules
    └── Sector rotation playbook
```

### RAG Pipeline
```
User Query → Embed → Retrieve Top-K Chunks → Augment Prompt → LLM → Response
                ↑___________________________________________↓
                              (Feedback loop)
```

**Use Cases:**
- "Why did I buy JMIA?" → Retrieves thesis from Obsidian + trade journal
- "What's my historical win rate on tech stocks?" → Queries position history
- "What did the LLM Council say about NVDA last month?" → Retrieves council notes
- "Show me similar setups to current TSLA position" → Semantic search on past trades

---

## Layer 2: AI Harness (Signal Unification)

### The Problem
You have 33 JSON data sources, 60 scripts, 119 vault files — but they're SILOS.

### The Harness
A unified data fusion layer that normalizes, scores, and ranks ALL signals:

```
┌─────────────────────────────────────────────────────────────┐
│                    VOX AI HARNESS                            │
├─────────────────────────────────────────────────────────────┤
│  Signal Source          │  Weight  │  Current Value         │
├─────────────────────────────────────────────────────────────┤
│  Grade System (Polygon) │  25%     │  NVDA 78, JMIA 22      │
│  Technical Analysis     │  15%     │  RSI, MACD, SMA        │
│  Fundamental (FMP)      │  15%     │  P/E, Revenue Growth   │
│  News Sentiment         │  10%     │  Bullish/Bearish score │
│  Earnings Calendar      │  10%     │  Days to earnings      │
│  Macro Regime           │  10%     │  EARLY_BULL            │
│  LLM Council            │  10%     │  Consensus vote        │
│  Trump Policy           │   5%     │  Tariff risk score     │
└─────────────────────────────────────────────────────────────┘
                         ↓
              Composite Signal Score (0-100)
                         ↓
              Confidence + Action Recommendation
```

### Signal Types
| Signal | Source | Update Freq | Weight |
|--------|--------|-------------|--------|
| Grade | `grade_system.py` + Polygon | Daily | 25% |
| Technical | Polygon aggregates | Real-time | 15% |
| Fundamental | FMP API | Quarterly | 15% |
| News Sentiment | X/Twitter + NewsAPI | Hourly | 10% |
| Earnings | Polygon calendar | Daily | 10% |
| Macro | `vox_macro_data.json` | Daily | 10% |
| LLM Council | `llm_council_v2.py` | Weekly | 10% |
| Trump Tracker | `politician_tracker.py` | Event-driven | 5% |

---

## Layer 3: Play Generator (Information → Action)

### The Pipeline
```
Raw Data → Harness Scoring → Play Generator → Action Queue → Execution
                                              ↓
                                    Hypothesis / Watchlist
```

### Play Types
```typescript
interface Play {
  id: string;
  type: "BUY" | "SELL" | "TRIM" | "HOLD" | "WATCH";
  ticker: string;
  confidence: number;        // 0-100 from Harness
  conviction: "SPEC" | "CORE"; // Position sizing
  thesis: string;            // Why this play
  entryPrice: number;
  stopLoss: number;
  targetPrice: number;
  timeHorizon: "SWING" | "POSITION" | "LONG_TERM";
  catalysts: string[];       // What needs to happen
  risks: string[];           // What could go wrong
  sourceSignals: string[];   // Which signals triggered
  status: "HYPOTHESIS" | "ACTIVE" | "EXECUTED" | "CLOSED";
  createdAt: string;
  executedAt?: string;
  closedAt?: string;
  pnl?: number;
  lessons?: string;
}
```

### Generation Rules
1. **Grade < 40 + Technical breakdown** → SELL play (auto-generate)
2. **Grade > 70 + Earnings beat setup** → BUY play (high confidence)
3. **Grade 50-60 + No catalyst** → WATCH (hypothesis until trigger)
4. **Duplicate across brokers** → TRIM (correlation risk)
5. **Crypto > 10% portfolio** → TRIM (kill switch)
6. **Earnings in < 3 days** → WATCH (volatility risk)

---

## Layer 4: Tracking & Learning System

### Closed Loop
```
Generate Play → Execute → Track → Measure → Learn → Update Model
     ↑_____________________________________________________↓
```

### Tracking Metrics
| Metric | How | Target |
|--------|-----|--------|
| Win Rate | Closed plays with P&L > 0 | > 60% |
| Average R-Multiple | (Exit - Entry) / (Entry - Stop) | > 2.0 |
| Grade Accuracy | Did grade predict outcome? | Correlation > 0.7 |
| Signal Accuracy | Which signals were right? | Per-signal tracking |
| Time to Profit | How long until profitable? | < 30 days |
| Max Drawdown | Worst loss from entry | < 15% |

### Learning Mechanisms
1. **Grade Calibration**: If grade 70+ positions lose money, lower grade weights
2. **Signal Weight Tuning**: If sentiment signals are wrong, reduce weight
3. **Thesis Validation**: Compare pre-trade thesis to actual outcome
4. **Mistake Pattern Detection**: Auto-detect repeated mistake types
5. **Sector Rotation Learning**: Track which sectors outperform in which regimes

---

## Layer 5: Autonomous Agent

### Agent Loop (runs every 15 min during market hours)
```python
while market_open:
    # 1. INGEST
    fetch_all_data_sources()
    
    # 2. ANALYZE
    run_harness_on_all_positions()
    generate_new_plays()
    update_existing_play_confidence()
    
    # 3. DECIDE
    plays_requiring_action = filter(plays, confidence > 80, catalyst_triggered)
    
    # 4. ALERT
    for play in plays_requiring_action:
        send_alert(user, play)
        log_to_obsidian(play)
    
    # 5. LEARN (end of day)
    if market_close:
        update_all_tracking_metrics()
        retrain_signal_weights()
        generate_daily_report()
    
    sleep(15 * 60)
```

### Autonomous Capabilities
- **Discovery**: Scan 5,000+ tickers nightly for new plays matching your criteria
- **Monitoring**: Watch all 1,344 positions for grade changes, news, earnings
- **Alerting**: Push notifications for entry triggers, stop hits, grade drops
- **Reporting**: Daily briefing auto-generated with new plays, closed plays, P&L
- **Learning**: Weekly model review — which signals worked, which didn't

---

## Implementation Roadmap

### Phase 1: RAG Foundation (Week 1)
- [ ] Set up ChromaDB vector store
- [ ] Embed all Obsidian vault files
- [ ] Embed all position theses + trade history
- [ ] Build query interface in dashboard

### Phase 2: Harness (Week 2)
- [ ] Build signal aggregation pipeline
- [ ] Normalize all 33 JSON sources
- [ ] Implement composite scoring
- [ ] Dashboard "Signal Strength" widget

### Phase 3: Play Generator (Week 3)
- [ ] Build Play data model
- [ ] Implement generation rules
- [ ] Create "Plays" dashboard page
- [ ] Auto-generate from daily scans

### Phase 4: Tracking & Learning (Week 4)
- [ ] Build outcome tracking DB
- [ ] Implement metric calculations
- [ ] Create learning feedback loop
- [ ] Grade calibration system

### Phase 5: Autonomous Agent (Week 5-6)
- [ ] Build agent loop script
- [ ] Integrate with Telegram alerts
- [ ] Auto-discovery scanner
- [ ] Daily autonomous briefing

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Vector DB | ChromaDB (local) or Pinecone (cloud) |
| Embeddings | OpenAI text-embedding-3-small |
| LLM | OpenRouter (Grok, Claude, GPT-4) |
| Harness | Python pipeline + Next.js API routes |
| Play DB | SQLite or Supabase |
| Agent | Python daemon + cron |
| Alerts | Telegram Bot API |
| Dashboard | Next.js + shadcn/ui (existing) |
