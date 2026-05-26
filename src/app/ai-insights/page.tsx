"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MobileHeader } from "@/components/mobile-header";
import { Sidebar } from "@/components/sidebar";
import { Brain, TrendingUp, AlertTriangle, Lightbulb } from "lucide-react";

export default function AIInsightsPage() {
  const insights = [
    {
      ticker: "NVDA",
      grade: 64,
      signal: "HOLD",
      reasoning: "AI demand accelerating but valuation stretched. Wait for post-earnings dip below $200.",
      confidence: 78,
    },
    {
      ticker: "CEG",
      grade: 59,
      signal: "BUY",
      reasoning: "Nuclear renaissance thesis intact. AI power demand creating structural tailwind. Pullback to $270 is entry.",
      confidence: 82,
    },
    {
      ticker: "XLF",
      grade: 75,
      signal: "BUY",
      reasoning: "Financials leading sector rotation. Yield curve normalization benefits banks. Strong momentum.",
      confidence: 85,
    },
    {
      ticker: "BTC",
      grade: 62,
      signal: "TRIM",
      reasoning: "Exceeded 5% single-crypto limit. Trim to target despite strong grade. Rebalancing discipline.",
      confidence: 90,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader />
      <Sidebar />
      <main className="pt-14 lg:pt-0 lg:ml-64 p-4 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">AI Insights</h1>
          <p className="text-muted-foreground text-sm">
            LLM-generated analysis and recommendations
          </p>
        </div>

        <div className="space-y-4">
          {insights.map((insight) => (
            <Card key={insight.ticker} className="vox-card">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <Brain className="h-5 w-5 text-primary" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold">{insight.ticker}</span>
                        <Badge
                          variant={
                            insight.signal === "BUY"
                              ? "default"
                              : insight.signal === "SELL"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {insight.signal}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Grade: {insight.grade} | Confidence: {insight.confidence}%
                      </div>
                    </div>
                  </div>
                  <Lightbulb className="h-5 w-5 text-amber-400" />
                </div>
                <p className="text-sm text-muted-foreground">{insight.reasoning}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
