"use client";

import { colors, shadows, radius } from "@/lib/design-system";
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
  const shadow = variant === "stack" ? shadows.cardStack : variant === "flat" ? shadows.border : shadows.card;

  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-lg overflow-hidden",
        hover && "cursor-pointer transition-all duration-150 hover:-translate-y-px",
        className
      )}
      style={{
        background: colors.background,
        boxShadow: shadow,
      }}
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
  let style: React.CSSProperties = {};

  if (variant === "grade" && grade !== undefined) {
    if (grade >= 70) style = { color: colors.gradeCore, background: colors.gradeCoreSoft };
    else if (grade >= 60) style = { color: colors.gradeBuy, background: colors.gradeBuySoft };
    else if (grade >= 50) style = { color: colors.gradeHold, background: colors.gradeHoldSoft };
    else if (grade >= 40) style = { color: colors.gradeTrim, background: colors.gradeTrimSoft };
    else style = { color: colors.gradeSell, background: colors.gradeSellSoft };
  } else if (variant === "profit") {
    style = { color: colors.profit, background: colors.profitSoft };
  } else if (variant === "loss") {
    style = { color: colors.loss, background: colors.lossSoft };
  } else if (variant === "warning") {
    style = { color: colors.warning, background: "rgba(245, 158, 11, 0.10)" };
  } else if (variant === "info") {
    style = { color: colors.accent, background: colors.accentSoft };
  } else {
    style = { color: colors.muted, background: colors.gradeUngradedSoft };
  }

  return (
    <span
      className={cn("inline-flex items-center rounded px-2 py-0.5 text-xs font-mono font-medium", className)}
      style={style}
    >
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
  const subColor = subVariant === "profit" ? colors.profit : subVariant === "loss" ? colors.loss : colors.muted;

  return (
    <VoxCard className="p-4">
      <p className="text-xs font-medium uppercase tracking-wider" style={{ color: colors.muted }}>
        {label}
      </p>
      <p className="font-mono text-xl font-semibold mt-1" style={{ color: colors.foreground, letterSpacing: "-0.96px" }}>
        {value}
      </p>
      {sub && (
        <div className="flex items-center gap-1 mt-1">
          {icon}
          <span className="text-xs" style={{ color: subColor }}>{sub}</span>
        </div>
      )}
    </VoxCard>
  );
}
