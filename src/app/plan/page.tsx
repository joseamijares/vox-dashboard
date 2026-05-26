"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { MobileHeader } from "@/components/mobile-header";
import { Sidebar } from "@/components/sidebar";

interface PlanItem {
  id: string;
  ticker: string;
  action: string;
  shares?: string;
  value: number;
  broker?: string;
  limit_price?: number;
  reason: string;
  council: string;
  priority: string;
  status: string;
  condition?: string;
  trigger?: string;
  stop?: string;
}

interface PlanPhase {
  title: string;
  items: PlanItem[];
}

interface UltimatePlan {
  version: string;
  generated_at: string;
  market_context: {
    regime: string;
    macro: string;
    vix: number;
  };
  execution_plan: {
    phase_1_crypto_trims: PlanPhase;
    phase_2_stops: PlanPhase;
    phase_3_nvda_earnings: PlanPhase;
    phase_4_buys: PlanPhase;
    phase_5_post_earnings: PlanPhase;
  };
  protected_positions: string[];
}

export default function PlanPage() {
  const [plan, setPlan] = useState<UltimatePlan | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/vox_ultimate_plan_v2.json")
      .then((r) => r.json())
      .then((data) => setPlan(data))
      .catch(() => setPlan(null));
  }, []);

  const toggleComplete = (id: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getPriorityColor = (priority: string) => {
    if (priority === "MUST") return "bg-red-500/20 text-red-400 border-red-500/30";
    if (priority === "SHOULD") return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    return "bg-blue-500/20 text-blue-400 border-blue-500/30";
  };

  const getActionColor = (action: string) => {
    if (action.includes("SELL") || action.includes("TRIM")) return "text-red-400";
    if (action.includes("BUY")) return "text-green-400";
    if (action.includes("STOP")) return "text-amber-400";
    return "text-blue-400";
  };

  if (!plan) {
    return (
      <div className="min-h-screen bg-background">
      <MobileHeader />
      <Sidebar />
        <main className="pt-14 lg:pt-0 lg:ml-64 p-4 lg:p-8">
          <p className="text-muted-foreground">Loading plan...</p>
        </main>
      </div>
    );
  }

  const allItems = [
    ...plan.execution_plan.phase_1_crypto_trims.items,
    ...plan.execution_plan.phase_2_stops.items,
    ...plan.execution_plan.phase_3_nvda_earnings.items,
    ...plan.execution_plan.phase_4_buys.items,
    ...plan.execution_plan.phase_5_post_earnings.items,
  ];

  const totalItems = allItems.length;
  const completedItems = completed.size;
  const progress = Math.round((completedItems / totalItems) * 100);

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader />
      <Sidebar />
      <main className="pt-14 lg:pt-0 lg:ml-64 p-4 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Ultimate Plan</h1>
          <p className="text-muted-foreground text-sm">
            Concrete execution plan — v{plan.version}
          </p>
        </div>

        {/* Market Context */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-xs text-muted-foreground">Regime</div>
              <div className="text-lg font-bold">{plan.market_context.regime}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-xs text-muted-foreground">Macro</div>
              <div className="text-lg font-bold text-red-400">{plan.market_context.macro}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-xs text-muted-foreground">VIX</div>
              <div className="text-lg font-bold">{plan.market_context.vix}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-xs text-muted-foreground">Progress</div>
              <div className="text-lg font-bold">{progress}%</div>
              <div className="text-xs text-muted-foreground">{completedItems}/{totalItems}</div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-muted rounded-full h-2 mb-6">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Phase 1: Crypto Trims */}
        <Card className="mb-4 border-red-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="text-red-400">🔴</span>
              {plan.execution_plan.phase_1_crypto_trims.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {plan.execution_plan.phase_1_crypto_trims.items.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors"
              >
                <Checkbox
                  checked={completed.has(item.id)}
                  onCheckedChange={() => toggleComplete(item.id)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold">{item.ticker}</span>
                    <span className={getActionColor(item.action)}>{item.action}</span>
                    <Badge className={getPriorityColor(item.priority)}>{item.priority}</Badge>
                    <Badge variant="outline">{item.council}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {item.shares && <span>Shares: {item.shares} | </span>}
                    Value: ${item.value.toLocaleString()}
                    {item.broker && <span> | Broker: {item.broker}</span>}
                  </div>
                  <div className="text-sm mt-1">{item.reason}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Phase 2: Stops */}
        <Card className="mb-4 border-amber-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="text-amber-400">🟡</span>
              {plan.execution_plan.phase_2_stops.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {plan.execution_plan.phase_2_stops.items.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors"
              >
                <Checkbox
                  checked={completed.has(item.id)}
                  onCheckedChange={() => toggleComplete(item.id)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold">{item.ticker}</span>
                    <span className={getActionColor(item.action)}>{item.action}</span>
                    {'trigger' in item && (item as any).trigger && (
                      <span className="text-sm text-muted-foreground">{(item as any).trigger}</span>
                    )}
                    <Badge className={getPriorityColor(item.priority)}>{item.priority}</Badge>
                  </div>
                  <div className="text-sm mt-1">{item.reason}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Phase 3: NVDA Earnings */}
        <Card className="mb-4 border-purple-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="text-purple-400">🟣</span>
              {plan.execution_plan.phase_3_nvda_earnings.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {plan.execution_plan.phase_3_nvda_earnings.items.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors"
              >
                <Checkbox
                  checked={completed.has(item.id)}
                  onCheckedChange={() => toggleComplete(item.id)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold">{item.ticker}</span>
                    <span className={getActionColor(item.action)}>{item.action}</span>
                    <Badge className={getPriorityColor(item.priority)}>{item.priority}</Badge>
                    <Badge variant="outline">{item.council}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {item.shares && <span>Shares: {item.shares} | </span>}
                    Value: ${item.value.toLocaleString()}
                    {item.broker && <span> | Broker: {item.broker}</span>}
                  </div>
                  <div className="text-sm mt-1">{item.reason}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Phase 4: Buys */}
        <Card className="mb-4 border-green-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="text-green-400">🟢</span>
              {plan.execution_plan.phase_4_buys.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {plan.execution_plan.phase_4_buys.items.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors"
              >
                <Checkbox
                  checked={completed.has(item.id)}
                  onCheckedChange={() => toggleComplete(item.id)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold">{item.ticker}</span>
                    <span className={getActionColor(item.action)}>{item.action}</span>
                    <Badge className={getPriorityColor(item.priority)}>{item.priority}</Badge>
                    <Badge variant="outline">{item.council}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {item.shares && <span>Shares: {item.shares} | </span>}
                    Value: ${item.value.toLocaleString()}
                    {item.limit_price && <span> | Limit: ${item.limit_price}</span>}
                    {item.broker && <span> | Broker: {item.broker}</span>}
                  </div>
                  <div className="text-sm mt-1">{item.reason}</div>
                  {(item as any).stop && (
                    <div className="text-xs text-red-400 mt-1">Stop: {(item as any).stop}</div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Phase 5: Post-Earnings */}
        <Card className="mb-4 border-blue-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="text-blue-400">⚪</span>
              {plan.execution_plan.phase_5_post_earnings.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {plan.execution_plan.phase_5_post_earnings.items.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors"
              >
                <Checkbox
                  checked={completed.has(item.id)}
                  onCheckedChange={() => toggleComplete(item.id)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold">{item.ticker}</span>
                    <span className={getActionColor(item.action)}>{item.action}</span>
                    <Badge className={getPriorityColor(item.priority)}>{item.priority}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Condition: {item.condition}
                    {item.value && <span> | Value: ${item.value.toLocaleString()}</span>}
                  </div>
                  <div className="text-sm mt-1">{item.reason}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Protected & Hold */}
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">🛒 Protected / Hold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {plan.protected_positions.map((ticker) => (
                <Badge key={ticker} variant="outline" className="text-green-400">
                  {ticker}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Do not sell. Thesis intact.
            </p>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground">
          Generated: {new Date(plan.generated_at).toLocaleString()}
        </p>
      </main>
    </div>
  );
}
