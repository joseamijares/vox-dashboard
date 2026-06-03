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
    SELECT ticker, alert_type, entry_price, target_price, stop_loss, position_size, status, created_at
    FROM alerts
    WHERE status = 'active'
    ORDER BY created_at DESC
  `);
}

export async function getPlays() {
  return query(`
    SELECT ticker, play_type, entry_price, target_price, stop_loss, position_size, rationale, status, timestamp, pnl
    FROM plays
    ORDER BY timestamp DESC
  `);
}

export async function getJournal() {
  return query(`
    SELECT entry_type, ticker, content, tags, timestamp
    FROM journal
    ORDER BY timestamp DESC
    LIMIT 100
  `);
}
