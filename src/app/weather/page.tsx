"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageShell } from "@/components/vox-nav";
import { VoxBadge } from "@/components/vox";
import { CloudRain, Sun, Thermometer, Wind, AlertTriangle, RefreshCw } from "lucide-react";

interface WeatherRisk {
  id: number;
  region: string;
  risk_type: string;
  severity: string;
  description: string;
  affected_tickers: string[];
  max_temp: number;
  min_temp: number;
  precip_5day: number;
  created_at: string;
}

export default function WeatherPage() {
  const [risks, setRisks] = useState<WeatherRisk[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchRisks() {
    try {
      const res = await fetch("/api/weather");
      const data = await res.json();
      setRisks(data.risks || []);
    } catch (e) {
      console.error("Failed to fetch weather risks:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchRisks();
    const interval = setInterval(fetchRisks, 300000); // 5 min
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRisks();
  };

  const severityColor = (s: string) => {
    if (s === "EXTREME") return "bg-red-500/20 text-red-400 border-red-500/30";
    if (s === "HIGH") return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    if (s === "MEDIUM") return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    return "bg-blue-500/20 text-blue-400 border-blue-500/30";
  };

  const riskIcon = (type: string) => {
    if (type.includes("HEAT")) return <Thermometer className="h-4 w-4 text-red-400" />;
    if (type.includes("FROST")) return <Snowflake className="h-4 w-4 text-blue-400" />;
    if (type.includes("RAIN") || type.includes("FLOOD")) return <CloudRain className="h-4 w-4 text-blue-400" />;
    if (type.includes("DROUGHT")) return <Sun className="h-4 w-4 text-amber-400" />;
    return <Wind className="h-4 w-4 text-gray-400" />;
  };

  return (
    <PageShell>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Weather Intelligence</h1>
              <p className="text-sm text-neutral-500 mt-1">Agricultural risk monitoring for portfolio positions</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 text-neutral-500 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-neutral-400">Loading weather data...</div>
          ) : risks.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Sun className="h-12 w-12 text-amber-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-700">No Active Weather Risks</h3>
                <p className="text-sm text-neutral-500 mt-2">All agricultural regions reporting normal conditions</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {risks.map((risk) => (
                <Card key={risk.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">{riskIcon(risk.risk_type)}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-neutral-900">{risk.region}</h3>
                            <Badge className={severityColor(risk.severity)}>{risk.severity}</Badge>
                          </div>
                          <p className="text-sm text-neutral-600 mt-1">{risk.description}</p>
                          {risk.affected_tickers && risk.affected_tickers.length > 0 && (
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-neutral-500">Affected:</span>
                              {risk.affected_tickers.map((t) => (
                                <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-neutral-500">
                            {risk.max_temp !== null && <span>Max: {risk.max_temp}°C</span>}
                            {risk.min_temp !== null && <span>Min: {risk.min_temp}°C</span>}
                            {risk.precip_5day !== null && <span>Precip: {risk.precip_5day}mm</span>}
                          </div>
                        </div>
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

function Snowflake(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/>
      <path d="m20 16-4-4 4-4"/><path d="m4 8 4 4-4 4"/><path d="m16 4-4 4-4-4"/><path d="m8 20 4-4 4 4"/>
    </svg>
  );
}
