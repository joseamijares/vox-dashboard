"use client";

import { cn } from "@/lib/utils";
import { colors } from "@/lib/design-system";

interface VoxErrorProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function VoxError({
  message = "Something went wrong",
  onRetry,
  className,
}: VoxErrorProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-border bg-card p-8 text-center",
        className
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-loss-soft text-loss text-lg">
        ⚠
      </div>
      <p className="text-sm font-medium text-foreground">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-md px-4 py-2 text-sm font-medium text-primary-foreground bg-primary transition-colors hover:opacity-90"
        >
          Retry
        </button>
      )}
    </div>
  );
}
