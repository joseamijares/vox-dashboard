"use client";

import { useState, useEffect } from "react";
import { MobileHeader } from "@/components/mobile-header";
import { Sidebar } from "@/components/sidebar";
import { Search } from "lucide-react";

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/watchlist");
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        setWatchlist(json.watchlist || []);
      } catch (e) {
        console.error("Failed to load watchlist:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filtered = watchlist.filter((w: any) =>
    w.ticker?.toLowerCase().includes(search.toLowerCase()) ||
    w.name?.toLowerCase().includes(search.toLowerCase()) ||
    w.sector?.toLowerCase().includes(search.toLowerCase())
  );

  const gradeColor = (grade: number) => {
    if (grade >= 70) return "bg-green-500/20 text-green-400 border-green-500/30";
    if (grade >= 60) return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    if (grade >= 50) return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    return "bg-red-500/20 text-red-400 border-red-500/30";
  };

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
          <h1 className="text-2xl font-bold tracking-tight">Watchlist</h1>
          <p className="text-muted-foreground text-sm">{watchlist.length} tickers tracked</p>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search ticker, name, or sector..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((w: any) => (
            <div
              key={w.ticker}
              className="p-4 rounded-lg border border-border bg-card hover:bg-card/80 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="font-mono font-semibold text-lg">{w.ticker}</span>
                  <p className="text-xs text-muted-foreground">{w.name || w.sector}</p>
                </div>
                <span className={`text-xs font-mono px-2 py-1 rounded border ${gradeColor(w.grade || 0)}`}>
                  {w.grade || "—"}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs mt-3">
                <div>
                  <p className="text-muted-foreground">Entry</p>
                  <p className="font-mono">${w.entry_price || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Target</p>
                  <p className="font-mono">${w.target_price || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Stop</p>
                  <p className="font-mono text-red-400">${w.stop_loss || "—"}</p>
                </div>
              </div>
              {w.notes && (
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{w.notes}</p>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
