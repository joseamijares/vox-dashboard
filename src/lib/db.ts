import { Pool } from "pg";
import { readFileSync } from "fs";

// Try to read password from a file (set by startup script)
let pgPassword = "";
try {
  pgPassword = readFileSync("/tmp/.pgpass", "utf8").trim();
} catch (e) {
  // Fallback to env var
  pgPassword = process.env.PGPASSWORD || "";
}

const PGHOST = process.env.PGHOST || "postgres-flpd.railway.internal";
const PGPORT = process.env.PGPORT || "5432";
const PGUSER = process.env.PGUSER || "postgres";
const PGDATABASE = process.env.PGDATABASE || "railway";

const connectionString = "postgresql://" + PGUSER + ":" + pgPassword + "@" + PGHOST + ":" + PGPORT + "/" + PGDATABASE;

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

// Parse numeric strings from Postgres into numbers
function parseNumeric(value: any): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}

// Convert a row's numeric fields from strings to numbers
function parseRow(row: Record<string, any>, numericFields: string[]): Record<string, any> {
  const parsed = { ...row };
  for (const field of numericFields) {
    if (field in parsed) {
      parsed[field] = parseNumeric(parsed[field]);
    }
  }
  return parsed;
}

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
  const rows = await query(`
    SELECT ticker, shares, avg_cost, live_price, live_value, grade, council, brokers, sector, updated_at
    FROM positions
    ORDER BY live_value DESC
  `);
  return rows.map((row: any) =>
    parseRow(row, ["shares", "avg_cost", "live_price", "live_value", "grade"])
  );
}

export async function getWatchlist() {
  const rows = await query(`
    SELECT ticker, name, sector, thesis, entry_price, target_price, stop_loss, grade, council, status, added_at, notes
    FROM watchlist
    ORDER BY added_at DESC
  `);
  return rows.map((row: any) =>
    parseRow(row, ["entry_price", "target_price", "stop_loss", "grade"])
  );
}

export async function getAlerts() {
  const rows = await query(`
    SELECT timestamp, ticker, alert_type, message, grade, council, sent
    FROM alerts
    ORDER BY timestamp DESC
  `);
  return rows.map((row: any) => parseRow(row, ["grade"]));
}

export async function getPlays() {
  const rows = await query(`
    SELECT timestamp, ticker, action, shares, price, notional, broker, reason, grade_at_entry, council_at_entry, notes, closed, exit_price, exit_date, pnl, pnl_pct
    FROM plays
    ORDER BY timestamp DESC
  `);
  return rows.map((row: any) =>
    parseRow(row, ["shares", "price", "notional", "grade_at_entry", "exit_price", "pnl", "pnl_pct"])
  );
}

export async function getJournal() {
  const rows = await query(`
    SELECT timestamp, date, ticker, action, shares, price, notional, broker, reason, grade_at_entry, council_at_entry, notes, pnl, pnl_pct, tags
    FROM journal
    ORDER BY timestamp DESC
    LIMIT 100
  `);
  return rows.map((row: any) =>
    parseRow(row, ["shares", "price", "notional", "grade_at_entry", "pnl", "pnl_pct"])
  );
}
