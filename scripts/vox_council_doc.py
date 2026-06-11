#!/usr/bin/env python3
"""
VOX Council v2.0 — Disagree-or-Commit (DoC) Protocol
Based on FinCom: https://arxiv.org/abs/2606.00939

Each agent must either:
1. DISAGREE — explicitly identify errors/contradictions + provide corrective evidence
2. COMMIT — explicitly endorse + add at least one new supporting fact

Agents:
- Technical Analyst: Charts, patterns, volume, grades
- Macro Analyst: Fed, CPI, sector rotation, news
- Sentiment Analyst: X/Twitter, Reddit, fear/greed
- Risk Manager: Position sizing, correlation, drawdown, VaR

Risk Manager has VETO power — if risk_score >= 7, council cannot vote BUY.
"""
import os
import sys
import json
from datetime import datetime, timezone
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict

import psycopg2

# Load env
for env_path in [os.path.expanduser("~/.env"), os.path.expanduser("~/.hermes/.env")]:
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                if "=" in line and not line.startswith("#"):
                    k, v = line.strip().split("=", 1)
                    os.environ.setdefault(k, v)

DATABASE_URL = os.environ.get("DATABASE_URL")
DB_HOST = os.environ.get("DB_HOST", "acela.proxy.rlwy.net")
DB_PORT = os.environ.get("DB_PORT", "35577")
DB_USER = os.environ.get("DB_USER", "postgres")
DB_PASSWORD = os.environ.get("DB_PASSWORD")
DB_NAME = os.environ.get("DB_NAME", "railway")


def get_db():
    if DATABASE_URL:
        return psycopg2.connect(DATABASE_URL)
    return psycopg2.connect(
        host=DB_HOST, port=DB_PORT, user=DB_USER,
        password=DB_PASSWORD, dbname=DB_NAME, sslmode="require",
    )


# Agent weights (updated based on historical accuracy)
AGENT_WEIGHTS = {
    "technical": 1.0,
    "macro": 0.9,
    "sentiment": 0.7,
    "risk": 1.2,
}


@dataclass
class AgentVote:
    agent: str
    vote: str
    conviction: int
    signal: str
    details: str
    doc_action: str = ""  # "DISAGREE" or "COMMIT"
    doc_target: str = ""  # Which agent they responded to
    doc_reasoning: str = ""  # Their disagreement or additional evidence


@dataclass
class CouncilDeliberation:
    ticker: str
    timestamp: str
    consensus: str
    consensus_pct: float
    votes: List[dict]
    deliberations: List[dict]
    risk_veto: bool
    risk_veto_reason: str
    final_action: str


DOC_PROMPT = """### Disagree or Commit (DoC)
Before producing your response, review reasoning from the previous agent.
- If you detect errors, contradictions, or missing evidence, **state them clearly**
  and provide **corrective evidence** or reasoning with citations.
- If the reasoning is valid, **acknowledge agreement** and add at least one new
  supporting fact or contextual clarification.

Think step by step."""


def fetch_position_data(cur, ticker: str) -> Dict:
    """Fetch position data from Railway Postgres."""
    cur.execute("""
        SELECT ticker, shares, avg_cost, live_price, live_value, grade, council, sector, brokers
        FROM positions WHERE ticker = %s
    """, (ticker,))
    row = cur.fetchone()
    if row:
        cols = [desc[0] for desc in cur.description]
        return dict(zip(cols, row))
    return {}


def fetch_macro_signals(cur) -> Dict:
    """Fetch latest macro signals."""
    cur.execute("SELECT signal_name, signal_value, signal_direction FROM macro_signals WHERE computed_at > NOW() - INTERVAL '2 days'")
    return {name: {"value": val, "direction": direction} for name, val, direction in cur.fetchall()}


def fetch_market_regime(cur) -> Dict:
    """Fetch latest market regime."""
    cur.execute("SELECT regime, confidence, vix_level FROM market_regime ORDER BY created_at DESC LIMIT 1")
    row = cur.fetchone()
    if row:
        return {"regime": row[0], "confidence": row[1], "vix": row[2]}
    return {}


def fetch_sp500_grade(cur, ticker: str) -> Optional[int]:
    """Fetch S&P 500 grade if available."""
    cur.execute("SELECT vox_grade FROM sp500_grades WHERE ticker = %s", (ticker,))
    row = cur.fetchone()
    return row[0] if row else None


