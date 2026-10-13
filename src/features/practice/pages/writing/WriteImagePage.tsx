"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePracticeComplete } from "@/hooks/usePracticeComplete";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import PracticeTwoPanel from "@/features/practice/components/PracticeTwoPanel";
import { useWriteImageEvaluation } from "@/features/practice/hooks/useWriteImageEvaluation";
import WriteImageFeedbackResult from "@/features/practice/components/WriteImageFeedbackResult";
import { fetchPracticeData } from "@/utils/practiceFetcher";
import { Loader2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { imageSamples, imageCharacterLimit, insertImageAccent } from "../../lib/writeImageInput";

const ACCENT_KEYS = ["é", "è", "ê", "à", "ç", "â", "î", "ô", "û", "ë", "ï", "ü"];

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
  const insertAccent = (char: string) => {
    const el = textareaRef.current;
    if (!el || isSubmitting || showFeedback || evaluation) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const nextValue = insertImageAccent(userAnswer, start, end, char, charLimit);
    if (nextValue === userAnswer) return;
    setUserAnswer(nextValue);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + char.length, start + char.length);
    });
  };
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
        disableContentScroll
      >
        <PracticeTwoPanel className="flex-1 overflow-y-auto md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-4 md:overflow-hidden md:p-4">
          <section className="flex min-h-[320px] min-w-0 items-center justify-center bg-neutral-50 p-4 dark:bg-slate-950 md:min-h-0" aria-label="Exercise image">
            {currentQ.image_url ? (
              <div className="relative aspect-square w-full max-w-[min(100%,calc(100dvh-15rem))] shrink-0 overflow-hidden rounded-xl">
                <Image
                  src={currentQ.image_url}
                  alt="Image to describe"
                  fill
                  sizes="(min-width: 768px) 40vw, 90vw"
                  unoptimized
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 text-slate-400 dark:text-slate-500">
                <ImageIcon className="h-20 w-20" aria-hidden="true" />
                <p className="practice-type-content">Image not yet uploaded</p>
              </div>
            )}
          </section>
          <section className="flex min-h-[460px] min-w-0 flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900 md:min-h-0" aria-label="Image description">
            <label className="sr-only" htmlFor="write-image-answer">{instructionLabel}</label>
            <textarea
              id="write-image-answer"
              ref={textareaRef}
              value={userAnswer}
              onChange={e => setUserAnswer(e.target.value)}
              onKeyDown={e => {
                if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                  e.preventDefault();
                  if (userAnswer.trim()) void handleSubmit();
                }
              }}
              placeholder="|"
              readOnly={showFeedback || !!evaluation}
              disabled={isSubmitting || !!missingContent}
              maxLength={charLimit}
              autoFocus
              className={cn(
                "practice-type-content practice-comprehension-scroll min-h-[320px] w-full flex-1 resize-none md:min-h-0 overflow-y-auto rounded-[20px] border-2 border-slate-200 bg-white px-6 py-5 font-normal text-slate-900 outline-none transition-[background-color,border-color,box-shadow] duration-200 motion-reduce:transition-none placeholder:text-slate-400 disabled:cursor-not-allowed dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100",
                !showFeedback && !evaluation && !isSubmitting && "focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:focus:ring-sky-900/30",
              )}
            />
            <div className="flex shrink-0 flex-col gap-3">
              {!showFeedback && !evaluation && (
                <div className="grid w-full grid-cols-6 gap-1 xl:grid-cols-12" aria-label="French accent keyboard">
                  {ACCENT_KEYS.map(char => (
                    <button
                      key={char}
                      type="button"
                      disabled={isSubmitting || !!missingContent || charCount >= charLimit}
                      aria-label={`Insert ${char}`}
                      onMouseDown={e => e.preventDefault()}
                      onClick={() => insertAccent(char)}
                      className="flex h-11 w-full min-w-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-base font-semibold text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-[background-color,border-color,box-shadow,transform] duration-150 hover:border-sky-300 hover:bg-sky-50 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 motion-safe:active:scale-[0.94] motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                    >
                      {char}
                    </button>
                  ))}
                </div>
              )}
              <span aria-label={`${charCount} of ${charLimit} characters`} className={cn("self-end text-base font-semibold tabular-nums", charCount >= charLimit * 0.9 ? "text-red-500" : "text-slate-500 dark:text-slate-400")}>{charCount}/{charLimit}</span>
            </div>
            {(missingContent || contentError || error) && (
              <p role="alert" className="text-base text-red-600 dark:text-red-400">{missingContent || contentError || error}</p>
            )}
          </section>
        </PracticeTwoPanel>
        {evaluation && (
          <WriteImageFeedbackResult evaluation={evaluation} userText={submittedAnswer} onContinue={handleContinue} />
        )}
      </PracticeGameLayout>
    </>
  );
}
