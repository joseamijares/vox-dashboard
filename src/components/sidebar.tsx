"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Target, Brain, Briefcase, Wallet,
  TrendingUp, Bot, Clock, Shield, Activity, BarChart3,
  AlertTriangle, Scale, Search, Bitcoin, BookOpen,
  Newspaper, Settings,
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
