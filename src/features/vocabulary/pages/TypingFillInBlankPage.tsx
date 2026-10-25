"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import AudioPlayer from "@/features/vocabulary/components/shared/AudioPlayer";
import { TranslateButton } from "@/components/ui/TranslateButton";
import { useTranslateText } from "@/hooks/useTranslateText";
import { useRouter } from "next/navigation";
import { fetchPracticeQuestions } from "@/services/vocabularyApi";

type Question = { id: string; fullText: string; displayParts: string[]; blanks: string[]; hints: string[]; timeLimitSeconds: number };

export default function TypingFillInBlankPage() {
  const router = useRouter();
  const handleExit = () => router.push("/vocabulary/practice");
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInputs, setUserInputs] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);
  const [blankResults, setBlankResults] = useState<boolean[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const response = await fetchPracticeQuestions("vocab_typing_blanks");
        const practiceData = response.data || [];

        if (!practiceData || practiceData.length === 0) {
          throw new Error("No questions found");
        }

        // Normalize backend data to expected format
        const normalized = practiceData
          .map((item) => {
            // Try to extract blanks and displayParts from the data
            const blanks = item.blanks || item.Blanks || [];
            const displayParts = item.displayParts || item.DisplayParts || [];
            const fullText =
              item.fullText ||
              item.FullText ||
              item.Sentence ||
              item.sentence ||
              item.CompleteSentence ||
              item.completeSentence ||
              "";
            const hints = item.hints || item.Hints || [];
            const timeLimitSeconds = parseInt(
              item.TimeLimitSeconds || item.timeLimitSeconds || "60",
              10,
            );

            return {
              id: item.id || item.ExerciseID || Math.random().toString(),
              fullText,
              displayParts:
                displayParts.length > 0
                  ? displayParts
                  : fullText.split(/____/).map((p) => p),
              blanks: Array.isArray(blanks)
                ? blanks
                : typeof blanks === "string"
                  ? blanks.split("|").map((b) => b.trim())
                  : [],
              hints: Array.isArray(hints)
                ? hints
                : typeof hints === "string"
                  ? hints.split("|").map((h) => h.trim())
                  : [],
              timeLimitSeconds,
            };
          })
          .filter((q) => q.blanks.length > 0);

        setQuestions(normalized);
      } catch (err) {
        console.error("[TypingFillInBlank] ❌ Failed to fetch:", err);
        setError("Failed to load questions. Please check data source.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const currentQuestion = questions[currentIndex];
  const correctSentence = currentQuestion?.fullText || currentQuestion?.displayParts.map((part, index) =>
    `${index > 0 ? currentQuestion.blanks[index - 1] || "" : ""}${part}`,
  ).join("") || "";
  const answerTranslation = useTranslateText(correctSentence, "fr");
  const timerDuration = currentQuestion?.timeLimitSeconds || 60;

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
    isPaused: isCompleted || showFeedback || loading,
  });

  useEffect(() => {
    if (currentQuestion && !isCompleted) {
      setUserInputs(new Array(currentQuestion.blanks.length).fill(""));
      setBlankResults([]);
      resetTimer();
    }
  }, [currentIndex, currentQuestion, isCompleted, resetTimer]);

  const handleInputChange = (index, value) => {
    const newInputs = [...userInputs];
    newInputs[index] = value;
    setUserInputs(newInputs);
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Enter") {
      if (index < currentQuestion.blanks.length - 1) {
        inputRefs.current[index + 1]?.focus();
      } else if (userInputs.every((input) => input.trim())) {
        handleSubmit();
      }
    }
  };

  const normalize = (str) =>
    str
      .toLowerCase()
      .replace(/[.,!?;:'"]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const handleSubmit = () => {
    if (showFeedback) return;
    const results = currentQuestion.blanks.map((blank, index) => {
      const userAnswer = normalize(userInputs[index] || "");
      const correctAnswer = normalize(blank);
      return userAnswer === correctAnswer;
    });
    setBlankResults(results);
    const allCorrect = results.every((r) => r);
    setIsCorrect(allCorrect);
    setFeedbackMessage(getFeedbackMessage(allCorrect));
    setShowFeedback(true);
    if (allCorrect) setScore((prev) => prev + 1);
  };

  const handleContinue = () => {
    setShowFeedback(false);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error || "No questions found for this activity."}
      </div>
    );
  }

  const allFilled = userInputs.every((input) => input.trim().length > 0);
  const progress =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  const renderSentence = () => {
    if (!currentQuestion) return null;
    const parts = currentQuestion.displayParts;
    const elements: React.ReactNode[] = [];
    for (let i = 0; i < parts.length; i++) {
      elements.push(<span key={`part-${i}`}>{parts[i]}</span>);
      if (i < currentQuestion.blanks.length) {
        elements.push(
          <span
            key={`blank-${i}`}
            className="relative mx-2 inline-flex items-center align-middle"
          >
            {currentQuestion.hints?.[i] && (
              <label
                htmlFor={`writing-word-${i}`}
                id={`writing-clue-${i}`}
                className="sr-only"
              >
                {currentQuestion.hints[i]}
              </label>
            )}
            <input
              id={`writing-word-${i}`}
              aria-label={`Missing word ${i + 1}`}
              aria-describedby={
                currentQuestion.hints?.[i] ? `writing-clue-${i}` : undefined
              }
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              value={userInputs[i] || ""}
              onChange={(e) => handleInputChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              disabled={showFeedback}
              style={{
                width: `${Math.max(7, currentQuestion.blanks[i].length + 2, (currentQuestion.hints?.[i]?.length || 0) + 2)}ch`,
                lineHeight: 1.2,
              }}
              className={cn(
                "practice-type-content h-12 min-w-28 max-w-[min(70vw,22rem)] px-3 py-1 rounded-lg text-center font-normal tracking-normal text-slate-800 dark:text-slate-100 border-2 outline-none transition-colors placeholder:text-slate-400 focus:placeholder:text-transparent disabled:placeholder:text-transparent caret-slate-800 dark:caret-slate-100",
                "bg-white dark:bg-slate-700",
                showFeedback && blankResults[i]
                  ? "border-emerald-500"
                  : showFeedback && !blankResults[i]
                    ? "border-red-500"
                    : "border-slate-300 focus:border-blue-500",
              )}
              placeholder={currentQuestion.hints?.[i] || "|"}
            />
          </span>,
        );
      }
    }
    return elements;
  };

  return (
    <>
      <PracticeGameLayout
        questionType="Fill in the blanks - Vocabulary"
        instructionEn="Type the missing words"
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={questions.length}
        onExit={handleExit}
        onNext={handleSubmit}
        isSubmitEnabled={allFilled && !showFeedback}
        showSubmitButton={true}
        timerValue={timerString}
      >
        <div className="flex flex-1 flex-col items-center justify-center w-full max-w-[1280px] mx-auto px-4 py-12 sm:px-6">
          <div className="mb-12 sm:mb-14">
            <AudioPlayer text={correctSentence} showTurtle={!showFeedback} />
          </div>
          <div className={cn("w-full py-4", showFeedback && "max-w-5xl rounded-3xl border border-slate-200 bg-white px-5 sm:px-8 dark:border-slate-700 dark:bg-slate-900")}>
            <p className="practice-type-content !leading-[1.8] text-center font-medium text-slate-700 dark:text-slate-200">
              {renderSentence()}
            </p>
            {showFeedback && correctSentence && (
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-center text-xl text-slate-900 dark:text-slate-100">
                <span lang={answerTranslation.showTranslation ? "en" : "fr"}>{answerTranslation.displayText}</span>
                <TranslateButton
                  aria-label={answerTranslation.showTranslation ? "Show French answer" : "Translate correct answer"}
                  aria-pressed={answerTranslation.showTranslation}
                  isLoading={answerTranslation.isTranslating}
                  onClick={answerTranslation.toggle}
                />
              </div>
            )}
            {showFeedback && answerTranslation.error && (
              <p role="status" className="mt-2 text-center text-sm text-red-700 dark:text-red-400">{answerTranslation.error}</p>
            )}
          </div>
        </div>
      </PracticeGameLayout>

      {showFeedback && (
        <FeedbackBanner
          compact
          isCorrect={isCorrect}
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
