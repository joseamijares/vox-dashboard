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
    SELECT id, timestamp, date, ticker, action, shares, price, notional, broker, reason, grade_at_entry, council_at_entry, notes, pnl, pnl_pct, tags
    FROM journal
    ORDER BY timestamp DESC
    LIMIT 100
  `);
  return rows.map((row: any) =>
    parseRow(row, ["id", "shares", "price", "notional", "grade_at_entry", "pnl", "pnl_pct"])
  );
}

// Update position grade
export async function updatePositionGrade(ticker: string, grade: number, action: string) {
  await query(
    `UPDATE positions SET grade = $1, council = $2, updated_at = NOW() WHERE ticker = $3`,
    [grade, action, ticker]
  );
}

export async function getVoxGrades(): Promise<Record<string, any>[]> {
  const rows = await query(`
    SELECT ticker, name, vox_grade, previous_grade, action, current_price, stop_loss, entry_point,
           position_value, shares, technical_score, fundamental_score, macro_score, sector_score,
           weather_score, sentiment_score, catalysts, weather_factors, generated_at
    FROM vox_grades
    ORDER BY vox_grade DESC
  `);
  return rows.map((row: any) =>
    parseRow(row, [
      "vox_grade", "previous_grade", "current_price", "stop_loss", "entry_point",
      "position_value", "shares", "technical_score", "fundamental_score", "macro_score",
      "sector_score", "weather_score", "sentiment_score"
    ])
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// S&P 500 DATA
// ═══════════════════════════════════════════════════════════════════════════════

export async function getSp500Universe(): Promise<Record<string, any>[]> {
  const rows = await query(`
    SELECT ticker, name, sector, sub_industry, market_cap, is_active, added_at
    FROM sp500_universe
    WHERE is_active = true
    ORDER BY ticker
  `);
  return rows.map((row: any) => parseRow(row, ["market_cap"]));
}

export async function getSp500Grades(): Promise<Record<string, any>[]> {
  const rows = await query(`
    SELECT g.ticker, u.name, u.sector, g.vox_grade, g.technical_score, g.fundamental_score,
           g.macro_score, g.sector_score, g.weather_score, g.sentiment_score, g.computed_at
    FROM sp500_grades g
    JOIN sp500_universe u ON g.ticker = u.ticker
    ORDER BY g.vox_grade DESC
  `);
  return rows.map((row: any) =>
    parseRow(row, [
      "vox_grade", "technical_score", "fundamental_score", "macro_score",
      "sector_score", "weather_score", "sentiment_score"
    ])
  );
}

export async function getSp500SectorLeaders(): Promise<Record<string, any>[]> {
  const rows = await query(`
    SELECT sector, ticker, rank, change_5d_pct, volume_5d_avg, momentum_score, created_at
    FROM sp500_sector_leaders
    WHERE created_at = (SELECT MAX(created_at) FROM sp500_sector_leaders)
    ORDER BY sector, rank
  `);
  return rows.map((row: any) =>
    parseRow(row, ["rank", "change_5d_pct", "volume_5d_avg", "momentum_score"])
  );
}

export async function getSp500GradeDistribution(): Promise<Record<string, any>[]> {
  const rows = await query(`
    SELECT
      CASE
        WHEN vox_grade >= 70 THEN 'Strong Buy (70+)'
        WHEN vox_grade >= 60 THEN 'Buy (60-69)'
        WHEN vox_grade >= 50 THEN 'Hold (50-59)'
        WHEN vox_grade >= 40 THEN 'Trim (40-49)'
        ELSE 'Sell (<40)'
      END as bucket,
      COUNT(*) as count,
      MIN(vox_grade) as min_grade,
      MAX(vox_grade) as max_grade
    FROM sp500_grades
    GROUP BY bucket
    ORDER BY MIN(vox_grade) DESC
  `);
  return rows.map((row: any) =>
    parseRow(row, ["count", "min_grade", "max_grade"])
  );
}
