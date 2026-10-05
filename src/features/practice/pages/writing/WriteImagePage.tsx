"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePracticeComplete } from "@/hooks/usePracticeComplete";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { useWriteImageEvaluation } from "@/features/practice/hooks/useWriteImageEvaluation";
import WriteImageFeedbackResult from "@/features/practice/components/WriteImageFeedbackResult";
import { fetchPracticeData } from "@/utils/practiceFetcher";
import { Loader2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import AccentKeyboard from "@/components/ui/AccentKeyboard";
import { useSearchParams } from "next/navigation";
import { imageSamples, imageCharacterLimit, insertImageAccent } from "../../lib/writeImageInput";

// ─── Types ────────────────────────────────────────────────────────────────────

type WriteImageQuestion = {
  id: string;
  heading_fr: string;
  heading_en: string;
  content_fr: string;   // AI context only — not rendered
  content_en: string;   // AI context only — not rendered
  instruction_box_fr: string;
  instruction_box_en: string;
  sample_answers_fr: string[];
  sample_answers_en: string[];
  image_url: string;
  timeLimitSeconds: number;
  charLimit: number;
  level: string;
};

type RawWriteImageQuestion = Partial<WriteImageQuestion> & {
  Category?: string;
  imageUrl?: string;
  TimeLimitSeconds?: number;
  maxHighlightChars?: number;
  Level?: string;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function WriteImagePage() {
  const handleExit = usePracticeExit();
  const { learningLang, knownLang } = useLanguage();
  const searchParams = useSearchParams();
  const tag = searchParams?.get("tag") ?? undefined;
  const levelParam = searchParams?.get("level") ?? undefined;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const generation = useRef(0);
  const contextKey = `${learningLang}|${knownLang}|${tag}|${levelParam}`;
  const latestContext = useRef(contextKey);
  latestContext.current = contextKey;

  const [questions, setQuestions] = useState<WriteImageQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [submittedAnswer, setSubmittedAnswer] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);

  const { evaluation, isSubmitting, error, evaluate, resetEvaluation } = useWriteImageEvaluation();
  const [contentError, setContentError] = useState<string | null>(null);

  const currentQ = questions[currentIndex];

  const { timerString, resetTimer } = useExerciseTimer({
    duration: currentQ?.timeLimitSeconds || 360,
    mode: "timer",
    onExpire: () => { if (!isCompleted && !showFeedback) handleSubmit(); },
    isPaused: isLoading || isCompleted || showFeedback || isSubmitting,
  });

  usePracticeComplete({
    isGameOver: isCompleted,
    score,
    totalQuestions: questions.length,
    exerciseType: "write_image",
    level: currentQ?.level,
  });

  // ── Load ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    generation.current += 1;
    resetEvaluation();
    setIsLoading(true);
    setQuestions([]);
    setCurrentIndex(0);
    setScore(0);
    setIsCompleted(false);
    (async () => {
      try {
        const data = await fetchPracticeData("write_image", {
          level: levelParam,
          learningLang: learningLang || "fr",
          knownLang: knownLang || "en",
          tag,
        });
        const raw: RawWriteImageQuestion[] = Array.isArray(data) ? data : [];
        const normalized: WriteImageQuestion[] = raw
          .filter((item) =>
            (item.instruction_box_fr || item.instruction_box_en || item.heading_fr) &&
            (item.Category === "main" || !item.Category)
          )
          .map((item) => ({
            id: item.id || "",
            heading_fr: item.heading_fr || "",
            heading_en: item.heading_en || "",
            content_fr: item.content_fr || "",
            content_en: item.content_en || "",
            instruction_box_fr: item.instruction_box_fr || "Décrivez ce que vous voyez",
            instruction_box_en: item.instruction_box_en || "Write what you see",
            sample_answers_fr: imageSamples(item.sample_answers_fr),
            sample_answers_en: imageSamples(item.sample_answers_en),
            image_url: item.image_url || item.imageUrl || "",
            timeLimitSeconds: item.timeLimitSeconds || item.TimeLimitSeconds || 360,
            charLimit: imageCharacterLimit(item.maxHighlightChars),
            level: item.level || item.Level || "",
          }));
        if (!cancelled) setQuestions(normalized);
      } catch (e) {
        if (!cancelled) console.error("WriteImagePage load error:", e);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [levelParam, learningLang, knownLang, tag, resetEvaluation]);

  useEffect(() => {
    if (currentQ && !isCompleted) {
      generation.current += 1;
      setUserAnswer("");
      setSubmittedAnswer("");
      setShowFeedback(false);
      setContentError(null);
      resetTimer();
      resetEvaluation();
    }
  }, [currentIndex, currentQ, isCompleted, resetTimer, resetEvaluation]);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (showFeedback || isSubmitting || !currentQ || !userAnswer.trim()) return;
    if (!currentQ.image_url.trim()) {
      setContentError("This exercise needs an image before it can be evaluated.");
      return;
    }
    const sampleDescriptions = imageSamples(currentQ.sample_answers_fr);
    if (sampleDescriptions.length !== 2) {
      setContentError("This exercise needs two sample descriptions before feedback can be generated.");
      return;
    }
    const cefrLevel = (currentQ.level || levelParam || "").toUpperCase();
    if (!/^(A1|A2|B1|B2|C1|C2)$/.test(cefrLevel)) {
      setContentError("This exercise needs a CEFR level before feedback can be generated.");
      return;
    }
    if (!currentQ.id) {
      setContentError("This exercise must be saved before feedback can be generated.");
      return;
    }
    setContentError(null);
    if (userAnswer.length > currentQ.charLimit) {
      setContentError(`Your response must be at most ${currentQ.charLimit} characters.`);
      return;
    }
    const submittedGeneration = generation.current;
    const submittedContext = contextKey;
    const answerToEvaluate = userAnswer;
    setSubmittedAnswer(answerToEvaluate);
    const result = await evaluate({
      exercise_id: currentQ.id,
      learner_response: answerToEvaluate,
    });
    if (result && submittedGeneration === generation.current && submittedContext === latestContext.current) {
      setShowFeedback(true);
      if (result.overall_score >= 70) setScore(s => s + 1);
    }
  };

  const handleContinue = () => {
    setShowFeedback(false);
    setSubmittedAnswer("");
    resetEvaluation();
    if (currentIndex < questions.length - 1) setCurrentIndex(i => i + 1);
    else setIsCompleted(true);
  };

  // ── States ─────────────────────────────────────────────────────────────────
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <Loader2 className="animate-spin text-sky-500 w-8 h-8" />
    </div>
  );

  if (questions.length === 0) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
      <p className="text-xl text-slate-600 dark:text-slate-400">No content available.</p>
      <Button onClick={() => handleExit()} variant="outline" className="mt-4">Back</Button>
    </div>
  );

  const progress = ((currentIndex + 1) / questions.length) * 100;
  const charCount = userAnswer.length;
  const charLimit = currentQ?.charLimit || 1000;
  const instructionLabel = currentQ.instruction_box_en || currentQ.instruction_box_fr;
  const sampleAnswers = imageSamples(currentQ.sample_answers_fr);
  const missingContent = !currentQ.image_url.trim()
    ? "This exercise needs an image before it can be evaluated."
    : sampleAnswers.length !== 2
      ? "This exercise needs two sample descriptions before feedback can be generated."
      : !/^(A1|A2|B1|B2|C1|C2)$/i.test(currentQ.level || levelParam || "")
        ? "This exercise needs a CEFR level before feedback can be generated."
        : !currentQ.id
          ? "This exercise must be saved before feedback can be generated."
        : null;

  return (
    <>
      <PracticeGameLayout
        questionType="Write About Image"
        instructionFr="Décrivez l'image"
        instructionEn="Write About Image"
        localizedInstruction="Décrivez l'image"
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={questions.length}
        onExit={handleExit}
        onNext={handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={Boolean(userAnswer.trim()) && !missingContent && !showFeedback && !isSubmitting && !evaluation}
        showSubmitButton={!showFeedback && !evaluation}
        submitLabel={isSubmitting ? "Evaluating…" : "Submit Answer"}
        timerValue={timerString}
        currentQuestionIndex={currentIndex}
      >
        {/* ── Two-column layout matching mockup ── */}
        <div className="flex flex-col lg:flex-row w-full h-full min-h-0 bg-slate-50 dark:bg-slate-950">

          {/* LEFT — image */}
          <div className="flex items-center justify-center w-full lg:w-1/2 p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            {currentQ.image_url ? (
              <img
                src={currentQ.image_url}
                alt="Exercise image"
                className="max-w-full max-h-[380px] rounded-xl object-contain shadow-sm"
              />
            ) : (
              <div className="flex flex-col items-center gap-3 text-slate-300 dark:text-slate-600">
                <ImageIcon className="w-20 h-20" />
                <p className="text-sm">Image not yet uploaded</p>
              </div>
            )}
          </div>

          {/* RIGHT — textarea */}
          <div className="flex flex-col w-full lg:w-1/2 p-6 lg:p-10 bg-white dark:bg-slate-900">

            {!evaluation ? (
              <div className="flex flex-col h-full gap-4">
                {/* Instruction label */}
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {instructionLabel}
                </p>

                {/* Textarea */}
                <textarea
                  ref={textareaRef}
                  value={userAnswer}
                  onChange={e => setUserAnswer(e.target.value)}
                  placeholder="Écrivez ici…"
                  disabled={showFeedback || isSubmitting}
                  maxLength={charLimit}
                  autoFocus
                  className={cn(
                    "flex-1 min-h-[200px] w-full resize-none rounded-xl border text-sm font-medium p-4 outline-none transition-all",
                    "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100",
                    "placeholder:text-slate-400 dark:placeholder:text-slate-500",
                    "border-slate-200 dark:border-slate-700 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20",
                  )}
                />

                {/* Char counter */}
                <div className="flex justify-end">
                  <span className={cn(
                    "text-xs font-medium tabular-nums",
                    charCount >= charLimit * 0.9 ? "text-red-500" : "text-slate-400",
                  )}>
                    {charCount} / {charLimit}
                  </span>
                </div>

                {(missingContent || contentError || error) && (
                  <p role="alert" className="text-sm text-red-600 dark:text-red-400">
                    {missingContent || contentError || error}
                  </p>
                )}

                {/* Accent keyboard */}
                <AccentKeyboard
                  disabled={showFeedback || isSubmitting}
                  onAccentClick={(char) => {
                    const el = textareaRef.current;
                    if (!el) return;
                    const start = el.selectionStart;
                    const end = el.selectionEnd;
                    const newVal = insertImageAccent(userAnswer, start, end, char, charLimit);
                    if (newVal === userAnswer) return;
                    setUserAnswer(newVal);
                    requestAnimationFrame(() => {
                      el.focus();
                      el.setSelectionRange(start + char.length, start + char.length);
                    });
                  }}
                />
              </div>
            ) : (
              /* AI evaluation result */
              <div className="flex-1 overflow-y-auto animate-in slide-in-from-bottom-4 duration-500">
                <WriteImageFeedbackResult
                  evaluation={evaluation}
                  userText={submittedAnswer}
                  onContinue={handleContinue}
                />
              </div>
            )}
          </div>
        </div>
      </PracticeGameLayout>
    </>
  );
}
