"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/vox-nav";
import { VoxBadge, VoxError, VoxKpi, VoxLoading } from "@/components/vox";
import { cn } from "@/lib/utils";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/alerts");
      if (!res.ok) throw new Error("Failed to fetch alerts");
      const json = await res.json();
      setAlerts(json.alerts || []);
    } catch (e: any) {
      setError(e.message || "Failed to load alerts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const high = alerts.filter(
    (a) => (a.severity || "").toLowerCase() === "high" || (a.severity || "").toLowerCase() === "critical"
  );

  if (loading) {
    return (
      <PageShell title="Alerts" subtitle="Grade swings · material only">
        <VoxLoading text="Loading alerts…" />
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell title="Alerts">
        <VoxError message={error} onRetry={load} />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Alerts"
      subtitle={`${alerts.length} recent · high/critical weighted for action`}
    >
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        <VoxKpi label="Total" value={alerts.length} />
        <VoxKpi label="High/critical" value={high.length} />
        <VoxKpi
          label="Policy"
          value="≥2.5%"
          sub="position weight for P&L actions"
        />
      </div>

      <div className="space-y-2">
        {alerts.map((a, i) => {
          const sev = (a.severity || "medium").toLowerCase();
          return (
            <div
              key={`${a.ticker}-${a.timestamp}-${i}`}
              className={cn(
                "vox-surface p-4",
                sev === "high" || sev === "critical"
                  ? "ring-1 ring-[color:var(--vox-loss)]/20"
                  : ""
              )}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono font-semibold text-sm">
                  {a.ticker || "—"}
                </span>
                <VoxBadge
                  variant={
                    sev === "high" || sev === "critical"
                      ? "loss"
                      : sev === "medium"
                        ? "warning"
                        : "info"
                  }
                >
                  {sev}
                </VoxBadge>
                {a.grade != null && (
                  <VoxBadge grade={a.grade} variant="grade">
                    {a.grade}
                  </VoxBadge>
                )}
                <span className="text-xs text-muted-foreground ml-auto">
                  {a.timestamp
                    ? new Date(a.timestamp).toLocaleString()
                    : "—"}
                </span>
              </div>
              <p className="text-sm mt-2 text-foreground/90">
                {a.message || "—"}
              </p>
              <div className="flex gap-2 mt-2 text-[11px] text-muted-foreground">
                <span className="rounded-full bg-muted px-2 py-0.5">
                  {a.alert_type || "alert"}
                </span>
                {a.council && (
                  <span className="rounded-full bg-muted px-2 py-0.5">
                    {a.council}
                  </span>
                )}
              </div>
            </div>
          );
        })}
        {!alerts.length && (
          <div className="vox-surface p-8 text-center text-sm text-muted-foreground">
            No active alerts — quiet is good
          </div>
        )}
      </div>
    </PageShell>
  );
}
