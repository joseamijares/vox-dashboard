"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { colors, shadows, navSections } from "@/lib/design-system";
import {
  LayoutDashboard, Target, Brain, Briefcase, Wallet,
  TrendingUp, Bot, Clock, Shield, Activity, BarChart3,
  AlertTriangle, Scale, Search, Bitcoin, BookOpen,
  Newspaper, Settings, Menu, X,
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
          ? "text-foreground"
          : "hover:text-foreground"
      )}
      style={
        isActive
          ? {
              background: colors.secondary,
              boxShadow: shadows.borderLight,
              color: colors.foreground,
            }
          : { color: colors.muted }
      }
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={2} />
      <span style={{ fontWeight: isActive ? 500 : 400 }}>{label}</span>
    </Link>
  );
}

// ── Desktop Sidebar ──
export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed left-0 top-0 z-40 h-screen w-64 hidden lg:flex flex-col"
      style={{
        background: colors.background,
        boxShadow: shadows.border,
      }}
    >
      {/* Logo */}
      <div className="flex h-14 items-center px-4 shrink-0">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-sm" style={{ background: colors.foreground }} />
          <span
            className="font-semibold text-sm tracking-tight"
            style={{ color: colors.foreground, letterSpacing: "-0.32px" }}
          >
            VOX
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto space-y-6 p-3">
        {navSections.map((section) => (
          <div key={section.title}>
            <h3
              className="mb-2 px-2 text-[11px] font-semibold uppercase"
              style={{ color: colors.muted, letterSpacing: "1.2px" }}
            >
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
      <div className="p-3 shrink-0">
        <div className="flex items-center gap-2 text-xs" style={{ color: colors.mutedLight }}>
          <Settings className="h-3 w-3" />
          <span className="font-mono text-[11px]">VOX v12.0</span>
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
      <header
        className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4 lg:hidden"
        style={{
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(8px)",
          boxShadow: shadows.border,
        }}
      >
        <Link href="/" className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-sm" style={{ background: colors.foreground }} />
          <span className="font-semibold text-sm" style={{ color: colors.foreground, letterSpacing: "-0.32px" }}>
            VOX
          </span>
        </Link>
        <button
          onClick={() => setOpen(!open)}
          className="p-2 rounded-md transition-colors"
          style={{ color: colors.foreground }}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
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
          <nav
            className="absolute right-0 top-14 bottom-0 w-72 overflow-y-auto"
            style={{
              background: colors.background,
              boxShadow: "-4px 0 24px rgba(0,0,0,0.08)",
            }}
          >
            <div className="p-4 space-y-6">
              {navSections.map((section) => (
                <div key={section.title}>
                  <h3
                    className="mb-2 px-2 text-[11px] font-semibold uppercase"
                    style={{ color: colors.muted, letterSpacing: "1.2px" }}
                  >
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
    <div style={{ minHeight: "100vh", background: colors.background }}>
      <MobileHeader />
      <Sidebar />
      <main
        className="lg:ml-64"
        style={{
          paddingTop: "56px", // mobile header
        }}
      >
        <div className="lg:pt-0 p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
