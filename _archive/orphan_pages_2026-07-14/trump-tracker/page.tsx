"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/vox-nav";
import { VoxCard, VoxBadge } from "@/components/vox-card";
import { VoxLoading, VoxError } from "@/components/vox";
import { getGradeStyle } from "@/lib/design-system";
import {
  Megaphone,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Minus,
  ExternalLink,
  RefreshCw,
  Clock,
  CheckCircle2,
  Bell,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Alert {
  id: string;
  post_id: string;
  author: string;
  text: string;
  post_url: string;
  created_at: string;
  detected_at: string;
  read: boolean;
  analysis: {
    market_moving: boolean;
    direction: "bullish" | "bearish" | "neutral";
    severity: "low" | "medium" | "high" | "critical";
    sectors_affected: string[];
    tickers_mentioned: string[];
    tickers_at_risk: string[];
    summary: string;
    action: "monitor" | "alert" | "act";
    reasoning: string;
  };
}

export default function TrumpTrackerPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetch("/api/trump-tracker");
      const json = await res.json();
      setAlerts(json.alerts || []);
      setSummary(json.summary || {});
    } catch (e) {
      setError("Failed to load tracker data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <VoxLoading />;
  if (error) return <VoxError message={error} onRetry={loadData} />;

  const severityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <ShieldAlert className="h-4 w-4 text-red-500" />;
      case "high":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case "medium":
        return <Bell className="h-4 w-4 text-amber-500" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const directionIcon = (direction: string) => {
    switch (direction) {
      case "bullish":
        return <TrendingUp className="h-4 w-4 text-emerald-500" />;
      case "bearish":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const severityStyle = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-900";
      case "high":
        return "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-300 dark:border-orange-900";
      case "medium":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-300 dark:border-slate-800";
    }
  };

  const actionStyle = (action: string) => {
    switch (action) {
      case "act":
        return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200";
      case "alert":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200";
    }
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

  const unreadAlerts = alerts.filter((a) => !a.read);
  const actionableAlerts = alerts.filter(
    (a) => !a.read && ["alert", "act"].includes(a.analysis?.action)
  );

  return (
    <PageShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Trump Tracker</h1>
        <p className="text-sm text-muted-foreground">
          Monitor Trump posts for market-moving signals
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <VoxCard>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Megaphone className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-semibold">{summary.total || 0}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Total Alerts</div>
            </div>
          </div>
        </VoxCard>
        <VoxCard>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Bell className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <div className="text-2xl font-semibold">{summary.unread || 0}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Unread</div>
            </div>
          </div>
        </VoxCard>
        <VoxCard>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <div className="text-2xl font-semibold">{summary.actionable || 0}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Actionable</div>
            </div>
          </div>
        </VoxCard>
        <VoxCard>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <div className="text-sm font-medium">{summary.lastRun ? formatTime(summary.lastRun) : "Never"}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Last Run</div>
            </div>
          </div>
        </VoxCard>
      </div>

      {/* Actionable banner */}
      {actionableAlerts.length > 0 && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:bg-red-950/20 dark:border-red-900">
          <div className="flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <div className="font-semibold text-red-900 dark:text-red-200">
                {actionableAlerts.length} actionable alert{actionableAlerts.length > 1 ? "s" : ""} requiring attention
              </div>
              <div className="text-sm text-red-700 dark:text-red-300 mt-1">
                Trump posts flagged as market-moving with portfolio exposure detected.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alerts feed */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Alert Feed</h2>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 rounded-md bg-secondary px-3 py-1.5 text-sm font-medium hover:bg-secondary/80 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {alerts.length === 0 ? (
        <VoxCard className="py-12 text-center">
          <Megaphone className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
          <div className="text-lg font-medium">No alerts yet</div>
          <div className="text-sm text-muted-foreground mt-1">
            The tracker runs every 15 minutes. Alerts will appear here when Trump posts about your sectors or holdings.
          </div>
        </VoxCard>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <VoxCard
              key={alert.id}
              className={cn(
                "transition-opacity",
                alert.read && "opacity-60"
              )}
            >
              <div className="flex flex-col gap-3">
                {/* Header */}
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                      severityStyle(alert.analysis?.severity)
                    )}
                  >
                    {severityIcon(alert.analysis?.severity)}
                    {alert.analysis?.severity?.toUpperCase()}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                      actionStyle(alert.analysis?.action)
                    )}
                  >
                    {alert.analysis?.action === "act" && <ShieldAlert className="h-3.5 w-3.5" />}
                    {alert.analysis?.action === "alert" && <Bell className="h-3.5 w-3.5" />}
                    {alert.analysis?.action === "monitor" && <CheckCircle2 className="h-3.5 w-3.5" />}
                    {alert.analysis?.action?.toUpperCase()}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">
                    {directionIcon(alert.analysis?.direction)}
                    {alert.analysis?.direction?.toUpperCase()}
                  </span>
                  {!alert.read && (
                    <span className="ml-auto inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-900/40 dark:text-blue-200">
                      NEW
                    </span>
                  )}
                </div>

                {/* Tweet text */}
                <div className="text-[15px] leading-relaxed text-foreground">
                  {alert.text}
                </div>

                {/* AI Summary */}
                <div className="rounded-md bg-secondary/50 p-3 text-sm">
                  <div className="font-medium text-foreground mb-1">VOX Analysis</div>
                  <div className="text-muted-foreground">{alert.analysis?.summary}</div>
                  <div className="text-muted-foreground mt-1 italic">{alert.analysis?.reasoning}</div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {alert.analysis?.sectors_affected?.map((sector) => (
                    <span
                      key={sector}
                      className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                      {sector}
                    </span>
                  ))}
                  {alert.analysis?.tickers_at_risk?.map((ticker) => (
                    <span
                      key={ticker}
                      className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-semibold text-red-700 dark:bg-red-950/30 dark:text-red-300"
                    >
                      ⚠ {ticker}
                    </span>
                  ))}
                  {alert.analysis?.tickers_mentioned?.map((ticker) => (
                    <span
                      key={ticker}
                      className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950/30 dark:text-blue-300"
                    >
                      {ticker}
                    </span>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="text-xs text-muted-foreground">
                    Detected {formatTime(alert.detected_at)} · Posted {formatTime(alert.created_at)}
                  </div>
                  <a
                    href={alert.post_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    View on X
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </VoxCard>
          ))}
        </div>
      )}
    </PageShell>
  );
}
