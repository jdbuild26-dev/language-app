"use client";

import { Turtle, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import speakerStyles from "./AudioSpeaker.module.css";

/** Shared slow/normal control used by Main Practice and Vocabulary listening. */
export default function ListeningPlaybackButton({ mode, active, onClick, label, size = "default" }: {
  mode: "slow" | "normal";
  active: boolean;
  onClick: () => void;
  label: string;
  size?: "default" | "large";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={cn(
        "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-[background-color,box-shadow,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 motion-safe:active:scale-[0.96] motion-reduce:transition-none sm:h-[52px] sm:w-[52px] dark:focus-visible:ring-offset-slate-900",
        size === "large" && (mode === "normal" ? "!h-20 !w-20" : "!h-14 !w-14"),
        mode === "normal" && speakerStyles.speakerButton,
        mode === "normal" && active && speakerStyles.playing,
        mode === "slow" && "motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0",
        active
          ? cn("bg-sky-500 text-white hover:bg-sky-600 dark:bg-sky-600 dark:text-white dark:hover:bg-sky-500", mode === "slow" ? "shadow-[0_0_0_4px_rgba(14,165,233,0.2)]" : "shadow-[0_0_0_4px_rgba(14,165,233,0.16)]")
          : "bg-sky-100 text-sky-700 hover:bg-sky-200 dark:bg-sky-900/40 dark:text-sky-300 dark:hover:bg-sky-900/60",
      )}
    >
      {mode === "slow"
        ? <Turtle className={size === "large" ? "h-7 w-7" : "h-6 w-6"} aria-hidden="true" />
        : <Volume2 className={cn(size === "large" ? "h-10 w-10" : "h-7 w-7", speakerStyles.speakerIcon)} aria-hidden="true" />}
    </button>
  );
}
