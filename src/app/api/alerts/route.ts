import { NextResponse } from "next/server";
import { getAlerts } from "@/lib/db";

export async function GET() {
  try {
    const alerts = await getAlerts();
    return NextResponse.json({ alerts });
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return NextResponse.json(
      { error: "Failed to fetch alerts" },
      { status: 500 }
    );
  }
}
