"use client";

import { cn } from "@/lib/utils";

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
        "vox-surface flex flex-col items-center justify-center gap-3 p-8 text-center",
        className
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-loss-soft text-loss text-sm font-semibold">
        !
      </div>
      <p className="text-sm font-medium text-foreground">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-full px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground hover:bg-muted transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
}
