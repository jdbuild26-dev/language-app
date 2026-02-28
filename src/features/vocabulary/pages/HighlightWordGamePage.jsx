import React, { useState, useEffect } from "react";

// Normalize curly/typographic apostrophes so comparisons are quote-agnostic
const normalizeApostrophe = (str) =>
  str.replace(/[\u2018\u2019\u201A\u201B\u02BC\u02C8`]/g, "'");
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { fetchPracticeQuestions } from "@/services/vocabularyApi";
import { getFeedbackMessage } from "@/utils/feedbackMessages";

export default function HighlightWordGamePage() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Single-select state
  const [selectedWordIndex, setSelectedWordIndex] = useState(null);

  // Multi-select state
  const [selectedWordIndices, setSelectedWordIndices] = useState(new Set());

  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetchPracticeQuestions("highlight_word");
      if (response && response.data && response.data.length > 0) {
        const formattedQuestions = response.data
          .filter(
            (q) =>
              (q.passage || q.sentence || q.Sentence) &&
              (q.passage || q.sentence || q.Sentence) !== "None",
          )
          .map((q) => {
            const rawAnswer =
              q.correctWord ||
              q.correctAnswer ||
              q.CorrectAnswer ||
              q.Answer ||
              q.eval_correctWord ||
              "";

            // Support pipe-separated or space-separated multi-answers: "chat|chien" or "une pomme"
            const correctWords = rawAnswer
              .split(/[| ]+/)
              .map((w) => normalizeApostrophe(w.trim().toLowerCase()))
              .filter(Boolean);

            return {
              ...q,
              sentence:
                q.passage ||
                q.sentence ||
                q.Sentence ||
                q["Complete sentence"] ||
                "",
              correctWord: correctWords[0] ?? "",
              correctWords, // array, length > 1 means multi-select
              isMultiSelect: correctWords.length > 1,
              prompt: (
                q.question ||
                q.instructionEn ||
                q.Instruction_EN ||
                q.Question_EN ||
                ""
              )?.trim(),
            };
          });
        setQuestions(formattedQuestions);
      } else {
        console.error("[HighlightWord] ❌ No valid questions received");
        setQuestions([]);
      }
    } catch (error) {
      console.error("[HighlightWord] ❌ Failed to load:", error);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const { timerString, resetTimer } = useExerciseTimer({
    duration: 30,
    mode: "timer",
    onExpire: () => {
      if (!isAnswered && !isGameOver && !showFeedback) {
        const hasSelection = currentItem?.isMultiSelect
          ? selectedWordIndices.size > 0
          : selectedWordIndex !== null;
        if (!hasSelection) {
          setIsAnswered(true);
          setIsCorrect(false);
          setFeedbackMessage("Time's up!");
          setShowFeedback(true);
        } else {
          handleCheck();
        }
      }
    },
    isPaused: loading || isGameOver || isAnswered || showFeedback,
  });

  useEffect(() => {
    resetTimer();
  }, [currentIndex, resetTimer]);

  const currentItem = questions[currentIndex];
  const words = currentItem ? currentItem.sentence.split(" ") : [];

  // ── Single-select handler ──────────────────────────────────────────────
  const handleWordClick = (index) => {
    if (isAnswered) return;
    if (currentItem.isMultiSelect) {
      // Toggle in multi-select set
      setSelectedWordIndices((prev) => {
        const next = new Set(prev);
        if (next.has(index)) {
          next.delete(index);
        } else {
          // Restrict to max number of correct words
          if (next.size < currentItem.correctWords.length) {
            next.add(index);
          }
        }
        return next;
      });
    } else {
      setSelectedWordIndex(index);
    }
  };

  // ── Check answer ───────────────────────────────────────────────────────
  const handleCheck = () => {
    if (currentItem.isMultiSelect) {
      if (selectedWordIndices.size === 0) return;

      setIsAnswered(true);

      // Collect the clean text of every selected word (normalize apostrophes + strip punctuation)
      const cleanWord = (w) =>
        normalizeApostrophe(w)
          .replace(/[.,!?;:]/g, "")
          .toLowerCase();
      const selectedClean = [...selectedWordIndices].map((i) =>
        cleanWord(words[i]),
      );

      // Every correct word must be selected, and no extra words
      const targets = currentItem.correctWords; // already normalized during load
      const allFound = targets.every((t) => selectedClean.includes(t));
      const noExtras = selectedClean.every((s) => targets.includes(s));
      const correct = allFound && noExtras;

      setIsCorrect(correct);
      setFeedbackMessage(getFeedbackMessage(correct));
      setShowFeedback(true);
      if (correct) setScore((prev) => prev + 1);
    } else {
      if (selectedWordIndex === null) return;
      setIsAnswered(true);

      const selectedWord = words[selectedWordIndex];
      const cleanWord = normalizeApostrophe(selectedWord)
        .replace(/[.,!?;:]/g, "")
        .toLowerCase();
      const cleanTarget = normalizeApostrophe(
        currentItem.correctWord,
      ).toLowerCase();

      const correct = cleanWord === cleanTarget;
      setIsCorrect(correct);
      setFeedbackMessage(getFeedbackMessage(correct));
      setShowFeedback(true);
      if (correct) setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (!isAnswered) {
      handleCheck();
      return;
    }
    setShowFeedback(false);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedWordIndex(null);
      setSelectedWordIndices(new Set());
      setIsAnswered(false);
      resetTimer();
    } else {
      setIsGameOver(true);
    }
  };

  const progress =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  // ── Submit enabled guard ───────────────────────────────────────────────
  const isSubmitEnabled = currentItem?.isMultiSelect
    ? selectedWordIndices.size > 0
    : selectedWordIndex !== null;

  // ── Correct answer display string ──────────────────────────────────────
  const correctAnswerDisplay = !isCorrect
    ? currentItem?.isMultiSelect
      ? currentItem.correctWords.join(" • ")
      : currentItem?.correctWord
    : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-red-500">
        <p className="text-xl font-bold">No questions found</p>
        <Button
          className="mt-4"
          variant="outline"
          onClick={() => navigate("/vocabulary/practice")}
        >
          Back to Practice
        </Button>
      </div>
    );
  }

  return (
    <>
      <PracticeGameLayout
        questionType={currentItem?.QuestionType}
        instructionFr={currentItem?.Instruction_FR}
        instructionEn={currentItem?.Instruction_EN}
        progress={progress}
        currentQuestionIndex={currentIndex}
        isGameOver={isGameOver}
        score={score}
        totalQuestions={questions.length}
        onExit={() => navigate("/vocabulary/practice")}
        onNext={handleNext}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={isSubmitEnabled}
        showSubmitButton={true}
        submitLabel={
          showFeedback
            ? currentIndex + 1 === questions.length
              ? "FINISH"
              : "CONTINUE"
            : isAnswered
              ? "Next"
              : "Submit"
        }
        timerValue={timerString}
        showFeedback={showFeedback}
        isCorrect={isCorrect}
        correctAnswer={correctAnswerDisplay}
        feedbackMessage={feedbackMessage}
      >
        <div className="flex flex-col items-center justify-center w-full max-w-5xl">
          {/* Prompt */}
          <div className="mb-6 text-center w-full">
            <h3 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              {currentItem?.prompt}
            </h3>
            {currentItem?.isMultiSelect && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Select all {currentItem.correctWords.length} correct words
                {selectedWordIndices.size > 0 && (
                  <span className="ml-2 font-semibold text-blue-500">
                    ({selectedWordIndices.size} selected)
                  </span>
                )}
              </p>
            )}
          </div>

          {/* Word tokens */}
          <div className="flex flex-wrap justify-center gap-3 text-lg md:text-xl font-medium leading-relaxed max-w-4xl mx-auto">
            {words.map((word, index) => {
              const cleanWord = normalizeApostrophe(word)
                .replace(/[.,!?;:]/g, "")
                .toLowerCase();

              let styles =
                "bg-transparent text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg px-2 py-1 cursor-pointer transition-all border border-transparent";

              if (isAnswered) {
                const isTarget = currentItem.isMultiSelect
                  ? currentItem.correctWords.includes(cleanWord)
                  : cleanWord ===
                    normalizeApostrophe(currentItem.correctWord).toLowerCase();

                const wasSelected = currentItem.isMultiSelect
                  ? selectedWordIndices.has(index)
                  : selectedWordIndex === index;

                if (isTarget) {
                  styles =
                    "bg-green-100 text-green-800 ring-2 ring-green-400 rounded-lg px-2 py-1 shadow-sm";
                } else if (wasSelected) {
                  styles =
                    "bg-red-100 text-red-800 ring-2 ring-red-400 rounded-lg px-2 py-1 opacity-80";
                } else {
                  styles =
                    "text-gray-400 dark:text-gray-600 rounded-lg px-2 py-1 opacity-50";
                }
              } else {
                // Pre-answer selection highlights
                const isSelected = currentItem?.isMultiSelect
                  ? selectedWordIndices.has(index)
                  : selectedWordIndex === index;

                if (isSelected) {
                  styles =
                    "bg-blue-100 text-blue-800 ring-2 ring-blue-300 rounded-lg px-2 py-1 shadow-sm";
                }
              }

              return (
                <span
                  key={index}
                  onClick={() => handleWordClick(index)}
                  className={styles}
                >
                  {word}
                </span>
              );
            })}
          </div>
        </div>
      </PracticeGameLayout>
    </>
  );
}
