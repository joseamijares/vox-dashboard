"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageShell } from "@/components/vox-nav";
import { VoxBadge } from "@/components/vox";

interface CouncilVote {
  ticker: string;
  consensus: string;
  consensus_pct: number;
  votes: {
    agent: string;
    vote: string;
    conviction: number;
    details: string;
  }[];
  dissent: {
    agent: string;
    vote: string;
  }[];
}

export default function CouncilPage() {
  const [votes, setVotes] = useState<CouncilVote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/vox_council_votes.json?t=" + Date.now())
      .then((r) => r.json())
      .then((data) => {
        setVotes(data.results || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getSignalColor = (signal: string) => {
    if (signal.includes("BUY")) return "bg-green-500/20 text-green-400 border-green-500/30";
    if (signal.includes("SELL")) return "bg-red-500/20 text-red-400 border-red-500/30";
    return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
  };

  const getVoteEmoji = (vote: string) => {
    if (vote === "BUY") return "🟢";
    if (vote === "SELL") return "🔴";
    return "⚪";
  };

  const buyVotes = votes.filter((v) => v.consensus === "BUY");
  const sellVotes = votes.filter((v) => v.consensus === "SELL");
  const holdVotes = votes.filter((v) => v.consensus === "HOLD");

  return (
    <PageShell>
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Agent Council</h1>
          <p className="text-muted-foreground text-sm">Multi-agent voting on portfolio positions</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="h-8 w-64 bg-muted animate-pulse rounded" />
            <div className="h-32 w-full bg-muted animate-pulse rounded" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-green-500/10 border-green-500/20">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-green-400">{buyVotes.length}</div>
                  <div className="text-sm text-muted-foreground">BUY Signals</div>
                </CardContent>
              </Card>
              <Card className="bg-red-500/10 border-red-500/20">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-red-400">{sellVotes.length}</div>
                  <div className="text-sm text-muted-foreground">SELL Signals</div>
                </CardContent>
              </Card>
              <Card className="bg-yellow-500/10 border-yellow-500/20">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-yellow-400">{holdVotes.length}</div>
                  <div className="text-sm text-muted-foreground">HOLD Signals</div>
                </CardContent>
              </Card>
            </div>

            {/* Votes Table */}
            <Card>
              <CardHeader>
                <CardTitle>Council Votes</CardTitle>
              </CardHeader>
              <CardContent>
                {votes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-lg mb-2">No council votes yet</p>
                    <p className="text-sm">Run: python3 vox_council.py --batch</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {votes.map((vote) => (
                      <div key={vote.ticker} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-lg">{vote.ticker}</span>
                            <Badge className={getSignalColor(vote.consensus)}>
                              {vote.consensus} ({vote.consensus_pct}%)
                            </Badge>
                          </div>
                          {vote.dissent.length > 0 && (
                            <Badge variant="outline" className="text-orange-400 border-orange-400/30">
                              {vote.dissent.length} dissenting
                            </Badge>
                          )}
                        </div>

                        {/* Agent Votes */}
                        <div className="grid grid-cols-4 gap-2 text-sm">
                          {vote.votes.map((v) => (
                            <div key={v.agent} className="bg-muted rounded p-2">
                              <div className="font-medium capitalize">{v.agent}</div>
                              <div className="flex items-center gap-1">
                                <span>{getVoteEmoji(v.vote)}</span>
                                <span className={v.vote === "BUY" ? "text-green-400" : v.vote === "SELL" ? "text-red-400" : "text-yellow-400"}>
                                  {v.vote}
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground">{v.conviction}% conv</div>
                            </div>
                          ))}
                        </div>

                        {/* Dissent */}
                        {vote.dissent.length > 0 && (
                          <div className="text-sm text-orange-400">
                            <span className="font-medium">Dissent: </span>
                            {vote.dissent.map((d) => `${d.agent} (${d.vote})`).join(", ")}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </PageShell>
  );
}
