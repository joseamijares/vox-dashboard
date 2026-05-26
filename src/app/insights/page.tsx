"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MobileHeader } from "@/components/mobile-header";
import { Sidebar } from "@/components/sidebar";
import Link from "next/link";

interface Insight {
  id: string;
  priority: string;
  icon: string;
  title: string;
  body: string;
  action: string;
  action_link: string;
  timestamp: string;
}

export default function InsightsPage() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/vox_insights.json")
      .then((r) => r.json())
      .then((data) => {
        setInsights(data.insights || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getPriorityColor = (priority: string) => {
    if (priority === "high") return "bg-red-500/10 border-red-500/20";
    if (priority === "medium") return "bg-amber-500/10 border-amber-500/20";
    return "bg-blue-500/10 border-blue-500/20";
  };

  const getPriorityBadge = (priority: string) => {
    if (priority === "high") return "bg-red-500/20 text-red-400 border-red-500/30";
    if (priority === "medium") return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    return "bg-blue-500/20 text-blue-400 border-blue-500/30";
  };

  const highCount = insights.filter((i) => i.priority === "high").length;
  const mediumCount = insights.filter((i) => i.priority === "medium").length;

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader />
      <Sidebar />
      <main className="pt-14 lg:pt-0 lg:ml-64 p-4 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Insights</h1>
          <p className="text-muted-foreground text-sm">
            Proactive intelligence — what you need to know now
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="h-32 w-full bg-muted animate-pulse rounded" />
            <div className="h-32 w-full bg-muted animate-pulse rounded" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-red-500/10 border-red-500/20">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-red-400">{highCount}</div>
                  <div className="text-sm text-muted-foreground">High Priority</div>
                </CardContent>
              </Card>
              <Card className="bg-amber-500/10 border-amber-500/20">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-amber-400">{mediumCount}</div>
                  <div className="text-sm text-muted-foreground">Medium Priority</div>
                </CardContent>
              </Card>
              <Card className="bg-blue-500/10 border-blue-500/20">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-blue-400">{insights.length}</div>
                  <div className="text-sm text-muted-foreground">Total Insights</div>
                </CardContent>
              </Card>
            </div>

            {/* Insights List */}
            <div className="space-y-3">
              {insights.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    <p className="text-lg mb-2">No insights yet</p>
                    <p className="text-sm">Run: python3 vox_insights_generator.py generate</p>
                  </CardContent>
                </Card>
              ) : (
                insights.map((insight) => (
                  <Card key={insight.id} className={getPriorityColor(insight.priority)}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{insight.icon}</span>
                            <span className="font-semibold">{insight.title}</span>
                            <Badge
                              variant="outline"
                              className={getPriorityBadge(insight.priority)}
                            >
                              {insight.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {insight.body}
                          </p>
                          <Link
                            href={insight.action_link}
                            className="text-sm text-primary hover:underline"
                          >
                            → {insight.action}
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
