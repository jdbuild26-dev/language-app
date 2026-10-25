"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type PracticeOptionCardProps = {
  children: ReactNode;
  variant?: "word" | "row";
  selected?: boolean;
  correct?: boolean;
  submitted?: boolean;
  onSelect?: () => void;
  className?: string;
  leading?: ReactNode;
  suffix?: ReactNode;
  action?: ReactNode;
};

/** Shared presentation only; exercises own selection, audio and translation state. */
export default function PracticeOptionCard({
  children, variant = "word", selected = false, correct = false,
  submitted = false, onSelect, className, leading, suffix, action,
}: PracticeOptionCardProps) {
  const state = submitted ? correct ? "correct" : selected ? "incorrect" : "muted" : selected ? "selected" : "idle";
  const stateClasses = {
    idle: "border-slate-200 bg-white text-slate-700 hover:border-blue-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
    selected: "border-blue-500 bg-sky-50 text-slate-700 dark:border-blue-400 dark:bg-blue-950/30 dark:text-slate-200",
    correct: "border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-400 dark:bg-emerald-950/30 dark:text-emerald-300",
    incorrect: "border-red-400 bg-red-50 text-red-600 dark:border-red-400 dark:bg-red-950/30 dark:text-red-300",
    muted: "border-slate-200 bg-white text-slate-700 opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
  };
  const button = (
    <motion.button
      type="button"
      data-practice-option
      data-state={state}
      aria-pressed={selected}
      disabled={submitted}
      onClick={() => { if (!submitted) onSelect?.(); }}
      whileHover={!submitted && !selected ? { scale: 1.01 } : {}}
      whileTap={!submitted ? { scale: 0.985 } : {}}
      transition={{ duration: 0.22 }}
      className={cn(
        "practice-type-content flex w-full items-center rounded-2xl border-2 px-4 font-medium shadow-sm transition-[background-color,border-color,color,opacity,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
        variant === "word" ? "flex-col justify-center py-8 text-center" : "gap-3 py-3.5 text-left",
        action && (variant === "word" ? "pt-12" : "pr-14"),
        submitted && "cursor-default",
        className,
        stateClasses[state],
      )}
    >
      {leading}
      {children}
      {suffix}
    </motion.button>
  );
  return action ? (
    <div className="relative min-w-0">
      {button}
      <div className={variant === "word" ? "absolute left-2 top-2 z-10" : "absolute right-3 top-1/2 z-10 -translate-y-1/2"}>
        {action}
      </div>
    </div>
  ) : button;
}
