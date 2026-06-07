"use client";

import { colors, typography } from "@/lib/design-system";
import { cn } from "@/lib/utils";

interface VoxKpiProps {
  label: string;
  value: string | number;
  change?: number;
  changeType?: "positive" | "negative" | "neutral";
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

  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-lg border bg-white p-4",
        className
      )}
      style={{ borderColor: colors.border }}
    >
      <span
        className="text-xs font-semibold uppercase tracking-wider"
        style={{ color: colors.muted }}
      >
        {label}
      </span>
      {loading ? (
        <div className="h-8 w-24 animate-pulse rounded bg-gray-100" />
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
    </div>
  );
}
