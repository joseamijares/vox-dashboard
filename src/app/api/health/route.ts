import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "vox-dashboard",
    version: "12.0",
    timestamp: new Date().toISOString(),
  });
}
