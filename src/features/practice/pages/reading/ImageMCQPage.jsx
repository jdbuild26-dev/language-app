import React, { useState, useEffect } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";

// Mock data for Match Image to Description (MCQ) exercise
const MOCK_QUESTIONS = [
  {
    id: 1,
    imageEmoji: "🐱",
    imageAlt: "A cat",
    question: "Which describes this image?",
    options: [
      "Un chien marche dans le parc",
      "Un chat dort sur le canapé",
      "Un oiseau vole dans le ciel",
      "Un poisson nage dans l'eau",
    ],
    correctIndex: 1,
    timeLimitSeconds: 30,
  },
  {
    id: 2,
    imageEmoji: "🍎",
    imageAlt: "An apple",
    question: "Which describes this image?",
    options: [
      "Une orange sur la table",
      "Une banane jaune",
      "Une pomme rouge",
      "Un raisin violet",
    ],
    correctIndex: 2,
    timeLimitSeconds: 30,
  },
  {
    id: 3,
    imageEmoji: "☀️",
    imageAlt: "The sun",
    question: "Which describes this image?",
    options: [
      "Il pleut aujourd'hui",
      "Il neige en hiver",
      "Il fait beau et ensoleillé",
      "Il y a du vent",
    ],
    correctIndex: 2,
    timeLimitSeconds: 30,
  },
  {
    id: 4,
    imageEmoji: "🏠",
    imageAlt: "A house",
    question: "Which describes this image?",
    options: [
      "Un immeuble en ville",
      "Une maison avec un jardin",
      "Un appartement moderne",
      "Un château ancien",
    ],
    correctIndex: 1,
    timeLimitSeconds: 30,
  },
  {
    id: 5,
    imageEmoji: "📚",
    imageAlt: "Books",
    question: "Which describes this image?",
    options: [
      "Des journaux sur la table",
      "Des magazines colorés",
      "Des livres empilés",
      "Des lettres dans une boîte",
    ],
    correctIndex: 2,
    timeLimitSeconds: 30,
  },
];

export default function ImageMCQPage() {
  const handleExit = usePracticeExit();

  const [questions] = useState(MOCK_QUESTIONS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);

  const currentQuestion = questions[currentIndex];
  const timerDuration = currentQuestion?.timeLimitSeconds || 30;

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
    isPaused: isCompleted || showFeedback,
  });

  useEffect(() => {
    if (currentQuestion && !isCompleted) {
      setSelectedOption(null);
      resetTimer();
    }
  }, [currentIndex, currentQuestion, isCompleted, resetTimer]);

  const handleOptionSelect = (index) => {
    if (showFeedback) return;
    setSelectedOption(index);
  };

  const handleSubmit = () => {
    if (showFeedback || selectedOption === null) return;

    const correct = selectedOption === currentQuestion.correctIndex;
    setIsCorrect(correct);
    setFeedbackMessage(getFeedbackMessage(correct));
    setShowFeedback(true);

    if (correct) {
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

  const progress =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  return (
    <>
      <PracticeGameLayout
        questionType="Match Image to Description"
        instructionFr="Choisissez la description correcte"
        instructionEn="Choose the correct description"
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={questions.length}
        onExit={handleExit}
        onNext={handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={selectedOption !== null && !showFeedback}
        showSubmitButton={true}
        submitLabel="Check"
        timerValue={timerString}
      >
        <div className="flex flex-col items-center w-full max-w-2xl mx-auto px-4 py-6">
          {/* Image Display */}
          <div className="w-48 h-48 bg-gradient-to-br from-amber-100 to-yellow-200 dark:from-amber-900/30 dark:to-yellow-900/30 rounded-2xl flex items-center justify-center mb-6 shadow-lg border-4 border-white dark:border-slate-700">
            <span className="text-8xl">{currentQuestion?.imageEmoji}</span>
          </div>

          {/* Question */}
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-6 text-center">
            {currentQuestion?.question}
          </h3>

          {/* Options */}
          <div className="w-full space-y-3">
            {currentQuestion?.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionSelect(index)}
                disabled={showFeedback}
                className={cn(
                  "w-full py-4 px-6 rounded-xl text-left text-base font-medium transition-all duration-200 border-2",
                  selectedOption === index
                    ? "bg-amber-500 text-white border-amber-500 shadow-lg"
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20",
                  showFeedback && index === currentQuestion.correctIndex
                    ? "bg-emerald-500 text-white border-emerald-500"
                    : "",
                  showFeedback &&
                    selectedOption === index &&
                    index !== currentQuestion.correctIndex
                    ? "bg-red-500 text-white border-red-500"
                    : "",
                )}
              >
                <span className="inline-flex items-center gap-3">
                  <span
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                      selectedOption === index
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300",
                    )}
                  >
                    {String.fromCharCode(65 + index)}
                  </span>
                  {option}
                </span>
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
              ? currentQuestion.options[currentQuestion.correctIndex]
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
