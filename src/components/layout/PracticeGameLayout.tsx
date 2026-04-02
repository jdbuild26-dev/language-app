"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import {
  ArrowLeft,
  RotateCcw,
  Languages,
  X,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { cn } from "@/lib/utils";
import { useAuth } from "@clerk/nextjs";
import { completeAssignment } from "@/services/assignmentsApi";
import FeedbackBanner from "@/components/ui/FeedbackBanner";

/**
 * Inner component that uses useSearchParams — must be wrapped in Suspense.
 */
function AssignmentSubmitter({ isGameOver, score, totalQuestions, questionType }) {
  const searchParams = useSearchParams();
  const { getToken } = useAuth();
  const hasSubmitted = useRef(false);
  const [isSubmittingResult, setIsSubmittingResult] = useState(false);

  const assignmentId = searchParams.get("assignmentId");

  useEffect(() => {
    if (isGameOver && assignmentId && !hasSubmitted.current) {
      const submitResult = async () => {
        try {
          hasSubmitted.current = true;
          setIsSubmittingResult(true);
          const token = await getToken();
          const percentage =
            totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
          await completeAssignment(assignmentId, percentage, { rawScore: score, total: totalQuestions, type: questionType }, token);
          console.log("✅ Assignment auto-completed:", assignmentId);
        } catch (error) {
          console.error("❌ Failed to auto-complete assignment:", error);
          hasSubmitted.current = false;
        } finally {
          setIsSubmittingResult(false);
        }
      };
      submitResult();
    }
  }, [isGameOver, assignmentId, score, totalQuestions, getToken, questionType]);

  if (!assignmentId) return null;

  return isSubmittingResult ? (
    <div className="mb-6 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 rounded-full text-blue-700 dark:text-blue-300 text-sm font-medium">
      Saving results...
    </div>
  ) : isGameOver ? (
    <div className="mb-6 px-4 py-2 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/50 rounded-full text-green-700 dark:text-green-300 text-sm font-medium animate-in fade-in slide-in-from-top-2">
      Assignment progress saved! ✅
    </div>
  ) : null;
}

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
  userAnswer = "",
  questionContext = "",
  customEndGameContent = null,
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

        {customEndGameContent}

        <Suspense fallback={null}>
          <AssignmentSubmitter
            isGameOver={isGameOver}
            score={score}
            totalQuestions={totalQuestions}
            questionType={questionType}
          />
        </Suspense>

        <div className="flex gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={onExit}
          >
            Back to Menu
          </Button>
          <Button
            onClick={onRestart}
            size="lg"
            className="gap-2"
          >
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
        {/* Close Button */}
        {onExit && (
          <button
            onClick={onExit}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
            aria-label="Close exercise"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {/* Instructions (Main Heading) */}
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="flex items-center justify-center gap-3">
            <h1 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              {showTranslation
                ? instructionEn || instructionFr || localizedInstruction
                : localizedInstruction || instructionFr || instructionEn}
            </h1>

            {((instructionFr && instructionEn) ||
              (localizedInstruction && instructionEn)) && (
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
                  : totalQuestions > 0
                    ? Math.round(((progress ?? 0) / 100) * totalQuestions)
                    : 0
              }
              total={totalQuestions || 1}
              label="Questions"
              className=""
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

      {/* FOOTER — timer + submit button when no feedback; FeedbackBanner when feedback is active */}
      {showFeedback ? (
        <FeedbackBanner
          isCorrect={isCorrect}
          correctAnswer={correctAnswer}
          userAnswer={userAnswer}
          questionContext={questionContext}
          message={feedbackMessage}
          onContinue={onNext}
        />
      ) : (
        <div className="py-4 md:py-6 px-4 md:px-8 border-t border-red-100 dark:border-red-900/30 shrink-0 flex items-center justify-between w-full z-10 bg-white dark:bg-slate-950">
          {/* Timer */}
          <div className="text-xl md:text-3xl font-bold font-mono tracking-wider min-w-[60px] md:min-w-[80px] text-gray-800 dark:text-gray-200">
            {timerValue || ""}
          </div>

          {/* Submit button */}
          <div className="shrink-0 ml-4">
            {showSubmitButton && (
              <button
                onClick={onNext}
                disabled={!isSubmitEnabled}
                className={cn(
                  "px-6 md:px-8 py-3 md:py-6 text-base md:text-lg font-bold rounded-xl uppercase tracking-wider shadow-lg transition-transform active:scale-95 min-w-[120px] md:min-w-[140px]",
                  !isSubmitEnabled
                    ? "opacity-50 cursor-not-allowed bg-gray-200 text-gray-400"
                    : "bg-sky-400 hover:bg-sky-500 text-white border-b-4 border-sky-500 active:border-b-0",
                )}
              >
                {submitLabel}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
