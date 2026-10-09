"use client";

import React, { Suspense, useState, useEffect, useRef } from "react";
import {
  RotateCcw,
  CheckCircle,
  X,
  Loader2,
  Trophy,
  Timer,
  ListChecks,
  Settings,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { ProgressBar } from "@/components/ui/ProgressBar";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { TranslateButton } from "@/components/ui/TranslateButton";
import { cn } from "@/lib/utils";
import { useAuth } from "@clerk/nextjs";
import { completeAssignment } from "@/services/assignmentsApi";

type FeedbackTone = "neutral" | "success" | "error" | "partial";

type PracticeGameLayoutProps = {
  questionType?: string;
  questionTypeFr?: string;
  questionTypeEn?: string;
  instructionFr?: string;
  instructionEn?: string;
  localizedInstruction?: string;
  progress?: number;
  isGameOver?: boolean;
  score?: number;
  totalQuestions?: number;
  headerTotalQuestions?: number;
  onExit?: () => void;
  onNext?: () => void;
  onRestart?: () => void;
  isSubmitEnabled?: boolean;
  showSubmitButton?: boolean;
  preserveFooterHeightOnFeedback?: boolean;
  animateFeedbackEntrance?: boolean;
  compactFeedback?: boolean;
  feedbackInFlow?: boolean;
  onFeedbackTranslate?: () => void;
  feedbackTranslationVisible?: boolean;
  submitLabel?: string;
  disableContentScroll?: boolean;
  disableContentScrollOnDesktop?: boolean;
  timerValue?: string;
  currentQuestionIndex?: number;
  questionCounterValue?: number;
  showFeedback?: boolean;
  isCorrect?: boolean;
  feedbackTone?: FeedbackTone;
  feedbackMessage?: string;
  correctAnswer?: React.ReactNode;
  correctAnswerLabel?: string;
  feedbackChildren?: React.ReactNode;
  customEndGameContent?: React.ReactNode;
  children?: React.ReactNode;
};

function AssignmentIdSync({
  onChange,
}: {
  onChange: (value: string | null) => void;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    onChange(searchParams?.get("assignmentId") ?? null);
  }, [searchParams, onChange]);

  return null;
}

/**
 * Standard Layout for Practice Games — Premium Design
 */
