import React, { useState, useEffect, useRef } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { loadMockCSV } from "@/utils/csvLoader";
import { Button } from "@/components/ui/button";
import AccentKeyboard from "@/components/ui/AccentKeyboard";

export default function TranslateTypedPage() {
  const handleExit = usePracticeExit();
  const textareaRef = useRef(null);

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const data = await loadMockCSV("practice/writing/translate_typed.csv");
      setQuestions(data);
      setIsLoading(false);
    };
    fetchData();
  }, []);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <p className="text-xl text-slate-600 dark:text-slate-400">
          No questions available.
        </p>
        <Button onClick={() => handleExit()} variant="outline" className="mt-4">
          Back
        </Button>
      </div>
    );
  }

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
        <div className="flex flex-col items-center w-full max-w-4xl mx-auto px-4 py-4 lg:py-8 gap-6 lg:gap-8">
          {/* Main Grid Interaction Area */}
          <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
            {/* Source Sentence Card */}
            <div className="flex flex-col h-full">
              <div className="flex-1 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-8 lg:p-10 shadow-xl shadow-blue-500/10 flex items-center justify-center min-h-[140px] text-center">
                <p className="text-xl md:text-2xl lg:text-3xl text-white font-bold leading-tight">
                  {currentQuestion?.sourceText}
                </p>
              </div>
            </div>

            {/* User Input Column */}
            <div className="flex flex-col h-full gap-2">
              <textarea
                ref={textareaRef}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={showFeedback}
                placeholder="Type your translation here..."
                rows={4}
                autoFocus
                className={cn(
                  "w-full h-full min-h-[160px] lg:min-h-0 py-6 px-6 rounded-3xl text-lg lg:text-xl font-medium transition-all duration-300 border-2 outline-none resize-none shadow-sm",
                  "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100",
                  "border-slate-200 dark:border-slate-800",
                  "focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10",
                  "placeholder:text-slate-300 dark:placeholder:text-slate-600",
                  showFeedback &&
                    isCorrect &&
                    "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10",
                  showFeedback &&
                    !isCorrect &&
                    "border-red-500 bg-red-50 dark:bg-red-900/10",
                )}
              />
              <AccentKeyboard
                disabled={showFeedback}
                onAccentClick={(char) => {
                  const el = textareaRef.current;
                  if (!el) return;
                  const start = el.selectionStart;
                  const end = el.selectionEnd;
                  const newVal =
                    userInput.slice(0, start) + char + userInput.slice(end);
                  setUserInput(newVal);
                  requestAnimationFrame(() => {
                    el.focus();
                    el.setSelectionRange(start + 1, start + 1);
                  });
                }}
              />
            </div>
          </div>

          {/* Correct Answer Display */}
          {showFeedback && currentQuestion?.correctAnswer && (
            <div className="w-full max-w-4xl mx-auto px-4 -mt-2">
              <div
                className={cn(
                  "rounded-2xl p-4 border-2 transition-all duration-300",
                  isCorrect
                    ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-500"
                    : "bg-red-50 dark:bg-red-900/10 border-red-500",
                )}
              >
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Correct Answer:
                </p>
                <p className="text-lg font-medium text-slate-800 dark:text-slate-100">
                  {currentQuestion.correctAnswer}
                </p>
              </div>
            </div>
          )}

          {/* Quick Shortcuts / Instructions */}
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
