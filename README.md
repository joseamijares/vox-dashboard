# VOX Dashboard v9.1

**Autonomous AI Trading Intelligence System**

Live: https://vox-dashboard-five.vercel.app

---

## What is VOX?

VOX is a fully autonomous trading intelligence system that:
- **Monitors** your portfolio across 8 brokers
- **Grades** every position with AI-powered scoring
- **Generates** actionable trade plays
- **Alerts** you via Telegram in real-time
- **Learns** from your feedback to improve
- **Self-upgrades** its own signal weights

---

## Architecture

### 5-Layer AI Stack

```
┌─────────────────────────────────────────┐
│  Layer 5: Autonomous Agent              │
│  Self-running, 24/7 monitoring          │
├─────────────────────────────────────────┤
│  Layer 4: Tracking & Learning           │
│  Play review, win rate tracking         │
├─────────────────────────────────────────┤
│  Layer 3: Play Generator                │
│  BUY/SELL/TRIM/HOLD actions             │
├─────────────────────────────────────────┤
│  Layer 2: AI Signal Harness             │
│  8 signal sources, composite scoring    │
├─────────────────────────────────────────┤
│  Layer 1: RAG Memory                    │
│  119 vault files, semantic search       │
└─────────────────────────────────────────┘
```

### Signal Sources (8)

| Signal | Weight | Source |
|--------|--------|--------|
| Grade | 25% | Manual + AI scoring |
| Technical | 15% | Position P&L momentum |
| Fundamental | 15% | Revenue, growth |
| Sentiment | 10% | Social + news |
| Earnings | 10% | Surprise history |
| Macro | 10% | Market regime |
| LLM Council | 10% | Multi-model consensus |
| Trump Policy | 5% | Policy impact |

---

## Dashboard Pages (34)

### AI Section
- **Plays** — AI-generated trade cards with entry/stop/target
- **AI Insights** — LLM Council analysis
- **RAG Intelligence** — Ask anything about your portfolio
- **Play Review** — Rate AI recommendations, track outcomes

### Overview
- Dashboard, Portfolio, Grades, Watchlist

### Intelligence
- Market Regime, Daily Briefing, Position Review, Trade Scorer
- Sector Rotation, LLM Council

### Feeds
- Trump Tracker, Sentiment, Screener DB, Macro, Correlation

### Tracking
- Trade Journal, Earnings, Dividends, Risk Mgmt, Performance

### Tools
- Position Sizer, Rebalancing, Compounding, Mistake Journal

### Assets
- Crypto, Options, Forex

### Systems
- Alert System, Commander, Weekly Summary, Trade Logger

---

## Scripts (Python)

All scripts live in `~/.hermes/scripts/`:

| Script | Purpose |
|--------|---------|
| `vox_ai_harness.py` | Signal fusion, composite scoring |
| `vox_autonomous_agent.py` | 24/7 monitoring, discovery |
| `vox_rag_system.py` | Vector DB, semantic search |
| `vox_signal_enhancer.py` | Options flow, insider, short interest |
| `vox_self_upgrade.py` | Self-analysis, weight optimization |
| `vox_telegram_alerts.py` | Real-time Telegram notifications |
| `vox_agentic_cron.sh` | 15-minute autonomous loop |
| `vox_ai_pipeline.sh` | Sequential pipeline runner |

---

## Cost

| Service | Cost/Month |
|---------|-----------|
| Polygon API (Starter) | $29 |
| OpenRouter (embeddings) | ~$0.50 |
| Vercel Hosting | $0 |
| Telegram Bot | $0 |
| **Total** | **~$34** |

Portfolio: $195K. Breakeven: 0.02% better decisions/month.

---

## Setup

```bash
# Install dependencies
cd ~/.hermes/scripts
pip install chromadb sentence-transformers

# Set API keys in ~/.hermes/.env
POLYGON_API_KEY=xxx
OPENROUTER_API_KEY=xxx
TELEGRAM_BOT_TOKEN=xxx
TELEGRAM_CHAT_ID=xxx

# Run autonomous loop
python3 vox_agentic_cron.sh
```

---

## Cron Jobs

| Job | Frequency | Purpose |
|-----|-----------|---------|
| `vox-agentic-loop` | Every 15 min | Full autonomous cycle |
| `vox-premarket` | Daily 8:30 AM | Pre-market briefing |
| `vox-intraday` | Every 30 min | Intraday monitoring |
| `vox-close` | Daily 3:55 PM | End-of-day summary |

---

## GitHub

https://github.com/joseamijares/vox-dashboard

---

## Version History

- **v9.1** — Full agentic system, self-upgrading, Telegram alerts
- **v9.0** — AI architecture, RAG, harness, autonomous agent
- **v8.0** — React + Next.js migration, real broker data
- **v7.2** — Static HTML dashboard, responsive design

---

Built for Jose Mijares. Work ONLY on VOX.
