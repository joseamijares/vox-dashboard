"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sidebar } from "@/components/sidebar";
import { positions } from "@/lib/data";
import { Star, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

export default function ScorerPage() {
  const graded = positions.filter((p) => (p.grade || 0) > 0);
  const ungraded = positions.filter((p) => (p.grade || 0) === 0);

  const avgGrade = graded.length > 0
    ? graded.reduce((s, p) => s + (p.grade || 0), 0) / graded.length
    : 0;

  const strongBuy = graded.filter((p) => (p.grade || 0) >= 70);
  const buy = graded.filter((p) => (p.grade || 0) >= 60 && (p.grade || 0) < 70);
  const hold = graded.filter((p) => (p.grade || 0) >= 50 && (p.grade || 0) < 60);
  const weak = graded.filter((p) => (p.grade || 0) >= 40 && (p.grade || 0) < 50);
  const sell = graded.filter((p) => (p.grade || 0) > 0 && (p.grade || 0) < 40);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:ml-64 p-4 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Trade Scorer</h1>
          <p className="text-muted-foreground text-sm">
            Grade distribution across portfolio
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="vox-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Graded Positions</p>
                  <p className="text-2xl font-bold font-mono">{graded.length}</p>
                </div>
                <Star className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="vox-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ungraded</p>
                  <p className="text-2xl font-bold font-mono">{ungraded.length}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="vox-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Average Grade</p>
                  <p className="text-2xl font-bold font-mono">{avgGrade.toFixed(0)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="vox-card">
            <CardHeader>
              <CardTitle>Grade Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Strong Buy (70+)", count: strongBuy.length, color: "bg-green-500" },
                  { name: "Buy (60-69)", count: buy.length, color: "bg-blue-500" },
                  { name: "Hold (50-59)", count: hold.length, color: "bg-yellow-500" },
                  { name: "Weak Hold (40-49)", count: weak.length, color: "bg-orange-500" },
                  { name: "Sell (<40)", count: sell.length, color: "bg-red-500" },
                ].map((cat) => (
                  <div key={cat.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">{cat.name}</span>
                      <span className="text-sm font-mono">{cat.count}</span>
                    </div>
                    <Progress value={graded.length > 0 ? (cat.count / graded.length) * 100 : 0} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="vox-card">
            <CardHeader>
              <CardTitle>Lowest Grades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {graded
                  .sort((a, b) => (a.grade || 0) - (b.grade || 0))
                  .slice(0, 10)
                  .map((p) => (
                    <div key={`${p.ticker}-${p.broker}`} className="flex items-center justify-between p-2 bg-red-500/10 rounded">
                      <div>
                        <span className="font-semibold text-sm">{p.ticker}</span>
                        <span className="text-xs text-muted-foreground ml-2">{p.broker}</span>
                      </div>
                      <Badge variant="destructive" className="text-xs">{p.grade}</Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
