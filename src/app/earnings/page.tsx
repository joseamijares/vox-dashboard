"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MobileHeader } from "@/components/mobile-header";
import { Sidebar } from "@/components/sidebar";
import { Calendar, Clock, AlertTriangle } from "lucide-react";

const earningsCalendar = [
  { ticker: "NVDA", date: "2026-05-28", time: "After Close", estimate: "$0.85", consensus: "Beat", importance: "HIGH" },
  { ticker: "COST", date: "2026-05-29", time: "Before Open", estimate: "$3.78", consensus: "Meet", importance: "MEDIUM" },
  { ticker: "CRWD", date: "2026-06-02", time: "After Close", estimate: "$0.95", consensus: "Beat", importance: "HIGH" },
  { ticker: "SNOW", date: "2026-06-04", time: "After Close", estimate: "$0.22", consensus: "Miss", importance: "MEDIUM" },
  { ticker: "AVGO", date: "2026-06-05", time: "After Close", estimate: "$1.20", consensus: "Beat", importance: "MEDIUM" },
];

const yourHoldingsWithEarnings = [
  { ticker: "NVDA", shares: 41, value: 9011, date: "2026-05-28", impact: "High volatility expected" },
  { ticker: "COST", shares: 3, value: 794, date: "2026-05-29", impact: "Membership growth key" },
  { ticker: "CRWD", shares: 19, value: 12459, date: "2026-06-02", impact: "Cybersecurity demand" },
];

export default function EarningsPage() {
  return (
    <div className="min-h-screen bg-background">
      <MobileHeader />
      <Sidebar />
      <main className="pt-14 lg:pt-0 lg:ml-64 p-4 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Earnings Calendar</h1>
          <p className="text-muted-foreground text-sm">
            Upcoming earnings for your holdings
          </p>
        </div>

        {/* Your Holdings */}
        <Card className="vox-card mb-8 border-yellow-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              Your Positions with Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {yourHoldingsWithEarnings.map((h) => (
                <div key={h.ticker} className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                  <div>
                    <span className="font-semibold">{h.ticker}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {h.shares} shares | ${h.value.toLocaleString()}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">{h.impact}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span className="text-sm font-mono">{h.date}</span>
                    </div>
                    <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 mt-1">
                      Watch
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Full Calendar */}
        <Card className="vox-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Earnings Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {earningsCalendar.map((e) => (
                <div key={e.ticker} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <span className="font-semibold">{e.ticker}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      EPS est: {e.estimate}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {e.date} {e.time}
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs mt-1 ${
                        e.importance === "HIGH"
                          ? "bg-red-500/20 text-red-400 border-red-500/30"
                          : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                      }`}
                    >
                      {e.importance}
                    </Badge>
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
