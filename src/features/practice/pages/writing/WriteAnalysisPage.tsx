"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePracticeComplete } from "@/hooks/usePracticeComplete";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { useWritingEvaluation } from "@/hooks/useWritingEvaluation";
import WritingFeedbackResult from "@/components/WritingFeedbackResult";
import { fetchPracticeData } from "@/utils/practiceFetcher";
import { Loader2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import AccentKeyboard from "@/components/ui/AccentKeyboard";
import { useSearchParams } from "next/navigation";

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
    isPaused: isLoading || isCompleted || showFeedback,
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
              charLimit: c.maxHighlightChars || 2000,
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
    if (showFeedback || isSubmitting || !currentQ) return;
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
        isSubmitEnabled={userAnswer.trim().length > 5 && !showFeedback && !isSubmitting && !evaluation}
        showSubmitButton={!showFeedback && !evaluation}
        submitLabel={isSubmitting ? "Evaluating…" : "Submit Answer"}
        timerValue={timerString}
        currentQuestionIndex={currentIndex}
      >
        <div className="flex flex-col lg:flex-row w-full h-full min-h-0 bg-slate-50 dark:bg-slate-950">
          
          {/* LEFT — data image */}
          <div className="flex items-center justify-center w-full lg:w-1/2 p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            {currentQ.image_url ? (
              <img
                src={currentQ.image_url}
                alt="Exercise data"
                className="max-w-full max-h-[380px] rounded-xl object-contain shadow-sm"
              />
            ) : (
              <div className="flex flex-col items-center gap-3 text-slate-300 dark:text-slate-600">
                <ImageIcon className="w-20 h-20" />
                <p className="text-sm">Data image not yet uploaded</p>
              </div>
            )}
          </div>

          {/* RIGHT — textarea */}
          <div className="flex flex-col w-full lg:w-1/2 p-6 lg:p-10 bg-white dark:bg-slate-900">
            {!evaluation ? (
              <div className="flex flex-col h-full gap-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {instructionLabel}
                </p>

                <textarea
                  ref={textareaRef}
                  value={userAnswer}
                  onChange={e => setUserAnswer(e.target.value)}
                  placeholder="Écrivez votre analyse ici…"
                  disabled={showFeedback}
                  maxLength={charLimit}
                  autoFocus
                  className={cn(
                    "flex-1 min-h-[200px] w-full resize-none rounded-xl border text-sm font-medium p-4 outline-none transition-all",
                    "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100",
                    "placeholder:text-slate-400 dark:placeholder:text-slate-500",
                    "border-slate-200 dark:border-slate-700 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20",
                  )}
                />

                <div className="flex justify-end">
                  <span className={cn(
                    "text-xs font-medium tabular-nums",
                    charCount >= charLimit * 0.9 ? "text-red-500" : "text-slate-400",
                  )}>
                    {charCount} / {charLimit}
                  </span>
                </div>

                <AccentKeyboard
                  disabled={showFeedback}
                  className=""
                  onAccentClick={(char) => {
                    const el = textareaRef.current;
                    if (!el) return;
                    const start = el.selectionStart;
                    const end = el.selectionEnd;
                    const newVal = userAnswer.slice(0, start) + char + userAnswer.slice(end);
                    setUserAnswer(newVal);
                    requestAnimationFrame(() => {
                      el.focus();
                      el.setSelectionRange(start + 1, start + 1);
                    });
                  }}
                />
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto animate-in slide-in-from-bottom-4 duration-500">
                <WritingFeedbackResult
                  evaluation={evaluation as any}
                  mode="writing"
                  userText={userAnswer}
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
