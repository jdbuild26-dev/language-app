import React from "react";
import { cn } from "@/lib/utils";

export function SegmentedProgressBar({ current, total, className }) {
  // Create an array of length 'total' to map over
  const segments = Array.from({ length: total }, (_, i) => i);

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-4 py-2 bg-orange-50 dark:bg-slate-800/50 rounded-xl w-fit mx-auto",
        className,
      )}
    >
      {segments.map((index) => {
        const isActive = index < current;
        return (
          <div
            key={index}
            className={cn(
              "h-1.5 w-8 rounded-full transition-colors duration-300",
              isActive
                ? "bg-purple-900 dark:bg-purple-500"
                : "bg-gray-200 dark:bg-slate-700",
            )}
          />
        );
      })}
    </div>
  );
}
