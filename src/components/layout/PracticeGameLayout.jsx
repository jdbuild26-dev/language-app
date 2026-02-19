import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  RotateCcw,
  Languages,
  CheckCircle,
  XCircle,
  Loader2
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { cn } from "@/lib/utils";
import { useAuth } from "@clerk/clerk-react";
import { completeAssignment } from "@/services/assignmentsApi";

/**
 * Standard Layout for Practice Games
 */
export default function PracticeGameLayout({
  questionType,
  questionTypeFr,
  questionTypeEn,
  instructionFr,
  instructionEn,
  localizedInstruction,
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
  timerValue,
  currentQuestionIndex,
  showFeedback = false,
  isCorrect = false,
  feedbackMessage = "",
  correctAnswer = "",
  children,
}) {
  const [showTranslation, setShowTranslation] = useState(false);
  const [isSubmittingResult, setIsSubmittingResult] = useState(false);
  const [searchParams] = useSearchParams();
  const { getToken } = useAuth();
  const hasSubmitted = useRef(false);

  const assignmentId = searchParams.get("assignmentId");

  useEffect(() => {
    if (isGameOver && assignmentId && !hasSubmitted.current) {
      const submitResult = async () => {
        try {
          hasSubmitted.current = true;
          setIsSubmittingResult(true);
          const token = await getToken();

          // Calculate percentage score
          const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

          await completeAssignment(assignmentId, percentage, {
            rawScore: score,
            total: totalQuestions,
            type: questionType
          }, token);

          console.log("✅ Assignment auto-completed:", assignmentId);
        } catch (error) {
          console.error("❌ Failed to auto-complete assignment:", error);
          hasSubmitted.current = false; // Allow retry if it failed?
        } finally {
          setIsSubmittingResult(false);
        }
      };

      submitResult();
    }
  }, [isGameOver, assignmentId, score, totalQuestions, getToken, questionType]);

  if (isGameOver) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center animate-in zoom-in duration-300">
        <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6">
          {isSubmittingResult ? (
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          ) : (
            <span className="text-4xl">🏆</span>
          )}
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {isSubmittingResult ? "Saving Results..." : "Quiz Complete!"}
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          You scored <span className="font-bold text-blue-600">{score}</span>{" "}
          out of {totalQuestions}
        </p>

        {assignmentId && !isSubmittingResult && (
          <div className="mb-6 px-4 py-2 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/50 rounded-full text-green-700 dark:text-green-300 text-sm font-medium animate-in fade-in slide-in-from-top-2">
            Assignment progress saved! ✅
          </div>
        )}

        <div className="flex gap-4">
          <Button variant="outline" size="lg" onClick={onExit} disabled={isSubmittingResult}>
            Back to Menu
          </Button>
          <Button onClick={onRestart} size="lg" className="gap-2" disabled={isSubmittingResult}>
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
                ? instructionEn || instructionFr || localizedInstruction
                : localizedInstruction || instructionFr || instructionEn}
            </h1>

            {((instructionFr && instructionEn) || (localizedInstruction && instructionEn)) && (
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
