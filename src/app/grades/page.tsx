"use client";

import { useState, useEffect } from "react";
import { MobileHeader } from "@/components/mobile-header";
import { Sidebar } from "@/components/sidebar";
import { Zap, TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function GradesPage() {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/positions");
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        setPositions(json.positions || []);
      } catch (e) {
        console.error("Failed to load positions:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const graded = positions.filter((p: any) => (p.grade || 0) > 0);
  const ungraded = positions.filter((p: any) => !p.grade || p.grade === 0);

  const buckets = [
    { name: "Core (70+)", min: 70, max: 100, color: "text-green-400", bg: "bg-green-500/10" },
    { name: "Buy (60-69)", min: 60, max: 70, color: "text-blue-400", bg: "bg-blue-500/10" },
    { name: "Hold (50-59)", min: 50, max: 60, color: "text-amber-400", bg: "bg-amber-500/10" },
    { name: "Trim (40-49)", min: 40, max: 50, color: "text-orange-400", bg: "bg-orange-500/10" },
    { name: "Sell (<40)", min: 0, max: 40, color: "text-red-400", bg: "bg-red-500/10" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <MobileHeader />
        <Sidebar />
        <main className="pt-14 lg:pt-0 lg:ml-64 p-4 lg:p-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
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
          <h1 className="text-2xl font-bold tracking-tight">Grades</h1>
          <p className="text-muted-foreground text-sm">
            {graded.length} graded · {ungraded.length} ungraded
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {buckets.map((bucket) => {
            const items = graded.filter((p: any) => p.grade >= bucket.min && p.grade < bucket.max);
            return (
              <div key={bucket.name} className={`p-4 rounded-lg border border-border ${bucket.bg}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`font-semibold ${bucket.color}`}>{bucket.name}</h3>
                  <span className="text-sm text-muted-foreground">{items.length} positions</span>
                </div>
                <div className="space-y-2">
                  {items.slice(0, 10).map((p: any) => (
                    <div key={p.ticker} className="flex items-center justify-between p-2 rounded bg-background/50">
                      <span className="font-mono">{p.ticker}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm">${p.live_value?.toLocaleString()}</span>
                        <span className={`font-mono font-semibold ${bucket.color}`}>{p.grade}</span>
                      </div>
                    </div>
                  ))}
                  {items.length > 10 && (
                    <p className="text-xs text-muted-foreground text-center">+{items.length - 10} more</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
