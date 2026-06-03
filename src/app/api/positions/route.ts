import { NextResponse } from "next/server";
import { getPositions } from "@/lib/db";

export async function GET() {
  try {
    const positions = await getPositions();
    return NextResponse.json({ positions });
  } catch (error) {
    console.error("Error fetching positions:", error);
    return NextResponse.json(
      { error: "Failed to fetch positions" },
      { status: 500 }
    );
  }
}
