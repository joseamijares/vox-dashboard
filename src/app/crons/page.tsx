"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MobileHeader } from "@/components/mobile-header";
import { Sidebar } from "@/components/sidebar";
import { useState, useEffect } from "react";
import { Clock, CheckCircle, XCircle, AlertCircle, Loader2, RefreshCw } from "lucide-react";

interface CronRun {
  id: number;
  job_name: string;
  status: string;
  started_at: string;
  finished_at: string | null;
  duration_ms: number | null;
  output: string | null;
  error: string | null;
}

const jobDescriptions: Record<string, string> = {
  "vox-daily-update": "Daily price update & alerts",
  "vox-premarket-briefing": "Premarket briefing",
  "vox-daily-top3-plays": "Top 3 plays scanner",
  "vox-alert-validator": "Alert validation",
  "vox-weather-agent": "Weather monitoring",
  "vox-geopolitical-agent": "Geopolitical risk",
  "vox-supply-chain-agent": "Supply chain monitor",
  "vox-cost-monitor": "API cost tracking",
  "vox-weekly-gbm-import": "GBM portfolio sync",
  "vox-institutional-ownership-monitor": "13F filings monitor",
  "vox-daily-obsidian-log": "Daily trader log",
  "vox-weekly-obsidian-summary": "Weekly summary",
  "vox-monthly-obsidian-summary": "Monthly summary",
  "vox-cron-health-monitor": "Cron health check",
};

export default function CronsPage() {
  const [runs, setRuns] = useState<CronRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchRuns() {
    try {
      const res = await fetch("/api/admin/cron-runs/latest");
      const data = await res.json();
      setRuns(data.jobs || []);
    } catch (e) {
      console.error("Failed to fetch cron runs:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchRuns();
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchRuns, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRuns();
  };

  const statusIcon = (status: string) => {
    const s = status?.toLowerCase() || "";
    if (s === "ok" || s === "success") return <CheckCircle className="h-4 w-4 text-green-400" />;
    if (s === "error" || s === "failed") return <XCircle className="h-4 w-4 text-red-400" />;
    if (s === "running") return <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />;
    return <AlertCircle className="h-4 w-4 text-amber-400" />;
  };

  const statusBadge = (status: string) => {
    const s = status?.toLowerCase() || "";
    if (s === "ok" || s === "success") return "bg-green-500/20 text-green-400 border-green-500/30";
    if (s === "error" || s === "failed") return "bg-red-500/20 text-red-400 border-red-500/30";
    if (s === "running") return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    return "bg-amber-500/20 text-amber-400 border-amber-500/30";
  };

  const formatTime = (iso: string) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const timeAgo = (iso: string) => {
    if (!iso) return "—";
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const okCount = runs.filter((r) => r.status === "ok" || r.status === "success").length;
  const errorCount = runs.filter((r) => r.status === "error" || r.status === "failed").length;
  const runningCount = runs.filter((r) => r.status === "running").length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pt-14 lg:pt-0">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading cron status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader />
      <Sidebar />
      <main className="pt-14 lg:pt-0 lg:ml-64 p-4 lg:p-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Clock className="h-6 w-6 text-primary" />
              Agent Status
            </h1>
            <p className="text-muted-foreground text-sm">
              {runs.length} cron jobs tracked | Last updated: {timeAgo(runs[0]?.started_at)}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-3 py-2 rounded-md bg-muted text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 text-sm"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="vox-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Healthy</p>
              <p className="text-2xl font-bold font-mono text-green-400">{okCount}</p>
            </CardContent>
          </Card>
          <Card className="vox-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Errors</p>
              <p className="text-2xl font-bold font-mono text-red-400">{errorCount}</p>
            </CardContent>
          </Card>
          <Card className="vox-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Running</p>
              <p className="text-2xl font-bold font-mono text-blue-400">{runningCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Cron Runs Table */}
        <Card className="vox-card">
          <CardHeader>
            <CardTitle>Agent Execution Log</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Agent</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Description</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Last Run</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Ago</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Duration</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Output</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.map((run) => (
                    <tr key={run.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="p-3">
                        <Badge variant="outline" className={statusBadge(run.status)}>
                          <span className="flex items-center gap-1">
                            {statusIcon(run.status)}
                            {run.status}
                          </span>
                        </Badge>
                      </td>
                      <td className="p-3 font-mono font-bold">{run.job_name}</td>
                      <td className="p-3 text-muted-foreground">
                        {jobDescriptions[run.job_name] || "—"}
                      </td>
                      <td className="p-3 font-mono text-xs">{formatTime(run.started_at)}</td>
                      <td className="p-3 text-muted-foreground">{timeAgo(run.started_at)}</td>
                      <td className="p-3 font-mono">
                        {run.duration_ms ? `${run.duration_ms}ms` : "—"}
                      </td>
                      <td className="p-3 text-muted-foreground text-xs max-w-xs truncate">
                        {run.error || run.output || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {runs.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No cron runs recorded yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
