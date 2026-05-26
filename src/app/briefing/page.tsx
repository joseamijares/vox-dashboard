"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MobileHeader } from "@/components/mobile-header";
import { Sidebar } from "@/components/sidebar";
import { dailyBriefing, marketRegime } from "@/lib/data";
import { Newspaper, AlertTriangle, TrendingUp, Target, CheckCircle, Calendar } from "lucide-react";

export default function BriefingPage() {
  const brief = dailyBriefing;
  const macro = marketRegime.macroIndicators;

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader />
      <Sidebar />
      <main className="pt-14 lg:pt-0 lg:ml-64 p-4 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Daily Briefing</h1>
          <p className="text-muted-foreground text-sm">
            {brief.date} — Generated at 8:00 AM
          </p>
        </div>

        {/* Macro Snapshot */}
        <Card className="vox-card mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Macro Snapshot
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {macro.slice(0, 4).map((ind) => (
                <div key={ind.name} className="p-3 bg-muted/30 rounded-lg text-center">
                  <div className="text-xs text-muted-foreground">{ind.name}</div>
                  <div className="text-xl font-bold font-mono">{ind.value}</div>
                  <Badge
                    variant={ind.trend === "down" ? "default" : ind.trend === "up" ? "destructive" : "secondary"}
                    className="text-xs mt-1"
                  >
                    {ind.trend}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alerts + Signals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="vox-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-400">
                <AlertTriangle className="h-5 w-5" />
                Positions Needing Attention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {brief.alerts.map((alert, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                    <span>{alert}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="vox-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-400">
                <TrendingUp className="h-5 w-5" />
                Screener Signals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {brief.screener.map((sig: any, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                    <span>{sig.ticker}: {sig.signal} ({sig.confidence}%)</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Contrarian + Checklist */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="vox-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-400">
                <Target className="h-5 w-5" />
                Contrarian Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {brief.contrarian.map((opp: any, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Target className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
                    <span>{opp.ticker}: {opp.signal} (RSI {opp.rsi})</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="vox-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                Action Checklist
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {brief.checklist.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <div className="w-4 h-4 rounded border border-muted-foreground/30 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
