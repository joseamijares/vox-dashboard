"use client";

import { colors, typography } from "@/lib/design-system";
import { cn } from "@/lib/utils";

interface VoxKpiProps {
  label: string;
  value: string | number;
  change?: number;
  changeType?: "positive" | "negative" | "neutral";
  sub?: string;
  subVariant?: "profit" | "loss" | "warning" | "info" | "muted";
  prefix?: string;
  suffix?: string;
  className?: string;
  loading?: boolean;
}

export function VoxKpi({
  label,
  value,
  change,
  changeType = "neutral",
  sub,
  subVariant = "muted",
  prefix = "",
  suffix = "",
  className,
  loading = false,
}: VoxKpiProps) {
  const changeColor =
    changeType === "positive"
      ? colors.profit
      : changeType === "negative"
        ? colors.loss
        : colors.muted;

  const changeIcon =
    changeType === "positive" ? "↑" : changeType === "negative" ? "↓" : "—";

  const subColor =
    subVariant === "profit" ? colors.profit :
    subVariant === "loss" ? colors.loss :
    subVariant === "warning" ? colors.warning :
    subVariant === "info" ? colors.accent :
    colors.muted;

  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-lg border bg-card p-4",
        className
      )}
    >
      <span
        className="text-xs font-semibold uppercase tracking-wider"
        style={{ color: colors.muted }}
      >
        {label}
      </span>
      {loading ? (
        <div className="h-8 w-24 animate-pulse rounded bg-muted" />
      ) : (
        <span
          className="text-2xl font-semibold tracking-tight"
          style={{ color: colors.foreground }}
        >
          {prefix}
          {value}
          {suffix}
        </span>
      )}
      {change !== undefined && !loading && (
        <span className="text-xs font-medium" style={{ color: changeColor }}>
          {changeIcon} {change > 0 ? "+" : ""}
          {change.toFixed(2)}%
        </span>
      )}
      {sub && !loading && (
        <span className="text-xs font-medium" style={{ color: subColor }}>
          {sub}
        </span>
      )}
    </div>
  );
}
