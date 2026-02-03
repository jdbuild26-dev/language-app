import React, { useState } from "react";
import {
  ArrowLeft,
  RotateCcw,
  Languages,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { cn } from "@/lib/utils";

/**
 * Standard Layout for Practice Games
 * @param {string} title - Page title (fallback)
 * @param {string} questionType - "What do you hear", "Fill in the blank", etc. (from Sheet)
 * @param {string} instructionFr - French instruction (from Sheet)
 * @param {string} instructionEn - English instruction (from Sheet)
 * @param {number} progress - 0 to 100
 * @param {boolean} isGameOver - Show completion screen?
 * @param {number} score - Current score
 * @param {number} totalQuestions - Total count
 * @param {function} onExit - Handle exit
 * @param {function} onNext - Handle next/submit
 * @param {function} onRestart - Handle restart
 * @param {boolean} isSubmitEnabled - Can user submit?
 * @param {boolean} showSubmitButton - Show the manual submit button?
 * @param {React.ReactNode} children - Game content
 * @param {boolean} showFeedback - Is feedback banner active?
 * @param {boolean} isCorrect - Is the answer correct?
 * @param {string} feedbackMessage - Feedback text
 * @param {string} correctAnswer - The correct answer string
 */
export default function PracticeGameLayout({
  questionType,
  questionTypeFr, // New: French specific question type heading
  questionTypeEn, // New: English specific question type heading
  instructionFr,
  instructionEn,
  progress,
  isGameOver,
  score,
  totalQuestions,
  onExit,
  onNext,
  onRestart,
  isSubmitEnabled = true,
  showSubmitButton = true,
  submitLabel = "Submit",
  timerValue, // New prop for Timer string (e.g. "0:17")
  currentQuestionIndex, // Optional: Explicit current question index (0-based) for display "X / Y"
  showFeedback = false, // New Prop
  isCorrect = false, // New Prop
  feedbackMessage = "", // New Prop
  correctAnswer = "", // New Prop
  children,
}) {
  const [showTranslation, setShowTranslation] = useState(false);

  if (isGameOver) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center animate-in zoom-in duration-300">
        <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6">
          <span className="text-4xl">🏆</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Quiz Complete!
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          You scored <span className="font-bold text-blue-600">{score}</span>{" "}
          out of {totalQuestions}
        </p>

        <div className="flex gap-4">
          <Button variant="outline" size="lg" onClick={onExit}>
            Back to Menu
          </Button>
          <Button onClick={onRestart} size="lg" className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-h-screen bg-white dark:bg-slate-950 overflow-hidden font-sans">
      {/* HEADER */}
      <div className="pt-8 md:pt-12 pb-4 md:pb-6 px-4 text-center border-b-[1px] border-red-100 dark:border-red-900/30 shrink-0 relative bg-white dark:bg-slate-950 z-10">
        {/* Instructions (Main Heading) */}
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="flex items-center justify-center gap-3">
            <h1 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              {showTranslation
                ? instructionEn || instructionFr
                : instructionFr || instructionEn}
            </h1>

            {instructionFr && instructionEn && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowTranslation(!showTranslation)}
                className="rounded-full w-8 h-8 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                title="Translate"
              >
                <Languages className="w-5 h-5" />
              </Button>
            )}
          </div>

          {/* Secondary Heading / Question Type - REMOVED */}

          {/* Progress Bar */}
          <div className="w-full max-w-sm mt-4">
            <ProgressBar
              current={
                currentQuestionIndex !== undefined
                  ? currentQuestionIndex
                  : Math.round((progress / 100) * totalQuestions)
              }
              total={totalQuestions}
              label="Questions"
            />
          </div>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 flex flex-col items-center justify-start p-6 overflow-y-auto w-full max-w-[95%] mx-auto">
        <div className="w-full h-full flex flex-col justify-start items-center pt-8">
          {children}
        </div>
      </div>

      <div
        className={cn(
          "py-4 md:py-6 px-4 md:px-8 border-t-[1px] shrink-0 flex items-center justify-between w-full z-10 transition-colors duration-300",
          showFeedback
            ? isCorrect
              ? "bg-green-100 dark:bg-green-900/30 border-green-500"
              : "bg-red-100 dark:bg-red-900/30 border-red-500"
            : "bg-white dark:bg-slate-950 border-red-100 dark:border-red-900/30",
        )}
      >
        {/* Feedback Content (Left/Center) or Timer (Left) */}
        <div className="flex items-center gap-4 flex-1">
          {showFeedback ? (
            <div className="flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {isCorrect ? (
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400 shrink-0" />
              ) : (
                <XCircle className="w-8 h-8 text-red-600 dark:text-red-400 shrink-0" />
              )}
              <div className="flex flex-col">
                <span
                  className={cn(
                    "text-lg md:text-xl font-bold leading-tight",
                    isCorrect
                      ? "text-green-800 dark:text-green-200"
                      : "text-red-800 dark:text-red-200",
                  )}
                >
                  {feedbackMessage}
                </span>
                {!isCorrect && correctAnswer && (
                  <span className="text-red-700 dark:text-red-300 text-sm font-medium">
                    Correct Answer: {correctAnswer}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div
              className={cn(
                "text-xl md:text-3xl font-bold font-mono tracking-wider min-w-[60px] md:min-w-[80px] transition-colors",
                // Timer Styling default
                "text-gray-800 dark:text-gray-200",
              )}
            >
              {timerValue || ""}
            </div>
          )}
        </div>

        {/* Right: Action Button */}
        <div className="shrink-0 ml-4">
          {showSubmitButton && (
            <button
              onClick={onNext}
              disabled={!isSubmitEnabled}
              className={cn(
                "px-6 md:px-8 py-3 md:py-6 text-base md:text-lg font-bold rounded-xl uppercase tracking-wider shadow-lg transition-transform active:scale-95 min-w-[120px] md:min-w-[140px]",
                showFeedback
                  ? isCorrect
                    ? "bg-green-600 hover:bg-green-700 text-white border-b-4 border-green-700 active:border-b-0"
                    : "bg-red-600 hover:bg-red-700 text-white border-b-4 border-red-700 active:border-b-0"
                  : !isSubmitEnabled
                    ? "opacity-50 cursor-not-allowed bg-gray-200 text-gray-400"
                    : "bg-sky-400 hover:bg-sky-500 text-white border-b-4 border-sky-500 active:border-b-0",
              )}
            >
              {submitLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
