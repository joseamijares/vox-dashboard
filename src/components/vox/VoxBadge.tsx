"use client";

import { getGradeClass } from "@/lib/design-system";
import { cn } from "@/lib/utils";

interface VoxBadgeProps {
  children?: React.ReactNode;
  grade?: number;
  label?: string;
  variant?:
    | "grade"
    | "sector"
    | "status"
    | "custom"
    | "profit"
    | "loss"
    | "warning"
    | "info"
    | "default";
  color?: string;
  bgColor?: string;
  className?: string;
}

const statusClass: Record<string, string> = {
  active: "text-grade-core bg-grade-core-soft",
  paused: "text-grade-hold bg-grade-hold-soft",
  error: "text-grade-sell bg-grade-sell-soft",
  warning: "text-grade-trim bg-grade-trim-soft",
  pending: "text-grade-buy bg-grade-buy-soft",
  fresh: "text-grade-core bg-grade-core-soft",
  stale: "text-grade-sell bg-grade-sell-soft",
};

export function VoxBadge({
  children,
  grade,
  label,
  variant = "grade",
  className,
}: VoxBadgeProps) {
  let cls = "text-muted-foreground bg-muted";
  let content: React.ReactNode = children ?? label ?? "—";

  if (variant === "grade" && grade !== undefined) {
    cls = getGradeClass(grade);
    content = children ?? grade;
  } else if (variant === "sector") {
    cls = "text-grade-buy bg-grade-buy-soft";
    content = children ?? label;
  } else if (variant === "status" && label) {
    cls = statusClass[label.toLowerCase()] || cls;
    content = children ?? label;
  } else if (variant === "profit") {
    cls = "text-profit bg-profit-soft";
  } else if (variant === "loss") {
    cls = "text-loss bg-loss-soft";
  } else if (variant === "warning") {
    cls = "text-warning bg-grade-hold-soft";
  } else if (variant === "info") {
    cls = "text-grade-buy bg-grade-buy-soft";
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium font-mono tabular-nums",
        cls,
        className
      )}
    >
      {content}
    </span>
  );
}
