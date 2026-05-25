"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sidebar } from "@/components/sidebar";
import { getGradeBuckets, getPositions } from "@/lib/data";

export default function GradesPage() {
  const buckets = getGradeBuckets();
  const positions = getPositions();

  const gradeGroups = [
    { label: "Strong Buy", range: [70, 100], color: "#22c55e", positions: positions.filter((p) => p.grade >= 70) },
    { label: "Buy", range: [60, 70], color: "#3b82f6", positions: positions.filter((p) => p.grade >= 60 && p.grade < 70) },
    { label: "Hold", range: [50, 60], color: "#f59e0b", positions: positions.filter((p) => p.grade >= 50 && p.grade < 60) },
    { label: "Weak Hold", range: [40, 50], color: "#f97316", positions: positions.filter((p) => p.grade >= 40 && p.grade < 50) },
    { label: "Sell", range: [0, 40], color: "#ef4444", positions: positions.filter((p) => p.grade < 40) },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:ml-64 p-4 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Grade Scanner</h1>
          <p className="text-muted-foreground text-sm">
            88 positions graded | Last updated: May 27, 2026
          </p>
        </div>

        {/* Grade Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="vox-card">
            <CardHeader>
              <CardTitle>Grade Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {buckets.map((bucket) => (
                  <div key={bucket.name}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium" style={{ color: bucket.color }}>{bucket.name}</span>
                      <span className="font-mono">{bucket.count}</span>
                    </div>
                    <div className="h-8 bg-muted/30 rounded-lg overflow-hidden">
                      <div
                        className="h-full rounded-lg transition-all duration-500"
                        style={{
                          width: `${(bucket.count / 88) * 100}%`,
                          backgroundColor: bucket.color,
                          opacity: 0.8,
                        }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {((bucket.count / 88) * 100).toFixed(1)}% of portfolio
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="vox-card">
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {buckets.map((bucket) => (
                <div key={bucket.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span style={{ color: bucket.color }}>{bucket.name}</span>
                    <span className="font-mono">{bucket.count}</span>
                  </div>
                  <Progress
                    value={(bucket.count / 88) * 100}
                    className="h-2"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Grade Groups */}
        <div className="space-y-6">
          {gradeGroups.map((group) => (
            <Card key={group.label} className="vox-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: group.color }}
                  />
                  {group.label} ({group.positions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {group.positions.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No positions in this range</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {group.positions.map((p) => (
                      <div
                        key={p.ticker}
                        className="p-3 bg-muted/30 rounded-lg"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-semibold">{p.ticker}</div>
                            <div className="text-xs text-muted-foreground">{p.name}</div>
                          </div>
                          <Badge
                            variant="outline"
                            style={{
                              borderColor: group.color,
                              color: group.color,
                              backgroundColor: `${group.color}20`,
                            }}
                          >
                            {p.grade}
                          </Badge>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          ${p.value.toLocaleString()} | {p.broker}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
