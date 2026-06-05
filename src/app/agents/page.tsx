"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MobileHeader } from "@/components/mobile-header";
import { Sidebar } from "@/components/sidebar";
import { 
  Bot, Clock, Activity, Newspaper, TrendingUp, 
  MessageSquare, Volume2, Brain, 
  Shield, BarChart3, Zap, AlertTriangle, CheckCircle,
  Loader2, RefreshCw
} from "lucide-react";

interface Agent {
  id: string;
  name: string;
  description: string;
  script: string;
  schedule: string;
  lastRun: string;
  status: "active" | "paused" | "error";
  outputs: string[];
  icon: any;
  category: string;
}

const agents: Agent[] = [
  {
    id: "news",
    name: "News Intelligence",
    description: "Scans breaking news for portfolio tickers. Scores relevance, sentiment, and stores high-impact alerts.",
    script: "vox_news_agent.py",
    schedule: "Every 4 hours",
    lastRun: "—",
    status: "active",
    outputs: ["news_intelligence/news_intelligence.json"],
    icon: Newspaper,
    category: "Intelligence"
  },
  {
    id: "trump",
    name: "Trump Tracker",
    description: "Monitors Trump statements, Truth Social, X posts. Detects market-moving commentary on tariffs, trade, sectors.",
    script: "vox_trump_agent.py",
    schedule: "Every 4 hours",
    lastRun: "—",
    status: "active",
    outputs: ["trump_intelligence/trump_intelligence.json"],
    icon: Shield,
    category: "Intelligence"
  },
  {
    id: "reddit",
    name: "Reddit Intelligence",
    description: "Tracks r/wallstreetbets, r/stocks, r/investing. Extracts ticker mentions, sentiment, hype scores.",
    script: "vox_reddit_agent.py",
    schedule: "Every 4 hours",
    lastRun: "—",
    status: "active",
    outputs: ["reddit_intelligence/reddit_intelligence.json"],
    icon: MessageSquare,
    category: "Intelligence"
  },
  {
    id: "x",
    name: "X/Twitter Intelligence",
    description: "Monitors X for ticker mentions, sentiment shifts, influencer activity. Tracks momentum and engagement.",
    script: "vox_x_agent.py",
    schedule: "Every 4 hours",
    lastRun: "—",
    status: "active",
    outputs: ["x_intelligence/x_intelligence.json"],
    icon: MessageSquare,
    category: "Intelligence"
  },
  {
    id: "volume",
    name: "Volume Intelligence",
    description: "Detects unusual volume patterns, accumulation/distribution, institutional flow anomalies.",
    script: "vox_volume_intelligence.py",
    schedule: "Every 4 hours",
    lastRun: "—",
    status: "active",
    outputs: ["volume_intelligence/volume_intelligence.json"],
    icon: Volume2,
    category: "Intelligence"
  },
  {
    id: "debrief",
    name: "Debrief Agent",
    description: "Aggregates ALL intelligence sources into unified daily report. Cross-signal alerts, watchlist adds.",
    script: "vox_debrief_agent.py",
    schedule: "Every 4 hours",
    lastRun: "—",
    status: "active",
    outputs: ["debriefs/debrief_latest.json"],
    icon: Brain,
    category: "Orchestration"
  },
  {
    id: "stock_researcher",
    name: "Stock Researcher",
    description: "Continuous technical + fundamental research. Grades, entry/exit levels, thesis for 50+ tickers.",
    script: "vox_stock_researcher.py",
    schedule: "Every 4 hours",
    lastRun: "—",
    status: "active",
    outputs: ["research_reports/*.json"],
    icon: TrendingUp,
    category: "Research"
  },
  {
    id: "crypto_researcher",
    name: "Crypto Researcher",
    description: "On-chain metrics, CoinGecko data, exchange flows, funding rates for 15+ crypto assets.",
    script: "vox_crypto_researcher.py",
    schedule: "Every 4 hours",
    lastRun: "—",
    status: "active",
    outputs: ["crypto_research/*.json"],
    icon: Zap,
    category: "Research"
  },
  {
    id: "macro",
    name: "Macro Agent",
    description: "Monitors VIX, 10Y yields, DXY, Fed policy. Outputs risk regime and regime-adjusted multipliers.",
    script: "vox_macro_agent.py",
    schedule: "Every 4 hours",
    lastRun: "—",
    status: "active",
    outputs: ["vox_macro_analysis.json"],
    icon: BarChart3,
    category: "Research"
  },
  {
    id: "sector",
    name: "Sector Agent",
    description: "Tracks 11 sector ETFs, relative strength, rotation patterns. Outputs sector rankings and signals.",
    script: "vox_sector_agent.py",
    schedule: "Every 4 hours",
    lastRun: "—",
    status: "active",
    outputs: ["vox_sector_rotation.json"],
    icon: Activity,
    category: "Research"
  },
];

