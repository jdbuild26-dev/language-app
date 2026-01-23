import React, { useState, useEffect } from "react";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";

// MOCK DATA for "Odd One Out"
const MOCK_QUESTIONS = [
  {
    id: 1,
    words: ["Chien", "Chat", "Lapin", "Pomme"],
    correctAnswer: "Pomme",
    reason: "'Pomme' is a fruit, the others are animals.",
    type: "Odd One Out",
    instructionFr: "Trouvez l'intrus",
    instructionEn: "Select the odd one out",
  },
  {
    id: 2,
    words: ["Rouge", "Bleu", "Voiture", "Vert"],
    correctAnswer: "Voiture",
    reason: "'Voiture' is a vehicle, the others are colors.",
  },
  {
    id: 3,
    words: ["Manger", "Boire", "Dormir", "Heureux"],
    correctAnswer: "Heureux",
    reason: "'Heureux' is an adjective, the others are verbs.",
  },
  {
    id: 4,
    words: ["Lundi", "Mardi", "Janvier", "Mercredi"],
    correctAnswer: "Janvier",
    reason: "'Janvier' is a month, the others are days.",
  },
  {
    id: 5,
    words: ["Un", "Deux", "Trois", "Livre"],
    correctAnswer: "Livre",
    reason: "'Livre' is an object, the others are numbers.",
  },
];

export default function OddOneOutGamePage() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedWord, setSelectedWord] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  // Timer Hook
  const { timerString, resetTimer, isPaused } = useExerciseTimer({
    duration: 20,
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
    resetTimer();
  }, [currentIndex, resetTimer]);

  const currentQuestion = MOCK_QUESTIONS[currentIndex];
  const totalQuestions = MOCK_QUESTIONS.length;
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  const handleWordClick = (word) => {
    if (isSubmitted) return;
    setSelectedWord(word);
  };

  const handleSubmit = () => {
    if (isSubmitted) {
      // Next Logic
      setShowFeedback(false);
      if (currentIndex + 1 < totalQuestions) {
        setCurrentIndex((prev) => prev + 1);
        setSelectedWord(null);
        setIsSubmitted(false);
      } else {
        setIsGameOver(true);
      }
      return;
    }

    // Submit Logic
    if (!selectedWord) return;
    setIsSubmitted(true);

    const correct = selectedWord === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    setFeedbackMessage(getFeedbackMessage(correct));
    setShowFeedback(true);

    if (correct) {
      setScore((prev) => prev + 1);
    }
  };

  const getWordStyle = (word) => {
    const baseStyle =
      "h-32 md:h-40 rounded-2xl border-2 text-lg md:text-xl font-medium transition-all duration-200 flex items-center justify-center relative overflow-hidden min-w-[180px] md:min-w-[240px]";

    if (!isSubmitted) {
      // Normal Selection
      if (word === selectedWord) {
        return `${baseStyle} bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500`;
      }
      return `${baseStyle} bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-purple-400 hover:shadow-md cursor-pointer text-gray-700 dark:text-gray-200`;
    }

    // Result Logic
    if (word === currentQuestion.correctAnswer) {
      // Always show correct
      return `${baseStyle} bg-green-50 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-300`;
    }

    if (word === selectedWord && word !== currentQuestion.correctAnswer) {
      // Wrong selection
      return `${baseStyle} bg-red-50 dark:bg-red-900/30 border-red-500 text-red-700 dark:text-red-300 opacity-80`;
    }

    return `${baseStyle} bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 text-gray-400 opacity-50`;
  };

  let submitLabel = "Submit";
  if (isSubmitted) {
    submitLabel =
      currentIndex + 1 === totalQuestions ? "Finish" : "Next Question";
  }

  return (
    <>
      <PracticeGameLayout
        questionType={currentQuestion.type || "Odd One Out"}
        instructionFr={currentQuestion.instructionFr || "Trouvez l'intrus"}
        instructionEn={
          currentQuestion.instructionEn || "Select the odd one out"
        }
        progress={progress}
        isGameOver={isGameOver}
        score={score}
        totalQuestions={totalQuestions}
        onExit={() => navigate("/vocabulary/practice")}
        onNext={handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={!!selectedWord}
        showSubmitButton={true}
        submitLabel={submitLabel}
        timerValue={timerString}
      >
        <div className="flex-1 flex flex-col items-center justify-center -mt-10">
          {/* Grid */}
          <div className="grid grid-cols-2 gap-6 md:gap-10 w-full max-w-5xl">
            {currentQuestion.words.map((word, idx) => (
              <button
                key={idx}
                onClick={() => handleWordClick(word)}
                disabled={isSubmitted}
                className={getWordStyle(word)}
              >
                <span>{word}</span>
                {isSubmitted && word === currentQuestion.correctAnswer && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                )}
                {isSubmitted &&
                  word === selectedWord &&
                  word !== currentQuestion.correctAnswer && (
                    <div className="absolute top-2 right-2">
                      <XCircle className="w-5 h-5 text-red-600" />
                    </div>
                  )}
              </button>
            ))}
          </div>
        </div>
      </PracticeGameLayout>

      {/* Feedback Banner */}
      {showFeedback && (
        <FeedbackBanner
          isCorrect={isCorrect}
          correctAnswer={
            !isCorrect
              ? `${currentQuestion.correctAnswer} - ${currentQuestion.reason}`
              : null
          }
          onContinue={handleSubmit}
          message={feedbackMessage}
          continueLabel={
            currentIndex + 1 === totalQuestions ? "FINISH" : "CONTINUE"
          }
        />
      )}
    </>
  );
}
