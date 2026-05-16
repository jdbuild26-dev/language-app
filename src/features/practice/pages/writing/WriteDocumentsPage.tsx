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
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import AccentKeyboard from "@/components/ui/AccentKeyboard";
import { useSearchParams } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

type WriteDocumentQuestion = {
  title_fr: string;
  title_en: string;
  heading_fr: string;
  heading_en: string;
  main_instruction_fr: string;
  main_instruction_en: string;
  topic_bullets_fr: string[];
  topic_bullets_en: string[];
  instruction_box_fr: string;
  instruction_box_en: string;
  sample_answers_fr: string[];
  sample_answers_en: string[];
  timeLimitSeconds: number;
  charLimit: number;
  level: string;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function WriteDocumentsPage() {
  const handleExit = usePracticeExit();
  const { learningLang, knownLang } = useLanguage();
  const searchParams = useSearchParams();
  const tag = searchParams?.get("tag") ?? undefined;
  const levelParam = searchParams?.get("level") ?? undefined;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [questions, setQuestions] = useState<WriteDocumentQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);

  const { evaluation, isSubmitting, evaluate, resetEvaluation } = useWritingEvaluation();

  const currentQ = questions[currentIndex];

  const { timerString, resetTimer } = useExerciseTimer({
    duration: currentQ?.timeLimitSeconds || 360,
    mode: "timer",
    onExpire: () => { if (!isCompleted && !showFeedback) handleSubmit(); },
    isPaused: isLoading || isCompleted || showFeedback,
  });

  usePracticeComplete({
    isGameOver: isCompleted,
    score,
    totalQuestions: questions.length,
    exerciseType: "write_documents",
    level: currentQ?.level,
  });

  // ── Load ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const data = await fetchPracticeData("write_documents", {
          level: levelParam,
          learningLang: learningLang || "fr",
          knownLang: knownLang || "en",
          tag,
        });
        const raw = Array.isArray(data) ? data : [];

        const normalized: WriteDocumentQuestion[] = raw
          .filter((item: any) =>
            // Standard format
            (item.main_instruction_fr || item.main_instruction_en ||
             (item.content && (item.content.main_instruction_fr || item.content.main_instruction_en))) &&
            (item.Category === "main" || !item.Category)
          )
          .map((item: any) => {
            const c = item.content || item;
            return {
              title_fr: c.title_fr || c.passage_title_fr || "",
              title_en: c.title_en || c.passage_title_en || "",
              heading_fr: c.heading_fr || "",
              heading_en: c.heading_en || "",
              main_instruction_fr: c.main_instruction_fr || "",
              main_instruction_en: c.main_instruction_en || "",
              topic_bullets_fr: Array.isArray(c.topic_bullets_fr) ? c.topic_bullets_fr : [],
              topic_bullets_en: Array.isArray(c.topic_bullets_en) ? c.topic_bullets_en : [],
              instruction_box_fr: c.instruction_box_fr || "Rédigez le document demandé",
              instruction_box_en: c.instruction_box_en || "Write the requested document",
              sample_answers_fr: Array.isArray(c.sample_answers_fr) ? c.sample_answers_fr : [],
              sample_answers_en: Array.isArray(c.sample_answers_en) ? c.sample_answers_en : [],
              timeLimitSeconds: c.timeLimitSeconds || item.TimeLimitSeconds || 360,
              charLimit: c.maxHighlightChars || c.charLimit || 1000,
              level: item.level || item.Level || "",
            };
          });
        setQuestions(normalized);
      } catch (e) {
        console.error("WriteDocumentsPage load error:", e);
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
      task_type: "document",
      user_text: userAnswer,
      topic: currentQ.title_en || currentQ.title_fr || currentQ.heading_en,
      reference: currentQ.sample_answers_fr[0] || currentQ.sample_answers_en[0] || "",
      context: currentQ.main_instruction_en || currentQ.main_instruction_fr,
      level: currentQ.level || levelParam || "A1",
    });
    if (result) {
      const finalScore = (result as any).overall_score ?? (result as any).score ?? 0;
      setIsCorrect(finalScore >= 70);
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
  const charLimit = currentQ?.charLimit || 1000;

  const mainInstruction = currentQ.main_instruction_fr || currentQ.main_instruction_en || "";
  const bullets = currentQ.topic_bullets_fr.length > 0
    ? currentQ.topic_bullets_fr
    : currentQ.topic_bullets_en;
  const instructionBox = currentQ.instruction_box_en || currentQ.instruction_box_fr || "Write the requested document";

  return (
    <>
      <PracticeGameLayout
        questionType="Write Documents"
        instructionFr="Rédigez le document demandé"
        instructionEn="Write Documents"
        localizedInstruction="Rédigez le document demandé"
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={questions.length}
        onExit={handleExit}
        onNext={handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={userAnswer.trim().length > 10 && !showFeedback && !isSubmitting}
        showSubmitButton={!showFeedback && !evaluation}
        submitLabel={isSubmitting ? "Evaluating…" : "Submit Answer"}
        timerValue={timerString}
        currentQuestionIndex={currentIndex}
      >
        <div className="w-full max-w-3xl mx-auto px-4 py-8 flex flex-col gap-5">

          {/* ── Top card: main instruction + bullet points ── */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 flex flex-col gap-4">
            <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
              {mainInstruction}
            </p>

            {bullets.length > 0 && (
              <>
                <hr className="border-slate-100 dark:border-slate-800" />
                <ul className="flex flex-col gap-1.5">
                  {bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {/* ── Bottom card: textarea ── */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 flex flex-col gap-3">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {instructionBox}
            </p>

            <textarea
              ref={textareaRef}
              value={userAnswer}
              onChange={e => setUserAnswer(e.target.value)}
              placeholder="Écrivez ici…"
              disabled={showFeedback || !!evaluation}
              maxLength={charLimit}
              rows={8}
              autoFocus
              className={cn(
                "w-full resize-none rounded-xl border text-sm font-medium p-4 outline-none transition-all",
                "bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100",
                "placeholder:text-slate-400 dark:placeholder:text-slate-500",
                showFeedback || evaluation
                  ? "border-slate-200 dark:border-slate-700"
                  : "border-slate-200 dark:border-slate-700 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20",
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

            {!showFeedback && !evaluation && (
              <AccentKeyboard
                disabled={false}
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
            )}
          </div>

          {evaluation && (
            <div className="animate-in slide-in-from-bottom-4 duration-500">
              <WritingFeedbackResult
                evaluation={evaluation as any}
                mode="writing"
                userText={userAnswer}
                onContinue={handleContinue}
              />
            </div>
          )}
        </div>
      </PracticeGameLayout>
    </>
  );
}
