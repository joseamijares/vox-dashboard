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

    const ep = entry_price !== undefined ? entry_price : null;
    const tp = target_price !== undefined ? target_price : null;
    const sl = stop_loss !== undefined ? stop_loss : null;

    await query(
      `UPDATE watchlist SET entry_price = $1, target_price = $2, stop_loss = $3 WHERE ticker = $4`,
      [ep, tp, sl, ticker]
    );

    return NextResponse.json({ success: true, ticker, entry_price: ep, target_price: tp, stop_loss: sl });
  } catch (error) {
    console.error("Error updating watchlist targets:", error);
    return NextResponse.json(
      { error: "Failed to update watchlist targets: " + (error as Error).message },
      { status: 500 }
    );
  }
}
