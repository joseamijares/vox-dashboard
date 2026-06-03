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

# Drop and recreate journal with correct schema
cur.execute("DROP TABLE IF EXISTS journal CASCADE")
cur.execute("""
CREATE TABLE journal (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    date DATE,
    ticker TEXT,
    action TEXT,
    shares NUMERIC,
    price NUMERIC,
    notional NUMERIC,
    broker TEXT,
    reason TEXT,
    grade_at_entry INTEGER,
    council_at_entry TEXT,
    notes TEXT,
    pnl NUMERIC,
    pnl_pct NUMERIC,
    tags TEXT[]
);
""")
print("Fixed journal table")

cur.close()
conn.close()
print("Done")
