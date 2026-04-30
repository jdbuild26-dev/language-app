"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { fetchPracticeData } from "@/utils/practiceFetcher";
import { Button } from "@/components/ui/button";
import AccentKeyboard from "@/components/ui/AccentKeyboard";

/** Normalise a string for loose comparison: lowercase, trim, collapse spaces, strip punctuation */
function normalise(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[''`]/g, "'")
    .replace(/[^\w\s']/g, "")
    .replace(/\s+/g, " ");
}

function isAnswerCorrect(userInput: string, question: any): boolean {
  const user = normalise(userInput);
  const candidates: string[] = [];

  if (Array.isArray(question?.acceptableAnswers)) {
    candidates.push(...question.acceptableAnswers.map(String));
  }
  if (question?.correctAnswer) candidates.push(String(question.correctAnswer));

  return candidates.some((c) => normalise(c) === user);
}

/** Normalise a raw API item into the shape this page expects */
function normaliseQuestion(raw: any) {
  // Resolve source text (English sentence the user must translate)
  const sourceText =
    raw.sourceText ||
    raw.SourceText ||
    raw.source_text ||
    raw["Complete Sentence_EN"] ||
    raw["Complete Sentence_en"] ||
    raw.Question ||
    raw.question ||
    "";

  // Resolve correct answer (French translation) — be explicit, never fall back to English fields
  const correctAnswer =
    raw["Correct answer_FR"] ||
    raw["Correct answer_fr"] ||
    raw["correct answer_fr"] ||
    raw["Complete Sentence_FR"] ||
    raw["Complete Sentence_fr"] ||
    raw.correctAnswer_fr ||
    // Only use generic correctAnswer if it's clearly not the same as sourceText
    (raw.correctAnswer && raw.correctAnswer !== sourceText ? raw.correctAnswer : "") ||
    (raw.CorrectAnswer && raw.CorrectAnswer !== sourceText ? raw.CorrectAnswer : "") ||
    "";

  // Resolve acceptable answers array
  const acceptableAnswers: string[] = (() => {
    if (Array.isArray(raw.acceptableAnswers) && raw.acceptableAnswers.length > 0) {
      // Filter out any English sentences that snuck in
      const filtered = raw.acceptableAnswers.filter((a: string) => a !== sourceText);
      if (filtered.length > 0) return filtered;
    }
    const raw_aa =
      raw["Correct answer_FR"] ||
      raw["Correct answer_fr"] ||
      raw.AcceptableAnswers ||
      correctAnswer;
    if (typeof raw_aa === "string" && raw_aa.includes("|"))
      return raw_aa.split("|").map((s: string) => s.trim()).filter(Boolean);
    return correctAnswer ? [correctAnswer] : [];
  })();

  const timeLimitSeconds =
    raw.timeLimitSeconds ||
    raw.TimeLimitSeconds ||
    raw.config?.timeLimitSeconds ||
    60;

  return {
    ...raw,
    sourceText,
    correctAnswer,
    acceptableAnswers,
    timeLimitSeconds,
  };
}

export default function TranslateTypedPage() {
  const handleExit = usePracticeExit();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchPracticeData("translate_typed");
        setQuestions(data.map(normaliseQuestion));
      } catch (err) {
        console.error("[TranslateTypedPage] Failed to load exercises:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const currentQuestion = questions[currentIndex];
  const timerDuration = currentQuestion?.timeLimitSeconds || 60;

  const { timerString, resetTimer } = useExerciseTimer({
    duration: timerDuration,
    mode: "timer",
    onExpire: () => {
      if (!isCompleted && !showFeedback) {
        setIsCorrect(false);
        setShowFeedback(true);
      }
    },
    isPaused: isCompleted || showFeedback,
  });

  useEffect(() => {
    if (currentQuestion && !isCompleted) {
      setUserInput("");
      resetTimer();
    }
  }, [currentIndex, currentQuestion, isCompleted, resetTimer]);

  const handleSubmit = () => {
    if (showFeedback || !userInput.trim()) return;
    const correct = isAnswerCorrect(userInput, currentQuestion);
    setIsCorrect(correct);
    if (correct) setScore((prev) => prev + 1);
    setShowFeedback(true);
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
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <p className="text-xl text-slate-600 dark:text-slate-400">No questions available.</p>
        <Button onClick={() => handleExit()} variant="outline" className="mt-4">Back</Button>
      </div>
    );
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && userInput.trim()) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const correctAnswer = Array.isArray(currentQuestion?.acceptableAnswers)
    ? currentQuestion.acceptableAnswers[0]
    : currentQuestion?.correctAnswer || "";

  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  return (
    <>
      <PracticeGameLayout
        questionType="Translate the Sentence"
        instructionFr="Traduisez la phrase en français"
        instructionEn="Translate the sentence into French"
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={questions.length}
        onExit={handleExit}
        onNext={handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={userInput.trim().length > 0 && !showFeedback}
        showSubmitButton={!showFeedback}
        submitLabel="Check"
        timerValue={timerString}
      >
        <div className="flex flex-col items-center w-full max-w-4xl mx-auto px-4 py-4 lg:py-8 gap-6 lg:gap-8">
          <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
            {/* Source sentence */}
            <div className="flex flex-col h-full">
              <div className="flex-1 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-8 lg:p-10 shadow-xl shadow-blue-500/10 flex items-center justify-center min-h-[140px] text-center">
                <p className="text-xl md:text-2xl lg:text-3xl text-white font-bold leading-tight">
                  {currentQuestion?.sourceText}
                </p>
              </div>
            </div>

            {/* User input */}
            <div className="flex flex-col h-full gap-2">
              <textarea
                ref={textareaRef}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={showFeedback}
                placeholder="Type your translation here..."
                rows={4}
                autoFocus
                className={cn(
                  "w-full h-full min-h-[160px] lg:min-h-0 py-6 px-6 rounded-3xl text-lg lg:text-xl font-medium transition-all duration-300 border-2 outline-none resize-none shadow-sm",
                  "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100",
                  "border-slate-200 dark:border-slate-800",
                  "focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10",
                  "placeholder:text-slate-300 dark:placeholder:text-slate-600",
                  showFeedback && isCorrect && "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10",
                  showFeedback && !isCorrect && "border-red-500 bg-red-50 dark:bg-red-900/10",
                )}
              />
              <AccentKeyboard
                disabled={showFeedback}
                onAccentClick={(char) => {
                  const el = textareaRef.current;
                  if (!el) return;
                  const start = el.selectionStart;
                  const end = el.selectionEnd;
                  setUserInput(userInput.slice(0, start) + char + userInput.slice(end));
                  requestAnimationFrame(() => {
                    el.focus();
                    el.setSelectionRange(start + 1, start + 1);
                  });
                }}
              />
            </div>
          </div>
        </div>
      </PracticeGameLayout>

      {showFeedback && (
        <FeedbackBanner
          isCorrect={isCorrect}
          correctAnswer={isCorrect ? "" : correctAnswer}
          onContinue={handleContinue}
          continueLabel={currentIndex + 1 === questions.length ? "FINISH" : "CONTINUE"}
        />
      )}
    </>
  );
}
