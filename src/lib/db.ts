import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

export async function query(text: string, params?: any[]) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result.rows;
  } finally {
    client.release();
  }
}

export async function getPositions() {
  return query(`
    SELECT ticker, shares, avg_cost, live_price, live_value, grade, council, brokers, sector, updated_at
    FROM positions
    ORDER BY live_value DESC
  `);
}

export async function getWatchlist() {
  return query(`
    SELECT ticker, name, sector, thesis, entry_price, target_price, stop_loss, grade, council, status, added_at, notes
    FROM watchlist
    ORDER BY added_at DESC
  `);
}

export async function getAlerts() {
  return query(`
    SELECT timestamp, ticker, alert_type, message, grade, council, sent
    FROM alerts
    ORDER BY timestamp DESC
  `);
}

export async function getPlays() {
  return query(`
    SELECT timestamp, ticker, action, shares, price, notional, broker, reason, grade_at_entry, council_at_entry, notes, closed, exit_price, exit_date, pnl, pnl_pct
    FROM plays
    ORDER BY timestamp DESC
  `);
}

export async function getJournal() {
  return query(`
    SELECT timestamp, date, ticker, action, shares, price, notional, broker, reason, grade_at_entry, council_at_entry, notes, pnl, pnl_pct, tags
    FROM journal
    ORDER BY timestamp DESC
    LIMIT 100
  `);
}
