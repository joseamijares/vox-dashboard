"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MobileHeader } from "@/components/mobile-header";
import { Sidebar } from "@/components/sidebar";
import { 
  Clock, Play, Pause, AlertTriangle, CheckCircle, 
  Calendar, Zap, Bell, Brain, Activity
} from "lucide-react";

interface CronJob {
  id: string;
  name: string;
  schedule: string;
  scheduleReadable: string;
  script: string;
  status: "active" | "paused";
  purpose: string;
  lastRun: string;
  nextRun: string;
  category: string;
  priority: "critical" | "high" | "medium" | "low";
}

const cronJobs: CronJob[] = [
  {
    id: "vox-alert-pipeline-unified",
    name: "Alert Pipeline v3",
    schedule: "0 9,12,15 * * 1-5",
    scheduleReadable: "9 AM, 12 PM, 3 PM CT (weekdays)",
    script: "vox_unified_pipeline_v3.sh",
    status: "active",
    purpose: "Live prices → Council → Cross-signal alerts → Telegram",
    lastRun: "—",
    nextRun: "3:00 PM CT",
    category: "Alerts",
    priority: "critical"
  },
  {
    id: "vox-research-orchestrator",
    name: "Research Orchestrator",
    schedule: "0 */4 * * *",
    scheduleReadable: "Every 4 hours",
    script: "vox_agentic_pipeline.sh",
    status: "active",
    purpose: "Full agentic pipeline: News → Trump → Reddit → X → Volume → Research → Debrief → Alerts → Supabase",
    lastRun: "—",
    nextRun: "4:00 PM CT",
    category: "Research",
    priority: "high"
  },
];