def fetch_sector_momentum(cur, sector: str) -> Dict:
    """Fetch sector momentum data."""
    cur.execute("""
        SELECT sector, ticker, rank, momentum_score, change_5d_pct
        FROM sp500_sector_leaders WHERE sector = %s AND rank <= 3
    """, (sector,))
    rows = cur.fetchall()
    if rows:
        return {"leaders": [{"ticker": r[1], "rank": r[2], "momentum": r[3], "change_5d": r[4]} for r in rows]}
    return {}


def technical_analyst(ticker: str, position: Dict, sp500_grade: Optional[int]) -> AgentVote:
    """Technical Analyst — charts, patterns, volume, grades."""
    grade = position.get("grade") or sp500_grade or 0
    live_price = position.get("live_price") or 0
    avg_cost = position.get("avg_cost") or 0

    # Calculate basic technical signals
    if avg_cost and live_price:
        price_vs_cost = (live_price - avg_cost) / avg_cost * 100
    else:
        price_vs_cost = 0

    vote = "HOLD"
    conviction = 50
    details = f"Grade: {grade}"

    if grade >= 70:
        vote = "BUY"
        conviction = min(100, grade)
        details = f"Strong technicals | Grade: {grade}"
    elif grade >= 55:
        vote = "HOLD"
        conviction = grade
        details = f"Moderate technicals | Grade: {grade}"
    elif grade > 0 and grade < 40:
        vote = "SELL"
        conviction = 100 - grade
        details = f"Weak technicals | Grade: {grade}"
    elif grade > 0:
        vote = "HOLD"
        conviction = 50
        details = f"Mixed technicals | Grade: {grade}"

    # Price momentum override
    if price_vs_cost > 10:
        details += f" | Up {price_vs_cost:.1f}% from cost"
        if vote == "HOLD":
            vote = "BUY"
            conviction = max(conviction, 75)
    elif price_vs_cost < -15:
        details += f" | Down {price_vs_cost:.1f}% from cost"
        if vote == "HOLD":
            vote = "SELL"
            conviction = max(conviction, 75)
    elif price_vs_cost > 5:
        details += f" | Up {price_vs_cost:.1f}% from cost"
        if vote == "HOLD":
            vote = "BUY"
            conviction = max(conviction, 65)
    elif price_vs_cost < -10:
        details += f" | Down {price_vs_cost:.1f}% from cost"
        if vote == "HOLD":
            vote = "SELL"
            conviction = max(conviction, 65)

    return AgentVote(
        agent="technical",
        vote=vote,
        conviction=conviction,
        signal=f"Grade: {grade}",
        details=details,
        doc_action="",  # First agent, no prior reasoning to respond to
        doc_target="",
        doc_reasoning="Initiating technical assessment. Primary signal is VOX grade with price momentum overlay."
    )


