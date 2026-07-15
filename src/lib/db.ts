import { Pool } from "pg";
import { readFileSync } from "fs";
import { getCouncilAction } from "./council";

// Try to read password from a file (set by startup script)
let pgPassword = "";
try {
  pgPassword = readFileSync("/tmp/.pgpass", "utf8").trim();
} catch {
  pgPassword = process.env.PGPASSWORD || process.env.DB_PASSWORD || "";
}

const PGHOST = process.env.PGHOST || "postgres-flpd.railway.internal";
const PGPORT = process.env.PGPORT || "5432";
const PGUSER = process.env.PGUSER || "postgres";
const PGDATABASE = process.env.PGDATABASE || "railway";

const connectionString =
  "postgresql://" +
  PGUSER +
  ":" +
  pgPassword +
  "@" +
  PGHOST +
  ":" +
  PGPORT +
  "/" +
  PGDATABASE;

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

function parseNumeric(value: any): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}

function parseRow(
  row: Record<string, any>,
  numericFields: string[]
): Record<string, any> {
  const parsed = { ...row };
  for (const field of numericFields) {
    if (field in parsed) parsed[field] = parseNumeric(parsed[field]);
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

/** Latest grade row per ticker (Pattern 7 — never count historical rows) */
const LATEST_VOX_GRADES = `
  SELECT DISTINCT ON (ticker)
    ticker, name, vox_grade, previous_grade, action, current_price, stop_loss, entry_point,
    position_value, shares, technical_score, fundamental_score, macro_score, sector_score,
    weather_score, sentiment_score, catalysts, weather_factors, generated_at
  FROM vox_grades
  ORDER BY ticker, generated_at DESC NULLS LAST
`;

export async function getPositions() {
  const rows = await query(`
    SELECT
      p.ticker,
      p.shares,
      p.avg_cost,
      COALESCE(p.live_price, 0) AS live_price,
      COALESCE(p.live_value_usd, p.live_value, 0) AS live_value,
      COALESCE(p.live_value_usd, p.live_value, 0) AS value,
      COALESCE(p.live_value_usd, p.live_value, 0) AS value_usd,
      COALESCE(g.vox_grade, p.grade, 0) AS grade,
      COALESCE(p.council, g.action, 'HOLD') AS council,
      p.brokers,
      p.sector,
      p.updated_at,
      p.price_source,
      p.price_asof,
      p.prev_close,
      p.day_chg_pct,
      CASE
        WHEN p.price_asof IS NULL THEN true
        WHEN p.price_asof < NOW() - INTERVAL '45 minutes' THEN true
        ELSE false
      END AS price_stale,
      EXTRACT(EPOCH FROM (NOW() - p.price_asof)) / 60.0 AS price_age_min,
      COALESCE(u.security, p.ticker) AS name,
      g.technical_score,
      g.fundamental_score,
      g.macro_score,
      g.sentiment_score,
      ROUND(
        COALESCE(g.vox_grade, p.grade, 50) * 0.55
        + COALESCE(g.technical_score, 50) * 0.20
        + COALESCE(g.fundamental_score, 50) * 0.15
        + COALESCE(g.macro_score, 50) * 0.10
      , 1) AS research_score,
      jsonb_build_object(
        'technical', g.technical_score,
        'fundamental', g.fundamental_score,
        'macro', g.macro_score,
        'sentiment', g.sentiment_score
      ) AS layer_scores
    FROM positions p
    LEFT JOIN (${LATEST_VOX_GRADES}) g ON g.ticker = p.ticker
    LEFT JOIN sp500_universe u ON p.ticker = u.ticker AND u.is_active = true
    WHERE COALESCE(p.live_value_usd, p.live_value, 0) > 0
       OR COALESCE(p.shares, 0) > 0
    ORDER BY COALESCE(p.live_value_usd, p.live_value, 0) DESC
  `);
  return rows.map((row: any) =>
    parseRow(row, [
      "shares",
      "avg_cost",
      "live_price",
      "live_value",
      "value",
      "value_usd",
      "grade",
      "technical_score",
      "fundamental_score",
      "macro_score",
      "sentiment_score",
      "research_score",
      "prev_close",
      "day_chg_pct",
      "price_age_min",
    ])
  );
}

export async function getBrokerBook() {
  const rows = await query(`
    SELECT
      broker,
      COUNT(*) FILTER (WHERE COALESCE(live_value_usd, live_value, 0) > 0 OR COALESCE(shares, 0) > 0) AS position_count,
      ROUND(SUM(COALESCE(live_value_usd, live_value, 0))::numeric, 2) AS value,
      MAX(COALESCE(last_sync_at, updated_at)) AS last_updated,
      EXTRACT(EPOCH FROM (NOW() - MAX(COALESCE(last_sync_at, updated_at)))) / 86400.0 AS sync_age_days
    FROM broker_positions
    GROUP BY broker
    ORDER BY value DESC NULLS LAST
  `);
  return rows.map((row: any) =>
    parseRow(row, ["position_count", "value", "sync_age_days"])
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
  const out: any[] = [];
  try {
    const rows = await query(`
      SELECT timestamp, ticker, alert_type, message, grade, council, sent
      FROM alerts
      ORDER BY timestamp DESC
      LIMIT 50
    `);
    for (const a of rows || []) {
      const grade = parseNumeric(a.grade);
      out.push({
        ...a,
        grade,
        severity:
          grade > 0 && grade < 40
            ? "high"
            : grade > 0 && grade < 50
              ? "medium"
              : "low",
      });
    }
  } catch {
    /* empty */
  }
  try {
    const rows = await query(`
      SELECT triggered_at AS timestamp, ticker, alert_type,
             old_grade, new_grade, old_action, new_action, sent
      FROM grade_alerts
      ORDER BY triggered_at DESC
      LIMIT 50
    `);
    for (const g of rows || []) {
      const oldG = parseNumeric(g.old_grade);
      const newG = parseNumeric(g.new_grade);
      const delta = Math.abs(newG - oldG);
      out.push({
        timestamp: g.timestamp,
        ticker: g.ticker,
        alert_type: g.alert_type || "grade_swing",
        message: `Grade ${oldG || "?"} → ${newG || "?"} (${g.old_action || "?"} → ${g.new_action || "?"})`,
        severity: delta >= 15 ? "high" : delta >= 8 ? "medium" : "low",
        grade: newG,
        council: g.new_action,
        sent: g.sent,
      });
    }
  } catch {
    /* empty */
  }
  out.sort((a, b) => {
    const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    return tb - ta;
  });
  return out.slice(0, 100);
}

export async function getPlays() {
  const rows = await query(`
    SELECT timestamp, ticker, action, shares, price, notional, broker, reason, grade_at_entry, council_at_entry, notes, closed, exit_price, exit_date, pnl, pnl_pct
    FROM plays
    ORDER BY timestamp DESC
  `);
  return rows.map((row: any) =>
    parseRow(row, [
      "shares",
      "price",
      "notional",
      "grade_at_entry",
      "exit_price",
      "pnl",
      "pnl_pct",
    ])
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
    parseRow(row, [
      "id",
      "shares",
      "price",
      "notional",
      "grade_at_entry",
      "pnl",
      "pnl_pct",
    ])
  );
}

export async function updatePositionGrade(
  ticker: string,
  grade: number,
  _action?: string
) {
  const action = getCouncilAction(grade);
  await query(
    `UPDATE positions SET grade = $1, council = $2, updated_at = NOW() WHERE ticker = $3`,
    [grade, action, ticker]
  );
}

export async function getVoxGrades(): Promise<Record<string, any>[]> {
  const rows = await query(`
    SELECT * FROM (${LATEST_VOX_GRADES}) g
    ORDER BY vox_grade DESC NULLS LAST
  `);
  return rows.map((row: any) =>
    parseRow(row, [
      "vox_grade",
      "previous_grade",
      "current_price",
      "stop_loss",
      "entry_point",
      "position_value",
      "shares",
      "technical_score",
      "fundamental_score",
      "macro_score",
      "sector_score",
      "weather_score",
      "sentiment_score",
    ])
  );
}

export async function getSp500Universe(): Promise<Record<string, any>[]> {
  const rows = await query(`
    SELECT ticker, security as name, sector, industry as sub_industry, is_active, created_at
    FROM sp500_universe
    WHERE is_active = true
    ORDER BY ticker
  `);
  return rows;
}

export async function getSp500Grades(): Promise<Record<string, any>[]> {
  // Prefer latest unified/vox grades for universe, fall back to sp500_grades
  try {
    const rows = await query(`
      SELECT
        u.ticker,
        u.security AS name,
        u.sector,
        COALESCE(g.vox_grade, s.vox_grade, 0) AS vox_grade,
        COALESCE(g.technical_score, s.technical_score, 50) AS technical_score,
        COALESCE(g.fundamental_score, s.fundamental_score, 50) AS fundamental_score,
        COALESCE(g.macro_score, s.macro_score, 50) AS macro_score,
        COALESCE(g.sector_score, s.sector_score, 50) AS sector_score,
        COALESCE(g.weather_score, s.weather_score, 50) AS weather_score,
        COALESCE(g.sentiment_score, s.sentiment_score, 50) AS sentiment_score,
        COALESCE(g.generated_at, s.computed_at) AS computed_at,
        CASE WHEN p.ticker IS NOT NULL THEN true ELSE false END AS in_portfolio,
        COALESCE(p.live_value_usd, p.live_value, 0) AS portfolio_value
      FROM sp500_universe u
      LEFT JOIN (${LATEST_VOX_GRADES}) g ON g.ticker = u.ticker
      LEFT JOIN sp500_grades s ON s.ticker = u.ticker
      LEFT JOIN positions p ON p.ticker = u.ticker
        AND COALESCE(p.live_value_usd, p.live_value, 0) > 0
      WHERE u.is_active = true
        AND (g.vox_grade IS NOT NULL OR s.vox_grade IS NOT NULL)
      ORDER BY COALESCE(g.vox_grade, s.vox_grade, 0) DESC
    `);
    return rows.map((row: any) =>
      parseRow(row, [
        "vox_grade",
        "technical_score",
        "fundamental_score",
        "macro_score",
        "sector_score",
        "weather_score",
        "sentiment_score",
        "portfolio_value",
      ])
    );
  } catch {
    const rows = await query(`
      SELECT g.ticker, u.security as name, u.sector, g.vox_grade, g.technical_score, g.fundamental_score,
             g.macro_score, g.sector_score, g.weather_score, g.sentiment_score, g.computed_at
      FROM sp500_grades g
      JOIN sp500_universe u ON g.ticker = u.ticker
      ORDER BY g.vox_grade DESC
    `);
    return rows.map((row: any) =>
      parseRow(row, [
        "vox_grade",
        "technical_score",
        "fundamental_score",
        "macro_score",
        "sector_score",
        "weather_score",
        "sentiment_score",
      ])
    );
  }
}

export async function getSp500SectorLeaders(): Promise<Record<string, any>[]> {
  try {
    const rows = await query(`
      SELECT sector, ticker, rank_in_sector as rank, price_change_pct as change_5d_pct,
             avg_volume as avg_volume_m, momentum_score, screened_at as created_at
      FROM sp500_sector_leaders
      WHERE screened_at = (SELECT MAX(screened_at) FROM sp500_sector_leaders)
      ORDER BY sector, rank_in_sector
    `);
    return rows.map((row: any) =>
      parseRow(row, ["rank", "change_5d_pct", "avg_volume_m", "momentum_score"])
    );
  } catch {
    // Fallback: top grades by sector from latest vox grades
    const rows = await query(`
      WITH ranked AS (
        SELECT
          COALESCE(u.sector, 'Unknown') AS sector,
          g.ticker,
          g.vox_grade AS momentum_score,
          0::float AS change_5d_pct,
          ROW_NUMBER() OVER (PARTITION BY COALESCE(u.sector, 'Unknown') ORDER BY g.vox_grade DESC) AS rank
        FROM (${LATEST_VOX_GRADES}) g
        LEFT JOIN sp500_universe u ON u.ticker = g.ticker
        WHERE g.vox_grade IS NOT NULL
      )
      SELECT * FROM ranked WHERE rank <= 3 ORDER BY sector, rank
    `);
    return rows.map((row: any) =>
      parseRow(row, ["rank", "change_5d_pct", "momentum_score"])
    );
  }
}

export async function getSp500Alerts(): Promise<Record<string, any>[]> {
  try {
    const rows = await query(`
      SELECT ticker, alert_type, old_value, new_value, message, is_read, created_at
      FROM sp500_alerts
      WHERE is_read = false
      ORDER BY created_at DESC
      LIMIT 50
    `);
    return rows.map((row: any) => parseRow(row, ["old_value", "new_value"]));
  } catch {
    return [];
  }
}

export async function getPortfolioSectorComparison(): Promise<
  Record<string, any>[]
> {
  const rows = await query(`
    WITH book AS (
      SELECT
        COALESCE(NULLIF(p.sector, ''), u.sector, 'Other') AS sector,
        COALESCE(p.live_value_usd, p.live_value, 0) AS value,
        COALESCE(g.vox_grade, p.grade, 0) AS grade
      FROM positions p
      LEFT JOIN sp500_universe u ON u.ticker = p.ticker
      LEFT JOIN (${LATEST_VOX_GRADES}) g ON g.ticker = p.ticker
      WHERE COALESCE(p.live_value_usd, p.live_value, 0) > 0
        AND p.ticker <> 'MIRROR_TOTAL'
    )
    SELECT
      sector,
      COUNT(*) AS portfolio_count,
      ROUND(SUM(value)::numeric, 2) AS portfolio_value,
      ROUND(AVG(NULLIF(grade, 0))::numeric, 1) AS portfolio_avg_grade
    FROM book
    GROUP BY sector
    ORDER BY portfolio_value DESC
  `);
  return rows.map((row: any) =>
    parseRow(row, [
      "portfolio_count",
      "portfolio_value",
      "portfolio_avg_grade",
    ])
  );
}

export async function getSp500GradeDistribution(): Promise<
  Record<string, any>[]
> {
  try {
    const rows = await query(`
      SELECT
        CASE
          WHEN vox_grade >= 70 THEN 'Core (70+)'
          WHEN vox_grade >= 60 THEN 'Buy (60-69)'
          WHEN vox_grade >= 50 THEN 'Hold (50-59)'
          WHEN vox_grade >= 40 THEN 'Trim (40-49)'
          ELSE 'Sell (<40)'
        END as bucket,
        COUNT(*) as count,
        MIN(vox_grade) as min_grade,
        MAX(vox_grade) as max_grade
      FROM (${LATEST_VOX_GRADES}) g
      WHERE vox_grade IS NOT NULL
      GROUP BY 1
      ORDER BY 3 DESC
    `);
    return rows.map((row: any) =>
      parseRow(row, ["count", "min_grade", "max_grade"])
    );
  } catch {
    const rows = await query(`
      SELECT
        CASE
          WHEN vox_grade >= 70 THEN 'Core (70+)'
          WHEN vox_grade >= 60 THEN 'Buy (60-69)'
          WHEN vox_grade >= 50 THEN 'Hold (50-59)'
          WHEN vox_grade >= 40 THEN 'Trim (40-49)'
          ELSE 'Sell (<40)'
        END as bucket,
        COUNT(*) as count,
        MIN(vox_grade) as min_grade,
        MAX(vox_grade) as max_grade
      FROM sp500_grades
      GROUP BY 1
      ORDER BY 3 DESC
    `);
    return rows.map((row: any) =>
      parseRow(row, ["count", "min_grade", "max_grade"])
    );
  }
}
