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

export default function ReorderWordsPage() {
  const handleExit = usePracticeExit();

  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Reorder Logic State
  const [availableWords, setAvailableWords] = useState([]);
  const [selectedWords, setSelectedWords] = useState([]);

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
        const data = await loadMockCSV("grammar/grammar_reorder.csv");

        const transformed = data.map((item) => {
          // Parse words string "Le,chat,dort..." -> Array
          let wordsArray = [];
          if (typeof item.words === "string") {
            // Assuming comma separated as per CSV creation
            wordsArray = item.words.split(",").map((w) => w.trim());
          } else if (Array.isArray(item.words)) {
            wordsArray = item.words;
          }

          return {
            ...item,
            words: wordsArray,
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
        <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto px-4 py-6 gap-8 min-h-[60vh]">
          {/* Sentence Builder Area */}
          <div className="w-full max-w-2xl min-h-[140px] border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-3xl flex flex-wrap items-center justify-center content-center gap-3 p-6 bg-slate-50/50 dark:bg-slate-900/50 transition-all">
            {selectedWords.length === 0 && !showFeedback ? (
              <p className="text-slate-400 dark:text-slate-500 text-lg italic select-none">
                Tap words below to build the sentence
              </p>
            ) : (
              selectedWords.map((word) => (
                <button
                  key={word.id}
                  onClick={() => handleWordDeselect(word)}
                  disabled={showFeedback}
                  className="animate-in zoom-in-50 duration-200 px-5 py-2.5 bg-white dark:bg-slate-800 border-2 border-indigo-200 dark:border-indigo-900 text-slate-800 dark:text-slate-100 rounded-2xl shadow-sm text-lg font-medium hover:border-indigo-400 dark:hover:border-indigo-700 hover:-translate-y-0.5 transition-all"
                >
                  {word.text}
                </button>
              ))
            )}
          </div>

          {/* Translation (Shown after submission) */}
          {showFeedback && currentQuestion?.translation && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <p className="text-lg text-indigo-600 dark:text-indigo-400 font-medium italic">
                {currentQuestion.translation}
              </p>
            </div>
          )}

          {/* Word Bank */}
          <div className="w-full max-w-2xl flex flex-wrap justify-center gap-3">
            {availableWords.map((word) => (
              <button
                key={word.id}
                onClick={() => handleWordSelect(word)}
                disabled={showFeedback}
                className="px-5 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-2xl shadow-sm text-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 hover:-translate-y-0.5 transition-all active:scale-95"
              >
                {word.text}
              </button>
            ))}
          </div>
        </div>
      </PracticeGameLayout>

      {/* Feedback Banner */}
      {showFeedback && (
        <FeedbackBanner
          isCorrect={isCorrect}
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