def macro_analyst(ticker: str, position: Dict, macro: Dict, regime: Dict, sector_data: Dict, prior_vote: AgentVote) -> AgentVote:
    """Macro Analyst — Fed, CPI, sector rotation, news. Must DoC with Technical."""
    sector = position.get("sector", "technology")
    grade = position.get("grade") or 0

    # DoC with Technical Analyst
    doc_action = "COMMIT"
    doc_target = "technical"
    doc_reasoning = f"Technical grade {grade} is consistent with macro view. "

    # Macro regime assessment
    regime_name = regime.get("regime", "NEUTRAL")
    vix = regime.get("vix", 20)

    vote = "HOLD"
    conviction = 40
    details = f"Sector: {sector}, Regime: {regime_name}"

    # Sector momentum
    leaders = sector_data.get("leaders", [])
    ticker_in_leaders = any(l["ticker"] == ticker for l in leaders)

    # Macro conviction boost for strong signals
    if regime_name == "RISK_ON" and ticker_in_leaders:
        vote = "BUY"
        conviction = 75
        details += " | Sector leader in risk-on regime"
        doc_reasoning += f"{ticker} is a sector leader during risk-on regime. Supporting BUY with conviction."
    elif regime_name == "RISK_OFF" and not ticker_in_leaders:
        vote = "SELL"
        conviction = 70
        details += " | Lagging in risk-off regime"
        doc_reasoning += f"{ticker} is lagging during risk-off regime. Supporting SELL with conviction."
    elif vix > 30:
        vote = "HOLD"
        conviction = 75
        details += f" | Very high VIX ({vix:.1f}) — defensive posture"
        doc_reasoning += f"Very high VIX ({vix:.1f}) suggests defensive posture. Neutral on directional bet."
    elif vix > 25:
        vote = "HOLD"
        conviction = 60
        details += f" | Elevated VIX ({vix:.1f}) — cautious"
        doc_reasoning += f"Elevated VIX ({vix:.1f}) suggests caution. Neutral on directional bet."
    elif grade >= 65 and regime_name == "NEUTRAL":
        # Strong grade in neutral regime — lean with technical
        vote = "BUY"
        conviction = 55
        details += " | Strong grade in neutral regime"
        doc_reasoning += f"Grade {grade} is strong in neutral regime. Leaning with technical signal."
    elif grade <= 45 and regime_name == "NEUTRAL":
        # Weak grade in neutral regime — lean against
        vote = "SELL"
        conviction = 55
        details += " | Weak grade in neutral regime"
        doc_reasoning += f"Grade {grade} is weak in neutral regime. Leaning against technical signal."
    else:
        vote = "HOLD"
        conviction = 45
        details += f" | No strong macro signal (regime: {regime_name})"
        doc_reasoning += f"No strong macro signal in {regime_name} regime. Defaulting to HOLD with sector monitoring."

    # Check for disagreement with technical
    if prior_vote.vote == "BUY" and vote == "SELL":
        doc_action = "DISAGREE"
        doc_reasoning = f"DISAGREE with technical BUY: Macro regime ({regime_name}) and sector position do not support aggressive long exposure. Technical grade {grade} may be stale or missing macro context."
    elif prior_vote.vote == "SELL" and vote == "BUY":
        doc_action = "DISAGREE"
        doc_reasoning = f"DISAGREE with technical SELL: Macro conditions ({regime_name}) and sector leadership support maintaining exposure despite weak technicals. Grade {grade} may be oversold."

    return AgentVote(
        agent="macro",
        vote=vote,
        conviction=conviction,
        signal=f"Regime: {regime_name}",
        details=details,
        doc_action=doc_action,
        doc_target=doc_target,
        doc_reasoning=doc_reasoning
    )


def sentiment_analyst(ticker: str, position: Dict, prior_votes: List[AgentVote]) -> AgentVote:
    """Sentiment Analyst — X/Twitter, news. Must DoC with prior agents."""
    grade = position.get("grade") or 0

    # DoC with the most recent prior agent (Macro)
    prior = prior_votes[-1] if prior_votes else None
    doc_target = prior.agent if prior else ""

    # Default sentiment (would integrate X API in production)
    sentiment_score = 50  # Neutral default
    mentions = 0

    vote = "HOLD"
    conviction = 30
    details = "No validated X data available"

    # Simple sentiment heuristic based on grade
    if grade >= 70:
        sentiment_score = 75
        vote = "BUY"
        conviction = 55
        details = f"Implied bullish from grade {grade}"
    elif grade < 40:
        sentiment_score = 25
        vote = "SELL"
        conviction = 55
        details = f"Implied bearish from grade {grade}"

    # DoC reasoning
    if prior and prior.vote != vote:
        doc_action = "DISAGREE"
        doc_reasoning = f"DISAGREE with {prior.agent}'s {prior.vote}: Sentiment analysis suggests {vote} based on implied market positioning. Grade {grade} indicates {'bullish' if grade >= 60 else 'bearish' if grade < 40 else 'neutral'} consensus."
    else:
        doc_action = "COMMIT"
        doc_reasoning = f"COMMIT to {prior.agent}'s {prior.vote if prior else 'N/A'}: Sentiment aligns. Adding that grade {grade} reflects {'strong' if grade >= 70 else 'weak' if grade < 40 else 'mixed'} market consensus."

    return AgentVote(
        agent="sentiment",
        vote=vote,
        conviction=conviction,
        signal=f"Sentiment: {sentiment_score}",
        details=details,
        doc_action=doc_action,
        doc_target=doc_target,
        doc_reasoning=doc_reasoning
    )


