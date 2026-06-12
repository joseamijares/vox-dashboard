import { NextResponse } from "next/server";
import { getPositions } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const positions = await getPositions();
    
    // Enrich with P&L calculations
    const enriched = positions.map((p: any) => {
      const avgCost = p.avg_cost || 0;
      const livePrice = p.live_price || 0;
      const shares = p.shares || 0;
      const liveValue = p.live_value || 0;
      
      let pnl = 0;
      let pnl_pct = 0;
      
      if (avgCost > 0 && shares > 0) {
        const costBasis = avgCost * shares;
        pnl = liveValue - costBasis;
        pnl_pct = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
      }
      
      return {
        ...p,
        pnl,
        pnl_pct: Math.round(pnl_pct * 100) / 100, // Round to 2 decimals
      };
    });
    
    return NextResponse.json({ positions: enriched });
  } catch (error) {
    console.error("Error fetching positions:", error);
    return NextResponse.json(
      { error: "Failed to fetch positions" },
      { status: 500 }
    );
  }
}
