"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/vox-nav";
import { VoxBadge } from "@/components/vox";
import { useState } from "react";
import { Plus, Save } from "lucide-react";

interface LogEntry {
  id: number;
  date: string;
  ticker: string;
  action: string;
  shares: number;
  price: number;
  notes: string;
}

export default function LoggerPage() {
  const [entries, setEntries] = useState<LogEntry[]>([
    { id: 1, date: "2026-05-27", ticker: "NVDA", action: "BUY", shares: 5, price: 215.0, notes: "Pre-earnings position" },
  ]);
  const [form, setForm] = useState({ ticker: "", action: "BUY", shares: "", price: "", notes: "" });

  const addEntry = () => {
    if (!form.ticker || !form.shares || !form.price) return;
    const newEntry: LogEntry = {
      id: Date.now(),
      date: new Date().toISOString().split("T")[0],
      ticker: form.ticker.toUpperCase(),
      action: form.action,
      shares: Number(form.shares),
      price: Number(form.price),
      notes: form.notes,
    };
    setEntries([newEntry, ...entries]);
    setForm({ ticker: "", action: "BUY", shares: "", price: "", notes: "" });
  };

  return (
    <PageShell>
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Trade Logger</h1>
          <p className="text-muted-foreground text-sm">Log new trades in real-time</p>
        </div>

        <Card className="vox-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-green-400" />
              New Trade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
              <Input placeholder="Ticker" value={form.ticker} onChange={(e) => setForm({ ...form, ticker: e.target.value })} />
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.action}
                onChange={(e) => setForm({ ...form, action: e.target.value })}
              >
                <option>BUY</option>
                <option>SELL</option>
                <option>TRIM</option>
                <option>ADD</option>
              </select>
              <Input placeholder="Shares" type="number" value={form.shares} onChange={(e) => setForm({ ...form, shares: e.target.value })} />
              <Input placeholder="Price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              <Button onClick={addEntry} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Log Trade
              </Button>
            </div>
            <Input
              placeholder="Notes (optional)"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="mt-4"
            />
          </CardContent>
        </Card>

        <Card className="vox-card">
          <CardHeader>
            <CardTitle>Recent Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {entries.map((e) => (
                <div key={e.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={e.action === "BUY" ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}>
                      {e.action}
                    </Badge>
                    <span className="font-semibold">{e.ticker}</span>
                    <span className="text-sm text-muted-foreground">{e.shares} @ ${e.price}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground">{e.date}</span>
                    {e.notes && <p className="text-xs text-muted-foreground">{e.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </PageShell>
  );
}
