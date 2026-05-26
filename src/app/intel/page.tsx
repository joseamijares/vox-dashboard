"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MobileHeader } from "@/components/mobile-header";
import { Sidebar } from "@/components/sidebar";

interface IntelItem {
  category: string;
  priority: string;
  title: string;
  body: string;
  tickers: string[];
  action: string;
  source: string;
  timestamp: string;
}

interface IntelData {
  timestamp: string;
  portfolio_value: number;
  regime: string;
  total_items: number;
  high_priority: number;
  medium_priority: number;
  low_priority: number;
  items: IntelItem[];
  sources: string[];
}

export default function IntelPage() {
  const [data, setData] = useState<IntelData | null>(null);

  useEffect(() => {
    fetch("/vox_intelligence.json")
      .then((r) => r.json())
      .then((data) => setData(data))
      .catch(() => setData(null));
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen bg-background">
      <MobileHeader />
      <Sidebar />
        <main className="pt-14 lg:pt-0 lg:ml-64 p-4 lg:p-8">
          <p className="text-muted-foreground">Loading intelligence...</p>
        </main>
      </div>
    );
  }

  const highItems = data.items.filter((i) => i.priority === "HIGH");
  const medItems = data.items.filter((i) => i.priority === "MEDIUM");
  const lowItems = data.items.filter((i) => i.priority === "LOW");

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader />
      <Sidebar />
      <main className="pt-14 lg:pt-0 lg:ml-64 p-4 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Intelligence</h1>
          <p className="text-muted-foreground text-sm">
            Real-time intelligence from all tracking sources
          </p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="bg-red-500/5 border-red-500/20">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-400">{data.high_priority}</div>
              <div className="text-sm text-muted-foreground">High Priority</div>
            </CardContent>
          </Card>
          <Card className="bg-amber-500/5 border-amber-500/20">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-amber-400">{data.medium_priority}</div>
              <div className="text-sm text-muted-foreground">Medium Priority</div>
            </CardContent>
          </Card>
          <Card className="bg-blue-500/5 border-blue-500/20">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-400">{data.low_priority}</div>
              <div className="text-sm text-muted-foreground">Low Priority</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{data.regime}</div>
              <div className="text-sm text-muted-foreground">Market Regime</div>
            </CardContent>
          </Card>
        </div>

        {/* Sources */}
        <div className="flex flex-wrap gap-2 mb-6">
          {data.sources.map((source) => (
            <Badge key={source} variant="outline">
              {source}
            </Badge>
          ))}
        </div>

        {/* Intelligence Items */}
        <div className="space-y-4">
          {highItems.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3 text-red-400">🔴 High Priority</h2>
              <div className="space-y-2">
                {highItems.map((item, i) => (
                  <Card key={i} className="bg-red-500/5 border-red-500/20">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className="font-bold">{item.title}</span>
                          <Badge className="ml-2 bg-red-500/20 text-red-400 border-red-500/30">
                            {item.category}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">{item.source}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{item.body}</p>
                      {item.tickers.length > 0 && (
                        <div className="flex gap-1 mb-2">
                          {item.tickers.map((t) => (
                            <Badge key={t} variant="outline" className="text-xs">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <Badge variant="outline" className="text-red-400 border-red-500/30">
                        Action: {item.action}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {medItems.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3 text-amber-400">🟡 Medium Priority</h2>
              <div className="space-y-2">
                {medItems.map((item, i) => (
                  <Card key={i} className="bg-amber-500/5 border-amber-500/20">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className="font-bold">{item.title}</span>
                          <Badge className="ml-2 bg-amber-500/20 text-amber-400 border-amber-500/30">
                            {item.category}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">{item.source}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{item.body}</p>
                      {item.tickers.length > 0 && (
                        <div className="flex gap-1 mb-2">
                          {item.tickers.map((t) => (
                            <Badge key={t} variant="outline" className="text-xs">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <Badge variant="outline" className="text-amber-400 border-amber-500/30">
                        Action: {item.action}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {lowItems.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3 text-blue-400">⚪ Low Priority</h2>
              <div className="space-y-2">
                {lowItems.map((item, i) => (
                  <Card key={i} className="bg-blue-500/5 border-blue-500/20">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className="font-bold">{item.title}</span>
                          <Badge className="ml-2 bg-blue-500/20 text-blue-400 border-blue-500/30">
                            {item.category}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">{item.source}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{item.body}</p>
                      {item.tickers.length > 0 && (
                        <div className="flex gap-1 mb-2">
                          {item.tickers.map((t) => (
                            <Badge key={t} variant="outline" className="text-xs">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <Badge variant="outline" className="text-blue-400 border-blue-500/30">
                        Action: {item.action}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground mt-6">
          Generated: {new Date(data.timestamp).toLocaleString()} | Sources: {data.sources.join(", ")}
        </p>
      </main>
    </div>
  );
}
