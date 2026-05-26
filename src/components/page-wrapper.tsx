"use client";

import { MobileHeader } from "@/components/mobile-header";
import { Sidebar } from "@/components/sidebar";

export function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <MobileHeader />
      <Sidebar />
      <main className="pt-14 lg:pt-0 lg:ml-64 p-4 lg:p-8">
        {children}
      </main>
    </div>
  );
}
