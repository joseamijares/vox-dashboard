"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageShell } from "@/components/vox-nav";
import { VoxBadge } from "@/components/vox";
import { Globe, AlertTriangle, Shield, RefreshCw } from "lucide-react";

interface GeoEvent {
  id: number;
  event_type: string;
  severity: string;
  region: string;
  description: string;
  affected_sectors: string[];
  affected_tickers: string[];
  source_url: string;
  created_at: string;
}

export default function GeopoliticalPage() {
  const [events, setEvents] = useState<GeoEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchEvents() {
    try {
      const res = await fetch("/api/geopolitical");
      const data = await res.json();
      setEvents(data.events || []);
    } catch (e) {
      console.error("Failed to fetch geopolitical events:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 300000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  const severityColor = (s: string) => {
    if (s === "CRITICAL") return "bg-red-500/20 text-red-400 border-red-500/30";
    if (s === "HIGH") return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    if (s === "MEDIUM") return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    return "bg-blue-500/20 text-blue-400 border-blue-500/30";
  };

  return (
    <PageShell>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Geopolitical Risk</h1>
              <p className="text-sm text-neutral-500 mt-1">War, sanctions, trade disputes affecting markets</p>
            </div>
            <button onClick={handleRefresh} disabled={refreshing} className="p-2 rounded-lg hover:bg-neutral-100 transition-colors">
              <RefreshCw className={`h-4 w-4 text-neutral-500 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-neutral-400">Loading geopolitical data...</div>
          ) : events.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Shield className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-700">No Active Geopolitical Events</h3>
                <p className="text-sm text-neutral-500 mt-2">All regions reporting stable conditions</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {events.map((event) => (
                <Card key={event.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {event.severity === "CRITICAL" ? (
                          <AlertTriangle className="h-5 w-5 text-red-400" />
                        ) : (
                          <Globe className="h-5 w-5 text-blue-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium text-neutral-900">{event.event_type}</h3>
                          <Badge className={severityColor(event.severity)}>{event.severity}</Badge>
                          <span className="text-xs text-neutral-400">{event.region}</span>
                        </div>
                        <p className="text-sm text-neutral-600 mt-1">{event.description}</p>
                        {event.affected_sectors && event.affected_sectors.length > 0 && (
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-neutral-500">Sectors:</span>
                            {event.affected_sectors.map((s) => (
                              <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                            ))}
                          </div>
                        )}
                        {event.affected_tickers && event.affected_tickers.length > 0 && (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-neutral-500">Tickers:</span>
                            {event.affected_tickers.map((t) => (
                              <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
    </PageShell>
  );
}
