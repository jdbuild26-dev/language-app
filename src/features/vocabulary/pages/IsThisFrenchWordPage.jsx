import React, { useState, useEffect } from "react";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { useNavigate } from "react-router-dom";
import { Check, X, Loader2 } from "lucide-react";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { cn } from "@/lib/utils";
import { fetchPracticeQuestions } from "../../../services/vocabularyApi";

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
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);

      const response = await fetchPracticeQuestions("is_french_word");
      if (response && response.data) {
        const normalized = response.data.map((item) => {
          // Handle new structure from vocabularyApi transformer
          if (item.content) {
            return {
              id: item.external_id || item.id,
              word: item.content.word,
              isFrench: item.content.isFrench,
            };
          }

          // Handle flattened API structure
          const word =
            item.word || item.Question || item.Word || item.Word_FR || "";

          let isFr = item.isFrench;
          if (isFr === undefined) {
            const ans = (item.CorrectAnswer || item.Answer || "")
              .toString()
              .toLowerCase();
            isFr = ["yes", "oui", "true", "1"].includes(ans);
          }

          return {
            id: item.id || item.ExerciseID,
            word: word,
            isFrench: isFr,
          };
        });
        setQuestions(normalized.sort(() => Math.random() - 0.5));
      }
    } catch (err) {
      console.error("[IsThisFrenchWord] ❌ Failed to load:", err);
    } finally {
      setLoading(false);
    }
  };

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

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-red-500">
        <p className="text-xl font-bold">No questions found</p>
        <button
          className="mt-4 px-6 py-2 border border-slate-300 rounded-lg text-slate-600"
          onClick={() => navigate("/vocabulary/practice")}
        >
          Back to Practice
        </button>
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
        onNext={showFeedback ? handleContinue : undefined}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={showFeedback}
        showSubmitButton={showFeedback}
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
        correctAnswer={
          !isCorrect
            ? currentQ.isFrench
              ? "Yes, it's French!"
              : "No, it's not French"
            : null
        }
        feedbackMessage={feedbackMessage}
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
    </>
  );
}
