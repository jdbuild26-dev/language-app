import React, { useState, useEffect } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { loadMockCSV } from "@/utils/csvLoader";
import { Button } from "@/components/ui/button";

export default function TranslateTypedPage() {
  const handleExit = usePracticeExit();

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
        <p className="text-xl text-slate-600 dark:text-slate-400">No questions available.</p>
        <Button onClick={() => handleExit()} variant="outline" className="mt-4">Back</Button>
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
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-2">
                SOURCE SENTENCE
              </label>
              <div className="flex-1 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-8 lg:p-10 shadow-xl shadow-blue-500/10 flex items-center justify-center min-h-[140px] text-center">
                <p className="text-xl md:text-2xl lg:text-3xl text-white font-bold leading-tight">
                  {currentQuestion?.sourceText}
                </p>
              </div>
            </div>

            {/* User Input Column */}
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-end mb-2 ml-2">
                <label className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">
                  YOUR TRANSLATION
                </label>
                <span className="text-[10px] font-mono text-slate-400">
                  {userInput.length} chars
                </span>
              </div>
              <textarea
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
                  showFeedback && isCorrect && "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10",
                  showFeedback && !isCorrect && "border-red-500 bg-red-50 dark:bg-red-900/10",
                )}
              />
            </div>
          </div>

          {/* Quick Shortcuts / Instructions */}
          <div className="w-full flex flex-col md:flex-row items-center justify-center gap-4 text-slate-400 dark:text-slate-600">
            <div className="flex items-center gap-2 text-xs">
              <span className="px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-bold">Enter</span>
              to check answer
            </div>
            <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="text-xs italic">
              Try to be as accurate as possible!
            </div>
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
