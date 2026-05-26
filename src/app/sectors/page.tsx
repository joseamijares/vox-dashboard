"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MobileHeader } from "@/components/mobile-header";
import { Sidebar } from "@/components/sidebar";

interface SectorData {
  name: string;
  description: string;
  thesis: string;
  momentum: string;
  key_companies: string[];
  etfs: string[];
  portfolio_overlap: string[];
  watchlist_candidates: string[];
  alerts: Array<{
    level: string;
    message: string;
    action: string;
  }>;
}

interface SectorWatchlistData {
  timestamp: string;
  sectors: Record<string, SectorData>;
  summary: {
    total_sectors: number;
    strong_momentum: number;
    building_momentum: number;
    portfolio_coverage: Record<string, number>;
  };
}

export default function SectorsPage() {
  const [data, setData] = useState<SectorWatchlistData | null>(null);

  useEffect(() => {
    fetch("/vox_sector_watchlist.json")
      .then((r) => r.json())
      .then((data) => setData(data))
      .catch(() => setData(null));
  }, []);

  const getMomentumColor = (momentum: string) => {
    if (momentum === "STRONG") return "bg-green-500/20 text-green-400 border-green-500/30";
    if (momentum === "BUILDING") return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    return "bg-blue-500/20 text-blue-400 border-blue-500/30";
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-background">
      <MobileHeader />
      <Sidebar />
        <main className="pt-14 lg:pt-0 lg:ml-64 p-4 lg:p-8">
          <p className="text-muted-foreground">Loading sectors...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader />
      <Sidebar />
      <main className="pt-14 lg:pt-0 lg:ml-64 p-4 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Sector Watchlist</h1>
          <p className="text-muted-foreground text-sm">
            Autonomous sector research and watchlist
          </p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{data.summary.total_sectors}</div>
              <div className="text-sm text-muted-foreground">Sectors Tracked</div>
            </CardContent>
          </Card>
          <Card className="bg-green-500/5 border-green-500/20">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-400">{data.summary.strong_momentum}</div>
              <div className="text-sm text-muted-foreground">Strong Momentum</div>
            </CardContent>
          </Card>
          <Card className="bg-amber-500/5 border-amber-500/20">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-amber-400">{data.summary.building_momentum}</div>
              <div className="text-sm text-muted-foreground">Building Momentum</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {Object.values(data.summary.portfolio_coverage).reduce((a, b) => a + b, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Portfolio Positions</div>
            </CardContent>
          </Card>
        </div>

        {/* Sectors */}
        <div className="space-y-4">
          {Object.entries(data.sectors).map(([name, sector]) => (
            <Card key={name}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-lg">{name}</span>
                      <Badge className={getMomentumColor(sector.momentum)}>
                        {sector.momentum}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{sector.description}</p>
                  </div>
                </div>

                <div className="text-sm mb-3">
                  <span className="font-medium">Thesis:</span> {sector.thesis}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">In Portfolio</p>
                    <div className="flex flex-wrap gap-1">
                      {sector.portfolio_overlap.length > 0 ? (
                        sector.portfolio_overlap.map((t) => (
                          <Badge key={t} variant="outline" className="text-green-400">
                            {t}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">None</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Watchlist</p>
                    <div className="flex flex-wrap gap-1">
                      {sector.watchlist_candidates.map((t) => (
                        <Badge key={t} variant="outline">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-2">
                  <span className="text-xs text-muted-foreground mr-2">ETFs:</span>
                  {sector.etfs.map((etf) => (
                    <Badge key={etf} variant="outline" className="text-xs">
                      {etf}
                    </Badge>
                  ))}
                </div>

                {sector.alerts.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border">
                    {sector.alerts.map((alert, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-amber-400">🚨</span>
                        <span className="text-sm">{alert.message}</span>
                        <Badge variant="outline" className="text-amber-400">
                          {alert.action}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-xs text-muted-foreground mt-6">
          Generated: {new Date(data.timestamp).toLocaleString()}
        </p>
      </main>
    </div>
  );
}
