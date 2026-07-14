"use client";
import { VoxLoading } from "@/components/vox";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageShell } from "@/components/vox-nav";
import { TrendingUp, TrendingDown, Minus, RefreshCw } from "lucide-react";

interface Commodity {
  id: number;
  symbol: string;
  name: string;
  price: number;
  unit: string;
  category: string;
  change_pct: number;
  source: string;
  created_at: string;
}

export default function SupplyChainPage() {
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchCommodities() {
    try {
      const res = await fetch("/api/commodities");
      const data = await res.json();
      setCommodities(data.commodities || []);
    } catch (e) {
      console.error("Failed to fetch commodities:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchCommodities();
    const interval = setInterval(fetchCommodities, 300000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCommodities();
  };

  const categories = [...new Set(commodities.map((c) => c.category))];

  return (
    <PageShell>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Supply Chain</h1>
              <p className="text-sm text-neutral-500 mt-1">Commodity prices, shipping costs, freight rates</p>
            </div>
            <button onClick={handleRefresh} disabled={refreshing} className="p-2 rounded-lg hover:bg-neutral-100 transition-colors">
              <RefreshCw className={`h-4 w-4 text-neutral-500 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>

          {loading ? (
            <VoxLoading text="Loading commodity data..." />
          ) : commodities.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Minus className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-700">No Commodity Data</h3>
                <p className="text-sm text-neutral-500 mt-2">Supply chain agent will populate this data</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {categories.map((category) => {
                const items = commodities.filter((c) => c.category === category);
                return (
                  <Card key={category}>
                    <CardHeader>
                      <CardTitle className="text-lg capitalize">{category}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {items.map((item) => (
                          <div key={item.id} className="p-3 rounded-lg bg-neutral-50 border border-neutral-100">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-neutral-900">{item.symbol}</span>
                              <span className="text-sm text-neutral-500">{item.name}</span>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-lg font-semibold">${item.price?.toFixed(2) || "—"}</span>
                              <span className="text-xs text-neutral-400">{item.unit}</span>
                            </div>
                            {item.change_pct !== null && (
                              <div className={`flex items-center gap-1 mt-1 text-sm ${item.change_pct >= 0 ? "text-green-600" : "text-red-600"}`}>
                                {item.change_pct >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                {item.change_pct >= 0 ? "+" : ""}{item.change_pct.toFixed(2)}%
                              </div>
                            )}
                            <div className="text-xs text-neutral-400 mt-1">Source: {item.source}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </PageShell>
  );
}
