"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePracticeComplete } from "@/hooks/usePracticeComplete";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import PracticeTwoPanel from "@/features/practice/components/PracticeTwoPanel";
import { normalizeTopicExercises, topicAvailability, type TopicQuestion } from "@/features/practice/lib/topicExercise";
import { insertImageAccent } from "@/features/practice/lib/writeImageInput";
import { useTopicEvaluation } from "@/features/practice/hooks/useTopicEvaluation";
import TopicFeedbackResult from "@/features/practice/components/TopicFeedbackResult";
import { fetchPracticeData } from "@/utils/practiceFetcher";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";

const ACCENT_KEYS = ["é", "è", "ê", "à", "ç", "â", "î", "ô", "û", "ë", "ï", "ü"];

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
        isSubmitEnabled={userAnswer.trim().length > 10 && !showFeedback && !isSubmitting && !missingContent}
        showSubmitButton={!showFeedback && !evaluation}
        submitLabel={busy ? "Evaluating…" : "Submit Answer"}
        timerValue={timerString}
        currentQuestionIndex={currentIndex}
        disableContentScroll
      >
        <PracticeTwoPanel className="flex-1 overflow-y-auto md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-4 md:overflow-hidden md:p-4">
          <section className="flex min-h-[320px] min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 md:min-h-0" aria-labelledby="topic-objective-heading">
            <h2 id="topic-objective-heading" className="practice-type-passage-heading !font-medium shrink-0 px-5 py-3 text-slate-900 dark:text-slate-100">OBJECTIVE</h2>
            <hr className="mx-5 shrink-0 border-slate-200 dark:border-slate-700" />
            <div className="practice-comprehension-scroll min-h-0 flex-1 overflow-y-auto px-5 py-5">
              <p className="practice-type-content text-slate-700 dark:text-slate-200">
                {mainInstruction}
              </p>
              {bullets.length > 0 && (
                <ul className="mt-8 flex flex-col gap-2">
                  {bullets.map((b, i) => (
                    <li key={i} className="practice-type-content flex items-start gap-3 text-slate-700 dark:text-slate-300">
                      <span aria-hidden="true" className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400 dark:bg-slate-500" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
          <section className="flex min-h-[460px] min-w-0 flex-col gap-4 md:min-h-0" aria-label="Topic answer">
            <label className="sr-only" htmlFor="write-topic-answer">{instructionBox}</label>
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
                <div className="flex min-w-0 flex-1 flex-wrap justify-center gap-2" aria-label="French accent keyboard">
                  {ACCENT_KEYS.map(char => (
                    <button
                      key={char}
                      type="button"
                      disabled={busy || !!missingContent || charCount >= charLimit}
                      aria-label={`Insert ${char}`}
                      onMouseDown={e => e.preventDefault()}
                      onClick={() => insertAccent(char)}
                      className="flex h-[50px] w-[50px] items-center justify-center rounded-2xl border border-slate-200 bg-white text-base font-semibold text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-[background-color,border-color,box-shadow,transform] duration-150 hover:border-sky-300 hover:bg-sky-50 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 motion-safe:active:scale-[0.94] motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                    >
                      {char}
                    </button>
                  ))}
                </div>
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