const pausedJobs: CronJob[] = [
  {
    id: "vox-autonomous-agent",
    name: "Autonomous Agent (old)",
    schedule: "0 */6 * * *",
    scheduleReadable: "Every 6 hours",
    script: "vox_autonomous_agent.py",
    status: "paused",
    purpose: "Legacy autonomous agent — superseded by research orchestrator",
    lastRun: "—",
    nextRun: "Paused",
    category: "Legacy",
    priority: "low"
  },
  {
    id: "vox-master-pipeline",
    name: "Master Pipeline (old)",
    schedule: "0 8,14,20 * * *",
    scheduleReadable: "8 AM, 2 PM, 8 PM",
    script: "vox_master_pipeline.sh",
    status: "paused",
    purpose: "Legacy pipeline — superseded by unified pipeline",
    lastRun: "—",
    nextRun: "Paused",
    category: "Legacy",
    priority: "low"
  },
  {
    id: "vox-data-validator",
    name: "Data Validator",
    schedule: "0 */3 * * *",
    scheduleReadable: "Every 3 hours",
    script: "vox_data_validator.py",
    status: "paused",
    purpose: "Validates data freshness — integrated into main pipeline",
    lastRun: "—",
    nextRun: "Paused",
    category: "Maintenance",
    priority: "medium"
  },
  {
    id: "vox-trade-scorer",
    name: "Trade Scorer",
    schedule: "0 10 * * 1-5",
    scheduleReadable: "10 AM weekdays",
    script: "vox_trade_scorer.py",
    status: "paused",
    purpose: "Scores trade setups — integrated into research pipeline",
    lastRun: "—",
    nextRun: "Paused",
    category: "Analysis",
    priority: "medium"
  },
  {
    id: "vox-suggested-plays",
    name: "Suggested Plays",
    schedule: "0 9 * * 1-5",
    scheduleReadable: "9 AM weekdays",
    script: "vox_suggested_plays.py",
    status: "paused",
    purpose: "Generates play ideas — integrated into research pipeline",
    lastRun: "—",
    nextRun: "Paused",
    category: "Analysis",
    priority: "medium"
  },
  {
    id: "vox-morning-commander",
    name: "Morning Commander",
    schedule: "0 8 * * 1-5",
    scheduleReadable: "8 AM weekdays",
    script: "vox_morning_commander.py",
    status: "paused",
    purpose: "Morning briefing — superseded by debrief agent",
    lastRun: "—",
    nextRun: "Paused",
    category: "Legacy",
    priority: "low"
  },
  {
    id: "vox-evening-commander",
    name: "Evening Commander",
    schedule: "0 18 * * 1-5",
    scheduleReadable: "6 PM weekdays",
    script: "vox_evening_commander.py",
    status: "paused",
    purpose: "Evening summary — superseded by debrief agent",
    lastRun: "—",
    nextRun: "Paused",
    category: "Legacy",
    priority: "low"
  },
  {
    id: "vox-autonomous-screener",
    name: "Autonomous Screener",
    schedule: "0 10 * * 1-5",
    scheduleReadable: "10 AM weekdays",
    script: "vox_autonomous_screener.py",
    status: "paused",
    purpose: "Screens for opportunities — integrated into screener tool",
    lastRun: "—",
    nextRun: "Paused",
    category: "Analysis",
    priority: "medium"
  },
  {
    id: "vox-daily-rotation",
    name: "Daily Rotation",
    schedule: "0 9 * * 1-5",
    scheduleReadable: "9 AM weekdays",
    script: "vox_daily_rotation.py",
    status: "paused",
    purpose: "Sector rotation signals — integrated into sector agent",
    lastRun: "—",
    nextRun: "Paused",
    category: "Analysis",
    priority: "medium"
  },
  {
    id: "vox-daily-briefing",
    name: "Daily Briefing",
    schedule: "0 8 * * *",
    scheduleReadable: "8 AM daily",
    script: "vox_daily_briefing.py",
    status: "paused",
    purpose: "Daily market briefing — superseded by debrief agent",
    lastRun: "—",
    nextRun: "Paused",
    category: "Legacy",
    priority: "low"
  },
  {
    id: "vox-position-review",
    name: "Position Review",
    schedule: "0 16 * * 5",
    scheduleReadable: "4 PM Fridays",
    script: "vox_position_review.py",
    status: "paused",
    purpose: "Weekly position review — integrated into research pipeline",
    lastRun: "—",
    nextRun: "Paused",
    category: "Analysis",
    priority: "medium"
  },
  {
    id: "vox-market-regime",
    name: "Market Regime",
    schedule: "0 */6 * * *",
    scheduleReadable: "Every 6 hours",
    script: "vox_market_regime.py",
    status: "paused",
    purpose: "Regime detection — integrated into macro agent",
    lastRun: "—",
    nextRun: "Paused",
    category: "Analysis",
    priority: "medium"
  },
  {
    id: "vox-sector-scan-weekly",
    name: "Sector Scan Weekly",
    schedule: "0 9 * * 1",
    scheduleReadable: "9 AM Mondays",
    script: "vox_sector_scan.py",
    status: "paused",
    purpose: "Weekly sector scan — integrated into sector agent",
    lastRun: "—",
    nextRun: "Paused",
    category: "Analysis",
    priority: "medium"
  },
  {
    id: "volume-scan-daily",
    name: "Volume Scan Daily",
    schedule: "0 10 * * 1-5",
    scheduleReadable: "10 AM weekdays",
    script: "vox_volume_scanner.py",
    status: "paused",
    purpose: "Volume scan — integrated into volume intelligence agent",
    lastRun: "—",
    nextRun: "Paused",
    category: "Analysis",
    priority: "medium"
  },
  {
    id: "trump-tweet-tracker",
    name: "Trump Tweet Tracker",
    schedule: "0 */2 * * *",
    scheduleReadable: "Every 2 hours",
    script: "vox_trump_tracker.py",
    status: "paused",
    purpose: "Trump tracking — superseded by Trump agent",
    lastRun: "—",
    nextRun: "Paused",
    category: "Legacy",
    priority: "low"
  },
  {
    id: "x-momentum-daily",
    name: "X Momentum Daily",
    schedule: "0 12 * * 1-5",
    scheduleReadable: "12 PM weekdays",
    script: "x_momentum_tracker.py",
    status: "paused",
    purpose: "X momentum — superseded by X intelligence agent",
    lastRun: "—",
    nextRun: "Paused",
    category: "Legacy",
    priority: "low"
  },
  {
    id: "openclaw-pipeline",
    name: "OpenClaw Pipeline",
    schedule: "0 */4 * * *",
    scheduleReadable: "Every 4 hours",
    script: "openclaw_pipeline.sh",
    status: "paused",
    purpose: "Legacy pipeline — not used",
    lastRun: "—",
    nextRun: "Paused",
    category: "Legacy",
    priority: "low"
  },
  {
    id: "weekly-portfolio",
    name: "Weekly Portfolio",
    schedule: "0 9 * * 1",
    scheduleReadable: "9 AM Mondays",
    script: "vox_weekly_portfolio.py",
    status: "paused",
    purpose: "Weekly portfolio — integrated into research pipeline",
    lastRun: "—",
    nextRun: "Paused",
    category: "Analysis",
    priority: "medium"
  },
  {
    id: "vox-dashboard-refresh",
    name: "Dashboard Refresh",
    schedule: "0 */2 * * *",
    scheduleReadable: "Every 2 hours",
    script: "vox_dashboard_refresh.py",
    status: "paused",
    purpose: "Dashboard data refresh — integrated into pipeline",
    lastRun: "—",
    nextRun: "Paused",
    category: "Maintenance",
    priority: "medium"
  },
  {
    id: "vox-weekly-snapshot",
    name: "Weekly Snapshot",
    schedule: "0 9 * * 1",
    scheduleReadable: "9 AM Mondays",
    script: "vox_weekly_snapshot.py",
    status: "paused",
    purpose: "Weekly snapshot — integrated into research pipeline",
    lastRun: "—",
    nextRun: "Paused",
    category: "Analysis",
    priority: "medium"
  },
  {
    id: "vox-weekly-report",
    name: "Weekly Report",
    schedule: "0 9 * * 1",
    scheduleReadable: "9 AM Mondays",
    script: "vox_weekly_report.py",
    status: "paused",
    purpose: "Weekly report — integrated into research pipeline",
    lastRun: "—",
    nextRun: "Paused",
    category: "Analysis",
    priority: "medium"
  },
  {
    id: "vox-monthly-report",
    name: "Monthly Report",
    schedule: "0 9 1 * *",
    scheduleReadable: "9 AM 1st of month",
    script: "vox_monthly_report.py",
    status: "paused",
    purpose: "Monthly report — integrated into research pipeline",
    lastRun: "—",
    nextRun: "Paused",
    category: "Analysis",
    priority: "medium"
  },
  {
    id: "vox-daily-snapshot",
    name: "Daily Snapshot",
    schedule: "0 9 * * *",
    scheduleReadable: "9 AM daily",
    script: "vox_daily_snapshot.py",
    status: "paused",
    purpose: "Daily snapshot — integrated into research pipeline",
    lastRun: "—",
    nextRun: "Paused",
    category: "Analysis",
    priority: "medium"
  },
  {
    id: "weekly-portfolio-brief",
    name: "Weekly Portfolio Brief",
    schedule: "0 9 * * 1",
    scheduleReadable: "9 AM Mondays",
    script: "vox_weekly_portfolio_brief.py",
    status: "paused",
    purpose: "Weekly brief — integrated into research pipeline",
    lastRun: "—",
    nextRun: "Paused",
    category: "Analysis",
    priority: "medium"
  },
  {
    id: "weekly-portfolio-snapshot",
    name: "Weekly Portfolio Snapshot",
    schedule: "0 9 * * 1",
    scheduleReadable: "9 AM Mondays",
    script: "vox_weekly_portfolio_snapshot.py",
    status: "paused",
    purpose: "Weekly snapshot — integrated into research pipeline",
    lastRun: "—",
    nextRun: "Paused",
    category: "Analysis",
    priority: "medium"
  },
  {
    id: "daily-market-brief",
    name: "Daily Market Brief",
    schedule: "0 8 * * 1-5",
    scheduleReadable: "8 AM weekdays",
    script: "vox_daily_market_brief.py",
    status: "paused",
    purpose: "Market brief — superseded by debrief agent",
    lastRun: "—",
    nextRun: "Paused",
    category: "Legacy",
    priority: "low"
  },
  {
    id: "evening-market-close",
    name: "Evening Market Close",
    schedule: "0 16 * * 1-5",
    scheduleReadable: "4 PM weekdays",
    script: "vox_evening_market_close.py",
    status: "paused",
    purpose: "Market close summary — superseded by debrief agent",
    lastRun: "—",
    nextRun: "Paused",
    category: "Legacy",
    priority: "low"
  },
  {
    id: "vox-weekly-summary",
    name: "Weekly Summary",
    schedule: "0 9 * * 1",
    scheduleReadable: "9 AM Mondays",
    script: "vox_weekly_summary.py",
    status: "paused",
    purpose: "Weekly summary — integrated into research pipeline",
    lastRun: "—",
    nextRun: "Paused",
    category: "Analysis",
    priority: "medium"
  },
  {
    id: "vox-weekly-review",
    name: "Weekly Review",
    schedule: "0 9 * * 1",
    scheduleReadable: "9 AM Mondays",
    script: "vox_weekly_review.py",
    status: "paused",
    purpose: "Weekly review — integrated into research pipeline",
    lastRun: "—",
    nextRun: "Paused",
    category: "Analysis",
    priority: "medium"
  },
];

