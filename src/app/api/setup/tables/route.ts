import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST() {
  try {
    // Create all new tables
    await query(`
      CREATE TABLE IF NOT EXISTS weather_risks (
        id SERIAL PRIMARY KEY,
        region VARCHAR(100) NOT NULL,
        risk_type VARCHAR(50) NOT NULL,
        severity VARCHAR(20) NOT NULL,
        description TEXT,
        affected_tickers TEXT[],
        max_temp NUMERIC,
        min_temp NUMERIC,
        precip_5day NUMERIC,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS geopolitical_events (
        id SERIAL PRIMARY KEY,
        event_type VARCHAR(50) NOT NULL,
        severity VARCHAR(20) NOT NULL,
        region VARCHAR(100),
        description TEXT,
        affected_sectors TEXT[],
        affected_tickers TEXT[],
        source_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS commodity_prices (
        id SERIAL PRIMARY KEY,
        symbol VARCHAR(20) NOT NULL,
        name VARCHAR(100),
        price NUMERIC,
        unit VARCHAR(20),
        category VARCHAR(50),
        change_pct NUMERIC,
        source VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS trade_signals (
        id SERIAL PRIMARY KEY,
        ticker VARCHAR(20) NOT NULL,
        signal_type VARCHAR(20) NOT NULL,
        composite_score INTEGER NOT NULL,
        technical_score INTEGER,
        fundamental_score INTEGER,
        macro_score INTEGER,
        sector_score INTEGER,
        weather_score INTEGER,
        sentiment_score INTEGER,
        rsi NUMERIC,
        grade INTEGER,
        macro_aligned BOOLEAN,
        correlation_risk NUMERIC,
        target_price NUMERIC,
        stop_price NUMERIC,
        position_size_pct NUMERIC,
        rationale TEXT,
        expires_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS market_regime (
        id SERIAL PRIMARY KEY,
        regime VARCHAR(20) NOT NULL,
        confidence NUMERIC,
        vix_level NUMERIC,
        spy_trend VARCHAR(20),
        yield_curve VARCHAR(20),
        fed_stance VARCHAR(20),
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create indexes
    await query(`CREATE INDEX IF NOT EXISTS idx_weather_risks_created ON weather_risks(created_at DESC)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_geopolitical_created ON geopolitical_events(created_at DESC)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_commodity_symbol ON commodity_prices(symbol, created_at DESC)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_trade_signals_score ON trade_signals(composite_score DESC)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_trade_signals_ticker ON trade_signals(ticker)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_market_regime_created ON market_regime(created_at DESC)`);

    return NextResponse.json({ success: true, message: "All tables created successfully" });
  } catch (error) {
    console.error("Error creating tables:", error);
    return NextResponse.json(
      { error: "Failed to create tables: " + (error as Error).message },
      { status: 500 }
    );
  }
}
