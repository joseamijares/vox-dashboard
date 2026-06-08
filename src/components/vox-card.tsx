"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface VoxCardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "stack" | "flat";
  hover?: boolean;
  onClick?: () => void;
}

export function VoxCard({ children, className, variant = "default", hover = false, onClick }: VoxCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-lg overflow-hidden bg-card border border-border",
        variant === "stack" && "shadow-lg",
        variant === "flat" && "shadow-none",
        variant === "default" && "shadow-sm",
        hover && "cursor-pointer transition-all duration-150 hover:-translate-y-px hover:shadow-md",
        className
      )}
    >
      {children}
    </div>
  );
}

interface VoxBadgeProps {
  children: ReactNode;
  variant?: "grade" | "profit" | "loss" | "warning" | "info" | "default";
  grade?: number;
  className?: string;
}

export function VoxBadge({ children, variant = "default", grade, className }: VoxBadgeProps) {
  const variantClasses = {
    grade: "",
    profit: "text-profit bg-profit-soft",
    loss: "text-loss bg-loss-soft",
    warning: "text-warning bg-warning/10",
    info: "text-accent bg-accent/10",
    default: "text-muted-foreground bg-muted",
  };

  if (variant === "grade" && grade !== undefined) {
    const gradeClass =
      grade >= 70 ? "text-grade-core bg-grade-core-soft" :
      grade >= 60 ? "text-grade-buy bg-grade-buy-soft" :
      grade >= 50 ? "text-grade-hold bg-grade-hold-soft" :
      grade >= 40 ? "text-grade-trim bg-grade-trim-soft" :
      "text-grade-sell bg-grade-sell-soft";

    return (
      <span className={cn("inline-flex items-center rounded px-2 py-0.5 text-xs font-mono font-medium", gradeClass, className)}>
        {children}
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center rounded px-2 py-0.5 text-xs font-mono font-medium", variantClasses[variant], className)}>
      {children}
    </span>
  );
}

interface VoxKpiProps {
  label: string;
  value: string;
  sub?: string;
  subVariant?: "profit" | "loss" | "muted";
  icon?: ReactNode;
}

export function VoxKpi({ label, value, sub, subVariant = "muted", icon }: VoxKpiProps) {
  const subColorClass =
    subVariant === "profit" ? "text-profit" :
    subVariant === "loss" ? "text-loss" :
    "text-muted-foreground";

  return (
    <VoxCard className="p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="font-mono text-xl font-semibold mt-1 text-foreground tracking-tight">
        {value}
      </p>
      {sub && (
        <div className="flex items-center gap-1 mt-1">
          {icon}
          <span className={cn("text-xs", subColorClass)}>{sub}</span>
        </div>
      )}
    </VoxCard>
  );
}
