"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MobileHeader } from "@/components/mobile-header";
import { Sidebar } from "@/components/sidebar";
import { useState } from "react";
import { Star, ThumbsUp, ThumbsDown, Target, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface PlayReview {
  id: string;
  ticker: string;
  type: string;
  aiConfidence: number;
  userRating?: number; // 1-5
  userFeedback?: string;
  executed: boolean;
  pnl?: number;
  status: "PENDING" | "EXECUTED" | "CLOSED";
  aiThesis: string;
  outcome?: "WIN" | "LOSS" | "BREAKEVEN";
}

const initialReviews: PlayReview[] = [
  {
    id: "play_001",
    ticker: "NVDA",
    type: "BUY",
    aiConfidence: 78,
    aiThesis: "Earnings May 28, AI demand strong, grade 78 STRONG BUY",
    status: "EXECUTED",
    executed: true,
    pnl: 1240,
    outcome: "WIN",
    userRating: 5,
    userFeedback: "Perfect timing, AI thesis played out"
  },
  {
    id: "play_002",
    ticker: "JMIA",
    type: "SELL",
    aiConfidence: 85,
    aiThesis: "Grade 22, African e-commerce headwinds, exit immediately",
    status: "EXECUTED",
    executed: true,
    pnl: -50,
    outcome: "LOSS",
    userRating: 4,
    userFeedback: "Should have exited earlier, but AI was right"
  },
  {
    id: "play_003",
    ticker: "CEG",
    type: "BUY",
    aiConfidence: 71,
    aiThesis: "Nuclear energy demand surge, government SMR support",
    status: "PENDING",
    executed: false,
  },
  {
    id: "play_004",
    ticker: "OKLO",
    type: "SELL",
    aiConfidence: 52,
    aiThesis: "Grade 49, nuclear sentiment shifting to CEG",
    status: "PENDING",
    executed: false,
  },
  {
    id: "play_005",
    ticker: "BTC",
    type: "HOLD",
    aiConfidence: 68,
    aiThesis: "Crypto allocation under 10%, halving supply shock",
    status: "EXECUTED",
    executed: true,
    pnl: 3200,
    outcome: "WIN",
    userRating: 5,
  }
];

export default function PlayReviewPage() {
  const [reviews, setReviews] = useState<PlayReview[]>(initialReviews);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "EXECUTED" | "CLOSED">("ALL");

  const filtered = reviews.filter((r) => filter === "ALL" || r.status === filter);

  const stats = {
    total: reviews.length,
    executed: reviews.filter((r) => r.executed).length,
    wins: reviews.filter((r) => r.outcome === "WIN").length,
    losses: reviews.filter((r) => r.outcome === "LOSS").length,
    avgAiConfidence: reviews.reduce((s, r) => s + r.aiConfidence, 0) / reviews.length,
    avgUserRating: reviews.filter((r) => r.userRating).reduce((s, r) => s + (r.userRating || 0), 0) / reviews.filter((r) => r.userRating).length || 0,
    totalPnl: reviews.reduce((s, r) => s + (r.pnl || 0), 0),
  };

  const ratePlay = (id: string, rating: number) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, userRating: rating } : r))
    );
  };

  const markExecuted = (id: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, executed: true, status: "EXECUTED" } : r))
    );
  };

  const markOutcome = (id: string, outcome: "WIN" | "LOSS" | "BREAKEVEN") => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, outcome, status: "CLOSED" } : r))
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader />
      <Sidebar />
      <main className="pt-14 lg:pt-0 lg:ml-64 p-4 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Play Review</h1>
          <p className="text-muted-foreground text-sm">
            Grade the AI's recommendations — teach it to improve
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card className="vox-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Total Plays</p>
              <p className="text-xl font-bold font-mono">{stats.total}</p>
            </CardContent>
          </Card>
          <Card className="vox-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Executed</p>
              <p className="text-xl font-bold font-mono">{stats.executed}</p>
            </CardContent>
          </Card>
          <Card className="vox-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Wins</p>
              <p className="text-xl font-bold font-mono text-green-400">{stats.wins}</p>
            </CardContent>
          </Card>
          <Card className="vox-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Losses</p>
              <p className="text-xl font-bold font-mono text-red-400">{stats.losses}</p>
            </CardContent>
          </Card>
          <Card className="vox-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">AI Avg Confidence</p>
              <p className="text-xl font-bold font-mono">{stats.avgAiConfidence.toFixed(0)}%</p>
            </CardContent>
          </Card>
          <Card className="vox-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Total P&L</p>
              <p className={`text-xl font-bold font-mono ${stats.totalPnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                ${stats.totalPnl.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {(["ALL", "PENDING", "EXECUTED", "CLOSED"] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
            >
              {f}
            </Button>
          ))}
        </div>

        {/* Play Cards */}
        <div className="space-y-4">
          {filtered.map((play) => (
            <Card key={play.id} className={`vox-card ${
              play.outcome === "WIN" ? "border-green-500/30" :
              play.outcome === "LOSS" ? "border-red-500/30" :
              play.status === "PENDING" ? "border-yellow-500/30" :
              ""
            }`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold font-mono">{play.ticker}</span>
                    <Badge variant="outline" className={
                      play.type === "BUY" ? "bg-green-500/20 text-green-400 border-green-500/30" :
                      play.type === "SELL" ? "bg-red-500/20 text-red-400 border-red-500/30" :
                      play.type === "TRIM" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" :
                      "bg-blue-500/20 text-blue-400 border-blue-500/30"
                    }>
                      {play.type}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      AI: {play.aiConfidence}%
                    </Badge>
                    {play.outcome && (
                      <Badge variant="outline" className={
                        play.outcome === "WIN" ? "bg-green-500/20 text-green-400 border-green-500/30" :
                        play.outcome === "LOSS" ? "bg-red-500/20 text-red-400 border-red-500/30" :
                        "bg-gray-500/20 text-gray-400 border-gray-500/30"
                      }>
                        {play.outcome}
                      </Badge>
                    )}
                  </div>
                  <div className="text-right">
                    {play.pnl !== undefined && (
                      <p className={`text-lg font-bold font-mono ${play.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {play.pnl >= 0 ? "+" : ""}${play.pnl.toLocaleString()}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">{play.status}</p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4">{play.aiThesis}</p>

                {/* User Rating */}
                {play.executed && (
                  <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-2">Your Rating (teaches the AI)</p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => ratePlay(play.id, star)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`h-5 w-5 ${
                              (play.userRating || 0) >= star
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-muted-foreground"
                            }`}
                          />
                        </button>
                      ))}
                      {play.userRating && (
                        <span className="text-xs text-muted-foreground ml-2 self-center">
                          {play.userRating}/5
                        </span>
                      )}
                    </div>
                    {play.userFeedback && (
                      <p className="text-xs text-muted-foreground mt-2 italic">
                        "{play.userFeedback}"
                      </p>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  {!play.executed && (
                    <Button size="sm" onClick={() => markExecuted(play.id)}>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Mark Executed
                    </Button>
                  )}
                  {play.executed && !play.outcome && (
                    <>
                      <Button size="sm" variant="outline" className="text-green-400" onClick={() => markOutcome(play.id, "WIN")}>
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Win
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-400" onClick={() => markOutcome(play.id, "LOSS")}>
                        <TrendingDown className="h-4 w-4 mr-1" />
                        Loss
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => markOutcome(play.id, "BREAKEVEN")}>
                        Breakeven
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
