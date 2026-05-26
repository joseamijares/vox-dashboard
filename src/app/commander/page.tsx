"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MobileHeader } from "@/components/mobile-header";
import { Sidebar } from "@/components/sidebar";
import { Rocket, AlertTriangle, CheckCircle, Clock } from "lucide-react";

const commands = [
  { id: 1, name: "Run Portfolio Scan", status: "READY", lastRun: "2026-05-27 09:00", auto: true },
  { id: 2, name: "Grade All Positions", status: "READY", lastRun: "2026-05-27 08:30", auto: true },
  { id: 3, name: "Check Earnings Calendar", status: "READY", lastRun: "2026-05-27 08:00", auto: true },
  { id: 4, name: "Sector Rotation Analysis", status: "READY", lastRun: "2026-05-26 16:00", auto: false },
  { id: 5, name: "Rebalance Calculator", status: "READY", lastRun: "2026-05-26 15:00", auto: false },
  { id: 6, name: "Export to Obsidian", status: "READY", lastRun: "2026-05-26 14:00", auto: true },
];

const alerts = [
  { ticker: "NVDA", type: "EARNINGS", urgency: "HIGH", message: "Earnings May 28 — position review required" },
  { ticker: "JMIA", type: "SELL", urgency: "HIGH", message: "Grade 22 — exit immediately" },
  { ticker: "BTC", type: "PRICE", urgency: "MEDIUM", message: "Above $110K — consider trim" },
];

export default function CommanderPage() {
  return (
    <div className="min-h-screen bg-background">
      <MobileHeader />
      <Sidebar />
      <main className="pt-14 lg:pt-0 lg:ml-64 p-4 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Commander</h1>
          <p className="text-muted-foreground text-sm">VOX Control Center — execute commands and monitor alerts</p>
        </div>

        {/* Active Alerts */}
        <Card className="vox-card mb-8 border-red-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              Active Alerts ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((a, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{a.ticker}</span>
                      <Badge variant="outline" className={
                        a.urgency === "HIGH" ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                      }>
                        {a.urgency}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{a.message}</p>
                  </div>
                  <Button size="sm" variant="outline">Acknowledge</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Commands */}
        <Card className="vox-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-primary" />
              Available Commands
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {commands.map((cmd) => (
                <div key={cmd.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <span className="font-semibold">{cmd.name}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{cmd.lastRun}</span>
                      {cmd.auto && <Badge variant="outline" className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">AUTO</Badge>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                      {cmd.status}
                    </Badge>
                    <Button size="sm">Run</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
