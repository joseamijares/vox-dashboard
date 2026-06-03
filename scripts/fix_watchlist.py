#!/usr/bin/env python3
import psycopg2

with open('/tmp/.pgpass') as f:
    pwd = f.read().strip()

conn = psycopg2.connect(
    host='acela.proxy.rlwy.net',
    port=35577,
    database='railway',
    user='postgres',
    password=pwd
)
conn.autocommit = True
cur = conn.cursor()

# Rename old table
cur.execute("ALTER TABLE IF EXISTS watchlist RENAME TO watchlist_old")
print("Renamed old watchlist")

# Create new table with correct schema
cur.execute("""
CREATE TABLE watchlist (
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
print("Created new watchlist table")

cur.close()
conn.close()
print("Done")
