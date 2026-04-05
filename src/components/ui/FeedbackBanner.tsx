"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Languages,
  Flag,
  Share2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Duolingo-style feedback banner component
 * Shows at the bottom of the screen with correct/incorrect feedback
 */
export default function FeedbackBanner({
  isCorrect,
  feedbackTone,
  correctAnswer,
  englishCorrectAnswer = "",
  onContinue,
  message,
  continueLabel = "CONTINUE",
  hideButton = false,
  children = null,
}) {
  const tone = feedbackTone || (isCorrect ? "success" : "error");
  const isPartial = tone === "partial";
  const isSuccess = tone === "success";

  return (
    <motion.div
      initial={{ y: 28, opacity: 0, scale: 0.985 }}
      animate={{
        y: 0,
        opacity: 1,
        scale: 1,
        transition: {
          type: "spring",
          stiffness: 360,
          damping: 28,
          mass: 0.9,
        },
      }}
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 min-h-[112px] sm:min-h-[120px] lg:min-h-[136px] shadow-[0_-14px_32px_rgba(15,23,42,0.16)]",
        isSuccess
          ? "bg-green-500 dark:bg-green-600"
          : isPartial
            ? "bg-yellow-500 dark:bg-yellow-600"
            : "bg-red-500 dark:bg-red-600",
      )}
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.1 } }}
        className="mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-2 lg:py-3 flex flex-col gap-1.5"
      >
        <div className="flex flex-row items-center justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.1 } }}
            className="flex items-center gap-2"
          >
            <div className="flex flex-col">
              <div className="flex gap-2 items-center">
                <span className="text-xs sm:text-sm lg:text-xl font-extrabold text-white">
                  {message}
                </span>
                {isSuccess ? (
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" />
                ) : isPartial ? (
                  <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" />
                )}
              </div>

              {/* Only show "Correct Answer:" label when there's actually something to show */}
              {!isSuccess && correctAnswer && (
                <span className="font-bold text-[10px] sm:text-xs lg:text-base tracking-wide text-white/80">
                  Correct Answer:
                </span>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.1 } }}
            className="flex items-center gap-2 shrink-0"
          >
            <button className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
              <Languages className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" />
            </button>
            <button className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
              <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" />
            </button>
            <button className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
              <Flag className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" />
            </button>

            {!hideButton && (
              <button
                onClick={onContinue}
                className={cn(
                  "px-4 sm:px-6 lg:px-7 py-1.5 lg:py-2 rounded-lg font-bold text-[10px] sm:text-xs lg:text-sm uppercase tracking-widest transition-all duration-200 hover:scale-105 active:scale-95 shadow-md bg-white",
                  isSuccess
                    ? "text-green-600 hover:bg-green-50"
                    : isPartial
                      ? "text-yellow-700 hover:bg-yellow-50"
                      : "text-red-600 hover:bg-red-50",
                )}
              >
                {isSuccess ? continueLabel : "GOT IT"}
              </button>
            )}
          </motion.div>
        </div>

        {!isSuccess && correctAnswer && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.1 } }}
            className="flex flex-col"
          >
            <span className="text-xs sm:text-sm lg:text-lg font-semibold text-white">
              {correctAnswer}
            </span>
            {englishCorrectAnswer && (
              <span className="text-[10px] sm:text-xs lg:text-sm text-white/80">
                {englishCorrectAnswer}
              </span>
            )}
          </motion.div>
        )}

        {children && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.1 } }}
            className="pl-8"
          >
            {children}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
