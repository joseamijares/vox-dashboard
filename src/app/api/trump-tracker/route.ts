import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const TRACKER_DIR = path.join(process.env.HOME || "/Users/jos", ".hermes", "vox-agent", "scripts", "trump_tracker", "data");
const ALERTS_FILE = path.join(TRACKER_DIR, "alerts.json");
const STATE_FILE = path.join(TRACKER_DIR, "state.json");

export async function GET() {
  try {
    let alerts: any[] = [];
    let state: any = {};

    if (existsSync(ALERTS_FILE)) {
      const raw = await readFile(ALERTS_FILE, "utf-8");
      alerts = JSON.parse(raw);
    }
    if (existsSync(STATE_FILE)) {
      const raw = await readFile(STATE_FILE, "utf-8");
      state = JSON.parse(raw);
    }

    // Sort newest first
    alerts.sort((a, b) =>
      new Date(b.detected_at || b.created_at).getTime() -
      new Date(a.detected_at || a.created_at).getTime()
    );

    const unread = alerts.filter((a) => !a.read);
    const actionable = alerts.filter(
      (a) => !a.read && ["alert", "act"].includes(a.analysis?.action)
    );
    const highSeverity = alerts.filter(
      (a) => ["high", "critical"].includes(a.analysis?.severity)
    );

    return NextResponse.json({
      alerts,
      summary: {
        total: alerts.length,
        unread: unread.length,
        actionable: actionable.length,
        highSeverity: highSeverity.length,
        lastRun: state.last_run || null,
      },
    });
  } catch (error) {
    console.error("Error fetching trump tracker data:", error);
    return NextResponse.json(
      { error: "Failed to fetch trump tracker data", alerts: [], summary: {} },
      { status: 500 }
    );
  }
}
