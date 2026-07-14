import { NextResponse } from "next/server";
import { getBrokerBook } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const brokers = await getBrokerBook();
    return NextResponse.json({ brokers });
  } catch (error) {
    console.error("Error fetching brokers:", error);
    return NextResponse.json(
      { error: "Failed to fetch brokers" },
      { status: 500 }
    );
  }
}
