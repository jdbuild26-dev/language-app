"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Flag,
  Share2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TranslateIcon } from "@/components/ui/TranslateButton";

/**
 * Duolingo-style feedback banner component
 * Shows at the bottom of the screen with correct/incorrect feedback
 */
type FeedbackBannerProps = {
  isCorrect?: boolean;
  feedbackTone?: string;
  feedbackAppearance?: "solid" | "soft";
  correctAnswer?: React.ReactNode;
  englishCorrectAnswer?: React.ReactNode;
  onContinue?: () => void;
  message?: React.ReactNode;
  continueLabel?: string;
  correctAnswerLabel?: string;
  hideButton?: boolean;
  animateEntrance?: boolean;
  compact?: boolean;
  inFlow?: boolean;
  onTranslate?: () => void;
  translationVisible?: boolean;
  children?: React.ReactNode;
};

export default function FeedbackBanner({
  isCorrect,
  feedbackTone,
  feedbackAppearance = "solid",
  correctAnswer,
  englishCorrectAnswer = "",
  onContinue,
  message,
  continueLabel = "CONTINUE",
  correctAnswerLabel = "Correct answer:",
  hideButton = false,
  animateEntrance = true,
  compact = false,
  inFlow = false,
  onTranslate,
  translationVisible = false,
  children = null,
}: FeedbackBannerProps) {
  const reduceMotion = useReducedMotion();
  const tone = feedbackTone || (isCorrect ? "success" : "error");
  const isPartial = tone === "partial";
  const isSuccess = tone === "success";
  const isSoft = feedbackAppearance === "soft";
  const textColor = isSoft ? "text-current" : "text-white";
  const secondaryTextColor = isSoft ? "text-current" : "text-white/90";
  const iconClassName = cn("w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5", textColor);
  const toolClassName = cn(
    "w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-full flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
    isSoft
      ? "bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
      : "bg-white/20 hover:bg-white/30",
  );

  return (
    <motion.div
      initial={animateEntrance ? { opacity: 0, transform: reduceMotion ? "none" : "translateY(8px)" } : false}
      animate={animateEntrance ? { opacity: 1, transform: reduceMotion ? "none" : "translateY(0px)" } : undefined}
      transition={animateEntrance ? { duration: reduceMotion ? 0.12 : 0.18, ease: [0.23, 1, 0.32, 1] } : undefined}
      className={cn(
        inFlow
          ? "relative z-10 shrink-0 max-h-[35dvh] overflow-y-auto border-t border-white/20"
          : "fixed bottom-0 left-0 right-0 z-50 max-h-[40dvh] overflow-y-auto shadow-[0_-14px_32px_rgba(15,23,42,0.16)]",
        isSoft
          ? isSuccess
            ? "bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-200"
            : isPartial
              ? "bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-200"
              : "bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-200"
          : isSuccess
            ? "bg-green-500 dark:bg-green-600"
            : isPartial
              ? "bg-yellow-500 dark:bg-yellow-600"
              : "bg-red-500 dark:bg-red-600",
      )}
    >
      <div
        className={cn(
          "mx-auto flex flex-col px-4 sm:px-6 lg:px-8",
          compact ? "gap-1 py-2 pb-[max(8px,env(safe-area-inset-bottom))]" : "gap-2 py-3 pb-[max(12px,env(safe-area-inset-bottom))]",
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            className={cn("flex min-w-0 items-center gap-2", compact && "flex-wrap gap-x-4")}
          >
            <div className="flex flex-col">
              <div className="flex gap-2 items-center">
                <span className={cn("practice-type-feedback font-bold", textColor)}>
                  {message}
                </span>
                {isSuccess ? (
                  <CheckCircle2 className={iconClassName} />
                ) : isPartial ? (
                  <AlertCircle className={iconClassName} />
                ) : (
                  <XCircle className={iconClassName} />
                )}
              </div>
            </div>
            {compact && !isSuccess && correctAnswer && (
              <div className={cn("practice-type-feedback min-w-0", textColor)}>
                <span className={cn("font-medium", secondaryTextColor)}>{correctAnswerLabel} </span>
                <span className="font-bold">{correctAnswer}</span>
              </div>
            )}
          </div>

          <div
            className="flex items-center gap-2 shrink-0"
          >
            <button type="button" onClick={onTranslate} disabled={inFlow && !onTranslate} aria-label={onTranslate ? (translationVisible ? "Hide translations" : "Show translations") : "Translate"} title={onTranslate ? (translationVisible ? "Hide translations" : "Show translations") : inFlow ? "Translation unavailable" : "Translate"} aria-pressed={onTranslate ? translationVisible : undefined} className={toolClassName}>
              <TranslateIcon className={iconClassName} />
            </button>
            <button className={toolClassName}>
              <Share2 className={iconClassName} />
            </button>
            <button className={toolClassName}>
              <Flag className={iconClassName} />
            </button>

            {!hideButton && (
              <button
                onClick={onContinue}
                className={cn(
                  "practice-type-action px-4 sm:px-6 lg:px-7 py-1.5 lg:py-2 rounded-lg uppercase tracking-widest transition-all duration-200 hover:scale-105 active:scale-95 shadow-md",
                  isSoft
                    ? cn(
                        "text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                        isSuccess
                          ? "bg-green-800 hover:bg-green-900 focus-visible:outline-green-800 dark:bg-green-200 dark:text-green-950 dark:hover:bg-green-100 dark:focus-visible:outline-green-200"
                          : isPartial
                            ? "bg-amber-800 hover:bg-amber-900 focus-visible:outline-amber-800 dark:bg-amber-200 dark:text-amber-950 dark:hover:bg-amber-100 dark:focus-visible:outline-amber-200"
                            : "bg-red-800 hover:bg-red-900 focus-visible:outline-red-800 dark:bg-red-200 dark:text-red-950 dark:hover:bg-red-100 dark:focus-visible:outline-red-200",
                      )
                    : isSuccess
                      ? "bg-white text-green-600 hover:bg-green-50"
                      : isPartial
                        ? "bg-white text-yellow-700 hover:bg-yellow-50"
                        : "bg-white text-red-600 hover:bg-red-50",
                )}
              >
                {continueLabel}
              </button>
            )}
          </div>
        </div>

        {!compact && !isSuccess && correctAnswer && (
          <div
            className={cn("practice-type-feedback flex flex-col gap-2", textColor)}
          >
            <div className="flex flex-wrap gap-x-2">
              <span className={cn("font-medium", secondaryTextColor)}>{correctAnswerLabel}</span>
              <span className="font-bold">{correctAnswer}</span>
            </div>
            {englishCorrectAnswer && (
              <span className={secondaryTextColor}>
                {englishCorrectAnswer}
              </span>
            )}
          </div>
        )}

        {children && (
          <div
            className={cn("practice-type-feedback", textColor)}
          >
            {children}
          </div>
        )}
      </div>
    </motion.div>
  );
}
