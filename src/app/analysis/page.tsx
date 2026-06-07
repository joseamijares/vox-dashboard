"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageShell } from "@/components/vox-nav";
import { VoxLoading, VoxError, VoxKpi, VoxBadge } from "@/components/vox";

interface Action {
  action: string;
  priority: string;
  ticker?: string;
  description: string;
  value?: number;
  pnl?: number;
  protected?: boolean;
}

interface AnalysisReport {
  timestamp: string;
  portfolio_summary: {
    total_value: number;
    total_positions: number;
    total_pnl: number;
  };
  actions: {
    must_do: Action[];
    should_do: Action[];
    watch: Action[];
  };
}

export default function AnalysisPage() {
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/vox_analysis_report.json")
      .then((r) => r.json())
      .then((data) => {
        setReport(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <PageShell>
        <VoxLoading text="Loading analysis..." />
      </PageShell>
    );
  }

  if (!report) {
    return (
      <PageShell>
        <VoxError message="No analysis report found" onRetry={() => window.location.reload()} />
      </PageShell>
    );
  }

  const { portfolio_summary, actions } = report;

  return (
    <PageShell>
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Portfolio Analysis</h1>
          <p className="text-muted-foreground text-sm">
            Full agentic analysis — all systems active
          </p>
        </div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <VoxKpi
            label="Total Value"
            value={`$${portfolio_summary.total_value.toLocaleString()}`}
          />
          <VoxKpi
            label="Total P&L"
            value={`${portfolio_summary.total_pnl >= 0 ? "+" : ""}$${portfolio_summary.total_pnl.toLocaleString()}`}
            subVariant={portfolio_summary.total_pnl >= 0 ? "profit" : "loss"}
          />
          <VoxKpi
            label="Positions"
            value={portfolio_summary.total_positions.toString()}
          />
        </div>

        {/* MUST DO */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-red-500">🔴</span> MUST DO ({actions.must_do.length})
          </h2>
          <div className="space-y-2">
            {actions.must_do.map((action, i) => (
              <Card key={i} className="bg-red-500/5 border-red-500/20">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {action.ticker && (
                          <span className="font-bold">{action.ticker}</span>
                        )}
                        <VoxBadge variant="loss">{action.action}</VoxBadge>
                      </div>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* SHOULD DO */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-amber-500">🟡</span> SHOULD DO ({actions.should_do.length})
          </h2>
          <div className="space-y-2">
            {actions.should_do.map((action, i) => (
              <Card key={i} className="bg-amber-500/5 border-amber-500/20">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {action.ticker && (
                          <span className="font-bold">{action.ticker}</span>
                        )}
                        <VoxBadge variant="warning">{action.action}</VoxBadge>
                      </div>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* WATCH */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-blue-500">⚪</span> WATCH ({actions.watch.length})
          </h2>
          <div className="space-y-2">
            {actions.watch.map((action, i) => (
              <Card key={i} className={action.protected ? "bg-purple-500/5 border-purple-500/20" : "bg-blue-500/5 border-blue-500/20"}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {action.ticker && (
                          <span className="font-bold">{action.ticker}</span>
                        )}
                        <VoxBadge variant={action.protected ? "info" : "default"}>
                          {action.protected ? "🛒 PROTECTED" : action.action}
                        </VoxBadge>
                      </div>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-muted-foreground">
          Generated: {new Date(report.timestamp).toLocaleString()} | 
          Next update: Market open
        </p>
      </PageShell>
  );
}
