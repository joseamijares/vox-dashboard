"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageShell } from "@/components/vox-nav";
import { TrendingUp, TrendingDown, MessageSquare, Newspaper } from "lucide-react";

const sentimentData = [
  { ticker: "NVDA", sentiment: 78, mentions: 12400, trend: "BULLISH", source: "Twitter/X" },
  { ticker: "TSLA", sentiment: 65, mentions: 8900, trend: "BULLISH", source: "Twitter/X" },
  { ticker: "BTC", sentiment: 72, mentions: 15200, trend: "BULLISH", source: "Crypto Twitter" },
  { ticker: "CRWD", sentiment: 58, mentions: 3200, trend: "NEUTRAL", source: "Reddit" },
  { ticker: "AMD", sentiment: 45, mentions: 5600, trend: "BEARISH", source: "Twitter/X" },
  { ticker: "OSCR", sentiment: 32, mentions: 800, trend: "BEARISH", source: "Reddit" },
  { ticker: "JMIA", sentiment: 28, mentions: 1200, trend: "BEARISH", source: "Twitter/X" },
];

const newsHeadlines = [
  { headline: "NVIDIA earnings preview: AI demand remains strong", source: "Bloomberg", sentiment: "POSITIVE" },
  { headline: "CrowdStrike expands into cloud security market", source: "Reuters", sentiment: "POSITIVE" },
  { headline: "Tesla FSD v13 rollout accelerates in Europe", source: "TechCrunch", sentiment: "POSITIVE" },
  { headline: "AMD loses data center share to NVIDIA", source: "WSJ", sentiment: "NEGATIVE" },
  { headline: "Bitcoin ETF inflows hit monthly high", source: "CoinDesk", sentiment: "POSITIVE" },
];

export default function SentimentPage() {
  return (
    <PageShell>
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Sentiment</h1>
          <p className="text-muted-foreground text-sm">
            Social media and news sentiment for your holdings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sentiment Scores */}
          <Card className="vox-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Social Sentiment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sentimentData.map((s) => (
                  <div key={s.ticker}>
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <span className="font-semibold">{s.ticker}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {s.mentions.toLocaleString()} mentions
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          s.trend === "BULLISH"
                            ? "bg-green-500/20 text-green-400 border-green-500/30"
                            : s.trend === "BEARISH"
                            ? "bg-red-500/20 text-red-400 border-red-500/30"
                            : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                        }`}
                      >
                        {s.trend}
                      </Badge>
                    </div>
                    <Progress value={s.sentiment} className="h-2" />
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-muted-foreground">{s.source}</span>
                      <span className="text-xs font-mono">{s.sentiment}/100</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* News Headlines */}
          <Card className="vox-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Newspaper className="h-5 w-5 text-primary" />
                Latest Headlines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {newsHeadlines.map((n, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    {n.sentiment === "POSITIVE" ? (
                      <TrendingUp className="h-4 w-4 text-green-400 mt-0.5" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-400 mt-0.5" />
                    )}
                    <div>
                      <p className="text-sm">{n.headline}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">{n.source}</span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            n.sentiment === "POSITIVE"
                              ? "bg-green-500/20 text-green-400 border-green-500/30"
                              : "bg-red-500/20 text-red-400 border-red-500/30"
                          }`}
                        >
                          {n.sentiment}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </PageShell>
  );
}
