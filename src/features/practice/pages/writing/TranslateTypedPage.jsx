import React, { useState, useEffect } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";

// Mock data for Translate the Sentence (Typed) exercise
const MOCK_QUESTIONS = [
  {
    id: 1,
    sourceText: "Hello, how are you?",
    correctAnswer: "Bonjour, comment allez-vous?",
    acceptableAnswers: [
      "Bonjour, comment allez-vous?",
      "Bonjour comment allez-vous",
      "Salut, comment ça va?",
      "Salut comment ca va",
    ],
    timeLimitSeconds: 60,
  },
  {
    id: 2,
    sourceText: "I would like a coffee, please.",
    correctAnswer: "Je voudrais un café, s'il vous plaît.",
    acceptableAnswers: [
      "Je voudrais un café, s'il vous plaît.",
      "Je voudrais un cafe s'il vous plait",
      "J'aimerais un café, s'il vous plaît.",
    ],
    timeLimitSeconds: 60,
  },
  {
    id: 3,
    sourceText: "Where is the train station?",
    correctAnswer: "Où est la gare?",
    acceptableAnswers: [
      "Où est la gare?",
      "Ou est la gare",
      "Où se trouve la gare?",
    ],
    timeLimitSeconds: 60,
  },
  {
    id: 4,
    sourceText: "I love learning French.",
    correctAnswer: "J'aime apprendre le français.",
    acceptableAnswers: [
      "J'aime apprendre le français.",
      "J'aime apprendre le francais",
      "J'adore apprendre le français.",
    ],
    timeLimitSeconds: 60,
  },
  {
    id: 5,
    sourceText: "The weather is nice today.",
    correctAnswer: "Il fait beau aujourd'hui.",
    acceptableAnswers: [
      "Il fait beau aujourd'hui.",
      "Il fait beau aujourd'hui",
      "Le temps est beau aujourd'hui.",
    ],
    timeLimitSeconds: 60,
  },
];

export default function TranslateTypedPage() {
  const handleExit = usePracticeExit();

  const [questions] = useState(MOCK_QUESTIONS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);

  const currentQuestion = questions[currentIndex];
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
    isPaused: isCompleted || showFeedback,
  });

  useEffect(() => {
    if (currentQuestion && !isCompleted) {
      setUserInput("");
      resetTimer();
    }
  }, [currentIndex, currentQuestion, isCompleted, resetTimer]);

  // Normalize for comparison
  const normalize = (str) =>
    str
      .toLowerCase()
      .replace(/[.,!?;:'"«»]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const handleSubmit = () => {
    if (showFeedback || !userInput.trim()) return;

    const userAnswer = normalize(userInput);
    const correct = currentQuestion.acceptableAnswers.some(
      (answer) => normalize(answer) === userAnswer,
    );

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

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && userInput.trim()) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const progress =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  return (
    <>
      <PracticeGameLayout
        questionType="Translate the Sentence"
        instructionFr="Traduisez la phrase en français"
        instructionEn="Translate the sentence into French"
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={questions.length}
        onExit={handleExit}
        onNext={handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={userInput.trim().length > 0 && !showFeedback}
        showSubmitButton={!showFeedback}
        submitLabel="Check"
        timerValue={timerString}
      >
        <div className="flex flex-col items-center w-full max-w-2xl mx-auto px-4 py-6">
          {/* Source Sentence */}
          <div className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 mb-6 shadow-lg">
            <p className="text-xl md:text-2xl text-white font-semibold text-center">
              {currentQuestion?.sourceText}
            </p>
          </div>

          {/* Text Input */}
          <div className="w-full mb-4">
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={showFeedback}
              placeholder="Type your French translation here..."
              rows={3}
              className={cn(
                "w-full py-4 px-6 rounded-xl text-lg font-medium transition-all duration-200 border-2 outline-none resize-none",
                "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100",
                "border-slate-200 dark:border-slate-700",
                "focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20",
                "placeholder:text-slate-400 dark:placeholder:text-slate-500",
                showFeedback && isCorrect && "border-emerald-500 bg-emerald-50",
                showFeedback && !isCorrect && "border-red-500 bg-red-50",
              )}
              autoFocus
            />
          </div>

          {/* Character count */}
          <div className="w-full flex justify-end items-center">
            <span className="text-sm text-slate-400">
              {userInput.length} characters
            </span>
          </div>
        </div>
      </PracticeGameLayout>

      {/* Feedback Banner */}
      {showFeedback && (
        <FeedbackBanner
          isCorrect={isCorrect}
          correctAnswer={!isCorrect ? currentQuestion.correctAnswer : null}
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
