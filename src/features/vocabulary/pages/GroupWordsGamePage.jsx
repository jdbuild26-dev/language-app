import React, { useState, useEffect } from "react";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { cn } from "@/lib/utils";

// MOCK DATA for "Pick 4" (Group Words)
export default function GroupWordsGamePage() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedWords, setSelectedWords] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  // Timer Hook
  const { timerString, resetTimer, isPaused } = useExerciseTimer({
    duration: 60,
    mode: "timer",
    onExpire: () => {
      if (!isSubmitted && !showFeedback && !isGameOver) {
        setIsSubmitted(true);
        setIsCorrect(false);
        setFeedbackMessage("Time's up!");
        setShowFeedback(true);
      }
    },
    isPaused: isSubmitted || showFeedback || isGameOver,
  });

  useEffect(() => {
    loadQuestions();
  }, []);

  useEffect(() => {
    resetTimer();
  }, [currentIndex, resetTimer]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetchPracticeQuestions("group_words");
      if (response && response.data) {
        const normalized = response.data.map((item) => {
          const correct = (item.correctGroup || item.CorrectGroup || item.CorrectAnswer || "").split(/[|,]+/).map(s => s.trim());
          const others = (item.otherWords || item.OtherWords || item.Options || "").split(/[|,]+/).map(s => s.trim());
          const all = [...correct, ...others].sort(() => Math.random() - 0.5);

          return {
            id: item.id || item.ExerciseID,
            theme: item.theme || item.Topic || item.Theme || "",
            instructionFr: item.Instruction_FR || "Triez les mots",
            instructionEn: item.Instruction_EN || "Select 4 words that are related",
            allWords: all,
            correctGroup: correct,
            reason: item.Reason || item.Explanation || item.CorrectExplanation_EN || `These are all related to ${item.theme || 'the topic'}.`
          };
        });
        setQuestions(normalized);
      }
    } catch (err) {
      console.error("Failed to load group words:", err);
      setError("Failed to load questions.");
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  const handleWordClick = (word) => {
    if (isSubmitted) return;

    if (selectedWords.includes(word)) {
      setSelectedWords((prev) => prev.filter((w) => w !== word));
    } else {
      if (selectedWords.length < targetCount) {
        setSelectedWords((prev) => [...prev, word]);
      }
    }
  };

  const handleSubmit = () => {
    if (isSubmitted) {
      // Next Logic
      setShowFeedback(false);
      if (currentIndex + 1 < totalQuestions) {
        setCurrentIndex((prev) => prev + 1);
        setSelectedWords([]);
        setIsSubmitted(false);
      } else {
        setIsGameOver(true);
      }
      return;
    }

    // Submit Logic
    if (selectedWords.length !== targetCount) return;
    setIsSubmitted(true);

    // Check if checks are correct
    // Are all selected words in the correctGroup?
    const allCorrect = selectedWords.every((w) =>
      currentQuestion.correctGroup.includes(w),
    );

    setIsCorrect(allCorrect);
    setFeedbackMessage(allCorrect ? "Great job!" : currentQuestion.reason);
    setShowFeedback(true);

    if (allCorrect) {
      setScore((prev) => prev + 1);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
    </div>
  );
  if (error || questions.length === 0) return (
    <div className="min-h-screen flex items-center justify-center text-red-500">
      {error || "No questions found for this activity."}
    </div>
  );

  let submitLabel = "Submit";
  if (isSubmitted) {
    submitLabel =
      currentIndex + 1 === totalQuestions ? "Finish" : "Next Question";
  }

  return (
    <>
      <PracticeGameLayout
        questionType="Pick 4"
        instructionFr={currentQuestion.instructionFr || "Triez les mots"}
        instructionEn={
          currentQuestion.instructionEn || `Select ${targetCount} related words`
        }
        progress={progress}
        isGameOver={isGameOver}
        score={score}
        totalQuestions={totalQuestions}
        onExit={() => navigate("/vocabulary/practice")}
        onNext={showFeedback ? handleSubmit : handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={selectedWords.length === targetCount || showFeedback}
        showSubmitButton={true}
        submitLabel={
          showFeedback
            ? currentIndex + 1 === totalQuestions
              ? "FINISH"
              : "CONTINUE"
            : "CHECK"
        }
        timerValue={timerString}
        showFeedback={showFeedback}
        isCorrect={isCorrect}
        correctAnswer={!isCorrect ? currentQuestion.reason : null}
        feedbackMessage={feedbackMessage}
      >
        <div className="flex-1 flex flex-col items-center justify-center -mt-10 w-full max-w-7xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-100">
              {currentQuestion.theme
                ? `Topic: ${currentQuestion.theme}`
                : "Find the related words"}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-3 text-lg">
              Select the {targetCount} words that belong together
            </p>
          </div>

          {/* Grid: 6 columns for 12 items = 2 rows. Wide spacing. */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-12 w-full px-4 md:px-0">
            {currentQuestion.allWords.map((word, idx) => {
              const isSelected = selectedWords.includes(word);
              const isTargetWord = currentQuestion.correctGroup.includes(word);

              // Square cards: aspect-square, remove fixed height
              let cardStyle =
                "aspect-square rounded-2xl border-2 flex items-center justify-center text-lg md:text-xl font-medium transition-all duration-200 cursor-pointer relative shadow-sm";

              if (showFeedback) {
                if (isTargetWord) {
                  // Always show correct words in green
                  cardStyle +=
                    " bg-green-100 border-green-500 text-green-800 dark:bg-green-900/30 dark:text-green-300";
                } else if (isSelected && !isTargetWord) {
                  // Wrong selection
                  cardStyle +=
                    " bg-red-100 border-red-500 text-red-800 dark:bg-red-900/30 dark:text-red-300 opacity-80";
                } else {
                  // Unrelated, unselected words
                  cardStyle +=
                    " bg-gray-50 border-gray-100 text-gray-400 opacity-30 dark:bg-gray-800/50 dark:border-gray-800";
                }
              } else {
                if (isSelected) {
                  cardStyle +=
                    " bg-blue-50 border-blue-500 text-blue-700 ring-4 ring-blue-500/20 dark:bg-blue-900/20 dark:text-blue-300";
                } else {
                  cardStyle +=
                    " bg-white border-gray-200 hover:border-blue-300 hover:shadow-lg hover:-translate-y-1 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleWordClick(word)}
                  disabled={isSubmitted}
                  className={cardStyle}
                >
                  {word}
                </button>
              );
            })}
          </div>
        </div>
      </PracticeGameLayout>
    </>
  );
}
