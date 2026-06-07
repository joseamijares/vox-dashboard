"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageShell } from "@/components/vox-nav";
import { VoxBadge } from "@/components/vox";
import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, AlertTriangle, Target, BarChart3, Clock, CheckCircle } from "lucide-react";

interface DigestAction {
  ticker: string;
  score: number;
  action: string;
  urgency: string;
  grade: number;
}

interface Digest {
  date: string;
  generated_at: string;
  summary: {
    total_tickers_scanned: number;
    actions_generated: number;
    winners: number;
    losers: number;
  };
  winners: DigestAction[];
  losers: DigestAction[];
  key_insights: string[];
}

export default function DigestPage() {
  const [digest, setDigest] = useState<Digest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/vox_daily_digest.json")
      .then((r) => r.json().catch(() => null))
      .then((data) => {
        setDigest(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <PageShell>
          <p className="text-muted-foreground">Loading digest...</p>
        </PageShell>
    );
  }

  if (!digest) {
    return (
      <PageShell>
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">Daily Digest</h1>
            <p className="text-muted-foreground text-sm">End-of-day intelligence summary</p>
          </div>
          <Card className="vox-card">
            <CardContent className="p-8 text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">No digest found for today.</p>
              <p className="text-xs text-muted-foreground">
                Run: python3 vox_daily_digest.py --send-telegram
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Or set up cron: hermes cron create --name vox-digest --schedule "30 16 * * 1-5"
              </p>
            </CardContent>
          </Card>
        </PageShell>
    );
  }

  return (
    <PageShell>
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Daily Digest</h1>
          <p className="text-muted-foreground text-sm">
            {digest.date} — {digest.summary.actions_generated} actions from {digest.summary.total_tickers_scanned} tickers
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <Card className="vox-card border-green-500/30">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Winners</p>
              <p className="text-2xl font-bold font-mono text-green-400">{digest.summary.winners}</p>
            </CardContent>
          </Card>
          <Card className="vox-card border-red-500/30">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Losers</p>
              <p className="text-2xl font-bold font-mono text-red-400">{digest.summary.losers}</p>
            </CardContent>
          </Card>
          <Card className="vox-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Scanned</p>
              <p className="text-2xl font-bold font-mono">{digest.summary.total_tickers_scanned}</p>
            </CardContent>
          </Card>
          <Card className="vox-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Actions</p>
              <p className="text-2xl font-bold font-mono">{digest.summary.actions_generated}</p>
            </CardContent>
          </Card>
        </div>

        {/* Key Insights */}
        {digest.key_insights && digest.key_insights.length > 0 && (
          <Card className="vox-card mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Key Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {digest.key_insights.map((insight, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary">•</span>
                    {insight}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Winners & Losers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="vox-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-400">
                <TrendingUp className="h-5 w-5" />
                Winners
              </CardTitle>
            </CardHeader>
            <CardContent>
              {digest.winners?.length > 0 ? (
                <div className="space-y-3">
                  {digest.winners.slice(0, 10).map((w, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div>
                        <div className="font-semibold">{w.ticker}</div>
                        <div className="text-xs text-muted-foreground">Score: {w.score}</div>
                      </div>
                      <Badge variant="outline" className="bg-green-500/20 text-green-400">
                        {w.action}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No winners today</p>
              )}
            </CardContent>
          </Card>

          <Card className="vox-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-400">
                <TrendingDown className="h-5 w-5" />
                Losers
              </CardTitle>
            </CardHeader>
            <CardContent>
              {digest.losers?.length > 0 ? (
                <div className="space-y-3">
                  {digest.losers.slice(0, 10).map((l, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div>
                        <div className="font-semibold">{l.ticker}</div>
                        <div className="text-xs text-muted-foreground">Score: {l.score}</div>
                      </div>
                      <Badge variant="outline" className="bg-red-500/20 text-red-400">
                        {l.action}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No losers today</p>
              )}
            </CardContent>
          </Card>
        </div>
      </PageShell>
  );
}
