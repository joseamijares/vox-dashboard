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

# Drop and recreate alerts with correct schema
cur.execute("DROP TABLE IF EXISTS alerts CASCADE")
cur.execute("""
CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    ticker TEXT NOT NULL,
    alert_type TEXT,
    message TEXT,
    grade INTEGER,
    council TEXT,
    sent BOOLEAN DEFAULT FALSE
);
""")
print("Fixed alerts table")

# Fix plays table
cur.execute("DROP TABLE IF EXISTS plays CASCADE")
cur.execute("""
CREATE TABLE plays (
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
print("Fixed plays table")

# Fix journal table
cur.execute("DROP TABLE IF EXISTS journal CASCADE")
cur.execute("""
CREATE TABLE journal (
    id SERIAL PRIMARY KEY,
    entry_type TEXT,
    ticker TEXT,
    content TEXT,
    tags TEXT[],
    timestamp TIMESTAMPTZ DEFAULT NOW()
);
""")
print("Fixed journal table")

cur.close()
conn.close()
print("Done")
