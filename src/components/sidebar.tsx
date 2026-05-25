"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Briefcase,
  BarChart3,
  Eye,
  TrendingUp,
  Brain,
  Bot,
  Flag,
  Target,
  BookOpen,
  Newspaper,
  AlertTriangle,
  Command,
  Calendar,
  DollarSign,
  Shield,
  PieChart,
  Calculator,
  RefreshCw,
  Wallet,
  Globe,
  Activity,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navItems = [
  { section: "Overview", items: [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/portfolio", label: "Portfolio", icon: Briefcase },
    { href: "/grades", label: "Grades", icon: BarChart3 },
    { href: "/watchlist", label: "Watchlist", icon: Eye },
  ]},
  { section: "Intelligence", items: [
    { href: "/regime", label: "Market Regime", icon: TrendingUp },
    { href: "/briefing", label: "Daily Briefing", icon: Newspaper },
    { href: "/positions", label: "Position Review", icon: AlertTriangle },
    { href: "/scorer", label: "Trade Scorer", icon: Target },
    { href: "/sectors", label: "Sector Rotation", icon: PieChart },
    { href: "/council", label: "LLM Council", icon: Brain },
  ]},
  { section: "Feeds", items: [
    { href: "/trump", label: "Trump Tracker", icon: Flag },
    { href: "/sentiment", label: "Sentiment", icon: Activity },
    { href: "/screener", label: "Screener DB", icon: Bot },
    { href: "/macro", label: "Macro", icon: Globe },
    { href: "/correlation", label: "Correlation", icon: RefreshCw },
  ]},
  { section: "Tracking", items: [
    { href: "/journal", label: "Trade Journal", icon: BookOpen },
    { href: "/earnings", label: "Earnings", icon: Calendar },
    { href: "/dividends", label: "Dividends", icon: DollarSign },
    { href: "/risk", label: "Risk Mgmt", icon: Shield },
    { href: "/performance", label: "Performance", icon: BarChart3 },
  ]},
  { section: "Tools", items: [
    { href: "/sizer", label: "Position Sizer", icon: Calculator },
    { href: "/rebalancing", label: "Rebalancing", icon: RefreshCw },
    { href: "/compounding", label: "Compounding", icon: TrendingUp },
    { href: "/mistakes", label: "Mistake Journal", icon: AlertTriangle },
  ]},
  { section: "Assets", items: [
    { href: "/crypto", label: "Crypto", icon: Wallet },
    { href: "/options", label: "Options", icon: Target },
    { href: "/forex", label: "Forex", icon: Globe },
  ]},
  { section: "Systems", items: [
    { href: "/alerts", label: "Alert System", icon: AlertTriangle },
    { href: "/commander", label: "Commander", icon: Command },
    { href: "/weekly", label: "Weekly Summary", icon: Calendar },
    { href: "/logger", label: "Trade Logger", icon: BookOpen },
  ]},
];

function NavLink({ href, label, icon: Icon, isActive }: { href: string; label: string; icon: React.ElementType; isActive: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
        isActive
          ? "bg-primary/10 text-primary font-medium"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-4 border-b border-border">
        <div className="w-8 h-8 rounded-lg vox-gradient flex items-center justify-center">
          <span className="text-white font-bold text-sm">V</span>
        </div>
        <span className="font-bold text-lg tracking-tight">VOX</span>
      </div>
      
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-4">
        {navItems.map((section) => (
          <div key={section.section}>
            <div className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {section.section}
            </div>
            <div className="space-y-0.5 mt-1">
              {section.items.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted/50">
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
            JM
          </div>
          <span className="text-sm text-muted-foreground">Jose Mijares</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-card border border-border">
          <Menu className="h-5 w-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 bg-sidebar">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop */}
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 left-0 bg-sidebar border-r border-border z-40">
        <SidebarContent />
      </aside>
    </>
  );
}
