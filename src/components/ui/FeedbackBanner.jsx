import React from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Duolingo-style feedback banner component
 * Shows at the bottom of the screen with correct/incorrect feedback
 */
export default function FeedbackBanner({
  isCorrect,
  correctAnswer,
  onContinue,
  message,
  continueLabel = "CONTINUE",
  hideButton = false,
}) {
  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 pointer-events-none",
        isCorrect
          ? "bg-green-100 dark:bg-green-900/30 border-t-2 border-green-500"
          : "bg-red-100 dark:bg-red-900/30 border-t-2 border-red-500",
      )}
    >
      <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        {/* Left side - Feedback message */}
        <div className="flex items-center gap-4 pointer-events-auto">
          {isCorrect ? (
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400 flex-shrink-0" />
          ) : (
            <XCircle className="w-8 h-8 text-red-600 dark:text-red-400 flex-shrink-0" />
          )}

          <div>
            <h3
              className={cn(
                "text-xl font-bold mb-1",
                isCorrect
                  ? "text-green-800 dark:text-green-200"
                  : "text-red-800 dark:text-red-200",
              )}
            >
              {message}
            </h3>

            {/* Show correct answer only when incorrect */}
            {!isCorrect && correctAnswer && (
              <div className="text-red-700 dark:text-red-300">
                <span className="font-semibold">Correct Answer: </span>
                <span>{correctAnswer}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right side - Continue button */}
        {!hideButton && (
          <button
            onClick={onContinue}
            className={cn(
              "px-8 py-3 rounded-xl font-bold text-white text-sm uppercase tracking-wide transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg flex-shrink-0 pointer-events-auto",
              isCorrect
                ? "bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                : "bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600",
            )}
          >
            {isCorrect ? continueLabel : "GOT IT"}
          </button>
        )}
      </div>
    </div>
  );
}
