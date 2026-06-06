"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MobileHeader } from "@/components/mobile-header";
import { Sidebar } from "@/components/sidebar";
import { useState, useEffect } from "react";
import { Search, TrendingUp, TrendingDown, Loader2, BarChart3, Activity } from "lucide-react";

interface Sp500Grade {
  ticker: string;
  name: string;
  sector: string;
  vox_grade: number;
  technical_score: number;
  fundamental_score: number;
  macro_score: number;
  sector_score: number;
  weather_score: number;
  sentiment_score: number;
  computed_at: string;
}

interface SectorLeader {
  sector: string;
  ticker: string;
  rank: number;
  change_5d_pct: number;
  momentum_score: number;
}

interface Distribution {
  bucket: string;
  count: number;
}

interface Summary {
  universeCount: number;
  gradesCount: number;
  leadersCount: number;
  distribution: Distribution[];
  top10: Sp500Grade[];
  bottom10: Sp500Grade[];
  lastUpdated: string;
}

function gradeBadgeClass(grade: number) {
  if (grade >= 70) return "bg-green-500/20 text-green-600 border-green-500/30";
  if (grade >= 60) return "bg-blue-500/20 text-blue-600 border-blue-500/30";
  if (grade >= 50) return "bg-yellow-500/20 text-yellow-600 border-yellow-500/30";
  if (grade >= 40) return "bg-orange-500/20 text-orange-600 border-orange-500/30";
  return "bg-red-500/20 text-red-600 border-red-500/30";
}

function gradeLabel(grade: number) {
  if (grade >= 70) return "STRONG BUY";
  if (grade >= 60) return "BUY";
  if (grade >= 50) return "HOLD";
  if (grade >= 40) return "TRIM";
  return "SELL";
}

export default function ScreenerPage() {
  const [activeTab, setActiveTab] = useState("grades");
  const [filter, setFilter] = useState("");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [leaders, setLeaders] = useState<SectorLeader[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [summaryRes, leadersRes] = await Promise.all([
          fetch("/api/sp500?type=summary"),
          fetch("/api/sp500?type=leaders"),
        ]);

        if (!summaryRes.ok) throw new Error("Failed to fetch summary");
        if (!leadersRes.ok) throw new Error("Failed to fetch leaders");

        const summaryData = await summaryRes.json();
        const leadersData = await leadersRes.json();

        setSummary(summaryData);
        setLeaders(leadersData.leaders || []);
      } catch (err: any) {
        setError(err.message || "Failed to load S&P 500 data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const filteredGrades = summary?.top10
    ? [...summary.top10, ...(summary.bottom10 || [])]
        .filter(
          (g) =>
            g.ticker.toLowerCase().includes(filter.toLowerCase()) ||
            g.name?.toLowerCase().includes(filter.toLowerCase()) ||
            g.sector?.toLowerCase().includes(filter.toLowerCase())
        )
    : [];

  const groupedLeaders = leaders.reduce((acc, leader) => {
    if (!acc[leader.sector]) acc[leader.sector] = [];
    acc[leader.sector].push(leader);
    return acc;
  }, {} as Record<string, SectorLeader[]>);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <MobileHeader />
        <Sidebar />
        <main className="pt-14 lg:pt-0 lg:ml-64 p-4 lg:p-8 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground text-sm">Loading S&P 500 data...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <MobileHeader />
        <Sidebar />
        <main className="pt-14 lg:pt-0 lg:ml-64 p-4 lg:p-8">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            <p className="font-medium">Error loading S&P 500 screener</p>
            <p className="text-sm">{error}</p>
          </div>
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
          <h1 className="text-2xl font-bold tracking-tight">S&P 500 Screener</h1>
          <p className="text-muted-foreground text-sm">
            {summary ? (
              <>
                {summary.gradesCount} of {summary.universeCount} tickers graded •{" "}
                {summary.leadersCount} sector leaders • Updated{" "}
                {new Date(summary.lastUpdated).toLocaleString()}
              </>
            ) : (
              "Real-time S&P 500 grading and sector analysis"
            )}
          </p>
        </div>

        {/* Stats */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {summary.distribution.map((d) => (
              <Card key={d.bucket} className="vox-card">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">{d.bucket}</p>
                  <p className="text-2xl font-bold">{d.count}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="grades">
              <BarChart3 className="h-4 w-4 mr-2" />
              Grades
            </TabsTrigger>
            <TabsTrigger value="leaders">
              <Activity className="h-4 w-4 mr-2" />
              Sector Leaders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="grades" className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Filter by ticker, name, or sector..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGrades.map((g) => (
                <Card key={g.ticker} className="vox-card">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-lg font-bold font-mono">{g.ticker}</span>
                        <p className="text-xs text-muted-foreground truncate max-w-[180px]">{g.name}</p>
                      </div>
                      <Badge variant="outline" className={gradeBadgeClass(g.vox_grade)}>
                        {gradeLabel(g.vox_grade)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-3xl font-bold">{g.vox_grade}</span>
                      <span className="text-xs text-muted-foreground">{g.sector}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                      <div>T: {g.technical_score}</div>
                      <div>F: {g.fundamental_score}</div>
                      <div>M: {g.macro_score}</div>
                      <div>S: {g.sector_score}</div>
                      <div>W: {g.weather_score}</div>
                      <div>Se: {g.sentiment_score}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="leaders" className="space-y-6">
            {Object.entries(groupedLeaders).map(([sector, sectorLeaders]) => (
              <div key={sector}>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  {sector}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {sectorLeaders.map((leader) => (
                    <Card key={`${leader.sector}-${leader.ticker}`} className="vox-card">
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-muted-foreground">#{leader.rank}</span>
                            <span className="text-lg font-bold font-mono">{leader.ticker}</span>
                          </div>
                          {leader.change_5d_pct >= 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-2xl font-bold ${
                              leader.change_5d_pct >= 0 ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {leader.change_5d_pct >= 0 ? "+" : ""}
                            {leader.change_5d_pct.toFixed(2)}%
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Score: {leader.momentum_score.toFixed(1)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
