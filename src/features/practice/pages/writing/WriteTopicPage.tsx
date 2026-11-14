"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePracticeComplete } from "@/hooks/usePracticeComplete";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import PracticeTwoPanel from "@/features/practice/components/PracticeTwoPanel";
import { AnswerInstruction, TopicPromptPanel } from "@/features/practice/components/PracticePromptPanels";
import { normalizeTopicExercises, topicAvailability, type TopicQuestion } from "@/features/practice/lib/topicExercise";
import { insertImageAccent } from "@/features/practice/lib/writeImageInput";
import { useTopicEvaluation } from "@/features/practice/hooks/useTopicEvaluation";
import TopicFeedbackResult from "@/features/practice/components/TopicFeedbackResult";
import { fetchPracticeData } from "@/utils/practiceFetcher";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import SpecialCharacterKeyboard from "@/features/practice/components/SpecialCharacterKeyboard";

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

  const insertAccent = (char: string) => {
    const el = textareaRef.current;
    if (!el || busy || showFeedback || evaluation) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const nextValue = insertImageAccent(userAnswer, start, end, char, charLimit);
    if (nextValue === userAnswer) return;
    setUserAnswer(nextValue);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + 1, start + 1);
    });
  };

  return (
    <>
      <PracticeGameLayout
        questionType="Write About Topic"
        instructionFr={currentQ.heading_fr || "Écrivez sur le sujet"}
        instructionEn={currentQ.heading_en || "Write About Topic"}
        localizedInstruction={currentQ.heading_fr || "Écrivez sur le sujet"}
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={questions.length}
        onExit={handleExit}
        onNext={handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={userAnswer.trim().length > 10 && !showFeedback && !isSubmitting && !missingContent}
        showSubmitButton={!showFeedback && !evaluation}
        submitLabel={busy ? "Evaluating…" : "Submit Answer"}
        timerValue={timerString}
        currentQuestionIndex={currentIndex}
        disableContentScroll
      >
        <PracticeTwoPanel className="flex-1 overflow-y-auto md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-4 md:overflow-hidden md:p-4">
          <TopicPromptPanel key={currentQ.id || currentIndex} task={currentQ} />
          <section className="flex min-h-[460px] min-w-0 flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900 md:min-h-0" aria-label="Topic answer">
            <AnswerInstruction key={currentQ.id || currentIndex} htmlFor="write-topic-answer"
              original={currentQ.instruction_box_fr} translation={currentQ.instruction_box_en} />
            <textarea
              id="write-topic-answer"
              ref={textareaRef}
              value={userAnswer}
              onChange={e => setUserAnswer(e.target.value)}
              onKeyDown={e => {
                if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                  e.preventDefault();
                  if (userAnswer.trim().length > 10) void handleSubmit();
                }
              }}
              placeholder="|"
              readOnly={showFeedback || !!evaluation}
              disabled={busy || !!missingContent}
              maxLength={charLimit}
              autoFocus
              className={cn(
                "practice-type-content practice-comprehension-scroll min-h-[320px] w-full flex-1 resize-none md:min-h-0 overflow-y-auto rounded-[20px] border-2 border-slate-200 bg-white px-6 py-5 font-normal text-slate-900 outline-none transition-[background-color,border-color,box-shadow] duration-200 motion-reduce:transition-none placeholder:text-slate-400 disabled:cursor-not-allowed dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100",
                !showFeedback && !evaluation && !busy && "focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:focus:ring-sky-900/30",
              )}
            />
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-3">
              {!showFeedback && !evaluation && (
                <SpecialCharacterKeyboard key={learningLang} learningLanguage={learningLang} onInsert={insertAccent} disabled={busy || !!missingContent || charCount >= charLimit} className="min-w-0 flex-1" />
              )}
              <span aria-label={`${charCount} of ${charLimit} characters`} className={cn("text-base font-semibold tabular-nums", charCount >= charLimit * 0.9 ? "text-red-500" : "text-slate-500 dark:text-slate-400")}>{charCount}/{charLimit}</span>
            </div>
            {missingContent && <p role="alert" className="text-base text-amber-700 dark:text-amber-300">{missingContent}</p>}
            {error && <p role="alert" className="text-base text-red-700 dark:text-red-300">{error}</p>}
          </section>
        </PracticeTwoPanel>
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

      </PracticeGameLayout>
    </>
  );
}
