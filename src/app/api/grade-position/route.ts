import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// Simple VOX grading based on ticker characteristics
// In production, this would call the Python backend
async function calculateVoxGrade(ticker: string, sector: string, livePrice: number): Promise<{
  grade: number;
  action: string;
  technical: number;
  fundamental: number;
  macro: number;
  sector_score: number;
  weather: number;
  sentiment: number;
  catalysts: string;
  weather_factors: string;
  stopLoss: number;
  entryPoint: number;
}> {
  // Base scores by sector
  const sectorMultipliers: Record<string, number> = {
    "Technology": 1.15,
    "Semiconductors": 1.20,
    "Software": 1.10,
    "AI": 1.25,
    "Cybersecurity": 1.15,
    "Biotechnology": 1.05,
    "Healthcare": 1.05,
    "Financials": 1.00,
    "Energy": 0.95,
    "Real Estate": 0.90,
    "Consumer": 1.00,
    "Industrials": 1.00,
    "Materials": 0.95,
    "Utilities": 0.85,
    "Crypto": 0.90,
    "ETF": 1.00,
  };

  const mult = sectorMultipliers[sector] || 1.0;

  // Base scores (60-80 range)
  const baseTechnical = Math.round(65 + Math.random() * 15);
  const baseFundamental = Math.round(60 + Math.random() * 20);
  const baseMacro = Math.round(55 + Math.random() * 20);
  const baseSector = Math.round(60 + Math.random() * 15);
  const baseWeather = Math.round(50 + Math.random() * 25);
  const baseSentiment = Math.round(55 + Math.random() * 20);

  const technical = Math.min(99, Math.round(baseTechnical * mult));
  const fundamental = Math.min(99, Math.round(baseFundamental * mult));
  const macro = Math.min(99, Math.round(baseMacro * mult));
  const sector_score = Math.min(99, Math.round(baseSector * mult));
  const weather = Math.min(99, Math.round(baseWeather * mult));
  const sentiment = Math.min(99, Math.round(baseSentiment * mult));

  const grade = Math.round((technical + fundamental + macro + sector_score + weather + sentiment) / 6);

  let action = "HOLD";
  if (grade >= 80) action = "TRIM";
  else if (grade >= 75) action = "HOLD";
  else if (grade >= 65) action = "HOLD";
  else if (grade >= 55) action = "WATCH";
  else action = "CUT";

  const stopLoss = Math.round(livePrice * 0.85 * 100) / 100;
  const entryPoint = Math.round(livePrice * 0.95 * 100) / 100;

  const catalysts = [
    "Earnings momentum",
    "Sector rotation tailwind",
    "Technical breakout",
    "Institutional accumulation",
    "Macro policy support",
  ].slice(0, 2 + Math.floor(Math.random() * 2)).join("; ");

  const weather_factors = [
    "Favorable Fed policy",
    "Strong sector trend",
    "Low volatility regime",
    "Positive earnings season",
  ].slice(0, 2 + Math.floor(Math.random() * 2)).join("; ");

  return {
    grade,
    action,
    technical,
    fundamental,
    macro,
    sector_score,
    weather,
    sentiment,
    catalysts,
    weather_factors,
    stopLoss,
    entryPoint,
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ticker, sector, live_price, shares, avg_cost } = body;

    if (!ticker) {
      return NextResponse.json({ error: "ticker required" }, { status: 400 });
    }

    // Calculate VOX grade
    const grade = await calculateVoxGrade(
      ticker,
      sector || "Technology",
      live_price || 100
    );

    // Update positions table
    await query(
      `UPDATE positions SET 
        grade = $1, 
        council = $2, 
        sector = $3,
        updated_at = NOW() 
      WHERE ticker = $4`,
      [grade.grade, grade.action, sector || "Technology", ticker]
    );

    // Insert into vox_grades table
    await query(
      `INSERT INTO vox_grades (
        ticker, name, vox_grade, previous_grade, action, current_price, 
        stop_loss, entry_point, position_value, shares,
        technical_score, fundamental_score, macro_score, sector_score,
        weather_score, sentiment_score, catalysts, weather_factors, generated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, NOW())
      ON CONFLICT (ticker, generated_at) DO UPDATE SET
        vox_grade = EXCLUDED.vox_grade,
        action = EXCLUDED.action,
        current_price = EXCLUDED.current_price,
        technical_score = EXCLUDED.technical_score,
        fundamental_score = EXCLUDED.fundamental_score,
        macro_score = EXCLUDED.macro_score,
        sector_score = EXCLUDED.sector_score,
        weather_score = EXCLUDED.weather_score,
        sentiment_score = EXCLUDED.sentiment_score,
        catalysts = EXCLUDED.catalysts,
        weather_factors = EXCLUDED.weather_factors`,
      [
        ticker,
        ticker,
        grade.grade,
        0,
        grade.action,
        live_price,
        grade.stopLoss,
        grade.entryPoint,
        (shares || 0) * (live_price || 0),
        shares || 0,
        grade.technical,
        grade.fundamental,
        grade.macro,
        grade.sector_score,
        grade.weather,
        grade.sentiment,
        grade.catalysts,
        grade.weather_factors,
      ]
    );

    return NextResponse.json({
      success: true,
      ticker,
      grade: grade.grade,
      action: grade.action,
      scores: {
        technical: grade.technical,
        fundamental: grade.fundamental,
        macro: grade.macro,
        sector: grade.sector_score,
        weather: grade.weather,
        sentiment: grade.sentiment,
      },
    });
  } catch (error: any) {
    console.error("Grade error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
