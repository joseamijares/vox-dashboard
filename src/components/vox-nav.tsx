"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navSections } from "@/lib/design-system";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  LayoutDashboard,
  Briefcase,
  Wallet,
  BarChart3,
  Search,
  Bell,
  Activity,
  Clock,
  BookOpen,
  Menu,
  X,
  PieChart,
} from "lucide-react";
import { useState } from "react";

const iconMap: Record<string, React.ElementType> = {
  Dashboard: LayoutDashboard,
  Positions: Briefcase,
  Brokers: Wallet,
  Grades: BarChart3,
  Sectors: PieChart,
  Screener: Search,
  Alerts: Bell,
  Signals: Activity,
  Crons: Clock,
  Journal: BookOpen,
};

function NavItem({
  href,
  label,
  icon,
  isActive,
  onClick,
  mobile = false,
}: {
  href: string;
  label: string;
  icon?: string;
  isActive: boolean;
  onClick?: () => void;
  mobile?: boolean;
}) {
  const Icon = iconMap[icon || label] || LayoutDashboard;

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2.5 rounded-md px-2.5 text-sm font-medium transition-colors",
        mobile ? "py-2.5" : "py-1.5",
        isActive
          ? "bg-secondary text-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0 opacity-80" strokeWidth={2} />
      <span>{label}</span>
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-56 hidden lg:flex flex-col bg-sidebar border-r border-sidebar-border">
      <div className="flex h-14 items-center px-4 shrink-0 justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
            <span className="text-[10px] font-bold text-primary-foreground tracking-tight">
              VX
            </span>
          </div>
          <div className="leading-tight">
            <div className="font-semibold text-sm tracking-tight text-foreground">
              VOX
            </div>
            <div className="text-[10px] text-muted-foreground font-mono">
              portfolio brain
            </div>
          </div>
        </Link>
        <ThemeToggle />
      </div>

      <nav className="flex-1 overflow-y-auto space-y-5 p-3">
        {navSections.map((section) => (
          <div key={section.title}>
            <h3 className="mb-1.5 px-2.5 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground/80">
              {section.title}
            </h3>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname === item.href ||
                      pathname.startsWith(item.href + "/");
                return (
                  <li key={item.href}>
                    <NavItem
                      href={item.href}
                      label={item.label}
                      icon={item.icon}
                      isActive={isActive}
                    />
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="p-3 shrink-0 border-t border-sidebar-border">
        <p className="px-2 text-[10px] text-muted-foreground font-mono leading-relaxed">
          Dark · balanced mandate
          <br />
          Not day-trading
        </p>
      </div>
    </aside>
  );
}

export function MobileHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4 lg:hidden bg-background/90 backdrop-blur-md border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
            <span className="text-[10px] font-bold text-primary-foreground">
              VX
            </span>
          </div>
          <span className="font-semibold text-sm tracking-tight">VOX</span>
        </Link>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            onClick={() => setOpen(!open)}
            className="p-2.5 rounded-md text-foreground min-h-11 min-w-11 flex items-center justify-center"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <nav className="absolute right-0 top-14 bottom-0 w-72 overflow-y-auto bg-background border-l border-border">
            <div className="p-4 space-y-5">
              {navSections.map((section) => (
                <div key={section.title}>
                  <h3 className="mb-1.5 px-2.5 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                    {section.title}
                  </h3>
                  <div className="space-y-0.5">
                    {section.items.map((item) => {
                      const isActive =
                        item.href === "/"
                          ? pathname === "/"
                          : pathname === item.href ||
                            pathname.startsWith(item.href + "/");
                      return (
                        <NavItem
                          key={item.href}
                          href={item.href}
                          label={item.label}
                          icon={item.icon}
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

export function PageShell({
  children,
  title,
  subtitle,
  actions,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <MobileHeader />
      <Sidebar />
      <main className="lg:ml-56 pt-14 lg:pt-0">
        <div className="p-4 lg:p-8 max-w-[1400px]">
          {(title || actions) && (
            <div className="mb-6 lg:mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div>
                {title && (
                  <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight text-foreground">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
                )}
              </div>
              {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
