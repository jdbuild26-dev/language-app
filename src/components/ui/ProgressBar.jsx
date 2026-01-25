import React from "react";
import { cn } from "@/lib/utils";

export function ProgressBar({ current, total, className, label }) {
  const percentage = Math.min(100, Math.max(0, (current / total) * 100));

  return (
    <div
      className={cn("w-full max-w-md mx-auto flex flex-col gap-2", className)}
    >
      <div className="flex justify-between text-sm font-medium text-gray-500 dark:text-gray-400">
        <span>{label}</span>
        <span>
          {current} / {total}
        </span>
      </div>
      <div className="h-2.5 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-sky-500 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
