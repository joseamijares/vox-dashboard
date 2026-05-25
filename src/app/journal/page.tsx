"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/sidebar";
import { BookOpen, Calendar, TrendingUp, TrendingDown } from "lucide-react";

const trades = [
  { date: "2026-05-20", ticker: "NVDA", action: "BUY", shares: 10, price: 210.5, value: 2105, reason: "Earnings setup, AI demand", outcome: "OPEN" },
  { date: "2026-05-18", ticker: "JMIA", action: "SELL", shares: 200, price: 6.97, value: 1394, reason: "Grade 22, exit loser", outcome: "CLOSED" },
  { date: "2026-05-15", ticker: "BTC", action: "BUY", shares: 0.05, price: 108000, value: 5400, reason: "Dip buy, long-term hold", outcome: "OPEN" },
  { date: "2026-05-12", ticker: "BILL", action: "SELL", shares: 50, price: 36.14, value: 1807, reason: "Grade 38, reallocate", outcome: "CLOSED" },
  { date: "2026-05-10", ticker: "CEG", action: "BUY", shares: 25, price: 285.0, value: 7125, reason: "Nuclear thesis, grade 71", outcome: "OPEN" },
];

export default function JournalPage() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:ml-64 p-4 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Trade Journal</h1>
          <p className="text-muted-foreground text-sm">Record of all trades and decisions</p>
        </div>

        <Card className="vox-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Trade History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {trades.map((t, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{t.ticker}</span>
                      <Badge
                        variant="outline"
                        className={
                          t.action === "BUY"
                            ? "bg-green-500/20 text-green-400 border-green-500/30"
                            : "bg-red-500/20 text-red-400 border-red-500/30"
                        }
                      >
                        {t.action}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {t.outcome}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{t.reason}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {t.date}
                    </div>
                    <p className="font-mono text-sm">{t.shares} @ ${t.price}</p>
                    <p className="font-mono text-sm">${t.value.toLocaleString()}</p>
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
