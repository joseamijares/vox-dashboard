"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Target, Brain, Briefcase, Wallet,
  TrendingUp, Bot, Clock, Shield, Activity, BarChart3,
  AlertTriangle, Scale, Search, Bitcoin, BookOpen,
  Newspaper, Settings, CloudRain, Globe, Truck, Zap, Layers,
  LineChart, Eye, Gamepad2, GraduationCap, Bell, Sparkles,
  Users, Factory, FileText, ClipboardList, ScrollText,
} from "lucide-react";
import { navSections as dsNavSections } from "@/lib/design-system";

const iconMap: Record<string, React.ComponentType<any>> = {
  Dashboard: LayoutDashboard,
  Plan: Target,
  Intelligence: Brain,
  Positions: Briefcase,
  Brokers: Wallet,
  Plays: TrendingUp,
  Performance: LineChart,
  Watchlist: Eye,
  "Paper Trading": Gamepad2,
  Screener: Search,
  Grades: GraduationCap,
  Analysis: BarChart3,
  Alerts: Bell,
  Predictions: Sparkles,
  Agents: Bot,
  Crons: Clock,
  Council: Shield,
  "Council Plays": Users,
  Sentiment: Activity,
  Regime: Scale,
  Risk: AlertTriangle,
  Weather: CloudRain,
  Geopolitical: Globe,
  "Supply Chain": Truck,
  "Sector Macro": Factory,
  Signals: Zap,
  Harness: Layers,
  Journal: BookOpen,
  Digest: FileText,
  Briefing: ClipboardList,
  Logger: Newspaper,
  Debrief: ScrollText,
};

const navSections = dsNavSections.map((section) => ({
  ...section,
  items: section.items.map((item) => ({
    ...item,
    icon: iconMap[item.label] || LayoutDashboard,
  })),
}));

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 hidden lg:block overflow-y-auto"
      style={{
        background: '#ffffff',
        borderRight: 'none',
        boxShadow: 'rgba(0, 0, 0, 0.08) 0px 0px 0px 1px',
      }}
    >
      {/* Logo */}
      <div className="flex h-14 items-center px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-sm" style={{ background: '#171717' }} />
          <span className="font-semibold text-sm tracking-tight" style={{ color: '#171717', letterSpacing: '-0.32px' }}>
            VOX
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="space-y-6 p-3">
        {navSections.map((section) => (
          <div key={section.title}>
            <h3 className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider"
              style={{ color: '#666666', letterSpacing: '1.2px' }}
            >
              {section.title}
            </h3>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;
                return (
                  <li key={item.href + item.label}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-all",
                        isActive
                          ? "text-[#171717]"
                          : "hover:text-[#171717]"
                      )}
                      style={isActive ? {
                        background: '#fafafa',
                        boxShadow: 'rgb(235, 235, 235) 0px 0px 0px 1px',
                        color: '#171717',
                      } : {
                        color: '#666666',
                      }}
                    >
                      <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                      <span className="text-sm" style={{ fontWeight: isActive ? 500 : 400 }}>
                        {item.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 mt-auto">
        <div className="flex items-center gap-2 text-xs" style={{ color: '#808080' }}>
          <Settings className="h-3 w-3" />
          <span style={{ fontFamily: 'var(--font-geist-mono), monospace', fontSize: '11px' }}>
            VOX v12.0
          </span>
        </div>
      </div>
    </aside>
  );
}
