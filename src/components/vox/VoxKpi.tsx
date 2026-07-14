"use client";

import { cn } from "@/lib/utils";
import { typography } from "@/lib/design-system";

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
  const changeCls =
    changeType === "positive"
      ? "text-profit"
      : changeType === "negative"
        ? "text-loss"
        : "text-muted-foreground";

  const subCls =
    subVariant === "profit"
      ? "text-profit"
      : subVariant === "loss"
        ? "text-loss"
        : subVariant === "warning"
          ? "text-warning"
          : subVariant === "info"
            ? "text-grade-buy"
            : "text-muted-foreground";

  const changeIcon =
    changeType === "positive" ? "↑" : changeType === "negative" ? "↓" : "";

  return (
    <div className={cn("vox-surface flex flex-col gap-1.5 p-4 lg:p-5", className)}>
      <span className={typography.label}>{label}</span>
      {loading ? (
        <div className="h-8 w-24 animate-pulse rounded-md bg-muted" />
      ) : (
        <span className="vox-metric text-2xl font-semibold tracking-tight text-foreground">
          {prefix}
          {value}
          {suffix}
        </span>
      )}
      {change !== undefined && !loading && (
        <span className={cn("text-xs font-medium font-mono tabular-nums", changeCls)}>
          {changeIcon} {change > 0 ? "+" : ""}
          {change.toFixed(2)}%
        </span>
      )}
      {sub && !loading && (
        <span className={cn("text-xs font-medium", subCls)}>{sub}</span>
      )}
    </div>
  );
}