export default function PracticeGameLayout({
  questionType,
  instructionFr,
  instructionEn,
  localizedInstruction,
  progress = 0,
  isGameOver = false,
  score = 0,
  totalQuestions = 0,
  headerTotalQuestions,
  onExit,
  onNext,
  onRestart,
  isSubmitEnabled = true,
  showSubmitButton = true,
  preserveFooterHeightOnFeedback = false,
  animateFeedbackEntrance = true,
  compactFeedback = false,
  feedbackInFlow = false,
  onFeedbackTranslate,
  feedbackTranslationVisible = false,
  submitLabel = "Submit Answer",
  disableContentScroll = false,
  disableContentScrollOnDesktop = false,
  timerValue = "",
  currentQuestionIndex,
  questionCounterValue,
  showFeedback = false,
  isCorrect = false,
  feedbackTone,
  feedbackMessage = "",
  correctAnswer = "",
  correctAnswerLabel,
  feedbackChildren = null,
  customEndGameContent = null,
  children,
}: PracticeGameLayoutProps) {
  const [showTranslation, setShowTranslation] = useState(false);
  const [isSubmittingResult, setIsSubmittingResult] = useState(false);
  const [assignmentId, setAssignmentId] = useState<string | null>(null);
  const { getToken } = useAuth();
  const hasSubmitted = useRef(false);

  useEffect(() => {
    if (isGameOver && assignmentId && !hasSubmitted.current) {
      const submitResult = async () => {
        try {
          hasSubmitted.current = true;
          setIsSubmittingResult(true);
          const token = await getToken();
          const percentage =
            totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
          await completeAssignment(
            assignmentId,
            percentage,
            { rawScore: score, total: totalQuestions, type: questionType },
            token,
          );
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

  /* ─── GAME OVER SCREEN ─────────────────────────────────────────────────── */
  if (isGameOver) {
    const percentage =
      totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    const isPerfect = percentage === 100;
    const isGood = percentage >= 70;

    return (
      <div className="practice-game-typography flex flex-col items-center w-full justify-center min-h-screen p-6 bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50 dark:from-slate-950 dark:via-blue-950/20 dark:to-indigo-950/30">
        <Suspense fallback={null}>
          <AssignmentIdSync onChange={setAssignmentId} />
        </Suspense>
        <div className="w-full max-w-sm text-center">
          {/* Trophy */}
          <div
            className={cn(
              "w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl ring-4",
              isPerfect
                ? "bg-gradient-to-br from-yellow-400 to-orange-400 ring-yellow-200 dark:ring-yellow-800"
                : isGood
                  ? "bg-gradient-to-br from-blue-500 to-indigo-500 ring-blue-200 dark:ring-blue-800"
                  : "bg-gradient-to-br from-slate-400 to-slate-500 ring-slate-200 dark:ring-slate-700",
            )}
          >
            {isSubmittingResult ? (
              <Loader2 className="w-12 h-12 text-white animate-spin" />
            ) : (
              <Trophy className="w-12 h-12 text-white drop-shadow" />
            )}
          </div>

          <h2 className="practice-type-exercise-heading text-gray-900 dark:text-white mb-1 tracking-tight">
            {isSubmittingResult
              ? "Saving…"
              : isPerfect
                ? "Perfect! 🎉"
                : isGood
                  ? "Great Job!"
                  : "Quiz Done!"}
          </h2>
          <p className="practice-type-feedback text-gray-500 dark:text-gray-400 mb-8">
            {isSubmittingResult
              ? "Recording your result…"
              : "Here's how you did"}
          </p>

          {/* Score card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 mb-6 border border-gray-100 dark:border-slate-800">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-5xl px-2 font-black text-gray-900 dark:text-white">
                {score}
              </span>
              <span className="text-2xl text-gray-400 font-light mt-1">
                / {totalQuestions}
              </span>
            </div>
            {/* Percentage bar */}
            <div className="h-3 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-700 ease-out",
                  isPerfect
                    ? "bg-gradient-to-r from-yellow-400 to-orange-400"
                    : isGood
                      ? "bg-gradient-to-r from-blue-500 to-indigo-500"
                      : "bg-gradient-to-r from-slate-400 to-slate-500",
                )}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <p
              className={cn(
                "text-sm font-semibold mt-2",
                isPerfect
                  ? "text-orange-500"
                  : isGood
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-slate-500",
              )}
            >
              {percentage}% correct
            </p>
          </div>

          {assignmentId && !isSubmittingResult && (
            <div className="mb-5 px-4 py-2.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-300 text-sm font-medium flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Assignment result saved
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onExit}
              disabled={isSubmittingResult}
              className="practice-type-action flex-1 h-12 rounded-xl border border-input bg-background hover:bg-accent hover:text-accent-foreground"
            >
              Exit
            </button>
            <button
              onClick={onRestart}
              disabled={isSubmittingResult}
              className="practice-type-action flex-1 h-12 rounded-xl gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30"
            >
              <RotateCcw className="w-4 h-4" />
              Try Again
            </button>
          </div>

          {customEndGameContent}
        </div>
      </div>
    );
  }

  /* ─── MAIN GAME LAYOUT ─────────────────────────────────────────────────── */
  const originalInstruction = localizedInstruction || instructionFr || instructionEn;
  const translatedInstruction = originalInstruction === instructionEn
    ? instructionFr
    : instructionEn || instructionFr;
  const instruction = showTranslation
    ? translatedInstruction || originalInstruction
    : originalInstruction;

  const hasTranslation = Boolean(translatedInstruction && translatedInstruction !== originalInstruction);
  const headingText = instruction ?? "";
  const headingParts = headingText.match(/^([\s\S]*\s)(\S+)$/u);

  const displayQuestionNumber =
    questionCounterValue !== undefined
      ? questionCounterValue
      : currentQuestionIndex !== undefined
        ? currentQuestionIndex + 1
        : (headerTotalQuestions ?? totalQuestions) > 0
          ? Math.min(
              headerTotalQuestions ?? totalQuestions,
              Math.max(1, Math.round((progress / 100) * (headerTotalQuestions ?? totalQuestions))),
            )
          : 0;
  const progressCurrent = Math.min(
    headerTotalQuestions ?? totalQuestions,
    Math.max(0, displayQuestionNumber),
  );

  return (
    <div className="practice-game-typography practice-dark-shell flex flex-col h-dvh max-h-dvh dark:bg-slate-950 overflow-hidden">
      <Suspense fallback={null}>
        <AssignmentIdSync onChange={setAssignmentId} />
      </Suspense>
      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <header className="practice-dark-chrome shrink-0 flex flex-col min-h-[96px] sm:min-h-[84px] lg:min-h-[6rem] bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-10">
        {/* Row 1: Speaker | Title + Lang icon | Settings */}
        <div className="grid flex-1 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 px-3 py-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)] sm:px-4 sm:py-2.5 lg:px-6 2xl:grid-cols-[20rem_minmax(0,1fr)_20rem]">
          {/* Speaker icon — left */}
          <div className="flex items-center shrink-0 w-7 sm:w-8 lg:w-12 z-10">
            <img
              src="/favicon.svg"
              alt=""
              className="w-4 h-4 sm:w-5 sm:h-5 lg:w-7 lg:h-7"
            />
          </div>

          {/* Keep the translation control attached to the final heading word as text wraps. */}
          <div className="flex min-w-0 justify-center">
            <AnimatePresence mode="wait">
              <motion.h1
                key={instruction}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.18, ease: "easeInOut" }}
                className="practice-type-exercise-heading min-w-0 max-w-4xl 2xl:max-w-none text-center tracking-[-0.01em] text-slate-800 dark:text-white"
              >
                {hasTranslation ? (
                  <>
                    {headingParts?.[1]}
                    <span className="whitespace-nowrap">
                      {headingParts?.[2] ?? headingText}
                      <TranslateButton
                        onClick={() => setShowTranslation((v) => !v)}
                        className="ml-1 h-7 w-7 align-middle text-slate-400 hover:text-blue-500 hover:bg-transparent"
                        aria-label="Toggle translation"
                        title="Toggle translation"
                      />
                    </span>
                  </>
                ) : (
                  instruction
                )}
              </motion.h1>
            </AnimatePresence>
          </div>

          {/* Top meta + controls — right */}
          <div className="flex min-w-0 flex-wrap items-center justify-self-end justify-end gap-1.5 sm:gap-2 lg:gap-1 xl:gap-2">
            <div className="practice-type-meta hidden lg:flex h-9 px-2 xl:px-3 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-semibold tabular-nums items-center gap-1.5">
              <ListChecks className="w-4 h-4 text-blue-600 dark:text-blue-300" />
              {displayQuestionNumber}/{headerTotalQuestions ?? totalQuestions}
            </div>

            {timerValue && (
              <div className="practice-type-meta hidden lg:flex h-9 px-2 xl:px-3 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-blue-700 dark:text-blue-300 font-semibold tabular-nums items-center gap-1.5">
                <Timer className="w-4 h-4" />
                {timerValue}
              </div>
            )}

            <button
              type="button"
              className="hidden lg:flex w-8 h-8 rounded-full items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onExit}
              className="w-8 h-8 sm:w-9 sm:h-9 lg:w-8 lg:h-8 xl:w-9 xl:h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-300 transition-colors"
              title="Exit"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Row 2: Progress bar — pinned to bottom of header */}
        <ProgressBar
          current={progressCurrent}
          total={headerTotalQuestions ?? totalQuestions}
          slim
          className="h-[3px] max-w-none"
        />
      </header>

      {/* ── CONTENT ─────────────────────────────────────────────────────────── */}
      <main
        className={cn(
          "practice-game-scroll practice-type-content practice-dark-canvas flex-1 min-h-0 overflow-x-hidden flex bg-neutral-50 dark:bg-slate-950 flex-col",
          disableContentScroll ? "overflow-hidden" : disableContentScrollOnDesktop ? "overflow-y-auto md:overflow-y-hidden" : "overflow-y-auto",
        )}
      >
        <div className="w-full mx-auto flex-1 min-h-0 flex flex-col">
          {children}
        </div>
      </main>

      {/* ── FOOTER BAR (in-flow, hidden when feedback is showing) ───── */}
      {showSubmitButton && (!showFeedback || preserveFooterHeightOnFeedback) && (
        <div
          aria-hidden={showFeedback}
          className={cn(
            "practice-dark-chrome shrink-0 h-14 sm:h-16 lg:h-[4.5rem] bg-white/95 dark:bg-slate-900/95 backdrop-blur border-t border-slate-200 dark:border-slate-800",
            showFeedback && "invisible pointer-events-none",
          )}
        >
          <div className="mx-auto px-3 sm:px-4 md:px-5 h-full flex items-center justify-stretch sm:justify-end pb-[max(env(safe-area-inset-bottom,0px),0px)]">
            <div className="w-full sm:w-auto justify-self-end">
              <button
                onClick={onNext}
                disabled={!isSubmitEnabled}
                className={cn(
                  "practice-type-action w-full sm:w-auto min-w-[120px] sm:min-w-[128px] lg:min-w-[132px] min-h-10 px-4 rounded-lg uppercase tracking-wide transition-all duration-200",
                  isSubmitEnabled
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed",
                )}
              >
                {submitLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── FEEDBACK BANNER (replaces submit button when feedback is active) ── */}
      {showSubmitButton && showFeedback && (
        <FeedbackBanner
          isCorrect={isCorrect}
          feedbackTone={feedbackTone}
          correctAnswer={correctAnswer}
          correctAnswerLabel={correctAnswerLabel}
          message={feedbackMessage}
          onContinue={onNext}
          continueLabel={submitLabel}
          animateEntrance={animateFeedbackEntrance}
          compact={compactFeedback}
          inFlow={feedbackInFlow}
          onTranslate={onFeedbackTranslate}
          translationVisible={feedbackTranslationVisible}
          children={feedbackChildren}
        />
      )}
    </div>
  );
}
