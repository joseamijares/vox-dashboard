"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { MobileHeader } from "@/components/mobile-header";
import { Sidebar } from "@/components/sidebar";
import { useState, useEffect } from "react";
import { Sunrise, Newspaper, Eye, CheckSquare, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

interface Debrief {
  date: string;
  portfolio_snapshot: {
    total_value: number;
    total_positions: number;
    cash: number;
  };
  sections: {
    reflection: {
      summary: {
        planned_trades: number;
        executed_trades: number;
        portfolio_change: number;
        portfolio_change_pct: number;
      };
      key_moves: Array<{
        ticker: string;
        move_pct: number;
        direction: string;
      }>;
      lessons: string[];
    };
    news: {
      headlines: Array<{
        ticker: string;
        title: string;
        source: string;
      }>;
    };
    watchlist: {
      earnings_today: Array<{ ticker: string }>;
      grade_alerts: Array<{
        ticker: string;
        old_grade: number;
        new_grade: number;
        direction: string;
      }>;
      price_alerts: Array<{
        ticker: string;
        message: string;
      }>;
    };
    checklist: string[];
  };
}

export default function DebriefPage() {
  const [debrief, setDebrief] = useState<Debrief | null>(null);
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/vox_morning_debrief.json")
      .then((r) => r.json().catch(() => null))
      .then((data) => {
        setDebrief(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const toggleCheck = (index: number) => {
    const next = new Set(checkedItems);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    setCheckedItems(next);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
      <MobileHeader />
      <Sidebar />
        <main className="pt-14 lg:pt-0 lg:ml-64 p-4 lg:p-8">
          <p className="text-muted-foreground">Loading debrief...</p>
        </main>
      </div>
    );
  }

  if (!debrief) {
    return (
      <div className="min-h-screen bg-background">
      <MobileHeader />
      <Sidebar />
        <main className="pt-14 lg:pt-0 lg:ml-64 p-4 lg:p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">Morning Debrief</h1>
            <p className="text-muted-foreground text-sm">Pre-market intelligence</p>
          </div>
          <Card className="vox-card">
            <CardContent className="p-8 text-center">
              <Sunrise className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">No debrief found for today.</p>
              <p className="text-xs text-muted-foreground">
                Run: python3 vox_morning_debrief.py --send-telegram
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Or set up cron: hermes cron create --name vox-debrief --schedule "0 8 * * 1-5"
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const { reflection, news, watchlist, checklist } = debrief.sections;

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader />
      <Sidebar />
      <main className="pt-14 lg:pt-0 lg:ml-64 p-4 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Morning Debrief</h1>
          <p className="text-muted-foreground text-sm">
            {debrief.date} — {debrief.portfolio_snapshot.total_positions} positions
          </p>
        </div>

        {/* Portfolio Snapshot */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <Card className="vox-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Portfolio</p>
              <p className="text-2xl font-bold font-mono">
                ${debrief.portfolio_snapshot.total_value.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card className="vox-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Positions</p>
              <p className="text-2xl font-bold font-mono">
                {debrief.portfolio_snapshot.total_positions}
              </p>
            </CardContent>
          </Card>
          <Card className="vox-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Cash</p>
              <p className="text-2xl font-bold font-mono text-green-400">
                ${debrief.portfolio_snapshot.cash.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card className="vox-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Change</p>
              <p className={`text-2xl font-bold font-mono ${reflection.summary.portfolio_change >= 0 ? "text-green-400" : "text-red-400"}`}>
                {reflection.summary.portfolio_change >= 0 ? "+" : ""}
                {reflection.summary.portfolio_change_pct.toFixed(2)}%
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Reflection */}
          <Card className="vox-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Yesterday's Reflection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/30 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">Planned</p>
                  <p className="text-xl font-bold font-mono">{reflection.summary.planned_trades}</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">Executed</p>
                  <p className="text-xl font-bold font-mono">{reflection.summary.executed_trades}</p>
                </div>
              </div>

              {reflection.key_moves?.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2">Key Moves</p>
                  <div className="space-y-2">
                    {reflection.key_moves.slice(0, 5).map((move, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                        <span className="font-semibold">{move.ticker}</span>
                        <span className={move.direction === "up" ? "text-green-400" : "text-red-400"}>
                          {move.direction === "up" ? "+" : ""}{move.move_pct.toFixed(2)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {reflection.lessons?.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2">Lessons</p>
                  <ul className="space-y-1">
                    {reflection.lessons.map((lesson, i) => (
                      <li key={i} className="text-xs text-muted-foreground">• {lesson}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* News */}
          <Card className="vox-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Newspaper className="h-5 w-5 text-primary" />
                Overnight News
              </CardTitle>
            </CardHeader>
            <CardContent>
              {news.headlines?.length > 0 ? (
                <div className="space-y-3">
                  {news.headlines.slice(0, 8).map((item, i) => (
                    <div key={i} className="p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">{item.ticker}</Badge>
                        <span className="text-xs text-muted-foreground">{item.source}</span>
                      </div>
                      <p className="text-sm">{item.title}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No headlines</p>
              )}
            </CardContent>
          </Card>

          {/* Watchlist */}
          <Card className="vox-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                Today's Watchlist
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {watchlist.earnings_today?.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2">Earnings Today</p>
                  <div className="flex flex-wrap gap-2">
                    {watchlist.earnings_today.map((e, i) => (
                      <Badge key={i} variant="outline">{e.ticker}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {watchlist.grade_alerts?.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2">Grade Alerts</p>
                  <div className="space-y-2">
                    {watchlist.grade_alerts.slice(0, 5).map((alert, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                        <span>{alert.ticker}</span>
                        <span className={alert.direction === "up" ? "text-green-400" : "text-red-400"}>
                          {alert.old_grade} → {alert.new_grade}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {watchlist.price_alerts?.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2">Price Alerts</p>
                  <div className="space-y-2">
                    {watchlist.price_alerts.slice(0, 5).map((alert, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                        <AlertTriangle className="h-3 w-3 text-yellow-400" />
                        <span className="text-sm">{alert.ticker}: {alert.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Checklist */}
          <Card className="vox-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-primary" />
                Pre-Market Checklist
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {checklist?.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Checkbox
                      checked={checkedItems.has(i)}
                      onCheckedChange={() => toggleCheck(i)}
                      className="mt-0.5"
                    />
                    <span className={`text-sm ${checkedItems.has(i) ? "line-through text-muted-foreground" : ""}`}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
