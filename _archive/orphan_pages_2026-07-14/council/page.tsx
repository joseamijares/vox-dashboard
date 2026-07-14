"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageShell } from "@/components/vox-nav";
import { VoxLoading, VoxBadge, VoxKpi } from "@/components/vox";

interface Deliberation {
  agent: string;
  action: string;
  target: string;
  reasoning: string;
  vote: string;
  conviction: number;
}

interface CouncilVote {
  agent: string;
  vote: string;
  conviction: number;
  signal: string;
  details: string;
  doc_action: string;
  doc_target: string;
  doc_reasoning: string;
}

interface CouncilData {
  ticker: string;
  timestamp: string;
  consensus: string;
  consensus_pct: number;
  votes: CouncilVote[];
  deliberations: Deliberation[];
  risk_veto: boolean;
  risk_veto_reason: string;
  final_action: string;
}

export default function CouncilPage() {
  const [data, setData] = useState<CouncilData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/council")
      .then((r) => r.json())
      .then((data) => {
        setData(data.results || []);
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

  const getDocEmoji = (action: string) => {
    if (action === "DISAGREE") return "🗣️";
    if (action === "COMMIT") return "✓";
    return "📝";
  };

  const buyVotes = data.filter((v) => v.consensus === "BUY");
  const sellVotes = data.filter((v) => v.consensus === "SELL");
  const holdVotes = data.filter((v) => v.consensus === "HOLD");
  const vetos = data.filter((v) => v.risk_veto);

  const selectedData = selectedTicker ? data.find((d) => d.ticker === selectedTicker) : null;

  return (
    <PageShell>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Agent Council</h1>
        <p className="text-muted-foreground text-sm">Disagree-or-Commit deliberation protocol</p>
      </div>

      {loading ? (
        <VoxLoading text="Loading council deliberations..." />
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4">
            <VoxKpi label="BUY Signals" value={buyVotes.length.toString()} subVariant="profit" />
            <VoxKpi label="SELL Signals" value={sellVotes.length.toString()} subVariant="loss" />
            <VoxKpi label="HOLD Signals" value={holdVotes.length.toString()} />
            <VoxKpi label="Risk Vetos" value={vetos.length.toString()} subVariant="warning" />
          </div>

          {/* Ticker Selector */}
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Positions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {data.map((item) => (
                  <button
                    key={item.ticker}
                    onClick={() => setSelectedTicker(item.ticker)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      selectedTicker === item.ticker
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    <span className="mr-1">{getVoteEmoji(item.consensus)}</span>
                    {item.ticker}
                    {item.risk_veto && <span className="ml-1">🚫</span>}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Selected Ticker Detail */}
          {selectedData && (
            <Card className="border-l-4 border-l-primary">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold">{selectedData.ticker}</span>
                    <VoxBadge
                      variant={
                        selectedData.consensus === "BUY"
                          ? "profit"
                          : selectedData.consensus === "SELL"
                          ? "loss"
                          : "warning"
                      }
                    >
                      {selectedData.consensus} ({selectedData.consensus_pct}%)
                    </VoxBadge>
                    {selectedData.risk_veto && (
                      <Badge variant="outline" className="text-red-400 border-red-400/30">
                        🚫 VETO
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(selectedData.timestamp).toLocaleString()}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Agent Votes Grid */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Agent Votes</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {selectedData.votes.map((v) => (
                      <div
                        key={v.agent}
                        className={`rounded-lg p-3 border ${
                          v.vote === "BUY"
                            ? "border-green-500/30 bg-green-500/5"
                            : v.vote === "SELL"
                            ? "border-red-500/30 bg-red-500/5"
                            : "border-yellow-500/30 bg-yellow-500/5"
                        }`}
                      >
                        <div className="font-medium capitalize text-sm">{v.agent}</div>
                        <div className="flex items-center gap-1 mt-1">
                          <span>{getVoteEmoji(v.vote)}</span>
                          <span
                            className={
                              v.vote === "BUY"
                                ? "text-green-400"
                                : v.vote === "SELL"
                                ? "text-red-400"
                                : "text-yellow-400"
                            }
                          >
                            {v.vote}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">{v.conviction}% conv</div>
                        <div className="text-xs text-muted-foreground mt-1 truncate">{v.signal}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Deliberation Thread */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Deliberation Thread</h3>
                  <div className="space-y-3">
                    {selectedData.deliberations.map((d, i) => (
                      <div
                        key={i}
                        className={`rounded-lg p-3 border-l-2 ${
                          d.action === "DISAGREE"
                            ? "border-l-orange-500 bg-orange-500/5"
                            : d.action === "COMMIT"
                            ? "border-l-green-500 bg-green-500/5"
                            : "border-l-blue-500 bg-blue-500/5"
                        }`}
                      >
                        <div className="flex items-center gap-2 text-sm">
                          <span>{getDocEmoji(d.action)}</span>
                          <span className="font-medium capitalize">{d.agent}</span>
                          {d.action && d.action !== "INITIATE" && (
                            <Badge variant="outline" className="text-xs">
                              {d.action} → {d.target}
                            </Badge>
                          )}
                          <span className="text-muted-foreground ml-auto">{d.vote} ({d.conviction}%)</span>
                        </div>
                        {d.reasoning && (
                          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                            {d.reasoning}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Risk Veto Banner */}
                {selectedData.risk_veto && (
                  <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-4">
                    <div className="flex items-center gap-2 text-red-400 font-medium">
                      <span>🚫</span>
                      <span>Risk Manager Veto</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedData.risk_veto_reason}
                    </p>
                  </div>
                )}

                {/* Final Action */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="text-sm text-muted-foreground">Final Action</span>
                  <VoxBadge
                    variant={
                      selectedData.final_action === "BUY"
                        ? "profit"
                        : selectedData.final_action === "SELL"
                        ? "loss"
                        : "warning"
                    }
                  >
                    {selectedData.final_action}
                  </VoxBadge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* All Positions Table */}
          {!selectedTicker && (
            <Card>
              <CardHeader>
                <CardTitle>All Council Votes</CardTitle>
              </CardHeader>
              <CardContent>
                {data.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-lg mb-2">No council deliberations yet</p>
                    <p className="text-sm">Run: python3 vox_council_doc.py --batch</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.map((item) => (
                      <div
                        key={item.ticker}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => setSelectedTicker(item.ticker)}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-bold">{item.ticker}</span>
                          <VoxBadge
                            variant={
                              item.consensus === "BUY"
                                ? "profit"
                                : item.consensus === "SELL"
                                ? "loss"
                                : "warning"
                            }
                          >
                            {item.consensus} ({item.consensus_pct}%)
                          </VoxBadge>
                          {item.risk_veto && (
                            <Badge variant="outline" className="text-red-400 border-red-400/30 text-xs">
                              VETO
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-1">
                          {item.votes.map((v) => (
                            <span key={v.agent} className="text-xs" title={`${v.agent}: ${v.vote}`}>
                              {getVoteEmoji(v.vote)}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </PageShell>
  );
}
