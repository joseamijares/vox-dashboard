# VOX AGENT TOOL INVENTORY
## What I Have Built vs What I Use

### GRADING ENGINE (Python)
**Location:** `vox-grader/src/grading/`
**Status:** ✅ USE REGULARLY
- `vox_engine.py` - Main 6-layer grading engine
- `engine.py` - Core scoring logic
- `fundamental.py` - Fundamental analysis (P/E, FCF yield, revenue growth)
- `technical.py` - Technical analysis (RSI, MACD, trend)
- `delisted.py` - Delisted ticker detection

**What I should do:**
- Run weekly on all 500 S&P 500 tickers
- Run daily on portfolio positions
- Use for new stock evaluation

### LAYERS (Python)
**Location:** `vox-grader/src/layers/`
**Status:** ⚠️ UNDERUTILIZED
- `sentiment.py` - News sentiment (Alpha Vantage + synthetic fallback)
- `macro_trends.py` - Macro analysis (FRED data)
- `sector_momentum.py` - Sector rotation
- `weather_patterns.py` - Weather/agricultural alerts
- `unified_scanner.py` - Cross-layer scanning
- `integrated_grader.py` - Layer integration

**What I should do:**
- Use `macro_trends.py` before every market open
- Use `sector_momentum.py` for sector rotation plays
- Use `weather_patterns.py` for commodity/agricultural opportunities
- Use `sentiment.py` for earnings/news events

### BROKER SYNC (Python)
**Location:** `vox-grader/src/brokers/`
**Status:** ✅ USE VIA CRON
- `binance_sync.py` - Binance API sync
- `etoro_sync.py` / `etoro_sync_railway.py` - eToro API sync
- `gbm_sync.py` - GBM CSV import
- `unified_sync.py` - All brokers sync
- `remaining_sync.py` - Manual broker sync

**What I should do:**
- Run weekly sync every Monday 9 AM
- Verify sync succeeded before grading
- Flag stale data (>7 days) for manual update

### ALERTS (Python)
**Location:** `vox-grader/src/alerts/`
**Status:** ⚠️ UNDERUTILIZED
- `notifier.py` - Alert generation and delivery

**What I should do:**
- Check daily for grade changes
- Alert when positions drop below 50
- Alert when new BUY opportunities emerge
- Send to Telegram bot @vox_alerts_hermes_agent_bot

### GRADER SERVICES (Python)
**Location:** `vox-grader/scripts/`
**Status:** ✅ USE VIA CRON
- `grader_service.py` - Main grader service
- `sp500_grader_service.py` - S&P 500 batch grading
- `grade_sp500_batch.py` - Batch processing

**What I should do:**
- Run `sp500_grader_service.py` weekly (Sunday 6 PM)
- Run `grader_service.py` daily for portfolio positions
- Monitor for errors and API rate limits

### DASHBOARD (Next.js)
**Location:** `vox-dashboard/`
**Status:** ✅ FOR USER
- Portfolio page with grade filters
- Brokers breakdown
- Grades page
- Screener
- Alerts
- Watchlist
- Journal

**What I should do:**
- Keep dashboard updated with latest data
- Ensure dashboard reflects current positions
- Add new features only when user requests

### SKILLS (Hermes)
**Status:** ✅ HAVE BUT DON'T ALWAYS LOAD
- `vox-harness` - 6-layer grading checklist
- `vox-portfolio-analysis` - Full portfolio analysis
- `vox-data-quality` - Data quality checks
- `vox-macro-snapshot` - Macro data population
- `vox-cron-orchestrator` - Cron setup patterns
- `vox-digest-format` - Digest output format
- `vox-recommendation-format` - Recommendation format

**What I should do:**
- Load `vox-harness` before EVERY grading session
- Load `vox-data-quality` before EVERY analysis
- Load `vox-portfolio-analysis` for portfolio reviews
- Load `vox-macro-snapshot` when macro data is stale

### EXTERNAL SKILLS (Hermes)
**Status:** ⚠️ UNDERUTILIZED
- `finance-master` - Master finance analysis
- `stock-picker` - Stock picking and portfolio analysis
- `crypto-investor` - Crypto analysis
- `fiscal-ai` - Quality compounder identification
- `tech-guru` - Tech ecosystem analysis
- `geopolitical-strategist` - Geopolitical trends
- `keith-fitz-gerald` - 50-40-10 portfolio model
- `weather-pattern-investor` - Weather opportunities
- `sec-finance-ai` - SEC filing analysis

**What I should do:**
- Load `finance-master` for deep research
- Load `stock-picker` for new ideas
- Load `crypto-investor` for crypto positions
- Load `fiscal-ai` for quality stock screening
- Load `geopolitical-strategist` for macro themes

---

## SYSTEMATIC WORKFLOW I SHOULD FOLLOW

### DAILY (Pre-Market)
1. Load `vox-harness` skill
2. Run `macro_trends.py` - Check macro regime
3. Run `sentiment.py` - Check market sentiment
4. Check `alerts` table for overnight grade changes
5. Generate morning briefing

### DAILY (Post-Market)
1. Check `broker_positions` for stale data
2. Run `vox_data_quality` check
3. Update dashboard JSON
4. Generate evening digest

### WEEKLY (Monday 9 AM)
1. Run `unified_sync.py` - Sync all brokers
2. Run `grader_service.py` - Grade all positions
3. Run `sp500_grader_service.py` - Grade S&P 500
4. Generate weekly opportunity scan

### WEEKLY (Sunday 6 PM)
1. Run `sp500_grader_service.py` - Full S&P 500 re-grade
2. Update `sp500_grades` table
3. Identify new opportunities

### ON-DEMAND (When User Asks)
1. Load `vox-harness` + `vox-portfolio-analysis`
2. Run data quality check
3. Fetch latest positions
4. Run full 6-layer grading
5. Generate broker-segregated analysis
6. Provide clear BUY/SELL/HOLD recommendations

### NEW STOCK EVALUATION
1. Load `vox-harness` + `finance-master` + `stock-picker`
2. Run `vox_engine.py` on ticker
3. Check `sp500_grades` if S&P 500 stock
4. Run fundamental analysis
5. Check sector momentum
6. Provide grade + recommendation

---

## WHAT I BUILT BUT RARELY USE

1. **Weather Patterns** - Should use for agricultural/commodity plays
2. **Geopolitical Strategist** - Should use for macro themes
3. **Tech Guru** - Should use for tech stock deep dives
4. **SEC Finance AI** - Should use for earnings/10-K analysis
5. **Paper Trading** - Page exists but not used
6. **Predictions** - Page exists but not accurate
7. **Council Plays** - Should use for deliberation logic
8. **Sector Macro** - Should use for sector rotation

## WHAT I NEED TO BUILD

1. **Unified Agent Workflow** - Single script that runs all checks
2. **Grade Change Detector** - Alert when positions change grade buckets
3. **Opportunity Scanner** - Find S&P 500 stocks with grade > 60
4. **Rebalancing Calculator** - Suggest sells to fund buys
5. **Performance Tracker** - Track grade accuracy over time

---

## MEMORY UPDATES NEEDED

- [ ] Add tool inventory to memory
- [ ] Add daily workflow checklist
- [ ] Add skill loading priorities
- [ ] Add data quality rules
- [ ] Add broker sync schedule
- [ ] Add grading schedule
- [ ] Add alert thresholds
