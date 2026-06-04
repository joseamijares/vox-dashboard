#!/usr/bin/env python3
"""Sync eToro positions to Railway Postgres - runs inside Railway environment"""

import os
import sys
import json
import urllib.request
import psycopg2
from datetime import datetime

# eToro API credentials
ETORO_API_KEY = os.environ.get("ETORO_API_KEY", "")
ETORO_USER_KEY = os.environ.get("ETORO_USER_KEY", "")

def etoro_request(endpoint: str) -> dict:
    """Make authenticated request to eToro public API."""
    import uuid
    url = f"https://public-api.etoro.com/api/v1{endpoint}"
    request_id = str(uuid.uuid4())
    
    req = urllib.request.Request(url)
    req.add_header("x-api-key", ETORO_API_KEY)
    req.add_header("x-user-key", ETORO_USER_KEY)
    req.add_header("x-request-id", request_id)
    req.add_header("Accept", "application/json")
    req.add_header("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36")
    req.add_header("Origin", "https://etoro.com")
    req.add_header("Referer", "https://etoro.com/")
    
    with urllib.request.urlopen(req, timeout=30) as response:
        return json.loads(response.read().decode("utf-8"))

def fetch_instruments(instrument_ids: list) -> dict:
    """Fetch instrument metadata."""
    if not instrument_ids:
        return {}
    ids_str = ",".join(map(str, instrument_ids))
    data = etoro_request(f"/market-data/instruments?instrumentIds={ids_str}")
    mapping = {}
    for inst in data.get("instrumentDisplayDatas", []):
        iid = inst.get("instrumentID")
        mapping[iid] = {
            "name": inst.get("instrumentDisplayName", "Unknown"),
            "symbol": inst.get("symbolFull", "?"),
            "type": inst.get("instrumentTypeID", 0)
        }
    return mapping

def get_db_conn():
    """Connect to Railway Postgres using internal hostname."""
    return psycopg2.connect(
        host=os.environ.get("PGHOST", "postgres-flpd.railway.internal"),
        port=os.environ.get("PGPORT", "5432"),
        user=os.environ.get("PGUSER", "postgres"),
        password=os.environ.get("PGPASSWORD", ""),
        database=os.environ.get("PGDATABASE", "railway")
    )

def sync():
    print("🔑 Loading eToro credentials...")
    print("📊 Fetching portfolio from eToro API...")
    
    portfolio = etoro_request("/trading/info/real/pnl")
    cp = portfolio.get("clientPortfolio", {})
    positions = cp.get("positions", [])
    mirrors = cp.get("mirrors", [])
    cash = cp.get("credit", 0)
    
    # Fetch instrument names
    instrument_ids = sorted(set(p.get("instrumentID") for p in positions if p.get("instrumentID")))
    inst_map = fetch_instruments(instrument_ids)
    
    # Calculate totals
    direct_exposure = sum(p.get("unrealizedPnL", {}).get("exposureInAccountCurrency", 0) for p in positions)
    
    mirror_exposure = 0
    for m in mirrors:
        for p in m.get("positions", []):
            mirror_exposure += p.get("unrealizedPnL", {}).get("exposureInAccountCurrency", 0)
    
    mirror_available = sum(m.get("availableAmount", 0) for m in mirrors)
    total_value = direct_exposure + mirror_exposure + mirror_available + cash
    
    print(f"\n💰 REAL eToro Value: ${total_value:,.2f}")
    print(f"📈 Direct Positions: {len(positions)}")
    print(f"🪞 Mirrors: {len(mirrors)}")
    print(f"💵 Cash: ${cash:,.2f}")
    
    # Aggregate positions by symbol
    from collections import defaultdict
    aggregated = defaultdict(lambda: {"shares": 0, "value": 0, "pnl": 0, "initial": 0})
    
    for pos in positions:
        iid = pos.get("instrumentID", 0)
        info = inst_map.get(iid, {"symbol": f"ID:{iid}", "name": "Unknown"})
        symbol = info.get("symbol", "?")
        
        exposure = pos.get("unrealizedPnL", {}).get("exposureInAccountCurrency", 0)
        pnl = pos.get("unrealizedPnL", {}).get("pnL", 0)
        initial = pos.get("initialAmountInDollars", 0)
        is_buy = pos.get("isBuy", True)
        
        if initial > 0:
            shares = exposure / initial if initial > 0 else 0
        else:
            shares = 0
        
        aggregated[symbol]["shares"] += shares if is_buy else -shares
        aggregated[symbol]["value"] += exposure
        aggregated[symbol]["pnl"] += pnl
        aggregated[symbol]["initial"] += initial
    
    # Connect to DB
    print(f"\n🔄 Updating Railway Postgres with {len(aggregated)} eToro positions...")
    conn = get_db_conn()
    cur = conn.cursor()
    
    # Get existing positions to merge brokers
    cur.execute("SELECT ticker, brokers FROM positions")
    existing = {row[0]: row[1] for row in cur.fetchall()}
    
    inserted = 0
    updated = 0
    
    for symbol, data in sorted(aggregated.items(), key=lambda x: x[1]["value"], reverse=True):
        if data["value"] < 1:
            continue
        
        shares = abs(data["shares"])
        live_price = data["value"] / shares if shares > 0 else 0
        avg_cost = data["initial"] / shares if shares > 0 else 0
        
        # Merge brokers
        old_brokers = existing.get(symbol, [])
        if old_brokers:
            if isinstance(old_brokers, str):
                import ast
                try:
                    old_brokers = ast.literal_eval(old_brokers)
                except:
                    old_brokers = []
            new_brokers = list(set(old_brokers + ["eToro"]))
        else:
            new_brokers = ["eToro"]
        
        if symbol in existing:
            # Update existing
            cur.execute("""
                UPDATE positions 
                SET shares = %s, avg_cost = %s, live_price = %s, live_value = %s,
                    brokers = %s, updated_at = NOW()
                WHERE ticker = %s
            """, (shares, avg_cost, live_price, data["value"], json.dumps(new_brokers), symbol))
            print(f"  🔄 Updated {symbol}: ${data['value']:,.2f}")
            updated += 1
        else:
            # Insert new
            cur.execute("""
                INSERT INTO positions (ticker, shares, avg_cost, live_price, live_value, grade, council, brokers, sector, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
            """, (symbol, shares, avg_cost, live_price, data["value"], 0, "", json.dumps(new_brokers), ""))
            print(f"  ✅ Inserted {symbol}: ${data['value']:,.2f}")
            inserted += 1
    
    conn.commit()
    conn.close()
    
    print(f"\n✅ Sync complete: {updated} updated, {inserted} inserted")
    print(f"💰 Total eToro value: ${direct_exposure:,.2f}")
    
    return total_value

if __name__ == "__main__":
    try:
        value = sync()
        print(f"\n🎉 eToro sync complete: ${value:,.2f}")
    except Exception as e:
        print(f"\n❌ Sync failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
