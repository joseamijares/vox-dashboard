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

/** Linear-style surface: background defines elevation */
export function VoxCard({
  children,
  className,
  variant = "default",
  hover = false,
  onClick,
}: VoxCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "vox-surface overflow-hidden",
        variant === "flat" && "bg-transparent shadow-none",
        hover && "vox-surface-hover cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}

export function VoxCardHeader({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-4 pt-4 pb-2",
        className
      )}
    >
      {children}
    </div>
  );
}

export function VoxCardTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h3 className={cn("text-sm font-semibold text-foreground", className)}>
      {children}
    </h3>
  );
}

export function VoxCardContent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("px-4 pb-4", className)}>{children}</div>;
}

// Re-exports for legacy imports from this file
export { VoxBadge } from "@/components/vox/VoxBadge";
export { VoxKpi } from "@/components/vox/VoxKpi";
