import React, { useState } from "react";
import { ArrowLeft, XCircle, RotateCcw, Languages } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/ProgressBar";

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
      <div className="pt-12 pb-6 px-4 text-center border-b-[1px] border-red-100 dark:border-red-900/30 shrink-0 relative bg-white dark:bg-slate-950 z-10">
        {/* Instructions (Main Heading) */}
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="flex items-center justify-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
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
      <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto w-full max-w-[95%] mx-auto">
        <div className="w-full h-full flex flex-col justify-center items-center">
          {children}
        </div>
      </div>

      {/* FOOTER */}
      <div className="py-6 px-8 border-t-[1px] border-red-100 dark:border-red-900/30 shrink-0 bg-white dark:bg-slate-950 flex items-center justify-between w-full z-10">
        {/* Left: Timer */}
        <div className="text-3xl font-bold text-gray-800 dark:text-gray-200 font-mono tracking-wider min-w-[80px]">
          {timerValue || ""}
        </div>

        {/* Right: Action Button */}
        <div className="flex-1 flex justify-end">
          {showSubmitButton && (
            <Button
              onClick={onNext}
              disabled={!isSubmitEnabled}
              className={`
                    px-8 py-6 text-lg font-bold rounded-xl uppercase tracking-wider shadow-lg transition-transform active:scale-95
                    ${
                      !isSubmitEnabled
                        ? "opacity-50 cursor-not-allowed bg-gray-200 text-gray-400"
                        : "bg-sky-400 hover:bg-sky-500 text-white"
                    }
                `}
            >
              {submitLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