export default function AgentsPage() {
  const [logs, setLogs] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      try {
        // In a real implementation, these would be fetched from an API
        // For now, we'll show the agent definitions
        setLoading(false);
      } catch (e) {
        console.error("Failed to load agent logs:", e);
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  const activeCount = agents.filter(a => a.status === "active").length;
  const totalRuns = agents.length * 6; // 6 runs per day (every 4h)

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader />
      <Sidebar />
      <main className="pt-14 lg:pt-0 lg:ml-64 p-4 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            Agent Control Center
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {agents.length} autonomous research agents • {activeCount} active • ~{totalRuns} runs/day
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="vox-card">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">{agents.length}</div>
              <div className="text-xs text-muted-foreground">Total Agents</div>
            </CardContent>
          </Card>
          <Card className="vox-card">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-400">{activeCount}</div>
              <div className="text-xs text-muted-foreground">Active</div>
            </CardContent>
          </Card>
          <Card className="vox-card">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-400">{totalRuns}</div>
              <div className="text-xs text-muted-foreground">Runs/Day</div>
            </CardContent>
          </Card>
          <Card className="vox-card">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-400">6</div>
              <div className="text-xs text-muted-foreground">Intelligence Sources</div>
            </CardContent>
          </Card>
        </div>

        {/* Agents by Category */}
        {["Intelligence", "Research", "Orchestration"].map(category => {
          const categoryAgents = agents.filter(a => a.category === category);
          return (
            <div key={category} className="mb-8">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                {category === "Intelligence" && <Newspaper className="h-5 w-5 text-primary" />}
                {category === "Research" && <TrendingUp className="h-5 w-5 text-primary" />}
                {category === "Orchestration" && <Brain className="h-5 w-5 text-primary" />}
                {category} Agents
              </h2>
              
              <div className="grid gap-4">
                {categoryAgents.map(agent => {
                  const Icon = agent.icon;
                  return (
                    <Card key={agent.id} className="vox-card">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">{agent.name}</h3>
                                <Badge variant={agent.status === "active" ? "default" : "secondary"} className="text-xs">
                                  {agent.status === "active" ? (
                                    <span className="flex items-center gap-1">
                                      <CheckCircle className="h-3 w-3" /> Active
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-1">
                                      <AlertTriangle className="h-3 w-3" /> Paused
                                    </span>
                                  )}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">{agent.description}</p>
                              
                              <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {agent.schedule}
                                </span>
                                <span className="flex items-center gap-1">
                                  <RefreshCw className="h-3 w-3" />
                                  Last: {agent.lastRun}
                                </span>
                              </div>
                              
                              <div className="mt-2">
                                <code className="text-xs bg-muted px-2 py-1 rounded">{agent.script}</code>
                              </div>
                              
                              <div className="mt-2 flex flex-wrap gap-1">
                                {agent.outputs.map(out => (
                                  <code key={out} className="text-xs bg-muted/50 px-2 py-0.5 rounded text-muted-foreground">
                                    {out}
                                  </code>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Pipeline Flow */}
        <Card className="vox-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Pipeline Flow (Every 4 Hours)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Badge variant="outline">Live Prices</Badge>
              <span className="text-muted-foreground">→</span>
              <Badge variant="outline">News</Badge>
              <span className="text-muted-foreground">→</span>
              <Badge variant="outline">Trump</Badge>
              <span className="text-muted-foreground">→</span>
              <Badge variant="outline">Reddit</Badge>
              <span className="text-muted-foreground">→</span>
              <Badge variant="outline">X</Badge>
              <span className="text-muted-foreground">→</span>
              <Badge variant="outline">Volume</Badge>
              <span className="text-muted-foreground">→</span>
              <Badge variant="outline">Research</Badge>
              <span className="text-muted-foreground">→</span>
              <Badge variant="outline">Debrief</Badge>
              <span className="text-muted-foreground">→</span>
              <Badge variant="default">Alerts</Badge>
              <span className="text-muted-foreground">→</span>
              <Badge variant="outline">Postgres</Badge>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
