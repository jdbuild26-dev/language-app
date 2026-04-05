"use client";

import React, { useEffect, useMemo, useState } from "react";
import { XCircle, Loader2, Languages } from "lucide-react";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { cn } from "@/lib/utils";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { fetchCompletePassageData } from "@/services/vocabularyApi";
import { loadMockCSV } from "@/utils/csvLoader";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { useLanguage } from "@/contexts/LanguageContext";

type CompletePassageQuestion = {
  passageBefore: string;
  passageAfter: string;
  options: string[];
  correctIndex: number;
  instructionFr?: string;
  instructionEn?: string;
  localizedInstruction?: string;
  timeLimitSeconds?: number;
};

const DEFAULT_PLACEHOLDER = "[Select the best sentence to complete the passage]";
const PASSAGE_TEXT_CLASS = "practice-reading-passage-text";
const OPTION_TEXT_CLASS = "practice-reading-option-text";

function parseJsonIfString<T>(value: unknown, fallback: T): T {
  if (value == null || value === "") return fallback;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return value as T;
}

function normalizeOptions(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (typeof value === "string") {
    return value
      .split("|")
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return [];
}

function toFiniteNumber(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function normalizeQuestion(raw: unknown): CompletePassageQuestion | null {
  if (!raw || typeof raw !== "object") return null;

  const source = raw as Record<string, unknown>;
  const content =
    source.content && typeof source.content === "object"
      ? (source.content as Record<string, unknown>)
      : null;

  const passageBefore = String(
    source.passageBefore ??
      content?.passageBefore ??
      source.PassageBefore ??
      content?.PassageBefore ??
      "",
  ).trim();

  const passageAfter = String(
    source.passageAfter ??
      content?.passageAfter ??
      source.PassageAfter ??
      content?.PassageAfter ??
      "",
  ).trim();

  const options = normalizeOptions(
    source.options ??
      content?.options ??
      source.Options ??
      content?.Options ??
      [source.Option1, source.Option2, source.Option3, source.Option4].filter(
        Boolean,
      ),
  );

  const rawCorrectIndex = toFiniteNumber(
    source.correctIndex ?? content?.correctIndex,
  );
  const rawCorrectOptionIndex = toFiniteNumber(
    source.CorrectOptionIndex ?? content?.CorrectOptionIndex,
  );

  let correctIndex = -1;
  if (rawCorrectIndex !== null) {
    // `correctIndex` in local sentence_completion.csv is already zero-based.
    correctIndex = rawCorrectIndex;
  } else if (rawCorrectOptionIndex !== null) {
    // `CorrectOptionIndex` from other payloads is 1-based.
    correctIndex = rawCorrectOptionIndex > 0 ? rawCorrectOptionIndex - 1 : rawCorrectOptionIndex;
  }

  if (!passageBefore || !passageAfter || options.length === 0 || correctIndex < 0) {
    return null;
  }

  return {
    passageBefore,
    passageAfter,
    options,
    correctIndex,
    instructionFr:
      (source.instructionFr as string) ||
      (source.instruction_fr as string) ||
      undefined,
    instructionEn:
      (source.instructionEn as string) ||
      (source.instruction_en as string) ||
      undefined,
    localizedInstruction:
      (source.localizedInstruction as string) ||
      (source.instructionFr as string) ||
      (source.instruction_fr as string) ||
      undefined,
    timeLimitSeconds:
      toFiniteNumber(source.timeLimitSeconds ?? source.TimeLimitSeconds) ??
      undefined,
  };
}

function normalizePayload(payload: unknown): CompletePassageQuestion[] {
  const arr = Array.isArray(payload) ? payload : [payload];
  return arr
    .map((item) => normalizeQuestion(parseJsonIfString(item, item)))
    .filter((q): q is CompletePassageQuestion => q !== null);
}

export default function CompletePassagePage() {
  const handleExit = usePracticeExit();
  const { learningLang = "", knownLang = "" } = useLanguage() as {
    learningLang?: string;
    knownLang?: string;
  };

  const [questions, setQuestions] = useState<CompletePassageQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackTone, setFeedbackTone] = useState<"success" | "error">("error");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      let payload: unknown = null;
      try {
        payload = await fetchCompletePassageData({ learningLang, knownLang });
      } catch {
        try {
          payload = await loadMockCSV("practice/reading/sentence_completion.csv", {
            learningLang,
            knownLang,
          });
        } catch {
          payload = null;
        }
      }

      let normalized = normalizePayload(payload);

      if (normalized.length === 0) {
        try {
          const csvFallback = await loadMockCSV(
            "practice/reading/sentence_completion.csv",
            { learningLang, knownLang },
          );
          normalized = normalizePayload(csvFallback);
        } catch {
          // Ignore and show error below.
        }
      }

      if (normalized.length === 0) {
        setError("No complete-passage questions were found.");
      } else {
        setQuestions(normalized);
      }

      setLoading(false);
    };

    fetchData();
  }, [learningLang, knownLang]);

  const currentQuestion = questions[currentIndex];

  const timerDuration = useMemo(
    () => currentQuestion?.timeLimitSeconds || 120,
    [currentQuestion],
  );

  const { timerString, resetTimer } = useExerciseTimer({
    duration: timerDuration,
    mode: "timer",
    onExpire: () => {
      if (!isCompleted && !showFeedback) {
        setFeedbackTone("error");
        setFeedbackMessage("Time's up!");
        setShowFeedback(true);
      }
    },
    isPaused: isCompleted || showFeedback || loading,
  });

  useEffect(() => {
    if (!currentQuestion || isCompleted) return;
    setSelectedOption(null);
    setShowFeedback(false);
    setIsCorrect(false);
    setFeedbackTone("error");
    setFeedbackMessage("");
    resetTimer();
  }, [currentIndex, currentQuestion, isCompleted, resetTimer]);

  const handleOptionSelect = (index: number) => {
    if (showFeedback) return;
    setSelectedOption(index);
  };

  const handleSubmit = () => {
    if (!currentQuestion || showFeedback || selectedOption === null) return;

    const correct = selectedOption === currentQuestion.correctIndex;
    setIsCorrect(correct);
    setFeedbackTone(correct ? "success" : "error");
    setFeedbackMessage(getFeedbackMessage(correct));
    setShowFeedback(true);

    if (correct) setScore((prev) => prev + 1);
  };

  const handleContinue = () => {
    if (!showFeedback) return;
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      return;
    }
    setIsCompleted(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 max-w-md w-full text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Error Loading Practice
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            {error || "No question available."}
          </p>
          <button
            onClick={handleExit}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const progress =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  const selectedSentence =
    selectedOption !== null ? currentQuestion.options[selectedOption] : "";

  return (
    <PracticeGameLayout
      questionType="Complete the passage"
      questionTypeFr="Complétez le passage"
      questionTypeEn="Complete the passage"
      localizedInstruction={
        currentQuestion.localizedInstruction || "Choisissez la meilleure phrase"
      }
      instructionFr={
        currentQuestion.instructionFr || "Choisissez la meilleure phrase"
      }
      instructionEn={
        currentQuestion.instructionEn ||
        "Select the best sentence to complete the passage"
      }
      progress={progress}
      isGameOver={isCompleted}
      score={score}
      totalQuestions={questions.length}
      currentQuestionIndex={currentIndex}
      questionCounterValue={currentIndex + 1}
      onExit={handleExit}
      onNext={showFeedback ? handleContinue : handleSubmit}
      onRestart={() => window.location.reload()}
      isSubmitEnabled={selectedOption !== null || showFeedback}
      showSubmitButton={true}
      submitLabel={
        showFeedback
          ? currentIndex + 1 === questions.length
            ? "FINISH"
            : "CONTINUE"
          : "CHECK"
      }
      timerValue={timerString}
      showFeedback={showFeedback}
      isCorrect={isCorrect}
      feedbackTone={feedbackTone}
      feedbackMessage={feedbackMessage}
      correctAnswer={
        !isCorrect && showFeedback
          ? currentQuestion.options[currentQuestion.correctIndex]
          : undefined
      }
    >
      <div className="practice-reading-page-shell flex flex-col md:flex-row gap-3 p-3 mx-auto overflow-hidden flex-1 min-h-0">
        <div className="flex-1 min-h-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 md:p-8 overflow-y-auto">
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-[0.14em] mb-5">
            PASSAGE
          </p>

          <div className={PASSAGE_TEXT_CLASS}>
            <p>{currentQuestion.passageBefore}</p>

            <div
              className={cn(
                "my-4 rounded-lg bg-slate-100 dark:bg-slate-800/70 px-4 py-3 border-l-4",
                !showFeedback && "border-cyan-500",
                showFeedback && isCorrect && "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20",
                showFeedback && !isCorrect && "border-red-500 bg-red-50 dark:bg-red-900/20",
              )}
            >
              <span
                className={cn(
                  "italic",
                  selectedSentence
                    ? "not-italic text-slate-900 dark:text-slate-50"
                    : "text-slate-400 dark:text-slate-500",
                )}
              >
                {selectedSentence || DEFAULT_PLACEHOLDER}
              </span>
            </div>

            <p>{currentQuestion.passageAfter}</p>
          </div>
        </div>

        <div className="flex-1 min-h-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 md:p-8 overflow-y-auto">
          <h3 className="practice-reading-heading mb-6 flex items-center gap-2">
            <Languages className="w-5 h-5 text-blue-500" />
            Select the best sentence to complete the passage
          </h3>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedOption === index;
              const isOptionCorrect = showFeedback && index === currentQuestion.correctIndex;
              const isOptionWrong = showFeedback && isSelected && !isOptionCorrect;

              return (
                <button
                  key={`${index}-${option}`}
                  onClick={() => handleOptionSelect(index)}
                  disabled={showFeedback}
                  className={cn(
                    "w-full rounded-2xl border px-5 py-4 text-left flex items-start gap-4 transition-colors",
                    "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900",
                    !showFeedback && "hover:border-slate-300",
                    isSelected && !showFeedback && "border-blue-400 bg-blue-50 dark:bg-blue-900/20",
                    isOptionCorrect && "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20",
                    isOptionWrong && "border-red-400 bg-red-50 dark:bg-red-900/20",
                  )}
                >
                  <span
                    className={cn(
                      "mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0",
                      "border-slate-300 dark:border-slate-600",
                      isSelected && !showFeedback && "border-blue-500",
                      isOptionCorrect && "border-emerald-500",
                      isOptionWrong && "border-red-500",
                    )}
                  >
                    {(isSelected || isOptionCorrect || isOptionWrong) && (
                      <span
                        className={cn(
                          "w-2.5 h-2.5 rounded-full",
                          isOptionCorrect && "bg-emerald-500",
                          isOptionWrong && "bg-red-500",
                          isSelected && !showFeedback && "bg-blue-500",
                        )}
                      />
                    )}
                  </span>

                  <span className={OPTION_TEXT_CLASS}>
                    {option}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </PracticeGameLayout>
  );
}
