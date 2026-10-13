"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePracticeComplete } from "@/hooks/usePracticeComplete";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import PracticeTwoPanel from "@/features/practice/components/PracticeTwoPanel";
import { imageCharacterLimit, insertImageAccent } from "@/features/practice/lib/writeImageInput";
import { useWritingEvaluation } from "@/hooks/useWritingEvaluation";
import WritingFeedbackResult from "@/components/WritingFeedbackResult";
import { fetchPracticeData } from "@/utils/practiceFetcher";
import { Loader2, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";

const ACCENT_KEYS = ["é", "è", "ê", "à", "ç", "â", "î", "ô", "û", "ë", "ï", "ü"];

// ─── Types ────────────────────────────────────────────────────────────────────

type WriteAnalysisQuestion = {
  heading_fr: string;
  heading_en: string;
  content_fr: string;   // AI context only
  content_en: string;   // AI context only
  instruction_box_fr: string;
  instruction_box_en: string;
  sample_answers_fr: string[];
  sample_answers_en: string[];
  image_url: string;
  timeLimitSeconds: number;
  charLimit: number;
  level: string;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function WriteAnalysisPage() {
  const handleExit = usePracticeExit();
  const { learningLang, knownLang } = useLanguage();
  const searchParams = useSearchParams();
  const tag = searchParams?.get("tag") ?? undefined;
  const levelParam = searchParams?.get("level") ?? undefined;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [questions, setQuestions] = useState<WriteAnalysisQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);

  const { evaluation, isSubmitting, evaluate, resetEvaluation } = useWritingEvaluation();

  const currentQ = questions[currentIndex];

  const { timerString, resetTimer } = useExerciseTimer({
    duration: currentQ?.timeLimitSeconds || 600,
    mode: "timer",
    onExpire: () => { if (!isCompleted && !showFeedback) handleSubmit(); },
    isPaused: isLoading || isCompleted || showFeedback || isSubmitting,
  });

  usePracticeComplete({
    isGameOver: isCompleted,
    score,
    totalQuestions: questions.length,
    exerciseType: "write_analysis",
    level: currentQ?.level,
  });

  // ── Load ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const data = await fetchPracticeData("write_analysis", {
          level: levelParam,
          learningLang: learningLang || "fr",
          knownLang: knownLang || "en",
          tag,
        });
        const raw = Array.isArray(data) ? data : [];
        const normalized: WriteAnalysisQuestion[] = raw
          .filter((item: any) =>
            (item.instruction_box_fr || item.instruction_box_en || item.heading_fr || item.content?.instruction_box_fr) &&
            (item.Category === "main" || !item.Category)
          )
          .map((item: any) => {
            const c = item.content || item;
            return {
              heading_fr: c.heading_fr || "",
              heading_en: c.heading_en || "",
              content_fr: c.content_fr || "",
              content_en: c.content_en || "",
              instruction_box_fr: c.instruction_box_fr || "Analysez les données",
              instruction_box_en: c.instruction_box_en || "Analyse the data",
              sample_answers_fr: Array.isArray(c.sample_answers_fr) ? c.sample_answers_fr : [],
              sample_answers_en: Array.isArray(c.sample_answers_en) ? c.sample_answers_en : [],
              image_url: c.image_url || c.imageUrl || "",
              timeLimitSeconds: c.timeLimitSeconds || item.TimeLimitSeconds || 600,
              charLimit: imageCharacterLimit(c.maxHighlightChars || 2000),
              level: item.level || item.Level || "",
            };
          });
        setQuestions(normalized);
      } catch (e) {
        console.error("WriteAnalysisPage load error:", e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [levelParam, learningLang, knownLang, tag]);

  useEffect(() => {
    if (currentQ && !isCompleted) {
      setUserAnswer("");
      setShowFeedback(false);
      resetTimer();
      resetEvaluation();
    }
  }, [currentIndex, currentQ, isCompleted, resetTimer, resetEvaluation]);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (showFeedback || isSubmitting || !currentQ || !userAnswer.trim() || !currentQ.image_url.trim()) return;
    const result = await evaluate({
      task_type: "graph_data",
      user_text: userAnswer,
      topic: currentQ.content_en || currentQ.content_fr || currentQ.heading_en,
      reference: currentQ.sample_answers_en[0] || currentQ.sample_answers_fr[0] || "",
      context: currentQ.content_en || currentQ.content_fr,
      level: currentQ.level || levelParam || "A1",
    });
    if (result) {
      const finalScore = (result as any).overall_score ?? (result as any).score ?? 0;
      setShowFeedback(true);
      if (finalScore >= 70) setScore(s => s + 1);
    }
  };

  const handleContinue = () => {
    setShowFeedback(false);
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
  const charLimit = currentQ?.charLimit || 2000;
  const instructionLabel = currentQ.instruction_box_en || currentQ.instruction_box_fr;
  const missingGraph = !currentQ.image_url.trim();
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

  return (
    <>
      <PracticeGameLayout
        questionType="Write About Data"
        instructionFr="Analysez les données"
        instructionEn="Analyse the data"
        localizedInstruction="Analysez les données"
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={questions.length}
        onExit={handleExit}
        onNext={handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={Boolean(userAnswer.trim()) && !missingGraph && !showFeedback && !isSubmitting && !evaluation}
        showSubmitButton={!showFeedback && !evaluation}
        submitLabel={isSubmitting ? "Evaluating…" : "Submit Answer"}
        timerValue={timerString}
        currentQuestionIndex={currentIndex}
        disableContentScroll
      >
        <PracticeTwoPanel className="flex-1 overflow-y-auto md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-4 md:overflow-hidden md:p-4">
          <section className="flex min-h-[320px] min-w-0 items-center justify-center rounded-2xl border border-slate-200 bg-neutral-50 p-4 dark:border-slate-700 dark:bg-slate-950 md:min-h-0" aria-label="Exercise graph">
            {currentQ.image_url ? (
              <div className="aspect-square w-full max-w-[min(100%,calc(100dvh-15rem))] overflow-hidden rounded-xl">
                <img src={currentQ.image_url} alt="Graph to analyse" className="h-full w-full object-contain" />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 text-slate-400 dark:text-slate-500">
                <BarChart3 className="h-20 w-20" aria-hidden="true" />
                <p className="practice-type-content">Graph not yet uploaded</p>
              </div>
            )}
          </section>
          <section className="flex min-h-[460px] min-w-0 flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900 md:min-h-0" aria-label="Graph analysis">
            <label className="sr-only" htmlFor="write-data-answer">{instructionLabel}</label>
            <textarea
              id="write-data-answer"
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
              disabled={isSubmitting || missingGraph}
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
                      disabled={isSubmitting || missingGraph || charCount >= charLimit}
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
            {missingGraph && (
              <p role="alert" className="text-base text-red-600 dark:text-red-400">This exercise needs a graph before it can be evaluated.</p>
            )}
          </section>
        </PracticeTwoPanel>
        {evaluation && (
          <WritingFeedbackResult evaluation={evaluation} mode="writing" userText={userAnswer} onContinue={handleContinue} />
        )}
      </PracticeGameLayout>
    </>
  );
}
