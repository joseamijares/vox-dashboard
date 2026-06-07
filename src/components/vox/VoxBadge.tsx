"use client";

import { getGradeStyle, colors } from "@/lib/design-system";
import { cn } from "@/lib/utils";

interface VoxBadgeProps {
  grade?: number;
  label?: string;
  variant?: "grade" | "sector" | "status" | "custom";
  color?: string;
  bgColor?: string;
  className?: string;
}

const sectorColors: Record<string, { color: string; bg: string }> = {
  Technology: { color: "#0072f5", bg: "rgba(0, 114, 245, 0.10)" },
  "Financial Services": { color: "#00a86b", bg: "rgba(0, 168, 107, 0.10)" },
  Healthcare: { color: "#dc2626", bg: "rgba(220, 38, 38, 0.10)" },
  "Consumer Cyclical": { color: "#f59e0b", bg: "rgba(245, 158, 11, 0.10)" },
  "Communication Services": { color: "#8b5cf6", bg: "rgba(139, 92, 246, 0.10)" },
  Industrials: { color: "#6b7280", bg: "rgba(107, 114, 128, 0.10)" },
  "Consumer Defensive": { color: "#10b981", bg: "rgba(16, 185, 129, 0.10)" },
  Energy: { color: "#f97316", bg: "rgba(249, 115, 22, 0.10)" },
  Utilities: { color: "#06b6d4", bg: "rgba(6, 182, 212, 0.10)" },
  "Real Estate": { color: "#ec4899", bg: "rgba(236, 72, 153, 0.10)" },
  Materials: { color: "#84cc16", bg: "rgba(132, 204, 22, 0.10)" },
  ETF: { color: "#6366f1", bg: "rgba(99, 102, 241, 0.10)" },
  Crypto: { color: "#f59e0b", bg: "rgba(245, 158, 11, 0.10)" },
};

const statusColors: Record<string, { color: string; bg: string }> = {
  active: { color: colors.gradeCore, bg: colors.gradeCoreSoft },
  paused: { color: colors.gradeHold, bg: colors.gradeHoldSoft },
  error: { color: colors.gradeSell, bg: colors.gradeSellSoft },
  warning: { color: colors.gradeTrim, bg: colors.gradeTrimSoft },
  pending: { color: colors.info, bg: "rgba(0, 114, 245, 0.10)" },
};

export function VoxBadge({
  grade,
  label,
  variant = "grade",
  color,
  bgColor,
  className,
}: VoxBadgeProps) {
  let style: { color: string; bg: string; label: string } = { color: colors.muted, bg: colors.gradeUngradedSoft, label: "—" };

  if (variant === "grade" && grade !== undefined) {
    const gradeStyle = getGradeStyle(grade);
    style = { ...gradeStyle, label: gradeStyle.label };
  } else if (variant === "sector" && label) {
    const sector = sectorColors[label] || { color: colors.muted, bg: colors.gradeUngradedSoft };
    style = { ...sector, label };
  } else if (variant === "status" && label) {
    const status = statusColors[label.toLowerCase()] || { color: colors.muted, bg: colors.gradeUngradedSoft };
    style = { ...status, label };
  } else if (variant === "custom" && color && bgColor) {
    style = { color, bg: bgColor, label: label || "—" };
  } else if (label) {
    style = { ...style, label };
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        className
      )}
      style={{
        color: style.color,
        backgroundColor: style.bg,
      }}
    >
      {style.label}
    </span>
  );
}
