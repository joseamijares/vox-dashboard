"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MobileHeader } from "@/components/mobile-header";
import { Sidebar } from "@/components/sidebar";
import { BookOpen, Calendar, Loader2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { fmtCurrency } from "@/lib/format";
import { useState, useEffect } from "react";

async function getJournal() {
  const res = await fetch("/api/journal");
  if (!res.ok) throw new Error("Failed to fetch journal");
  const data = await res.json();
  return data.journal || [];
}

interface JournalEntry {
  id: number;
  timestamp: string;
  date: string;
  ticker: string;
  action: string;
  shares: number;
  price: number;
  notional: number;
  broker: string;
  reason: string;
  grade_at_entry: number;
  council_at_entry: string;
  notes: string;
  pnl: number | null;
  pnl_pct: number | null;
  tags: string[];
}

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getJournal();
        setEntries(data);
      } catch (e) {
        console.error("Failed to load journal:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getActionBadge = (action: string) => {
    switch (action) {
      case "ADD":
      case "BUY":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "SELL":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "TRIM":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "NOTE":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading journal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader />
      <Sidebar />
      <main className="pt-14 lg:pt-0 lg:ml-64 p-4 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Trade Journal</h1>
          <p className="text-muted-foreground text-sm">
            {entries.length} entries — all trades and notes
          </p>
        </div>

        <Card className="vox-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Journal ({entries.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {entries.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No entries yet</h3>
                <p className="text-sm text-muted-foreground">
                  Trades and notes will appear here automatically.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {entries.map((entry) => (
                  <div key={entry.id} className="flex items-start justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold font-mono">{entry.ticker}</span>
                        <Badge variant="outline" className={getActionBadge(entry.action)}>
                          {entry.action}
                        </Badge>
                        {entry.grade_at_entry > 0 && (
                          <Badge variant="outline" className="text-xs">
                            Grade: {entry.grade_at_entry}
                          </Badge>
                        )}
                        {entry.council_at_entry && (
                          <Badge variant="outline" className="text-xs text-purple-400">
                            {entry.council_at_entry}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{entry.reason}</p>
                      {entry.notes && (
                        <p className="text-xs text-muted-foreground mt-1">{entry.notes}</p>
                      )}
                      {entry.tags && entry.tags.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {entry.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                        <Calendar className="h-3 w-3" />
                        {entry.date}
                      </div>
                      {entry.shares > 0 && (
                        <>
                          <p className="font-mono text-sm">
                            {entry.shares.toFixed(2)} @ ${entry.price?.toFixed(2)}
                          </p>
                          <p className="font-mono text-sm font-bold">
                            ${entry.notional?.toLocaleString()}
                          </p>
                        </>
                      )}
                      {entry.pnl !== null && entry.pnl !== undefined && (
                        <div className={`flex items-center gap-1 text-sm ${entry.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                          {entry.pnl >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {entry.pnl >= 0 ? "+" : ""}${entry.pnl.toLocaleString()}
                          {entry.pnl_pct !== null && (
                            <span className="text-xs">({entry.pnl_pct >= 0 ? "+" : ""}{entry.pnl_pct.toFixed(1)}%)</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