def risk_manager(ticker: str, position: Dict, all_votes: List[AgentVote], macro: Dict) -> AgentVote:
    """Risk Manager — position sizing, correlation, drawdown. Has VETO power."""
    grade = position.get("grade") or 0
    live_value = position.get("live_value") or 0
    avg_cost = position.get("avg_cost") or 0
    shares = position.get("shares") or 0

    # Calculate risk metrics
    if avg_cost and live_value and shares:
        cost_basis = avg_cost * shares
        unrealized_pnl = live_value - cost_basis
        pnl_pct = (unrealized_pnl / cost_basis * 100) if cost_basis else 0
    else:
        unrealized_pnl = 0
        pnl_pct = 0

    # Portfolio concentration risk (simplified — would query total AUM)
    concentration_risk = 0.15  # Assume 15% for single position

    # Risk score 1-10
    risk_score = 2  # Lower base
    if pnl_pct < -25:
        risk_score += 3
    elif pnl_pct < -15:
        risk_score += 2
    elif pnl_pct < -5:
        risk_score += 1
    
    if grade > 0 and grade < 35:
        risk_score += 2
    elif grade > 0 and grade < 45:
        risk_score += 1
    
    if concentration_risk > 0.25:
        risk_score += 2
    elif concentration_risk > 0.15:
        risk_score += 1
    
    vix_val = macro.get("vix", 20) if isinstance(macro.get("vix", 20), (int, float)) else 20
    if vix_val > 30:
        risk_score += 2
    elif vix_val > 25:
        risk_score += 1

    risk_score = min(10, risk_score)

    # VETO POWER: If risk_score >= 8, cannot vote BUY (raised from 7)
    veto_active = risk_score >= 8

    # Determine vote — more nuanced
    if risk_score >= 8:
        vote = "SELL"
        conviction = 85
    elif risk_score >= 5:
        vote = "HOLD"
        conviction = 65
    elif risk_score >= 3:
        # Moderate risk — follow consensus but cap conviction
        buy_count = sum(1 for v in all_votes if v.vote == "BUY")
        sell_count = sum(1 for v in all_votes if v.vote == "SELL")
        if buy_count > sell_count:
            vote = "BUY"
            conviction = 45
        elif sell_count > buy_count:
            vote = "SELL"
            conviction = 45
        else:
            vote = "HOLD"
            conviction = 50
    else:
        # Low risk — follow consensus
        buy_count = sum(1 for v in all_votes if v.vote == "BUY")
        sell_count = sum(1 for v in all_votes if v.vote == "SELL")
        if buy_count > sell_count:
            vote = "BUY"
            conviction = 55
        elif sell_count > buy_count:
            vote = "SELL"
            conviction = 55
        else:
            vote = "HOLD"
            conviction = 50

    details = f"Risk score: {risk_score}/10, P&L: {pnl_pct:+.1f}%, Position: ${live_value:,.0f}"
    if veto_active:
        details += " | ⚠️ VETO ACTIVE (risk >= 7)"

    # DoC with consensus so far
    buy_count = sum(1 for v in all_votes if v.vote == "BUY")
    sell_count = sum(1 for v in all_votes if v.vote == "SELL")
    consensus_so_far = "BUY" if buy_count > sell_count else "SELL" if sell_count > buy_count else "HOLD"

    if veto_active and consensus_so_far == "BUY":
        doc_action = "DISAGREE"
        doc_reasoning = f"VETO: Despite {buy_count} BUY votes, risk score {risk_score}/10 triggers mandatory risk management override. Position shows {pnl_pct:+.1f}% P&L with concentration risk. Council cannot recommend BUY under current risk parameters."
    elif vote != consensus_so_far and consensus_so_far != "HOLD":
        doc_action = "DISAGREE"
        doc_reasoning = f"DISAGREE with {consensus_so_far} consensus: Risk assessment (score {risk_score}/10) does not support aggressive positioning. {details}"
    elif vote == consensus_so_far and consensus_so_far != "HOLD":
        doc_action = "COMMIT"
        doc_reasoning = f"COMMIT to {consensus_so_far} consensus: Risk profile (score {risk_score}/10) supports this direction. Adding that {'VIX elevated' if vix_val > 25 else 'risk environment is stable'}."
    else:
        doc_action = "COMMIT"
        doc_reasoning = f"COMMIT to HOLD consensus: Risk profile (score {risk_score}/10) is neutral. {'VIX elevated — monitoring' if vix_val > 25 else 'No significant risk factors identified'}."

    return AgentVote(
        agent="risk",
        vote=vote,
        conviction=conviction,
        signal=f"Risk: {risk_score}/10",
        details=details,
        doc_action=doc_action,
        doc_target="consensus",
        doc_reasoning=doc_reasoning
    )


