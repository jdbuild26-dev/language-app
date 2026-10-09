"use client";

import type { ComponentProps } from "react";
import { Languages, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type TranslateButtonProps = ComponentProps<"button"> & {
  isLoading?: boolean;
  iconSize?: "sm" | "md";
  iconVariant?: "header" | "option";
};

export const TranslateIcon = Languages;

/** One place to change the translation action icon across practice pages. */
export function TranslateButton({
  isLoading = false,
  iconSize = "sm",
  iconVariant = "header",
  className,
  disabled,
  type = "button",
  ...props
}: TranslateButtonProps) {
  const iconClassName = iconSize === "md" ? "h-5 w-5" : "h-5 w-5";

  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-transparent transition-[color,transform] duration-150 ease-out active:scale-[0.9] hover:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:opacity-60",
        className,
        iconVariant === "option"
          ? "text-sky-500 hover:text-sky-500/65 dark:text-slate-400 dark:hover:text-slate-300"
          : "text-sky-500 hover:text-sky-500/65 dark:text-sky-400 dark:hover:text-sky-400/65",
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className={cn(iconClassName, "animate-spin")} aria-hidden="true" />
      ) : (
        <TranslateIcon className={iconClassName} aria-hidden="true" />
      )}
    </button>
  );
}
