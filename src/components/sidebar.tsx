"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Target,
  Brain,
  Briefcase,
  Eye,
  BarChart3,
  Shield,
  Scale,
  Search,
  BookOpen,
  Newspaper,
  TrendingUp,
  AlertTriangle,
  Bitcoin,
  Award,
  Activity,
  Settings,
  Bot,
  Clock,
  Wallet,
} from "lucide-react";

const navSections = [
  {
    title: "Command",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
      { href: "/plan", label: "Plan", icon: Target },
      { href: "/intelligence", label: "Intelligence", icon: Brain },
    ],
  },
  {
    title: "Portfolio",
    items: [
      { href: "/portfolio", label: "Positions", icon: Briefcase },
      { href: "/brokers", label: "Brokers", icon: Wallet },
      { href: "/watchlist", label: "Watchlist", icon: Eye },
      { href: "/sectors", label: "Sectors", icon: BarChart3 },
      { href: "/grades", label: "Grades", icon: Award },
      { href: "/plays", label: "Plays", icon: TrendingUp },
    ],
  },
  {
    title: "Agents",
    items: [
      { href: "/agents", label: "Agents", icon: Bot },
      { href: "/crons", label: "Crons", icon: Clock },
      { href: "/council", label: "Council", icon: Shield },
      { href: "/sentiment", label: "Sentiment", icon: Activity },
      { href: "/regime", label: "Regime", icon: BarChart3 },
      { href: "/risk", label: "Risk", icon: AlertTriangle },
    ],
  },
  {
    title: "Tools",
    items: [
      { href: "/sizer", label: "Sizer", icon: Scale },
      { href: "/screener", label: "Screener", icon: Search },
      { href: "/crypto", label: "Crypto", icon: Bitcoin },
    ],
  },
  {
    title: "Journal",
    items: [
      { href: "/journal", label: "Journal", icon: BookOpen },
      { href: "/logger", label: "Logger", icon: Newspaper },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card hidden lg:block overflow-y-auto">
      <div className="flex h-14 items-center border-b border-border px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-6 w-6 rounded bg-primary" />
          <span className="font-bold text-lg">VOX</span>
        </Link>
      </div>

      <nav className="space-y-6 p-4">
        {navSections.map((section) => (
          <div key={section.title}>
            <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {section.title}
            </h3>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Settings className="h-3 w-3" />
          <span>VOX v12.0</span>
        </div>
      </div>
    </aside>
  );
}
