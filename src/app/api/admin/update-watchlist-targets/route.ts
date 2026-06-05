import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ticker, entry_price, target_price, stop_loss } = body;

    if (!ticker) {
      return NextResponse.json(
        { error: "Missing ticker" },
        { status: 400 }
      );
    }

    await query(
      `UPDATE watchlist SET entry_price = $1, target_price = $2, stop_loss = $3, updated_at = NOW() WHERE ticker = $4`,
      [entry_price ?? null, target_price ?? null, stop_loss ?? null, ticker]
    );

    return NextResponse.json({ success: true, ticker, entry_price, target_price, stop_loss });
  } catch (error) {
    console.error("Error updating watchlist targets:", error);
    return NextResponse.json(
      { error: "Failed to update watchlist targets" },
      { status: 500 }
    );
  }
}
