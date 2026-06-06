import { NextResponse } from "next/server";

// This endpoint proxies cron job status from the Hermes cron system
// In production, this would query the Railway Postgres cron_runs table
// For now, returns mock data structure that the frontend expects

const CRON_JOBS = [
  { name: "vox-daily-update", schedule: "0 9 * * *", description: "Daily price update & alerts" },
  { name: "vox-premarket-briefing", schedule: "30 8 * * 1-5", description: "Premarket briefing" },
  { name: "vox-daily-top3-plays", schedule: "0 7 * * *", description: "Top 3 plays scanner" },
  { name: "vox-alert-validator", schedule: "0 8,12,16 * * 1-5", description: "Alert validation" },
  { name: "vox-weather-agent", schedule: "every 240m", description: "Weather monitoring" },
  { name: "vox-geopolitical-agent", schedule: "every 240m", description: "Geopolitical risk" },
  { name: "vox-supply-chain-agent", schedule: "every 240m", description: "Supply chain monitor" },
  { name: "vox-cost-monitor", schedule: "0 9 * * *", description: "API cost tracking" },
  { name: "vox-weekly-gbm-import", schedule: "0 9 * * 1", description: "GBM portfolio sync" },
  { name: "vox-institutional-ownership-monitor", schedule: "0 9 * * 1", description: "13F filings monitor" },
  { name: "vox-daily-obsidian-log", schedule: "0 8 * * *", description: "Daily trader log" },
  { name: "vox-weekly-obsidian-summary", schedule: "0 9 * * 1", description: "Weekly summary" },
  { name: "vox-monthly-obsidian-summary", schedule: "0 10 1 * *", description: "Monthly summary" },
  { name: "vox-cron-health-monitor", schedule: "0 7 * * *", description: "Cron health check" },
];

export async function GET() {
  try {
    // In a full implementation, this would query a cron_runs table in Postgres
    // For now, return the job definitions with placeholder last_run
    const jobs = CRON_JOBS.map(job => ({
      ...job,
      last_run: null, // Would come from DB
      status: "unknown",
      next_run: null,
    }));

    return NextResponse.json({ jobs, count: jobs.length });
  } catch (error) {
    console.error("Error fetching cron status:", error);
    return NextResponse.json(
      { error: "Failed to fetch cron status" },
      { status: 500 }
    );
  }
}
