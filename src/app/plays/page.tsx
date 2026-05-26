"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MobileHeader } from "@/components/mobile-header";
import { Sidebar } from "@/components/sidebar";
import { getPlays } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

interface Play {
  ticker: string;
  action: string;
  priority: string;
  reason: string;
  current_value?: number;
  current_shares?: number;
  sell_shares?: number;
  keep_shares?: number;
  sell_value?: number;
  price?: number;
  pnl?: number;
  execution?: string;
  suggestion?: string;
  options?: string[];
  protected?: boolean;
  note?: string;
  brokers?: string[];
}

interface PlaysData {
  timestamp: string;
  market_date: string;
  summary: {
    total_positions: number;
    sell_signals: number;
    trim_signals: number;
    hold_signals: number;
    protected: number;
  };
  must_do: Play[];
  should_do: Play[];
  watch: Play[];
}

export default function PlaysPage() {
  const [data, setData] = useState<PlaysData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // Try Supabase first
        const plays = await getPlays();
        if (plays && plays.length > 0) {
          // Transform Supabase plays to PlaysData format
          const mustDo = plays.filter((p: any) => p.action === "SELL").map((p: any) => ({
            ticker: p.ticker,
            action: p.action,
            priority: "HIGH",
            reason: p.reason || `${p.action} ${p.shares?.toFixed(2)} shares @ $${p.price}`,
            price: p.price,
            pnl: p.pnl,
            execution: `${p.action} ${p.shares?.toFixed(2)} shares`,
          }));
          
          const shouldDo = plays.filter((p: any) => p.action === "TRIM").map((p: any) => ({
            ticker: p.ticker,
            action: p.action,
            priority: "MEDIUM",
            reason: p.reason || `${p.action} ${p.shares?.toFixed(2)} shares @ $${p.price}`,
            price: p.price,
            pnl: p.pnl,
          }));
          
          const watch = plays.filter((p: any) => p.action === "ADD" || p.action === "BUY").map((p: any) => ({
            ticker: p.ticker,
            action: p.action,
            priority: "LOW",
            reason: p.reason || `${p.action} ${p.shares?.toFixed(2)} shares @ $${p.price}`,
            price: p.price,
            pnl: p.pnl,
          }));

          setData({
            timestamp: new Date().toISOString(),
            market_date: new Date().toISOString().split('T')[0],
            summary: {
              total_positions: plays.length,
              sell_signals: mustDo.length,
              trim_signals: shouldDo.length,
              hold_signals: watch.length,
              protected: 0,
            },
            must_do: mustDo,
            should_do: shouldDo,
            watch: watch,
          });
        } else {
          // Fallback to JSON
          const res = await fetch("/vox_tomorrow_plays.json");
          if (res.ok) {
            const jsonData = await res.json();
            setData(jsonData);
          }
        }
      } catch (e) {
        console.error("Failed to load plays:", e);
        // Fallback to JSON
        try {
          const res = await fetch("/vox_tomorrow_plays.json");
          if (res.ok) {
            const jsonData = await res.json();
            setData(jsonData);
          }
        } catch (e2) {
          console.error("JSON fallback also failed:", e2);
        }
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getActionBadge = (action: string) => {
    if (action === "SELL") return "bg-red-500/20 text-red-400 border-red-500/30";
    if (action === "TRIM") return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    if (action === "BUY") return "bg-green-500/20 text-green-400 border-green-500/30";
    if (action === "REVIEW_STOP") return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    if (action === "TRAILING_STOP") return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    if (action === "EARNINGS_HEDGE") return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    if (action === "HOLD") return "bg-green-500/20 text-green-400 border-green-500/30";
    return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading plays from Supabase...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background">
      <MobileHeader />
      <Sidebar />
        <main className="pt-14 lg:pt-0 lg:ml-64 p-4 lg:p-8">
          <p>No plays generated yet</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader />
      <Sidebar />
      <main className="pt-14 lg:pt-0 lg:ml-64 p-4 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Tomorrow's Plays</h1>
          <p className="text-muted-foreground text-sm">
            {data.market_date} | {data.summary.total_positions} positions analyzed
          </p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="bg-red-500/10 border-red-500/20">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-400">{data.must_do.length}</div>
              <div className="text-sm text-muted-foreground">Must Do</div>
            </CardContent>
          </Card>
          <Card className="bg-amber-500/10 border-amber-500/20">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-amber-400">{data.should_do.length}</div>
              <div className="text-sm text-muted-foreground">Should Do</div>
            </CardContent>
          </Card>
          <Card className="bg-blue-500/10 border-blue-500/20">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-400">{data.watch.length}</div>
              <div className="text-sm text-muted-foreground">Watch</div>
            </CardContent>
          </Card>
          <Card className="bg-purple-500/10 border-purple-500/20">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-purple-400">{data.summary.protected}</div>
              <div className="text-sm text-muted-foreground">Protected</div>
            </CardContent>
          </Card>
        </div>

        {/* MUST DO */}
        {data.must_do.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <span className="text-red-500">🔴</span> MUST DO
            </h2>
            <div className="space-y-2">
              {data.must_do.map((play, i) => (
                <Card key={i} className="bg-red-500/5 border-red-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-lg">{play.ticker}</span>
                          <Badge className={getActionBadge(play.action)}>
                            {play.action}
                          </Badge>
                          <Badge variant="outline" className="text-red-400 border-red-500/30">
                            {play.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{play.reason}</p>
                        
                        {play.execution && (
                          <p className="text-sm font-mono bg-muted rounded p-2">
                            {play.execution}
                          </p>
                        )}
                        
                        {play.current_shares !== undefined && (
                          <div className="text-sm text-muted-foreground mt-2">
                            <span>Current: {play.current_shares?.toFixed ? play.current_shares.toFixed(4) : play.current_shares} shares</span>
                            {play.sell_shares !== undefined && (
                              <span className="ml-4">Sell: {play.sell_shares?.toFixed ? play.sell_shares.toFixed(4) : play.sell_shares}</span>
                            )}
                            {play.keep_shares !== undefined && (
                              <span className="ml-4">Keep: {play.keep_shares?.toFixed ? play.keep_shares.toFixed(4) : play.keep_shares}</span>
                            )}
                          </div>
                        )}
                        
                        {play.suggestion && (
                          <p className="text-sm text-amber-400 mt-2">💡 {play.suggestion}</p>
                        )}
                      </div>
                      
                      {play.current_value && (
                        <div className="text-right ml-4">
                          <div className="font-mono">${play.current_value.toLocaleString()}</div>
                          {play.pnl !== undefined && (
                            <div className={`text-sm ${play.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                              {play.pnl >= 0 ? "+" : ""}${play.pnl.toLocaleString()}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* SHOULD DO */}
        {data.should_do.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <span className="text-amber-500">🟡</span> SHOULD DO
            </h2>
            <div className="space-y-2">
              {data.should_do.map((play, i) => (
                <Card key={i} className="bg-amber-500/5 border-amber-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-lg">{play.ticker}</span>
                          <Badge className={getActionBadge(play.action)}>
                            {play.action}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{play.reason}</p>
                        
                        {play.options && (
                          <div className="space-y-1">
                            {play.options.map((opt, j) => (
                              <p key={j} className="text-sm text-muted-foreground">
                                • {opt}
                              </p>
                            ))}
                          </div>
                        )}
                        
                        {play.suggestion && (
                          <p className="text-sm text-amber-400 mt-2">💡 {play.suggestion}</p>
                        )}
                      </div>
                      
                      {play.current_value && (
                        <div className="text-right ml-4">
                          <div className="font-mono">${play.current_value.toLocaleString()}</div>
                          {play.pnl !== undefined && (
                            <div className={`text-sm ${play.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                              {play.pnl >= 0 ? "+" : ""}${play.pnl.toLocaleString()}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* WATCH */}
        {data.watch.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <span className="text-blue-500">⚪</span> WATCH
            </h2>
            <div className="space-y-2">
              {data.watch.map((play, i) => (
                <Card key={i} className={play.protected ? "bg-purple-500/5 border-purple-500/20" : "bg-blue-500/5 border-blue-500/20"}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-lg">{play.ticker}</span>
                          {play.protected ? (
                            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                              🛒 PROTECTED
                            </Badge>
                          ) : (
                            <Badge className={getActionBadge(play.action)}>
                              {play.action}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{play.reason}</p>
                        
                        {play.note && (
                          <p className="text-sm text-purple-400 mt-2">{play.note}</p>
                        )}
                      </div>
                      
                      {play.current_value && (
                        <div className="text-right ml-4">
                          <div className="font-mono">${play.current_value.toLocaleString()}</div>
                          {play.pnl !== undefined && (
                            <div className={`text-sm ${play.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                              {play.pnl >= 0 ? "+" : ""}${play.pnl.toLocaleString()}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Generated: {new Date(data.timestamp).toLocaleString()} | 
          Run: python3 vox_chat.py --interactive for natural language queries
        </p>
      </main>
    </div>
  );
}
