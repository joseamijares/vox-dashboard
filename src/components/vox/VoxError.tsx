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
        "flex flex-col items-center justify-center gap-3 rounded-lg border p-8 text-center",
        className
      )}
      style={{ borderColor: colors.border }}
    >
      <div
        className="flex h-10 w-10 items-center justify-center rounded-full text-lg"
        style={{ backgroundColor: colors.gradeSellSoft, color: colors.gradeSell }}
      >
        ⚠
      </div>
      <p className="text-sm font-medium" style={{ color: colors.foreground }}>
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-md px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
          style={{ backgroundColor: colors.primary }}
        >
          Retry
        </button>
      )}
    </div>
  );
}