def calculate_consensus(votes: List[AgentVote]) -> tuple:
    """Calculate weighted consensus with risk veto override."""
    buy_votes = []
    sell_votes = []
    hold_votes = []

    for vote in votes:
        weight = AGENT_WEIGHTS.get(vote.agent, 1.0)
        weighted_conviction = vote.conviction * weight

        if vote.vote == "BUY":
            buy_votes.append(weighted_conviction)
        elif vote.vote == "SELL":
            sell_votes.append(weighted_conviction)
        else:
            hold_votes.append(weighted_conviction)

    total_buy = sum(buy_votes)
    total_sell = sum(sell_votes)
    total_hold = sum(hold_votes)
    total_all = total_buy + total_sell + total_hold

    if total_all == 0:
        return "HOLD", 0

    buy_pct = total_buy / total_all * 100
    sell_pct = total_sell / total_all * 100
    hold_pct = total_hold / total_all * 100

    # Risk veto check
    risk_vote = next((v for v in votes if v.agent == "risk"), None)
    if risk_vote and risk_vote.vote == "SELL" and risk_vote.conviction >= 70:
        # Risk veto overrides — force SELL or HOLD
        if buy_pct > 50:
            return "HOLD", hold_pct + sell_pct  # Downgrade BUY to HOLD
        else:
            return "SELL", sell_pct

    if buy_pct > sell_pct and buy_pct > hold_pct:
        return "BUY", buy_pct
    elif sell_pct > buy_pct and sell_pct > hold_pct:
        return "SELL", sell_pct
    else:
        return "HOLD", hold_pct


def deliberate(ticker: str, db_conn=None) -> CouncilDeliberation:
    """Run full DoC council deliberation on a ticker."""
    conn = db_conn or get_db()
    cur = conn.cursor()

    # Fetch data
    position = fetch_position_data(cur, ticker)
    macro = fetch_macro_signals(cur)
    regime = fetch_market_regime(cur)
    sp500_grade = fetch_sp500_grade(cur, ticker)
    sector = position.get("sector", "technology")
    sector_data = fetch_sector_momentum(cur, sector)

    if not db_conn:
        conn.close()

    # Run agents sequentially with DoC
    votes = []
    deliberations = []

    # 1. Technical Analyst (first — no DoC target)
    tech_vote = technical_analyst(ticker, position, sp500_grade)
    votes.append(tech_vote)
    deliberations.append({
        "agent": tech_vote.agent,
        "action": "INITIATE",
        "target": "",
        "reasoning": tech_vote.doc_reasoning,
        "vote": tech_vote.vote,
        "conviction": tech_vote.conviction
    })

    # 2. Macro Analyst (DoC with Technical)
    macro_vote = macro_analyst(ticker, position, macro, regime, sector_data, tech_vote)
    votes.append(macro_vote)
    deliberations.append({
        "agent": macro_vote.agent,
        "action": macro_vote.doc_action,
        "target": macro_vote.doc_target,
        "reasoning": macro_vote.doc_reasoning,
        "vote": macro_vote.vote,
        "conviction": macro_vote.conviction
    })

    # 3. Sentiment Analyst (DoC with Macro)
    sent_vote = sentiment_analyst(ticker, position, votes)
    votes.append(sent_vote)
    deliberations.append({
        "agent": sent_vote.agent,
        "action": sent_vote.doc_action,
        "target": sent_vote.doc_target,
        "reasoning": sent_vote.doc_reasoning,
        "vote": sent_vote.vote,
        "conviction": sent_vote.conviction
    })

    # 4. Risk Manager (DoC with consensus, has VETO)
    risk_vote = risk_manager(ticker, position, votes, macro)
    votes.append(risk_vote)
    deliberations.append({
        "agent": risk_vote.agent,
        "action": risk_vote.doc_action,
        "target": risk_vote.doc_target,
        "reasoning": risk_vote.doc_reasoning,
        "vote": risk_vote.vote,
        "conviction": risk_vote.conviction
    })

    # Calculate consensus
    consensus, consensus_pct = calculate_consensus(votes)

    # Risk veto check
    risk_veto = risk_vote.vote == "SELL" and risk_vote.conviction >= 70
    risk_veto_reason = ""
    if risk_veto:
        risk_veto_reason = f"Risk Manager VETO: {risk_vote.details}"
        if consensus == "BUY":
            consensus = "HOLD"
            consensus_pct = 50

    # Final action
    final_action = consensus if consensus_pct > 60 else "HOLD"

    return CouncilDeliberation(
        ticker=ticker,
        timestamp=datetime.now(timezone.utc).isoformat(),
        consensus=consensus,
        consensus_pct=round(consensus_pct, 1),
        votes=[asdict(v) for v in votes],
        deliberations=deliberations,
        risk_veto=risk_veto,
        risk_veto_reason=risk_veto_reason,
        final_action=final_action
    )


