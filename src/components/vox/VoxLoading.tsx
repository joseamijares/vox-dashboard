"use client";

import { cn } from "@/lib/utils";

interface VoxLoadingProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  text?: string;
}

export function VoxLoading({ className, size = "md", text }: VoxLoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-3",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-gray-300 border-t-gray-900",
          sizeClasses[size]
        )}
      />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  );
}

export function VoxSkeleton({ className, rows = 3 }: { className?: string; rows?: number }) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-4 animate-pulse rounded bg-gray-100" />
      ))}
    </div>
  );
}
