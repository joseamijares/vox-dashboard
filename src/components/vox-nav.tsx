"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navSections } from "@/lib/design-system";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  LayoutDashboard, Target, Brain, Briefcase, Wallet,
  TrendingUp, Bot, Clock, Shield, Activity, BarChart3,
  AlertTriangle, Scale, Search, Bitcoin, BookOpen,
  Newspaper, Settings, Menu, X, Megaphone,
} from "lucide-react";
import { useState } from "react";

const iconMap: Record<string, React.ElementType> = {
  Dashboard: LayoutDashboard,
  Plan: Target,
  Intelligence: Brain,
  Positions: Briefcase,
  Brokers: Wallet,
  Plays: TrendingUp,
  Agents: Bot,
  Crons: Clock,
  Council: Shield,
  Sentiment: Activity,
  Regime: BarChart3,
  Risk: AlertTriangle,
  "Trump Tracker": Megaphone,
  Sizer: Scale,
  Screener: Search,
  Crypto: Bitcoin,
  Journal: BookOpen,
  Logger: Newspaper,
};

function NavItem({
  href,
  label,
  isActive,
  onClick,
  mobile = false,
}: {
  href: string;
  label: string;
  isActive: boolean;
  onClick?: () => void;
  mobile?: boolean;
}) {
  const Icon = iconMap[label] || LayoutDashboard;

  if (mobile) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
          isActive
            ? "bg-secondary text-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <Icon className="h-4 w-4" />
        {label}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-all",
        isActive
          ? "bg-secondary text-foreground shadow-border-light"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={2} />
      <span className={cn(isActive && "font-medium")}>{label}</span>
    </Link>
  );
}

// ── Desktop Sidebar ──
export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 hidden lg:flex flex-col bg-background border-r border-border">
      {/* Logo */}
      <div className="flex h-14 items-center px-4 shrink-0 justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-sm bg-foreground" />
          <span className="font-semibold text-sm tracking-tight text-foreground">
            VOX
          </span>
        </Link>
        <ThemeToggle />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto space-y-6 p-3">
        {navSections.map((section) => (
          <div key={section.title}>
            <h3 className="mb-2 px-2 text-[11px] font-semibold uppercase text-muted-foreground tracking-widest">
              {section.title}
            </h3>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <li key={item.href}>
                    <NavItem href={item.href} label={item.label} isActive={isActive} />
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 shrink-0 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Settings className="h-3 w-3" />
            <span className="font-mono text-[11px]">VOX v12.0</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ── Mobile Header + Drawer ──
export function MobileHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Header Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4 lg:hidden bg-background/95 backdrop-blur-sm border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-sm bg-foreground" />
          <span className="font-semibold text-sm tracking-tight text-foreground">
            VOX
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-md text-foreground"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setOpen(false)}
          />
          {/* Drawer */}
          <nav className="absolute right-0 top-14 bottom-0 w-72 overflow-y-auto bg-background shadow-lg border-l border-border">
            <div className="p-4 space-y-6">
              {navSections.map((section) => (
                <div key={section.title}>
                  <h3 className="mb-2 px-2 text-[11px] font-semibold uppercase text-muted-foreground tracking-widest">
                    {section.title}
                  </h3>
                  <div className="space-y-0.5">
                    {section.items.map((item) => {
                      const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                      return (
                        <NavItem
                          key={item.href}
                          href={item.href}
                          label={item.label}
                          isActive={isActive}
                          onClick={() => setOpen(false)}
                          mobile
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}

// ── Page Shell (wraps all pages) ──
export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <MobileHeader />
      <Sidebar />
      <main className="lg:ml-64 pt-14 lg:pt-0">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
