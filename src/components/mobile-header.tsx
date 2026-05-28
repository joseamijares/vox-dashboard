"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

const navSections = [
  {
    title: "Command",
    items: [
      { href: "/", label: "Dashboard" },
      { href: "/plan", label: "Plan" },
      { href: "/intelligence", label: "Intelligence" },
    ],
  },
  {
    title: "Portfolio",
    items: [
      { href: "/portfolio", label: "Positions" },
      { href: "/brokers", label: "Brokers" },
      { href: "/intelligence", label: "Intelligence" },
      { href: "/plays", label: "Plays" },
    ],
  },
  {
    title: "Agents",
    items: [
      { href: "/agents", label: "Agents" },
      { href: "/crons", label: "Crons" },
      { href: "/council", label: "Council" },
      { href: "/sentiment", label: "Sentiment" },
      { href: "/regime", label: "Regime" },
      { href: "/risk", label: "Risk" },
    ],
  },
  {
    title: "Tools",
    items: [
      { href: "/sizer", label: "Sizer" },
      { href: "/screener", label: "Screener" },
      { href: "/crypto", label: "Crypto" },
    ],
  },
  {
    title: "Journal",
    items: [
      { href: "/journal", label: "Journal" },
      { href: "/logger", label: "Logger" },
    ],
  },
];

export function MobileHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-border bg-card/95 backdrop-blur lg:hidden">
        <div className="flex h-full items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-primary" />
            <span className="font-bold text-lg">VOX</span>
          </Link>
          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-md hover:bg-muted"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <nav className="absolute right-0 top-14 bottom-0 w-64 bg-card border-l border-border overflow-y-auto">
            <div className="p-4 space-y-6">
              {navSections.map((section) => (
                <div key={section.title}>
                  <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {section.title}
                  </h3>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                      return (
                        <Link
                          key={item.href + item.label}
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                            isActive
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          )}
                        >
                          {item.label}
                        </Link>
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
