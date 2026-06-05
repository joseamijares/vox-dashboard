#!/usr/bin/env python3
"""
Populate watchlist entry/target/stop prices using technical analysis.
Uses yfinance for price data, calculates ATR-based stops and entry points.
Updates via admin API endpoints.
"""
import json
import urllib.request
import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime

BASE_URL = "https://web-production-9e321.up.railway.app"

def get_empty_watchlist():
    """Fetch tickers with empty targets."""
    req = urllib.request.Request(f"{BASE_URL}/api/admin/watchlist-empty-targets")
    resp = urllib.request.urlopen(req)
    return json.loads(resp.read().decode())

def calculate_atr(df, period=14):
    """Calculate Average True Range."""
    high = df['High']
    low = df['Low']
    close = df['Close']
    
    tr1 = high - low
    tr2 = abs(high - close.shift(1))
    tr3 = abs(low - close.shift(1))
    
    tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
    atr = tr.rolling(window=period).mean()
    return atr.iloc[-1] if not atr.empty else 0

def calculate_targets(ticker):
    """Calculate entry, target, and stop for a ticker."""
    try:
        stock = yf.Ticker(ticker)
        df = stock.history(period="3mo")
        
        if df.empty or len(df) < 20:
            return None
        
        current_price = df['Close'].iloc[-1]
        atr = calculate_atr(df)
        
        if pd.isna(atr) or atr == 0:
            atr = current_price * 0.02  # Fallback: 2% of price
        
        # Entry: near recent support (20-day low + small buffer) or current if at support
        support = df['Low'].rolling(20).min().iloc[-1]
        resistance = df['High'].rolling(20).max().iloc[-1]
        
        # Entry zone: between support and current price
        entry = min(current_price * 0.98, support * 1.02) if support < current_price else current_price * 0.97
        entry = max(entry, current_price * 0.90)  # Don't go more than 10% below
        
        # Stop: 2x ATR below entry
        stop = entry - (2.5 * atr)
        stop = max(stop, entry * 0.85)  # Max 15% loss
        
        # Target 1: 2:1 risk/reward
        risk = entry - stop
        target1 = entry + (2 * risk)
        
        # Target 2: 3:1 risk/reward or near resistance
        target2 = max(entry + (3 * risk), resistance * 0.98)
        
        return {
            'entry_price': round(entry, 2),
            'target_price': round(target1, 2),
            'stop_loss': round(stop, 2),
            'current_price': round(current_price, 2),
            'atr': round(atr, 2),
        }
    except Exception as e:
        print(f"  Error calculating {ticker}: {e}")
        return None

def update_watchlist(ticker, entry, target, stop):
    """Update watchlist targets via API."""
    data = json.dumps({
        'ticker': ticker,
        'entry_price': entry,
        'target_price': target,
        'stop_loss': stop,
    }).encode()
    
    req = urllib.request.Request(
        f"{BASE_URL}/api/admin/update-watchlist-targets",
        data=data,
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    resp = urllib.request.urlopen(req)
    return json.loads(resp.read().decode())

def main():
    print("Fetching empty watchlist targets...")
    empty = get_empty_watchlist()
    tickers = empty['tickers']
    print(f"Found {len(tickers)} tickers with empty targets\n")
    
    updated = 0
    failed = 0
    
    for i, item in enumerate(tickers):
        ticker = item['ticker']
        print(f"[{i+1}/{len(tickers)}] {ticker}...", end=" ")
        
        targets = calculate_targets(ticker)
        if targets:
            try:
                result = update_watchlist(
                    ticker,
                    targets['entry_price'],
                    targets['target_price'],
                    targets['stop_loss']
                )
                if result.get('success'):
                    print(f"OK entry=${targets['entry_price']} target=${targets['target_price']} stop=${targets['stop_loss']}")
                    updated += 1
                else:
                    print(f"API error: {result}")
                    failed += 1
            except Exception as e:
                print(f"API error: {e}")
                failed += 1
        else:
            print("SKIP (no data)")
            failed += 1
    
    print(f"\n✅ Updated {updated}/{len(tickers)} tickers")
    if failed:
        print(f"❌ Failed/Skipped: {failed}")

if __name__ == "__main__":
    main()