export default function CronsPage() {
  const activeJobs = cronJobs.filter(j => j.status === "active");
  const pausedJobsList = pausedJobs;

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader />
      <Sidebar />
      <main className="pt-14 lg:pt-0 lg:ml-64 p-4 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Clock className="h-6 w-6 text-primary" />
            Cron Job Monitor
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {activeJobs.length} active • {pausedJobsList.length} paused • 2 pipelines running
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="vox-card">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-400">{activeJobs.length}</div>
              <div className="text-xs text-muted-foreground">Active Jobs</div>
            </CardContent>
          </Card>
          <Card className="vox-card">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-400">{pausedJobsList.length}</div>
              <div className="text-xs text-muted-foreground">Paused Jobs</div>
            </CardContent>
          </Card>
          <Card className="vox-card">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">{cronJobs.length + pausedJobsList.length}</div>
              <div className="text-xs text-muted-foreground">Total Jobs</div>
            </CardContent>
          </Card>
          <Card className="vox-card">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-400">2</div>
              <div className="text-xs text-muted-foreground">Pipelines</div>
            </CardContent>
          </Card>
        </div>

        {/* Active Jobs */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-green-400" />
            Active Jobs
          </h2>
          
          <div className="grid gap-4">
            {activeJobs.map(job => (
              <Card key={job.id} className="vox-card border-l-4 border-l-green-400">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{job.name}</h3>
                        <Badge variant="default" className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                        <Badge variant={job.priority === "critical" ? "destructive" : "outline"} className="text-xs">
                          {job.priority}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">{job.purpose}</p>
                      
                      <div className="flex flex-wrap gap-3 mt-3 text-xs">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {job.scheduleReadable}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          Next: {job.nextRun}
                        </span>
                      </div>
                      
                      <code className="text-xs bg-muted px-2 py-1 rounded mt-2 inline-block">
                        {job.script}
                      </code>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Pipeline Architecture */}
        <Card className="vox-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Pipeline Architecture
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Bell className="h-4 w-4 text-primary" />
                  Alert Pipeline (3x daily)
                </h4>
                <div className="flex flex-wrap items-center gap-2 text-sm pl-6">
                  <Badge variant="outline">9 AM CT</Badge>
                  <span className="text-muted-foreground">→</span>
                  <Badge variant="outline">Live Prices</Badge>
                  <span className="text-muted-foreground">→</span>
                  <Badge variant="outline">Council</Badge>
                  <span className="text-muted-foreground">→</span>
                  <Badge variant="outline">Alerts v8</Badge>
                  <span className="text-muted-foreground">→</span>
                  <Badge variant="default">Telegram</Badge>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm pl-6 mt-1">
                  <Badge variant="outline">12 PM CT</Badge>
                  <span className="text-muted-foreground">→</span>
                  <Badge variant="outline">Same</Badge>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm pl-6 mt-1">
                  <Badge variant="outline">3 PM CT</Badge>
                  <span className="text-muted-foreground">→</span>
                  <Badge variant="outline">Same + Daily Digest</Badge>
                </div>
              </div>
              
              <div className="border-t border-border pt-4">
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" />
                  Research Pipeline (every 4h)
                </h4>
                <div className="flex flex-wrap items-center gap-2 text-sm pl-6">
                  <Badge variant="outline">Prices</Badge>
                  <span className="text-muted-foreground">→</span>
                  <Badge variant="outline">News</Badge>
                  <span className="text-muted-foreground">→</span>
                  <Badge variant="outline">Trump</Badge>
                  <span className="text-muted-foreground">→</span>
                  <Badge variant="outline">Reddit</Badge>
                  <span className="text-muted-foreground">→</span>
                  <Badge variant="outline">X</Badge>
                  <span className="text-muted-foreground">→</span>
                  <Badge variant="outline">Volume</Badge>
                  <span className="text-muted-foreground">→</span>
                  <Badge variant="outline">Research</Badge>
                  <span className="text-muted-foreground">→</span>
                  <Badge variant="outline">Debrief</Badge>
                  <span className="text-muted-foreground">→</span>
                  <Badge variant="default">Supabase</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Paused Jobs */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Pause className="h-5 w-5 text-yellow-400" />
            Paused Jobs ({pausedJobsList.length})
          </h2>
          
          <div className="grid gap-2">
            {pausedJobsList.map(job => (
              <Card key={job.id} className="vox-card opacity-60">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium">{job.name}</h3>
                      <Badge variant="secondary" className="text-xs">
                        <Pause className="h-3 w-3 mr-1" />
                        Paused
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">{job.scheduleReadable}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{job.purpose}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
