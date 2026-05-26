"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MobileHeader } from "@/components/mobile-header";
import { Sidebar } from "@/components/sidebar";
import { AlertTriangle, Lightbulb, XCircle } from "lucide-react";

const mistakes = [
  {
    id: 1,
    date: "2026-04-15",
    ticker: "JMIA",
    error: "Bought without grade check",
    loss: 1800,
    lesson: "Always run grade before entry. Grade was 35 at entry.",
    category: "PROCESS",
  },
  {
    id: 2,
    date: "2026-03-20",
    ticker: "OKLO",
    error: "FOMO entry at $85",
    loss: 1500,
    lesson: "Wait for pullback. Entry was 30% above 50-day MA.",
    category: "PSYCHOLOGY",
  },
  {
    id: 3,
    date: "2026-02-10",
    ticker: "BTC",
    error: "No stop loss on crypto",
    loss: 3200,
    lesson: "Set stops at entry. Crypto can drop 20% in hours.",
    category: "RISK",
  },
  {
    id: 4,
    date: "2026-01-28",
    ticker: "SPRB",
    error: "Biotech without understanding pipeline",
    loss: 600,
    lesson: "Don't trade sectors you don't understand.",
    category: "KNOWLEDGE",
  },
];

export default function MistakesPage() {
  return (
    <div className="min-h-screen bg-background">
      <MobileHeader />
      <Sidebar />
      <main className="pt-14 lg:pt-0 lg:ml-64 p-4 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Mistake Journal</h1>
          <p className="text-muted-foreground text-sm">Learn from losses</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="vox-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Losses</p>
                  <p className="text-2xl font-bold font-mono text-red-400">
                    ${mistakes.reduce((s, m) => s + m.loss, 0).toLocaleString()}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="vox-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Mistakes Logged</p>
                  <p className="text-2xl font-bold font-mono">{mistakes.length}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="vox-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Lessons</p>
                  <p className="text-2xl font-bold font-mono">{mistakes.length}</p>
                </div>
                <Lightbulb className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="vox-card">
          <CardHeader>
            <CardTitle>Mistake Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mistakes.map((m) => (
                <div
                  key={m.id}
                  className="p-4 bg-red-500/10 rounded-lg border border-red-500/20"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{m.ticker}</span>
                      <Badge variant="outline" className="text-xs">
                        {m.category}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">{m.date}</span>
                  </div>
                  <p className="text-sm text-red-400 mb-1">{m.error}</p>
                  <p className="text-sm text-muted-foreground">Loss: ${m.loss.toLocaleString()}</p>
                  <div className="mt-2 p-2 bg-muted/30 rounded">
                    <p className="text-sm flex items-center gap-2">
                      <Lightbulb className="h-3 w-3 text-primary" />
                      {m.lesson}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
