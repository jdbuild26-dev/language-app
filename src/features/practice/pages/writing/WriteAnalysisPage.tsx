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
import { fetchPracticeData } from "@/utils/practiceFetcher";
import { Loader2, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import SpecialCharacterKeyboard from "@/features/practice/components/SpecialCharacterKeyboard";
import { TranslateButton } from "@/components/ui/TranslateButton";
import WriteAnalysisChart from "@/features/practice/components/WriteAnalysisChart";
import { chartColor, type AnalysisChart } from "@/features/practice/lib/writeAnalysisChart";
import WriteAnalysisFeedbackResult from "@/features/practice/components/WriteAnalysisFeedbackResult";
import { useWriteAnalysisEvaluation } from "@/features/practice/hooks/useWriteAnalysisEvaluation";

// ─── Types ────────────────────────────────────────────────────────────────────

type WriteAnalysisQuestion = {
  id: string;
  heading_fr: string;
  heading_en: string;
  instruction_box_fr: string;
  instruction_box_en: string;
  image_url: string;
  timeLimitSeconds: number;
  charLimit: number;
  level: string;
  chart_data: string;
  chart: AnalysisChart | null;
  context_fr: string;
  context_en: string;
  legend_fr: string;
  legend_en: string;
};

type RawQuestion = Partial<WriteAnalysisQuestion> & {
  content?: Partial<WriteAnalysisQuestion> & { imageUrl?: string; maxHighlightChars?: number };
  imageUrl?: string;
  maxHighlightChars?: number;
  Category?: string;
  TimeLimitSeconds?: number;
  Level?: string;
};

function feedbackBlocker(question: WriteAnalysisQuestion): string | null {
  if (!question.chart_data.trim() || !question.context_fr.trim() || !question.context_en.trim()) {
    return "Feedback is unavailable because the saved chart figures or bilingual task context are missing.";
  }
  if (!/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(question.id)) {
    return "This exercise must be saved before feedback is available.";
  }
  return null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function WriteAnalysisPage() {
  const { learningLang, knownLang } = useLanguage();
  const searchParams = useSearchParams();
  const tag = searchParams?.get("tag") ?? undefined;
  const levelParam = searchParams?.get("level") ?? undefined;
  return <WriteAnalysisSession key={JSON.stringify([learningLang, knownLang, tag, levelParam])} tag={tag} levelParam={levelParam} />;
}

function WriteAnalysisSession({ tag, levelParam }: { tag?: string; levelParam?: string }) {
  const handleExit = usePracticeExit();
  const { learningLang, knownLang } = useLanguage();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [questions, setQuestions] = useState<WriteAnalysisQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [showTranslatedContext, setShowTranslatedContext] = useState(false);
  const [showTranslatedInstruction, setShowTranslatedInstruction] = useState(false);
  const analysis = useWriteAnalysisEvaluation();
  const { evaluation, isSubmitting } = analysis;

  const currentQ = questions[currentIndex];
  const blocked = currentQ ? feedbackBlocker(currentQ) : null;

  const { timerString, resetTimer } = useExerciseTimer({
    duration: currentQ?.timeLimitSeconds || 600,
    mode: "timer",
    onExpire: () => { if (!isCompleted && !evaluation) void handleSubmit(); },
    isPaused: isLoading || isCompleted || !!blocked || !!evaluation || isSubmitting,
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
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchPracticeData("write_analysis", {
          level: levelParam,
          learningLang: learningLang || "fr",
          knownLang: knownLang || "en",
          tag,
        });
        const raw: RawQuestion[] = Array.isArray(data) ? data : [];
        const normalized: WriteAnalysisQuestion[] = raw
          .filter(item =>
            (item.chart_data || item.content?.chart_data || item.instruction_box_fr || item.instruction_box_en || item.heading_fr || item.content?.instruction_box_fr) &&
            (item.Category === "main" || !item.Category)
          )
          .map(item => {
            const c = { ...item, ...item.content };
            return {
              id: item.id || "",
              heading_fr: c.heading_fr || "",
              heading_en: c.heading_en || "",
              instruction_box_fr: c.instruction_box_fr || "Analysez les données",
              instruction_box_en: c.instruction_box_en || "Analyse the data",
              image_url: c.image_url || c.imageUrl || "",
              timeLimitSeconds: c.timeLimitSeconds || item.TimeLimitSeconds || 600,
              charLimit: imageCharacterLimit(c.maxHighlightChars || 2000),
              level: item.level || item.Level || "",
              chart_data: c.chart_data || "",
              chart: c.chart || null,
              context_fr: c.context_fr || "",
              context_en: c.context_en || "",
              legend_fr: c.legend_fr || "",
              legend_en: c.legend_en || "",
            };
          });
        const ready = normalized.filter(question => !feedbackBlocker(question));
        if (!cancelled) setQuestions(ready.length ? ready : normalized);
      } catch (e) {
        console.error("WriteAnalysisPage load error:", e);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [levelParam, learningLang, knownLang, tag]);

  useEffect(() => {
    resetTimer();
  }, [currentIndex, resetTimer]);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (evaluation || isSubmitting || !currentQ || !userAnswer.trim() || blocked) return;
    const result = await analysis.evaluate(currentQ.id, userAnswer);
    if (result && result.overall_score >= 70) setScore(previous => previous + 1);
  };

  const handleContinue = () => {
    analysis.reset();
    setUserAnswer("");
    setShowTranslatedContext(false);
    setShowTranslatedInstruction(false);
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
  const instructionLabel = showTranslatedInstruction
    ? currentQ.instruction_box_en || currentQ.instruction_box_fr
    : currentQ.instruction_box_fr || currentQ.instruction_box_en;
  const context = showTranslatedContext ? currentQ.context_fr || currentQ.context_en : currentQ.context_en || currentQ.context_fr;
  const legend = showTranslatedContext ? currentQ.legend_fr || currentQ.legend_en : currentQ.legend_en || currentQ.legend_fr;
  const labels = legend ? legend.split(/\s*\+\s*(?=\[\d+\])|\r?\n/).map(label => label.trim().replace(/^\[\d+\]\s*/, "")).filter(Boolean) : currentQ.chart?.categories || [];
  const canTranslateContext = Boolean((currentQ.context_fr && currentQ.context_en) || (currentQ.legend_fr && currentQ.legend_en));
  const insertAccent = (char: string) => {
    const el = textareaRef.current;
    if (!el || blocked || isSubmitting || evaluation) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const nextValue = insertImageAccent(userAnswer, start, end, char, charLimit);
    if (nextValue === userAnswer) return;
    setUserAnswer(nextValue);
    requestAnimationFrame(() => {
      el.focus({ preventScroll: true });
      el.setSelectionRange(start + char.length, start + char.length);
    });
  };

  return (
    <div className="fixed inset-0 overflow-hidden">
      <PracticeGameLayout
        key={currentIndex}
        questionType="Write About Data"
        instructionFr={currentQ.heading_fr || "Analysez les données"}
        instructionEn={currentQ.heading_en || "Analyse the data"}
        localizedInstruction={currentQ.heading_fr || "Analysez les données"}
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={questions.length}
        onExit={handleExit}
        onNext={handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={Boolean(userAnswer.trim()) && !blocked && !isSubmitting && !evaluation}
        showSubmitButton={!evaluation}
        submitLabel={isSubmitting ? "Evaluating…" : "Submit Answer"}
        timerValue={timerString}
        currentQuestionIndex={currentIndex}
        disableContentScroll
      >
        <PracticeTwoPanel className="flex-1 overflow-y-auto md:grid-cols-[minmax(0,9fr)_minmax(0,11fr)] md:gap-4 md:overflow-hidden md:p-4">
          <section className="practice-comprehension-scroll flex min-w-0 flex-col gap-3 rounded-2xl border-2 border-sky-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-950 md:min-h-0 md:overflow-y-auto [scrollbar-gutter:stable]" aria-label="Exercise graph">
            {(context || canTranslateContext) && <div className="flex shrink-0 items-start gap-2 border-b border-slate-200 pb-3 dark:border-slate-700">
              {context && <p className="practice-passage-content min-w-0 flex-1 whitespace-pre-wrap break-words leading-relaxed">{context}</p>}
              {canTranslateContext && <TranslateButton className="ml-auto" onClick={() => setShowTranslatedContext(value => !value)} aria-label="Toggle context and legend translation" aria-pressed={showTranslatedContext} />}
            </div>}
            {currentQ.image_url ? (
              <div className="w-full shrink-0 overflow-hidden rounded-xl">
                <img src={currentQ.image_url} alt="Graph to analyse" className="mx-auto block h-auto max-w-full object-contain" />
              </div>
            ) : currentQ.chart ? (
              <WriteAnalysisChart chart={currentQ.chart} labels={labels} />
            ) : currentQ.chart_data ? (
              <p className="practice-passage-content whitespace-pre-wrap break-words">{currentQ.chart_data}</p>
            ) : (
              <div className="flex flex-col items-center gap-3 text-slate-400 dark:text-slate-500">
                <BarChart3 className="h-20 w-20" aria-hidden="true" />
                <p className="practice-type-content">Graph not yet uploaded</p>
              </div>
            )}
            {labels.length > 0 && <ul aria-label="Chart legend" className="flex shrink-0 flex-wrap gap-x-4 gap-y-2 border-t border-slate-200 pt-3 text-sm dark:border-slate-700 sm:text-base">
              {labels.map((label, index) => <li key={index} className="inline-flex max-w-full items-start gap-1.5">
                {currentQ.chart?.kind === "pie" && <span className="mt-1 size-3 shrink-0 rounded-sm" style={{ background: chartColor(index) }} aria-hidden="true" />}
                <span className="break-words"><strong>{index + 1}:</strong> {label}</span>
              </li>)}
            </ul>}
          </section>
          <section className="flex min-h-[460px] min-w-0 flex-col gap-3 md:min-h-0" aria-label="Graph analysis">
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border-2 border-sky-200 bg-white focus-within:border-sky-400 dark:border-slate-700 dark:bg-slate-900 dark:focus-within:border-sky-500">
              <div className="flex shrink-0 items-center gap-2 border-b border-slate-200 px-4 py-2 dark:border-slate-700">
                <label className="min-w-0 flex-1 break-words font-medium" htmlFor="write-data-answer">{instructionLabel}</label>
                {currentQ.instruction_box_fr && currentQ.instruction_box_en && <TranslateButton onClick={() => setShowTranslatedInstruction(value => !value)} aria-label="Toggle answer instruction translation" aria-pressed={showTranslatedInstruction} />}
              </div>
              {blocked && <p role="status" className="shrink-0 text-sm text-amber-800 dark:text-amber-300">{blocked}</p>}
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
                readOnly={!!evaluation}
                disabled={isSubmitting || !!blocked}
                maxLength={charLimit}
                autoFocus={!blocked}
                className="practice-type-content practice-comprehension-scroll min-h-[320px] w-full flex-1 resize-none md:min-h-0 overflow-y-auto bg-transparent px-6 py-5 font-normal text-slate-900 outline-none transition-[background-color,border-color,box-shadow] duration-200 motion-reduce:transition-none placeholder:text-slate-400 disabled:cursor-not-allowed dark:text-slate-100"
              />
            </div>
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
              {!evaluation && (
                <SpecialCharacterKeyboard key={learningLang} learningLanguage={learningLang} onInsert={insertAccent} disabled={isSubmitting || !!blocked || charCount >= charLimit} className="min-w-0 flex-1" />
              )}
              <span aria-label={`${charCount} of ${charLimit} characters`} className={cn("ml-auto self-end text-base font-semibold tabular-nums", charCount >= charLimit * 0.9 ? "text-red-500" : "text-slate-500 dark:text-slate-400")}>{charCount}/{charLimit}</span>
            </div>
            {analysis.error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{analysis.error}</p>}
          </section>
        </PracticeTwoPanel>
        {analysis.evaluation && <WriteAnalysisFeedbackResult evaluation={analysis.evaluation} response={userAnswer} onContinue={handleContinue} />}
      </PracticeGameLayout>
    </div>
  );
}
