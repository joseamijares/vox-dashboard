"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/sidebar";
import { alerts } from "@/lib/data";
import { AlertTriangle, Bell, CheckCircle, Clock } from "lucide-react";

export default function AlertsPage() {
  const allAlerts = alerts;

  const typeIcon = (type: string) => {
    switch (type) {
      case "PRICE": return <Bell className="h-4 w-4 text-blue-400" />;
      case "GRADE": return <AlertTriangle className="h-4 w-4 text-red-400" />;
      case "PULLBACK": return <CheckCircle className="h-4 w-4 text-green-400" />;
      case "TRUMP": return <AlertTriangle className="h-4 w-4 text-amber-400" />;
      case "EARNINGS": return <Clock className="h-4 w-4 text-purple-400" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const severityBadge = (severity: string) => {
    switch (severity) {
      case "HIGH": return "destructive";
      case "MEDIUM": return "secondary";
      case "LOW": return "outline";
      default: return "secondary";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:ml-64 p-4 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Alert System</h1>
          <p className="text-muted-foreground text-sm">
            All alerts in one place — price, grade, pullback, policy, earnings
          </p>
        </div>

        <div className="space-y-3">
          {allAlerts.map((alert: any) => (
            <Card
              key={alert.id}
              className={`vox-card ${alert.triggered ? "border-green-500/30" : "border-border"}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1">{typeIcon(alert.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{alert.ticker}</span>
                      <Badge variant={severityBadge(alert.severity)} className="text-xs">
                        {alert.severity}
                      </Badge>
                      <Badge variant={alert.triggered ? "default" : "outline"} className="text-xs">
                        {alert.triggered ? "TRIGGERED" : "PENDING"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
