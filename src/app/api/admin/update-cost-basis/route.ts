import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ticker, avg_cost } = body;

    if (!ticker || avg_cost === undefined) {
      return NextResponse.json(
        { error: "Missing ticker or avg_cost" },
        { status: 400 }
      );
    }

    await query(
      `UPDATE positions SET avg_cost = $1, updated_at = NOW() WHERE ticker = $2`,
      [avg_cost, ticker]
    );

    return NextResponse.json({ success: true, ticker, avg_cost });
  } catch (error) {
    console.error("Error updating cost basis:", error);
    return NextResponse.json(
      { error: "Failed to update cost basis" },
      { status: 500 }
    );
  }
}
