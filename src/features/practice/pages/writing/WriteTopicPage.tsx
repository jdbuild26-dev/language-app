"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePracticeComplete } from "@/hooks/usePracticeComplete";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { normalizeTopicExercises, topicAvailability, type TopicQuestion } from "@/features/practice/lib/topicExercise";
import { insertImageAccent } from "@/features/practice/lib/writeImageInput";
import { useTopicEvaluation } from "@/features/practice/hooks/useTopicEvaluation";
import TopicFeedbackResult from "@/features/practice/components/TopicFeedbackResult";
import { fetchPracticeData } from "@/utils/practiceFetcher";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import AccentKeyboard from "@/components/ui/AccentKeyboard";
import { useSearchParams } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────



// ─── Component ────────────────────────────────────────────────────────────────

export default function WriteTopicPage() {
  const handleExit = usePracticeExit();
  const { learningLang, knownLang } = useLanguage();
  const searchParams = useSearchParams();
  const tag = searchParams?.get("tag") ?? undefined;
  const levelParam = searchParams?.get("level") ?? undefined;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [questions, setQuestions] = useState<TopicQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
    const [score, setScore] = useState(0);
  const [submittedText, setSubmittedText] = useState("");

  const { evaluation, isSubmitting, error, evaluate, resetEvaluation } = useTopicEvaluation();

  const busy = isSubmitting;
  const currentQ = questions[currentIndex];

  const contextKey = JSON.stringify([learningLang, knownLang, levelParam, tag, currentIndex, currentQ?.id]);
  const activeContext = useRef(contextKey);
  activeContext.current = contextKey;

  const { timerString, resetTimer } = useExerciseTimer({
    duration: currentQ?.timeLimitSeconds || 360,
    mode: "timer",
    onExpire: () => { if (!isCompleted && !showFeedback) handleSubmit(); },
    isPaused: isLoading || isCompleted || showFeedback || busy,
  });

  usePracticeComplete({
    isGameOver: isCompleted,
    score,
    totalQuestions: questions.length,
    exerciseType: "write_topic",
    level: currentQ?.level,
  });

  // ── Load ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    let obsolete = false;
    resetEvaluation();
    setQuestions([]);
    setCurrentIndex(0);
    setScore(0);
    setIsCompleted(false);
    setShowFeedback(false);
    setIsLoading(true);
    (async () => {
      try {
        const data = await fetchPracticeData("write_topic", {
          level: levelParam, learningLang: learningLang || "fr", knownLang: knownLang || "en", tag,
        });
        if (!obsolete) setQuestions(normalizeTopicExercises(data, "write"));
      } catch (cause) {
        if (!obsolete) console.error("Topic load failed:", cause);
      } finally {
        if (!obsolete) setIsLoading(false);
      }
    })();
    return () => { obsolete = true; resetEvaluation(); };
  }, [levelParam, learningLang, knownLang, tag, resetEvaluation]);

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
    if (showFeedback || busy || !currentQ || !userAnswer.trim() || topicAvailability(currentQ)) return;
    const context = activeContext.current;
    setSubmittedText(userAnswer);
    const result = await evaluate({ mode: "write", exercise_id: currentQ.id, learner_response: userAnswer });
    if (result && activeContext.current === context) {
      setShowFeedback(true);
      if (result.overall_score >= 70) setScore(value => value + 1);
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

  const missingContent = topicAvailability(currentQ);
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const charCount = userAnswer.length;
  const charLimit = currentQ?.charLimit || 1000;

  // Legacy *_fr fields hold the selected learning-language content.
  const mainInstruction = currentQ.main_instruction_fr || currentQ.main_instruction_en || "";
  const bullets = currentQ.topic_bullets_fr.length > 0
    ? currentQ.topic_bullets_fr
    : currentQ.topic_bullets_en;
  const instructionBox = currentQ.instruction_box_en || currentQ.instruction_box_fr || "Write about the topic";

  return (
    <>
      <PracticeGameLayout
        questionType="Write About Topic"
        instructionFr="Écrivez sur le sujet"
        instructionEn="Write About Topic"
        localizedInstruction="Écrivez sur le sujet"
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={questions.length}
        onExit={handleExit}
        onNext={handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={userAnswer.trim().length > 10 && !showFeedback && !isSubmitting}
        showSubmitButton={!showFeedback && !evaluation}
        submitLabel={busy ? "Evaluating…" : "Submit Answer"}
        timerValue={timerString}
        currentQuestionIndex={currentIndex}
      >
        <div className="w-full max-w-3xl mx-auto px-4 py-8 flex flex-col gap-5">

          {/* ── Top card: main instruction + bullet points ── */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 flex flex-col gap-4">

            {/* Main instruction sentence */}
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

            {/* Textarea label */}
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {instructionBox}
            </p>

            <textarea
              ref={textareaRef}
              value={userAnswer}
              onChange={e => setUserAnswer(e.target.value)}
              placeholder="Écrivez ici…"
              disabled={showFeedback || !!evaluation || busy}
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

            {/* Char counter */}
            <div className="flex justify-end">
              <span className={cn(
                "text-xs font-medium tabular-nums",
                charCount >= charLimit * 0.9 ? "text-red-500" : "text-slate-400",
              )}>
                {charCount} / {charLimit}
              </span>
            </div>

            {/* Accent keyboard */}
            {!showFeedback && !evaluation && (
              <AccentKeyboard
                disabled={busy}
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
                    el.setSelectionRange(start + 1, start + 1);
                  });
                }}
              />
            )}
          </div>

          {missingContent && <p role="alert" className="text-sm text-amber-700 dark:text-amber-300">{missingContent}</p>}
          {error && <p role="alert" className="text-sm text-red-700 dark:text-red-300">{error}</p>}

          {/* ── AI Evaluation result ── */}
          {evaluation && (
            <div className="animate-in slide-in-from-bottom-4 duration-500">
              <TopicFeedbackResult
                evaluation={evaluation}
                userText={submittedText}
                onContinue={handleContinue}
              />
            </div>
          )}

        </div>
      </PracticeGameLayout>
    </>
  );
}
