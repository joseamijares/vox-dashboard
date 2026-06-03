#!/usr/bin/env python3
"""
Migrate VOX data from Supabase to Railway Postgres
Run with: SUPABASE_KEY=xxx DATABASE_URL=xxx python3 migrate_to_railway.py
"""
import os
import sys
import json

# Supabase client
from supabase import create_client as create_supabase_client

# Postgres client
import psycopg2
from psycopg2.extras import execute_values

# ─── CONFIG ───
SUPABASE_URL = "https://msvcrlijclhuifdjjmyy.supabase.co"
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")
if not SUPABASE_KEY:
    vox_env = os.path.expanduser("~/dev/vox-python/.env")
    if os.path.exists(vox_env):
        with open(vox_env) as f:
            for line in f:
                if line.startswith("SUPABASE_KEY="):
                    SUPABASE_KEY = line.split("=", 1)[1].strip()
                    break

# Read Railway PG password from file (avoids terminal masking)
PG_PASS = ""
pgpass_file = "/tmp/.pgpass"
if os.path.exists(pgpass_file):
    with open(pgpass_file) as f:
        PG_PASS = f.read().strip()

# Use public URL with actual password
RAILWAY_PG_URL = f"postgresql://postgres:{PG_PASS}@acela.proxy.rlwy.net:35577/railway" if PG_PASS else os.environ.get("DATABASE_URL", "")

print(f"Supabase Key present: {bool(SUPABASE_KEY)}")
print(f"Railway PG present: {bool(RAILWAY_PG_URL)}")

if not SUPABASE_KEY or not RAILWAY_PG_URL:
    print("ERROR: Set SUPABASE_KEY and DATABASE_URL env vars")
    sys.exit(1)

# ─── CONNECT ───
sb = create_supabase_client(SUPABASE_URL, SUPABASE_KEY)
pg = psycopg2.connect(RAILWAY_PG_URL)
pg.autocommit = True
cur = pg.cursor()

# ─── CREATE TABLES ───
print("\n=== Creating tables ===")

cur.execute("""
CREATE TABLE IF NOT EXISTS positions (
    id SERIAL PRIMARY KEY,
    ticker TEXT NOT NULL UNIQUE,
    shares NUMERIC,
    avg_cost NUMERIC,
    live_price NUMERIC,
    live_value NUMERIC,
    grade INTEGER,
    council TEXT,
    brokers TEXT[],
    sector TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS watchlist (
    id SERIAL PRIMARY KEY,
    ticker TEXT NOT NULL UNIQUE,
    name TEXT,
    sector TEXT,
    thesis TEXT,
    entry_price NUMERIC,
    target_price NUMERIC,
    stop_loss NUMERIC,
    grade INTEGER,
    council TEXT,
    status TEXT,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    triggered_at TIMESTAMPTZ,
    notes TEXT
);
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    ticker TEXT NOT NULL,
    alert_type TEXT,
    entry_price NUMERIC,
    target_price NUMERIC,
    stop_loss NUMERIC,
    position_size NUMERIC,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    triggered_at TIMESTAMPTZ
);
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS plays (
    id SERIAL PRIMARY KEY,
    ticker TEXT NOT NULL,
    play_type TEXT,
    entry_price NUMERIC,
    target_price NUMERIC,
    stop_loss NUMERIC,
    position_size NUMERIC,
    rationale TEXT,
    status TEXT DEFAULT 'open',
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ,
    pnl NUMERIC
);
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS journal (
    id SERIAL PRIMARY KEY,
    entry_type TEXT,
    ticker TEXT,
    content TEXT,
    tags TEXT[],
    timestamp TIMESTAMPTZ DEFAULT NOW()
);
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS technical_signals (
    id SERIAL PRIMARY KEY,
    ticker TEXT NOT NULL UNIQUE,
    score INTEGER,
    alpha_zoo_score INTEGER,
    alpha_factor_count INTEGER,
    mean_reversion_signals TEXT[],
    computed_at TIMESTAMPTZ DEFAULT NOW()
);
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS sector_momentum (
    id SERIAL PRIMARY KEY,
    sector TEXT NOT NULL UNIQUE,
    avg_grade NUMERIC,
    avg_return_1d NUMERIC,
    avg_return_5d NUMERIC,
    avg_return_20d NUMERIC,
    momentum_score INTEGER,
    top_tickers TEXT[],
    buy_count INTEGER,
    hold_count INTEGER,
    sell_count INTEGER,
    computed_at TIMESTAMPTZ DEFAULT NOW()
);
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS macro_signals (
    id SERIAL PRIMARY KEY,
    signal_name TEXT NOT NULL UNIQUE,
    signal_value NUMERIC,
    signal_direction TEXT,
    impact_sector TEXT,
    confidence INTEGER,
    source TEXT,
    computed_at TIMESTAMPTZ DEFAULT NOW()
);
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS weather_patterns (
    id SERIAL PRIMARY KEY,
    region TEXT,
    pattern_type TEXT,
    severity INTEGER,
    affected_sectors TEXT[],
    affected_tickers TEXT[],
    start_date TEXT,
    end_date TEXT,
    computed_at TIMESTAMPTZ DEFAULT NOW()
);
""")

print("Tables created.")

# ─── MIGRATE DATA ───
def migrate_table(table_name):
    print(f"\n--- Migrating {table_name} ---")
    result = sb.table(table_name).select("*").execute()
    rows = result.data
    print(f"  Source: {len(rows)} rows")
    
    if not rows:
        print(f"  Skipping (empty)")
        return
    
    cur.execute(f"TRUNCATE TABLE {table_name} CASCADE")
    
    keys = list(rows[0].keys())
    col_names = ", ".join([f'"{k}"' for k in keys])
    
    values = []
    for row in rows:
        vals = []
        for k in keys:
            v = row.get(k)
            if isinstance(v, list):
                v = v if v else None
            elif isinstance(v, dict):
                v = json.dumps(v)
            vals.append(v)
        values.append(tuple(vals))
    
    execute_values(
        cur,
        f"INSERT INTO {table_name} ({col_names}) VALUES %s ON CONFLICT DO NOTHING",
        values
    )
    
    cur.execute(f"SELECT COUNT(*) FROM {table_name}")
    count = cur.fetchone()[0]
    print(f"  Dest: {count} rows")

# Migrate each table
for table in ["positions", "watchlist", "alerts", "plays", "journal"]:
    migrate_table(table)

print("\n=== Migration complete ===")
pg.commit()
cur.close()
pg.close()
