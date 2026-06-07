"use client";

import { useState, useEffect } from "react";
import { PageShell } from "@/components/vox-nav";
import { ShieldAlert, AlertTriangle, Bell } from "lucide-react";
import { fmtCurrency } from "@/lib/format";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/alerts");
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        setAlerts(json.alerts || []);
      } catch (e) {
        console.error("Failed to load alerts:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const severityIcon = (severity: string) => {
    if (severity === "high") return <AlertTriangle className="h-4 w-4 text-red-400" />;
    if (severity === "medium") return <Bell className="h-4 w-4 text-amber-400" />;
    return <Bell className="h-4 w-4 text-blue-400" />;
  };

  if (loading) {
    return (
      <PageShell>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        </PageShell>
    );
  }

  return (
    <PageShell>
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Alerts</h1>
          <p className="text-muted-foreground text-sm">{alerts.length} active alerts</p>
        </div>

        <div className="space-y-3">
          {alerts.map((a: any, i: number) => (
            <div
              key={i}
              className={`p-4 rounded-lg border ${
                a.severity === "high" ? "border-red-500/30 bg-red-500/5" :
                a.severity === "medium" ? "border-amber-500/30 bg-amber-500/5" :
                "border-blue-500/30 bg-blue-500/5"
              }`}
            >
              <div className="flex items-center gap-3">
                {severityIcon(a.severity)}
                <span className="font-mono font-semibold">{a.ticker}</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {new Date(a.timestamp).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm mt-2">{a.message}</p>
              <div className="flex gap-2 mt-2">
                <span className="text-xs px-2 py-1 rounded bg-background">{a.alert_type}</span>
                <span className="text-xs px-2 py-1 rounded bg-background">Grade: {a.grade}</span>
              </div>
            </div>
          ))}
        </div>
      </PageShell>
  );
}
