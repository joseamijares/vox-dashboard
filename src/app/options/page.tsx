"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/sidebar";
import { AlertTriangle, Info } from "lucide-react";

export default function OptionsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:ml-64 p-4 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Options</h1>
          <p className="text-muted-foreground text-sm">Options analysis and strategies</p>
        </div>

        <Card className="vox-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              Options Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Options tracking coming soon. This module will include:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-400" />
                Covered call income tracking
              </li>
              <li className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-400" />
                Cash-secured put watchlist
              </li>
              <li className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-400" />
                Earnings straddle scanner
              </li>
              <li className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-400" />
                Greeks exposure dashboard
              </li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
