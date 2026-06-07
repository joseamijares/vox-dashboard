"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageShell } from "@/components/vox-nav";
import { VoxLoading, VoxError, VoxTable } from "@/components/vox";
import { useEffect, useState } from "react";
import { RefreshCw, AlertTriangle, CheckCircle, XCircle, Clock, Wallet } from "lucide-react";
import { fmtCurrency } from "@/lib/format";

interface BrokerHealth {
  status: string;
  duration_ms?: number;
  error?: string;
  timestamp: string;
}

interface BrokerStatus {
  value: number;
  status: string;
  stale: boolean;
  currency: string;
  last_updated?: string;
  position_count: number;
}

interface BrokerData {
  timestamp: string;
  total_value: number;
  total_pnl: number;
  broker_breakdown: Record<string, number>;
  broker_status: Record<string, BrokerStatus>;
  health?: {
    overall: string;
    healthy_count: number;
    total_count: number;
    checks: Record<string, BrokerHealth>;
  };
}

export default function BrokersPage() {
  const [data, setData] = useState<BrokerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchData = async () => {
    try {
      const res = await fetch("/data/dashboard_positions_live.json?t=" + Date.now());
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setLastRefresh(new Date());
      }
    } catch (e) {
      console.error("Failed to fetch broker data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "—";
    }
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return "—";
    }
  };

  const getStatusIcon = (status: string, stale: boolean) => {
    if (stale) return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
    if (status === "connected") return <CheckCircle className="h-4 w-4 text-green-400" />;
    if (status === "manual") return <Clock className="h-4 w-4 text-blue-400" />;
    return <XCircle className="h-4 w-4 text-red-400" />;
  };

  const getStatusColor = (status: string, stale: boolean) => {
    if (stale) return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    if (status === "connected") return "bg-green-500/10 text-green-400 border-green-500/20";
    if (status === "manual") return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    return "bg-red-500/10 text-red-400 border-red-500/20";
  };

  const brokerNames: Record<string, string> = {
    etoro: "eToro",
    binance: "Binance",
    gbm_main: "GBM Plus (Main)",
    gbm_usa: "GBM Plus (USA)",
    schwab: "Charles Schwab",
    ibkr: "Interactive Brokers",
    revolut: "Revolut",
    bitso: "Bitso",
  };

  if (loading) {
    return (
      <PageShell>
        <VoxLoading text="Loading broker data..." />
      </PageShell>
    );
  }

  if (!data) {
    return (
      <PageShell>
        <VoxError 
          message="No broker data available. Run broker sync to populate data." 
          onRetry={fetchData}
        />
      </PageShell>
    );
  }

  const brokers = data.broker_status || {};
  const health = data.health;
  const totalValue = data.total_value || 0;
  const totalPnl = data.total_pnl || 0;

  return (
    <PageShell>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Broker Sync</h1>
              <p className="text-muted-foreground text-sm">
                Live portfolio aggregation across all brokers
              </p>
            </div>
            <button
              onClick={fetchData}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              title="Refresh now"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Last refresh: {formatDate(lastRefresh.toISOString())} {formatTime(lastRefresh.toISOString())}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="vox-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Total AUM</p>
              <p className="text-xl font-bold font-mono">${totalValue.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="vox-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Total P&L</p>
              <p className={`text-xl font-bold font-mono ${totalPnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                {totalPnl >= 0 ? "+" : ""}${totalPnl.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card className="vox-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Brokers</p>
              <p className="text-xl font-bold">{Object.keys(brokers).length}</p>
            </CardContent>
          </Card>
          <Card className="vox-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Health</p>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${health?.overall === "healthy" ? "bg-green-400" : health?.overall === "degraded" ? "bg-yellow-400" : "bg-red-400"}`} />
                <p className="text-xl font-bold capitalize">{health?.overall || "unknown"}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Broker Status Grid */}
        <h2 className="text-lg font-semibold mb-4">Broker Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {Object.entries(brokers).map(([key, broker]) => (
            <Card key={key} className="vox-card">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <Wallet className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{brokerNames[key] || key}</h3>
                      <p className="text-xs text-muted-foreground">
                        {broker.position_count} positions
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className={getStatusColor(broker.status, broker.stale)}>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(broker.status, broker.stale)}
                      {broker.stale ? "STALE" : broker.status.toUpperCase()}
                    </span>
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Value</p>
                    <p className="font-mono font-semibold">
                      ${broker.value.toLocaleString()}
                      {broker.currency === "MXN" && (
                        <span className="text-muted-foreground text-xs ml-1">MXN</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Last Updated</p>
                    <p className="font-mono">
                      {broker.last_updated ? formatTime(broker.last_updated) : "—"}
                    </p>
                  </div>
                </div>

                {health?.checks?.[key] && (
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <div className="flex items-center justify-between text-xs">
                      <span className={`${health.checks[key].status === "healthy" ? "text-green-400" : "text-red-400"}`}>
                        {health.checks[key].status === "healthy" ? "✓" : "✗"} Health check
                      </span>
                      <span className="text-muted-foreground">
                        {health.checks[key].duration_ms}ms
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Health Details */}
        {health && (
          <>
            <h2 className="text-lg font-semibold mb-4">Health Checks</h2>
            <VoxTable
              data={Object.entries(health.checks).map(([name, check]) => ({
                name: brokerNames[name] || name,
                status: check.status,
                duration: check.duration_ms,
                checkedAt: check.timestamp,
              }))}
              columns={[
                { key: "name", header: "Broker", accessor: (r: any) => <span className="font-semibold">{r.name}</span> },
                { key: "status", header: "Status", accessor: (r: any) => (
                  <Badge variant="outline" className={r.status === "healthy" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}>
                    {r.status === "healthy" ? "✓" : "✗"} {r.status}
                  </Badge>
                )},
                { key: "duration", header: "Response Time", accessor: (r: any) => <span className="font-mono">{r.duration ? `${r.duration}ms` : "—"}</span>, align: "right" },
                { key: "checkedAt", header: "Checked At", accessor: (r: any) => <span className="text-muted-foreground">{formatTime(r.checkedAt)}</span>, align: "right" },
              ]}
              keyExtractor={(r: any) => r.name}
              searchable={false}
              pageSize={10}
            />
          </>
        )}

        {/* Sync Schedule */}
        <h2 className="text-lg font-semibold mb-4">Sync Schedule</h2>
        <Card className="vox-card">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-sm">Pre-Market Sync</span>
                </div>
                <span className="text-sm text-muted-foreground">7:00 AM CT</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-sm">Midday Sync</span>
                </div>
                <span className="text-sm text-muted-foreground">12:00 PM CT</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                  <span className="text-sm">Alert Pipeline</span>
                </div>
                <span className="text-sm text-muted-foreground">9/12/15 CT</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-purple-400" />
                  <span className="text-sm">Research Orchestrator</span>
                </div>
                <span className="text-sm text-muted-foreground">Every 4 hours</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </PageShell>
  );
}
