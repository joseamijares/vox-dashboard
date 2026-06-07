"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageShell } from "@/components/vox-nav";
import { VoxBadge } from "@/components/vox";

interface CouncilPlay {
  ticker: string;
  value: number;
  pnl: number;
  decision_layer: {
    action: string;
    size: string;
    conviction: string;
    thesis: string;
    reasoning: string;
  };
  llm_council: {
    consensus: string;
    confidence: number;
    requires_human: boolean;
    votes: Array<{
      agent: string;
      vote: string;
      confidence: number;
      reasoning: string;
    }>;
    conditions: string[];
    dissent: string[];
  };
  final_action: string;
  final_size: string;
  human_required: boolean;
  notes: string;
}

interface PlaysData {
  timestamp: string;
  methodology: string;
  portfolio_value: number;
  positions_analyzed: number;
  plays: CouncilPlay[];
}

export default function CouncilPlaysPage() {
  const [data, setData] = useState<PlaysData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/vox_council_plays.json")
      .then((r) => r.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getConsensusColor = (consensus: string) => {
    if (consensus === "APPROVE") return "bg-green-500/20 text-green-400 border-green-500/30";
    if (consensus === "REJECT") return "bg-red-500/20 text-red-400 border-red-500/30";
    return "bg-amber-500/20 text-amber-400 border-amber-500/30";
  };

  const getActionColor = (action: string) => {
    if (action === "SELL") return "text-red-400";
    if (action === "TRIM") return "text-amber-400";
    if (action === "BUY") return "text-green-400";
    return "text-blue-400";
  };

  if (loading) {
    return (
      <PageShell>
          <div className="space-y-4">
            <div className="h-8 w-64 bg-muted animate-pulse rounded" />
            <div className="h-32 w-full bg-muted animate-pulse rounded" />
          </div>
        </PageShell>
    );
  }

  if (!data) {
    return (
      <PageShell>
          <p>No council plays generated yet</p>
        </PageShell>
    );
  }

  const approved = data.plays.filter((p) => p.llm_council.consensus === "APPROVE");
  const conditional = data.plays.filter((p) => p.llm_council.consensus === "CONDITIONAL");
  const needHuman = data.plays.filter((p) => p.human_required);

  return (
    <PageShell>
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Council Reviewed Plays</h1>
          <p className="text-muted-foreground text-sm">
            Every play reviewed by 5 AI agents before recommendation
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Methodology: {data.methodology}
          </p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="bg-green-500/10 border-green-500/20">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-400">{approved.length}</div>
              <div className="text-sm text-muted-foreground">Approved</div>
            </CardContent>
          </Card>
          <Card className="bg-amber-500/10 border-amber-500/20">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-amber-400">{conditional.length}</div>
              <div className="text-sm text-muted-foreground">Conditional</div>
            </CardContent>
          </Card>
          <Card className="bg-blue-500/10 border-blue-500/20">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-400">{needHuman.length}</div>
              <div className="text-sm text-muted-foreground">Need Your Approval</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{data.positions_analyzed}</div>
              <div className="text-sm text-muted-foreground">Analyzed</div>
            </CardContent>
          </Card>
        </div>

        {/* Plays */}
        <div className="space-y-4">
          {data.plays.map((play, i) => (
            <Card key={i} className={play.llm_council.consensus === "APPROVE" ? "border-green-500/20" : "border-amber-500/20"}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg">{play.ticker}</span>
                    <Badge className={getConsensusColor(play.llm_council.consensus)}>
                      {play.llm_council.consensus}
                    </Badge>
                    {play.human_required && (
                      <Badge variant="outline" className="text-blue-400 border-blue-500/30">
                        👤 Needs You
                      </Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-mono">${play.value.toLocaleString()}</div>
                    <div className={`text-sm ${play.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {play.pnl >= 0 ? "+" : ""}${play.pnl.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Decision Layer</p>
                    <p className={`font-semibold ${getActionColor(play.decision_layer.action)}`}>
                      {play.decision_layer.action} {play.decision_layer.size}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Conviction: {play.decision_layer.conviction}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">LLM Council</p>
                    <p className="font-semibold">
                      Confidence: {play.llm_council.confidence}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {play.llm_council.votes.filter((v) => v.vote === "APPROVE").length}/{play.llm_council.votes.length} approve
                    </p>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground mb-2">
                  <span className="font-medium">Thesis:</span> {play.decision_layer.thesis}
                </div>

                <div className="text-sm text-muted-foreground mb-2">
                  <span className="font-medium">Reasoning:</span> {play.decision_layer.reasoning}
                </div>

                {/* Council Votes */}
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2">Council Votes:</p>
                  <div className="flex flex-wrap gap-2">
                    {play.llm_council.votes.map((vote, j) => (
                      <Badge
                        key={j}
                        variant="outline"
                        className={
                          vote.vote === "APPROVE"
                            ? "text-green-400 border-green-500/30"
                            : vote.vote === "REJECT"
                            ? "text-red-400 border-red-500/30"
                            : "text-amber-400 border-amber-500/30"
                        }
                      >
                        {vote.agent}: {vote.vote} ({vote.confidence}%)
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Conditions */}
                {play.llm_council.conditions.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground mb-1">Execution Conditions:</p>
                    <ul className="text-xs space-y-1">
                      {play.llm_council.conditions.map((cond, j) => (
                        <li key={j} className="text-amber-400">• {cond}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Dissent */}
                {play.llm_council.dissent.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground mb-1">Dissent:</p>
                    <ul className="text-xs space-y-1">
                      {play.llm_council.dissent.map((d, j) => (
                        <li key={j} className="text-red-400">• {d}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-xs text-muted-foreground mt-6">
          Generated: {new Date(data.timestamp).toLocaleString()} | 
          Every play requires dual approval: Decision Layer + LLM Council
        </p>
      </PageShell>
  );
}
