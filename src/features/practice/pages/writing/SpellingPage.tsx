"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePracticeComplete } from "@/hooks/usePracticeComplete";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { loadMockCSV } from "@/utils/csvLoader";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import AccentKeyboard from "@/components/ui/AccentKeyboard";
import { useSearchParams } from "next/navigation";

type SpellingQuestion = {
  passage_title_fr?: string;
  passage_title_en?: string;
  heading_fr?: string;
  heading_en?: string;
  wrong_sentence_fr?: string;
  wrong_sentence_en?: string;
  instruction_box_fr?: string;
  instruction_box_en?: string;
  correct_sentence_fr?: string;
  correct_sentence_en?: string;
  // legacy flat CSV fallback
  incorrectText?: string;
  correctText?: string;
  timeLimitSeconds?: number;
  level?: string;
  instructionFr?: string;
  instructionEn?: string;
  localizedInstruction?: string;
};

export default function SpellingPage() {
  const handleExit = usePracticeExit();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { learningLang, knownLang } = useLanguage();
  const searchParams = useSearchParams();
  const tag = searchParams?.get("tag") ?? undefined;
  const levelParam = searchParams?.get("level") ?? undefined;

  const [questions, setQuestions] = useState<SpellingQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);

  const currentQuestion = questions[currentIndex];

  // ── Resolve bilingual fields ──────────────────────────────────────────────
  const wrongSentenceFr =
    currentQuestion?.wrong_sentence_fr ||
    currentQuestion?.incorrectText ||
    "";
  const wrongSentenceEn =
    currentQuestion?.wrong_sentence_en || "";
  const correctSentenceFr =
    currentQuestion?.correct_sentence_fr ||
    currentQuestion?.correctText ||
    "";
  const correctSentenceEn =
    currentQuestion?.correct_sentence_en || "";

  const passageTitle =
    currentQuestion?.passage_title_fr ||
    currentQuestion?.passage_title_en ||
    "";
  const heading =
    currentQuestion?.heading_fr ||
    currentQuestion?.heading_en ||
    "";
  const instructionBox =
    currentQuestion?.instruction_box_fr ||
    currentQuestion?.instruction_box_en ||
    currentQuestion?.instructionFr ||
    currentQuestion?.instructionEn ||
    "Écrivez la phrase correcte";

  const timerDuration = currentQuestion?.timeLimitSeconds || 360;

  const { timerString, resetTimer } = useExerciseTimer({
    duration: timerDuration,
    mode: "timer",
    onExpire: () => {
      if (!isCompleted && !showFeedback) {
        setIsCorrect(false);
        setFeedbackMessage("Time's up!");
        setShowFeedback(true);
      }
    },
    isPaused: isCompleted || showFeedback || isLoading,
  });

  usePracticeComplete({
    isGameOver: isCompleted,
    score,
    totalQuestions: questions.length,
    exerciseType: "correct_spelling",
    level: currentQuestion?.level,
  });

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await loadMockCSV("practice/writing/spelling.csv", {
          level: levelParam,
          learningLang: learningLang || "fr",
          knownLang: knownLang || "en",
          tag,
        });
        const raw = Array.isArray(data) ? data : [];
        console.log("[SpellingPage] raw item[0] from backend:", raw[0]);
        // Only use passage-style exercises (category=main, has wrong_sentence_fr)
        const filtered = raw.filter((item: any) =>
          (item.wrong_sentence_fr || item.wrong_sentence_en) &&
          (item.Category === "main" || !item.Category)
        );
        const source = filtered.length > 0 ? filtered : raw;
        const normalized: SpellingQuestion[] = source.map((item: any) => {
          const c = item.content || item;
          const ev = item.evaluation || item;
          return {
            // Backend stores title under title_fr/title_en (BaseContent fields)
            // and also spreads them flat into the item via the generic route
            passage_title_fr:
              c.title_fr || c.passage_title_fr ||
              item.title_fr || item.passage_title_fr || "",
            passage_title_en:
              c.title_en || c.passage_title_en ||
              item.title_en || item.passage_title_en || "",
            heading_fr:
              c.heading_fr || item.heading_fr || "",
            heading_en:
              c.heading_en || item.heading_en || "",
            wrong_sentence_fr:
              c.wrong_sentence_fr || item.wrong_sentence_fr ||
              item.incorrectText || "",
            wrong_sentence_en:
              c.wrong_sentence_en || item.wrong_sentence_en || "",
            instruction_box_fr:
              c.instruction_box_fr || item.instruction_box_fr || "",
            instruction_box_en:
              c.instruction_box_en || item.instruction_box_en || "",
            correct_sentence_fr:
              ev.correct_sentence_fr || item.correct_sentence_fr ||
              item.correctText || "",
            correct_sentence_en:
              ev.correct_sentence_en || item.correct_sentence_en || "",
            timeLimitSeconds:
              item.timeLimitSeconds || item.config?.timeLimitSeconds ||
              item.TimeLimitSeconds || 360,
            level: item.level || item.Level || "",
            instructionFr:
              item.instruction_fr || item.instructionFr ||
              item.Instruction_FR || "",
            instructionEn:
              item.instruction_en || item.instructionEn ||
              item.Instruction_EN || "",
            localizedInstruction: item.localizedInstruction || "",
          };
        });
        setQuestions(normalized);
      } catch (error) {
        console.error("Error loading spelling data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, [levelParam, learningLang, knownLang, tag]);

  useEffect(() => {
    if (currentQuestion && !isCompleted) {
      setUserInput("");
      resetTimer();
    }
  }, [currentIndex, currentQuestion, isCompleted, resetTimer]);

  const normalize = (str: string) =>
    (str || "").toLowerCase().replace(/\s+/g, " ").trim();

  const handleSubmit = () => {
    if (showFeedback || !userInput.trim()) return;
    const correct = normalize(userInput) === normalize(correctSentenceFr);
    setIsCorrect(correct);
    setFeedbackMessage(getFeedbackMessage(correct));
    setShowFeedback(true);
    if (correct) setScore((prev) => prev + 1);
  };

  const handleContinue = () => {
    setShowFeedback(false);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="animate-spin text-sky-500 w-8 h-8" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <p className="text-xl text-slate-600 dark:text-slate-400">
          No content available.
        </p>
        <Button onClick={() => handleExit()} variant="outline" className="mt-4">
          Back
        </Button>
      </div>
    );
  }

  const progress =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  const localizedInstruction =
    currentQuestion?.localizedInstruction ||
    currentQuestion?.instructionFr ||
    currentQuestion?.instructionEn ||
    "Lisez le passage et répondez";

  return (
    <>
      <PracticeGameLayout
        questionType="Fix the Spelling"
        instructionFr="Corrigez l'orthographe"
        instructionEn="Fix the Spelling"
        localizedInstruction="Corrigez l'orthographe"
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={questions.length}
        onExit={handleExit}
        onNext={handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={userInput.trim().length > 0 && !showFeedback}
        showSubmitButton={!showFeedback}
        submitLabel="Submit Answer"
        timerValue={timerString}
        currentQuestionIndex={currentIndex}
        disableContentScroll
      >
        {/* ── Full-height two-column layout ── */}
        <div className="flex flex-col lg:flex-row w-full h-full min-h-0">

          {/* ══════════════════════════════════════════════
              LEFT PANEL — passage display
          ══════════════════════════════════════════════ */}
          <div className="flex flex-col w-full lg:w-1/2 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto">
            <div className="flex flex-col h-full p-6 lg:p-8 gap-4">

              {/* Title row — no toggle button, EN sentence is always the reference */}
              <div className="flex flex-col gap-0.5">
                {heading && (
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    {heading}
                  </p>
                )}
                {passageTitle && (
                  <h2 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wide">
                    {passageTitle}
                  </h2>
                )}
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-0.5">
                  PASSAGE
                </p>
              </div>

              {/* Correct EN sentence — always visible as the reference passage */}
              {correctSentenceEn && (
                <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed text-justify">
                  {correctSentenceEn}
                </div>
              )}

              {/* Divider */}
              <hr className="border-slate-200 dark:border-slate-700" />

              {/* Wrong FR sentence — plain white box with border, text underlined to hint errors */}
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {wrongSentenceFr}
              </div>

            </div>
          </div>

          {/* ══════════════════════════════════════════════
              RIGHT PANEL — question + answer input
          ══════════════════════════════════════════════ */}
          <div className="flex flex-col w-full lg:w-1/2 bg-slate-50 dark:bg-slate-950 overflow-y-auto">
            <div className="flex flex-col h-full p-6 lg:p-8 gap-5">

              {/* Question / instruction card */}
              <div className="flex items-start gap-2 text-slate-700 dark:text-slate-200">
                <span className="text-base mt-0.5">✍️</span>
                <p className="text-base font-semibold leading-snug">
                  {instructionBox}
                </p>
              </div>

              {/* Answer textarea — large grey box matching mockup */}
              <div className="flex-1 flex flex-col gap-3 min-h-0">
                <textarea
                  ref={textareaRef}
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Write the correct sentence"
                  disabled={showFeedback}
                  autoFocus
                  className={cn(
                    "w-full flex-1 min-h-[180px] lg:min-h-0 py-4 px-5 rounded-xl text-sm font-medium",
                    "transition-all duration-200 border outline-none resize-none",
                    "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100",
                    "placeholder:text-slate-400 dark:placeholder:text-slate-500",
                    showFeedback && isCorrect
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10"
                      : showFeedback && !isCorrect
                        ? "border-red-400 bg-red-50 dark:bg-red-900/10"
                        : "border-slate-200 dark:border-slate-700 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20",
                  )}
                />

                {/* Accent keyboard */}
                <AccentKeyboard
                  disabled={showFeedback}
                  onAccentClick={(char) => {
                    const el = textareaRef.current;
                    if (!el) return;
                    const start = el.selectionStart;
                    const end = el.selectionEnd;
                    const newVal =
                      userInput.slice(0, start) + char + userInput.slice(end);
                    setUserInput(newVal);
                    requestAnimationFrame(() => {
                      el.focus();
                      el.setSelectionRange(start + 1, start + 1);
                    });
                  }}
                />
              </div>

            </div>
          </div>

        </div>
      </PracticeGameLayout>

      {/* Feedback Banner */}
      {showFeedback && (
        <FeedbackBanner
          isCorrect={isCorrect}
          correctAnswer={!isCorrect ? correctSentenceFr : null}
          onContinue={handleContinue}
          message={feedbackMessage}
          continueLabel={
            currentIndex + 1 === questions.length ? "FINISH" : "CONTINUE"
          }
        />
      )}
    </>
  );
}
