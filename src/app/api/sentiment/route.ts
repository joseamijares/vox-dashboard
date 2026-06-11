import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ticker = searchParams.get("ticker");

    if (ticker) {
      // Get latest sentiment for specific ticker
      const rows = await query(
        `SELECT ticker, vox_score, raw_score, mention_count, article_count,
                bullish_count, somewhat_bullish_count, neutral_count,
                somewhat_bearish_count, bearish_count, bullish_ratio,
                top_headlines, data_freshness_hours, source, computed_at
         FROM sentiment_scores
         WHERE ticker = $1
         ORDER BY computed_at DESC
         LIMIT 1`,
        [ticker]
      );
      
      if (rows.length === 0) {
        return NextResponse.json({ error: "No sentiment data found" }, { status: 404 });
      }
      
      const row = rows[0];
      return NextResponse.json({
        ticker: row.ticker,
        vox_score: parseFloat(row.vox_score) || 50,
        raw_score: parseFloat(row.raw_score) || 0,
        mention_count: parseInt(row.mention_count) || 0,
        article_count: parseInt(row.article_count) || 0,
        bullish_count: parseInt(row.bullish_count) || 0,
        somewhat_bullish_count: parseInt(row.somewhat_bullish_count) || 0,
        neutral_count: parseInt(row.neutral_count) || 0,
        somewhat_bearish_count: parseInt(row.somewhat_bearish_count) || 0,
        bearish_count: parseInt(row.bearish_count) || 0,
        bullish_ratio: parseFloat(row.bullish_ratio) || 0.5,
        top_headlines: row.top_headlines || [],
        data_freshness_hours: row.data_freshness_hours,
        source: row.source,
        computed_at: row.computed_at,
      });
    } else {
      // Get all latest sentiment scores
      const rows = await query(
        `SELECT DISTINCT ON (ticker) ticker, vox_score, raw_score, mention_count,
                bullish_count, somewhat_bullish_count, neutral_count,
                somewhat_bearish_count, bearish_count, bullish_ratio,
                computed_at
         FROM sentiment_scores
         ORDER BY ticker, computed_at DESC
         LIMIT 100`
      );
      
      const results = rows.map((row: any) => ({
        ticker: row.ticker,
        vox_score: parseFloat(row.vox_score) || 50,
        raw_score: parseFloat(row.raw_score) || 0,
        mention_count: parseInt(row.mention_count) || 0,
        bullish_count: parseInt(row.bullish_count) || 0,
        somewhat_bullish_count: parseInt(row.somewhat_bullish_count) || 0,
        neutral_count: parseInt(row.neutral_count) || 0,
        somewhat_bearish_count: parseInt(row.somewhat_bearish_count) || 0,
        bearish_count: parseInt(row.bearish_count) || 0,
        bullish_ratio: parseFloat(row.bullish_ratio) || 0.5,
        computed_at: row.computed_at,
      }));
      
      return NextResponse.json({ sentiments: results, count: results.length });
    }
  } catch (error) {
    console.error("Error fetching sentiment:", error);
    return NextResponse.json({ error: "Failed to fetch sentiment" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const records = body.sentiments || [body];

    for (const record of records) {
      await query(
        `INSERT INTO sentiment_scores 
         (ticker, vox_score, raw_score, mention_count, article_count,
          bullish_count, somewhat_bullish_count, neutral_count,
          somewhat_bearish_count, bearish_count, bullish_ratio,
          top_headlines, data_freshness_hours, source)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          record.ticker,
          record.vox_score,
          record.raw_score,
          record.mention_count,
          record.article_count,
          record.bullish_count,
          record.somewhat_bullish_count,
          record.neutral_count,
          record.somewhat_bearish_count,
          record.bearish_count,
          record.bullish_ratio,
          JSON.stringify(record.top_headlines || []),
          record.data_freshness_hours,
          record.source || "alphavantage",
        ]
      );
    }

    return NextResponse.json({ success: true, count: records.length });
  } catch (error) {
    console.error("Error saving sentiment:", error);
    return NextResponse.json({ error: "Failed to save sentiment" }, { status: 500 });
  }
}