def save_deliberation(delib: CouncilDeliberation):
    """Save deliberation to Railway Postgres."""
    conn = get_db()
    cur = conn.cursor()

    # Ensure table exists
    cur.execute("""
        CREATE TABLE IF NOT EXISTS council_deliberations (
            id SERIAL PRIMARY KEY,
            ticker TEXT NOT NULL,
            timestamp TIMESTAMPTZ DEFAULT NOW(),
            consensus TEXT,
            consensus_pct NUMERIC,
            votes JSONB,
            deliberations JSONB,
            risk_veto BOOLEAN DEFAULT FALSE,
            risk_veto_reason TEXT,
            final_action TEXT,
            UNIQUE(ticker, timestamp)
        )
    """)

    cur.execute("""
        INSERT INTO council_deliberations (ticker, timestamp, consensus, consensus_pct, votes, deliberations, risk_veto, risk_veto_reason, final_action)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (ticker, timestamp) DO UPDATE SET
            consensus = EXCLUDED.consensus,
            consensus_pct = EXCLUDED.consensus_pct,
            votes = EXCLUDED.votes,
            deliberations = EXCLUDED.deliberations,
            risk_veto = EXCLUDED.risk_veto,
            risk_veto_reason = EXCLUDED.risk_veto_reason,
            final_action = EXCLUDED.final_action
    """, (
        delib.ticker, delib.timestamp, delib.consensus, delib.consensus_pct,
        json.dumps(delib.votes), json.dumps(delib.deliberations),
        delib.risk_veto, delib.risk_veto_reason, delib.final_action
    ))

    conn.commit()
    conn.close()


def batch_deliberate():
    """Run DoC council on all portfolio positions."""
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT ticker FROM positions WHERE live_value > 0")
    tickers = [row[0] for row in cur.fetchall()]
    conn.close()

    print(f"\n🗳️ VOX COUNCIL v2.0 — DoC Protocol")
    print(f"Deliberating on {len(tickers)} positions...")
    print("=" * 70)

    results = []
    for ticker in tickers:
        delib = deliberate(ticker)
        save_deliberation(delib)
        results.append(delib)

        emoji = "🟢" if delib.consensus == "BUY" else "🔴" if delib.consensus == "SELL" else "⚪"
        veto = " [VETO]" if delib.risk_veto else ""
        print(f"\n{emoji} {ticker}: {delib.consensus} ({delib.consensus_pct}%){veto}")

        # Show deliberations
        for d in delib.deliberations:
            action_emoji = "🗣️" if d["action"] == "DISAGREE" else "✓" if d["action"] == "COMMIT" else "📝"
            print(f"  {action_emoji} {d['agent']:12} | {d['action']:10} | {d['vote']} ({d['conviction']}%)")
            if d["reasoning"]:
                # Truncate long reasoning
                reason = d["reasoning"][:80] + "..." if len(d["reasoning"]) > 80 else d["reasoning"]
                print(f"      → {reason}")

    # Summary
    buys = [r for r in results if r.consensus == "BUY"]
    sells = [r for r in results if r.consensus == "SELL"]
    holds = [r for r in results if r.consensus == "HOLD"]
    vetos = [r for r in results if r.risk_veto]

    print("\n" + "=" * 70)
    print("📊 COUNCIL SUMMARY")
    print(f"   🟢 BUY: {len(buys)}")
    print(f"   🔴 SELL: {len(sells)}")
    print(f"   ⚪ HOLD: {len(holds)}")
    print(f"   🚫 Risk Vetos: {len(vetos)}")

    return results


def main():
    import argparse
    parser = argparse.ArgumentParser(description="VOX Council v2.0 — DoC Protocol")
    parser.add_argument("--ticker", help="Deliberate on specific ticker")
    parser.add_argument("--batch", action="store_true", help="Deliberate on all positions")

    args = parser.parse_args()

    if args.ticker:
        delib = deliberate(args.ticker)
        save_deliberation(delib)
        print(json.dumps(asdict(delib), indent=2))
    else:
        batch_deliberate()


if __name__ == "__main__":
    main()
