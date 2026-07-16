"use client";

import React, { useState, useEffect } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Loader2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { loadMockCSV } from "@/utils/csvLoader";
import { Button } from "@/components/ui/button";

const PRACTICE_READING_OPTION_TEXT_CLASS =
  "font-sans text-lg md:text-xl font-semibold leading-relaxed";
const PRACTICE_READING_SECTION_TEXT_CLASS =
  "font-sans text-2xl md:text-3xl font-medium leading-relaxed";

type WordChip = {
  id: string;
  text: string;
};

export default function ReorderWordsPage() {
  const handleExit = usePracticeExit();

  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Reorder Logic State
  const [availableWords, setAvailableWords] = useState<WordChip[]>([]);
  const [selectedWords, setSelectedWords] = useState<WordChip[]>([]);

  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);

  const currentQuestion = questions[currentIndex];
  // Default to 60 seconds
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
    isPaused: isCompleted || showFeedback || isLoading,
  });

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const tag =
          new URLSearchParams(window.location.search).get("tag") || undefined;
        const data = await loadMockCSV("grammar/grammar_reorder.csv", { tag });

        const transformed = (data as any[]).map((item) => {
          const splitWords = (value) => {
            if (typeof value !== "string") return [];
            const separator = value.includes("+") ? "+" : ",";
            return value
              .split(separator)
              .map((w) => w.trim())
              .filter(Boolean);
          };

          let wordsArray: string[] = [];
          if (typeof item.words === "string") {
            wordsArray = splitWords(item.words);
          } else if (Array.isArray(item.words)) {
            wordsArray = item.words;
          } else if (Array.isArray(item.wordBubbles)) {
            wordsArray =
              item.wordBubbles.length === 1 &&
              typeof item.wordBubbles[0] === "string"
                ? splitWords(item.wordBubbles[0])
                : item.wordBubbles;
          } else if (typeof item.BubbleTokens === "string") {
            wordsArray = splitWords(item.BubbleTokens);
          }
          const sentence =
            item["Complete Sentence_FR"] ??
            item["Complete Sentence_EN"] ??
            item.sentence;
          if (wordsArray.length === 0 && sentence) {
            wordsArray = String(sentence)
              .replace(/[.,!?;:]/g, "")
              .split(/\s+/)
              .filter(Boolean);
          }

          return {
            ...item,
            sentence,
            translation: item["Complete Sentence_EN"] ?? item.translation,
            words: wordsArray,
            timeLimitSeconds: item.TimeLimitSeconds ?? item.timeLimitSeconds,
          };
        });

        setQuestions(transformed || []);
      } catch (error) {
        console.error("Error loading questions:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  // Initialize words on question change
  useEffect(() => {
    if (currentQuestion && !isCompleted) {
      // Shuffle available words
      const shuffled = [...currentQuestion.words].sort(
        () => 0.5 - Math.random(),
      );
      // Add unique IDs to handle duplicate words correctly
      const mappedWords = shuffled.map((word, idx) => ({
        id: `${idx}-${word}`,
        text: word,
      }));

      setAvailableWords(mappedWords);
      setSelectedWords([]);
      setShowFeedback(false);
      resetTimer();
    }
  }, [currentIndex, currentQuestion, isCompleted, resetTimer]);

  const handleWordSelect = (wordObj) => {
    if (showFeedback) return;
    // Move from available to selected
    setAvailableWords((prev) => prev.filter((w) => w.id !== wordObj.id));
    setSelectedWords((prev) => [...prev, wordObj]);
  };

  const handleWordDeselect = (wordObj) => {
    if (showFeedback) return;
    // Move from selected back to available
    setSelectedWords((prev) => prev.filter((w) => w.id !== wordObj.id));
    setAvailableWords((prev) => [...prev, wordObj]);
  };

  const handleSubmit = () => {
    if (showFeedback) return;

    // Check correctness
    // Construct sentence from selected words
    // Note: Punctuation handling might be tricky if "dort." is in words.
    // My CSV has "Le,chat,dort..." -> punctuation included in word if split by comma.
    // Or we rely on exact string match.

    // Simplest: join selected words with space and compare to target sentence.
    // Normalize spaces and punctuation for strict check?
    // Let's assume strict exact match for now.

    const userSentence = selectedWords.map((w) => w.text).join(" ");
    // Remove trailing dot if it's separate? Usually "Le chat dort." is the sentence.
    // If words are "Le","chat","dort","." -> join with space "Le chat dort ." -> might not match "Le chat dort."
    // If words are "Le","chat","dort." -> join "Le chat dort." -> matches.
    // CSV Creator put "dort" in words list for "Le chat dort." sentence?
    // Wait, my CSV creator put: 1,"Le chat dort.","Le,chat,dort,un,chien,mange"
    // So "dort" has no dot. "Le chat dort" vs "Le chat dort."
    // I should normalize by removing punctuation from target sentence for comparison or ensure word chips have punctuation.
    // Let's normalize both: remove trailing punctuation from comparison.

    const normalize = (str) =>
      str
        .replace(/[.,!?;:]/g, "")
        .trim()
        .toLowerCase();

    const isMatched =
      normalize(userSentence) === normalize(currentQuestion.sentence);

    setIsCorrect(isMatched);
    setFeedbackMessage(getFeedbackMessage(isMatched));
    setShowFeedback(true);

    if (isMatched) {
      setScore((prev) => prev + 1);
    }
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
        <Loader2 className="animate-spin text-indigo-500 w-8 h-8" />
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
  const promptSentence = currentQuestion?.translation || currentQuestion?.sentence;

  return (
    <>
      <PracticeGameLayout
        questionType="Reorder Words"
        instructionFr="Reconstituez la phrase"
        instructionEn="Reorder the words to form the correct sentence"
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={questions.length}
        onExit={handleExit}
        onNext={handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={selectedWords.length > 0 && !showFeedback}
        showSubmitButton={!showFeedback}
        submitLabel="Check"
        timerValue={timerString}
      >
        <div className="practice-reading-page-shell flex flex-col items-center justify-center max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-10 flex-1 min-h-0">
          {/* Source Sentence */}
          <div className="w-full mb-10 md:mb-12 flex justify-center items-center">
            <p
              className={`${PRACTICE_READING_SECTION_TEXT_CLASS} text-center text-slate-800 dark:text-slate-100`}
            >
              {promptSentence}
            </p>
          </div>

          <div className="w-full max-w-5xl border-t border-slate-200 dark:border-slate-700 py-8 flex flex-col gap-6">
            {/* Answer Area - Selected Words */}
            <div className="w-full min-h-[90px] md:min-h-[100px] flex flex-wrap gap-3 justify-center items-center px-1">
              {selectedWords.length === 0 ? (
                <span className="w-[2px] h-10 bg-slate-500 dark:bg-slate-300 rounded-full animate-caret-blink" />
              ) : (
                <>
                  {selectedWords.map((word) => (
                    <button
                      key={word.id}
                      onClick={() => handleWordDeselect(word)}
                      disabled={showFeedback}
                      className={cn(
                        `px-6 py-3.5 rounded-2xl transition-all duration-200 border ${PRACTICE_READING_OPTION_TEXT_CLASS}`,
                        showFeedback && isCorrect
                          ? "bg-emerald-100 text-emerald-700 border-emerald-400 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700"
                          : showFeedback && !isCorrect
                            ? "bg-red-100 text-red-700 border-red-400 dark:bg-red-950/40 dark:text-red-300 dark:border-red-700"
                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:border-blue-400 active:scale-95",
                      )}
                    >
                      {word.text}
                    </button>
                  ))}
                  {!showFeedback && (
                    <span className="w-[2px] h-8 bg-slate-500 dark:bg-slate-300 rounded-full animate-caret-blink" />
                  )}
                </>
              )}
            </div>

            {/* Translation (Shown after submission) */}
            {showFeedback && currentQuestion?.translation && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300 text-center">
                <p className="text-lg text-green-600 dark:text-slate-300 font-medium italic">
                  {currentQuestion.translation}
                </p>
              </div>
            )}

            {/* Word Bank */}
            <div className="w-full flex flex-wrap gap-3 border-t border-slate-200 dark:border-slate-700 pt-6 justify-center px-1">
              {availableWords.map((word) => (
                <button
                  key={word.id}
                  onClick={() => handleWordSelect(word)}
                  disabled={showFeedback}
                  className={cn(
                    `px-6 py-3.5 rounded-2xl transition-all duration-200 border ${PRACTICE_READING_OPTION_TEXT_CLASS}`,
                    "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200",
                    "border-slate-300 dark:border-slate-600",
                    "hover:border-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700",
                    "active:scale-95",
                    showFeedback && "opacity-50 cursor-not-allowed",
                  )}
                >
                  {word.text}
                </button>
              ))}
            </div>
          </div>
        </div>
      </PracticeGameLayout>

      {/* Feedback Banner */}
      {showFeedback && (
        <FeedbackBanner
          isCorrect={isCorrect}
          feedbackTone={isCorrect ? "success" : "error"}
          correctAnswer={!isCorrect ? currentQuestion.sentence : null}
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
