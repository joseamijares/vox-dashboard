"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sidebar } from "@/components/sidebar";
import { llmCouncil } from "@/lib/data";
import { Brain, TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function CouncilPage() {
  const consensus = llmCouncil;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:ml-64 p-4 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">LLM Council</h1>
          <p className="text-muted-foreground text-sm">
            Multi-model consensus analysis
          </p>
        </div>

        <div className="space-y-6">
          {consensus.consensus.map((c: any) => (
            <Card key={c.ticker} className="vox-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold">{c.ticker}</span>
                    <Badge
                      variant={c.confidence >= 70 ? "default" : "secondary"}
                    >
                      Confidence: {c.confidence}%
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Consensus Grade</div>
                    <div className="text-2xl font-bold font-mono">{c.consensusGrade}</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Vote Distribution */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-green-500/10 rounded-lg text-center border border-green-500/20">
                    <div className="flex items-center justify-center gap-1 text-green-400 mb-1">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-2xl font-bold">{c.bullCount}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Bullish</div>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg text-center">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                      <Minus className="h-4 w-4" />
                      <span className="text-2xl font-bold">{c.neutralCount}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Neutral</div>
                  </div>
                  <div className="p-4 bg-red-500/10 rounded-lg text-center border border-red-500/20">
                    <div className="flex items-center justify-center gap-1 text-red-400 mb-1">
                      <TrendingDown className="h-4 w-4" />
                      <span className="text-2xl font-bold">{c.bearCount}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Bearish</div>
                  </div>
                </div>

                {/* Price Targets */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Min Target</div>
                    <div className="text-lg font-mono font-semibold">${c.minTarget}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Mean Target</div>
                    <div className="text-lg font-mono font-semibold text-primary">${c.meanTarget}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Max Target</div>
                    <div className="text-lg font-mono font-semibold">${c.maxTarget}</div>
                  </div>
                </div>

                {/* Individual Votes */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold">Individual Model Votes</h4>
                  {c.models.map((vote: any) => (
                    <div
                      key={vote.model}
                      className="p-3 bg-muted/30 rounded-lg"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium">{vote.model}</span>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              vote.direction === "BULL"
                                ? "default"
                                : vote.direction === "BEAR"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {vote.direction}
                          </Badge>
                          <span className="font-mono text-sm">{vote.grade}</span>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Target: ${vote.target} — {vote.reasoning}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
