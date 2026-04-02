import React from "react";
import { cn } from "@/lib/utils";

type ProgressBarProps = {
  current: number;
  total: number;
  className?: string;
  label?: string;
  slim?: boolean;
};

export function ProgressBar({
  current,
  total,
  className,
  label = "",
  slim = false,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (current / (total || 1)) * 100));
  const isComplete = current >= total;

  if (slim) {
    return (
      <div
        className={cn(
          "w-full h-2 bg-slate-300 dark:bg-slate-700 rounded-full overflow-hidden",
          className,
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            isComplete
              ? "bg-gradient-to-r from-green-400 to-emerald-500"
              : "bg-gradient-to-r from-blue-500 to-blue-400",
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  }

  return (
    <div className={cn("w-full flex flex-col ", className)}>
      {label && (
        <div className="flex justify-between text-xs font-medium text-slate-400 dark:text-slate-500">
          <span>{label}</span>
          <span>
            {current} / {total}
          </span>
        </div>
      )}
      <div className="relative h-2 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div
          className={cn(
            "h-full transition-all duration-500 ease-out relative",
            isComplete
              ? "bg-gradient-to-r from-green-400 to-emerald-500"
              : "bg-gradient-to-r from-blue-500 to-blue-400",
          )}
          style={{ width: `${percentage}%` }}
        >
          {!isComplete && percentage > 5 && (
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_1.8s_infinite] rounded-full" />
          )}
        </div>
      </div>
    </div>
  );
}
