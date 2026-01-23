import React, { useState, useEffect } from "react";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { useNavigate } from "react-router-dom";
import { Check, X, Loader2 } from "lucide-react";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { cn } from "@/lib/utils";

// MOCK DATA - Mix of real French words and non-French words
const MOCK_QUESTIONS = [
  { id: 1, word: "behavioral", isFrench: false },
  { id: 2, word: "bonjour", isFrench: true },
  { id: 3, word: "computer", isFrench: false },
  { id: 4, word: "château", isFrench: true },
  { id: 5, word: "beautiful", isFrench: false },
  { id: 6, word: "bibliothèque", isFrench: true },
  { id: 7, word: "restaurant", isFrench: true },
  { id: 8, word: "keyboard", isFrench: false },
  { id: 9, word: "papillon", isFrench: true },
  { id: 10, word: "mountain", isFrench: false },
];

export default function IsThisFrenchWordPage() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  // Timer

  useEffect(() => {
    // Shuffle and load questions
    const shuffled = [...MOCK_QUESTIONS].sort(() => Math.random() - 0.5);
    setQuestions(shuffled.slice(0, 6)); // Pick 6 questions
    setLoading(false);
  }, []);

  // Timer Hook
  const { timerString, resetTimer, isPaused } = useExerciseTimer({
    duration: 15,
    mode: "timer",
    onExpire: () => {
      // Auto fail if time runs out
      if (!showFeedback && !isCompleted) {
        setIsCorrect(false);
        setFeedbackMessage("Time's up!");
        setShowFeedback(true);
      }
    },
    isPaused: loading || isCompleted || showFeedback,
  });

  // Reset timer on new question
  useEffect(() => {
    resetTimer();
  }, [currentIndex, resetTimer]);
  // Removed manual timer effects

  const handleAnswer = (answer) => {
    if (showFeedback) return;

    const currentQ = questions[currentIndex];
    const correct = answer === currentQ.isFrench;

    setSelectedAnswer(answer);
    setIsCorrect(correct);
    setFeedbackMessage(getFeedbackMessage(correct));
    setShowFeedback(true);

    if (correct) {
      setScore((prev) => prev + 1);
    }
  };

  const handleContinue = () => {
    setShowFeedback(false);
    setSelectedAnswer(null);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const currentQ = questions[currentIndex];
  const progress =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
      </div>
    );
  }

  return (
    <>
      <PracticeGameLayout
        questionType="Is this a French Word?"
        instructionFr="Est-ce un mot français ?"
        instructionEn="Decide if the word shown is a real French word"
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={questions.length}
        onExit={() => navigate("/vocabulary/practice")}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={false}
        showSubmitButton={false}
        timerValue={timerString}
      >
        <div className="flex flex-col items-center justify-center w-full max-w-2xl gap-12">
          {/* Word Display */}
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100 tracking-wide">
              {currentQ?.word}
            </h2>
          </div>

          {/* Yes / No Buttons */}
          <div className="flex gap-6">
            {/* Yes Button */}
            <button
              onClick={() => handleAnswer(true)}
              disabled={showFeedback}
              className={cn(
                "flex flex-col items-center justify-center w-24 h-24 md:w-28 md:h-28 rounded-2xl border-2 transition-all duration-200 shadow-sm",
                "hover:shadow-lg hover:-translate-y-1",
                showFeedback && selectedAnswer === true && isCorrect
                  ? "bg-green-100 border-green-500 text-green-700"
                  : showFeedback && selectedAnswer === true && !isCorrect
                    ? "bg-red-100 border-red-500 text-red-700"
                    : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-sky-400",
              )}
            >
              <Check
                className="w-10 h-10 md:w-12 md:h-12 text-sky-500"
                strokeWidth={2.5}
              />
              <span className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                Yes
              </span>
            </button>

            {/* No Button */}
            <button
              onClick={() => handleAnswer(false)}
              disabled={showFeedback}
              className={cn(
                "flex flex-col items-center justify-center w-24 h-24 md:w-28 md:h-28 rounded-2xl border-2 transition-all duration-200 shadow-sm",
                "hover:shadow-lg hover:-translate-y-1",
                showFeedback && selectedAnswer === false && isCorrect
                  ? "bg-green-100 border-green-500 text-green-700"
                  : showFeedback && selectedAnswer === false && !isCorrect
                    ? "bg-red-100 border-red-500 text-red-700"
                    : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-sky-400",
              )}
            >
              <X
                className="w-10 h-10 md:w-12 md:h-12 text-sky-500"
                strokeWidth={2.5}
              />
              <span className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                No
              </span>
            </button>
          </div>
        </div>
      </PracticeGameLayout>

      {/* Feedback Banner */}
      {showFeedback && (
        <FeedbackBanner
          isCorrect={isCorrect}
          correctAnswer={
            !isCorrect
              ? currentQ.isFrench
                ? "Yes, it's French!"
                : "No, it's not French"
              : null
          }
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
