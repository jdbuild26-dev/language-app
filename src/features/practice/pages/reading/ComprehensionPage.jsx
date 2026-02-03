import React, { useState, useEffect } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { loadMockCSV } from "@/utils/csvLoader";
import { Button } from "@/components/ui/button";

export default function ComprehensionPage() {
  const handleExit = usePracticeExit();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const data = await loadMockCSV("practice/reading/comprehension.csv");
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

  const progress =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;


  return (
    <>
      <PracticeGameLayout
        questionType="Reading Comprehension"
        instructionFr="Lisez le passage et répondez"
        instructionEn="Read the passage and answer"
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={questions.length}
        onExit={handleExit}
        onNext={handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={selectedOption !== null && !showFeedback}
        showSubmitButton={!showFeedback}
        submitLabel="Check"
        timerValue={timerString}
      >
        <div className="flex w-full max-w-5xl mx-auto px-6 py-8 gap-0">
          {/* Left Column - Passage */}
          <div className="flex-1 pr-8">
            <p className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">
              PASSAGE
            </p>
            <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300">
              {currentQuestion?.passage}
            </p>
          </div>

          {/* Vertical Divider */}
          <div className="w-px bg-cyan-400 dark:bg-cyan-500 mx-4 self-stretch" />

          {/* Right Column - Question & Options */}
          <div className="flex-1 pl-8">
            {/* Question */}
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6">
              {currentQuestion?.question}
            </h3>

            {/* Options */}
            <div className="space-y-4">
              {currentQuestion?.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleOptionSelect(index)}
                  disabled={showFeedback}
                  className={cn(
                    "w-full py-4 px-5 rounded-lg text-left text-base font-medium transition-all duration-200 border flex items-center gap-4",
                    selectedOption === index
                      ? "bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border-cyan-400 dark:border-cyan-500"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-cyan-300 dark:hover:border-cyan-600",
                    showFeedback && index === currentQuestion.correctIndex
                      ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-400 dark:border-emerald-500"
                      : "",
                    showFeedback &&
                      selectedOption === index &&
                      index !== currentQuestion.correctIndex
                      ? "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-400 dark:border-red-500"
                      : "",
                  )}
                >
                  {/* Radio Circle */}
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                      selectedOption === index
                        ? "border-cyan-500 dark:border-cyan-400"
                        : "border-slate-300 dark:border-slate-600",
                      showFeedback && index === currentQuestion.correctIndex
                        ? "border-emerald-500 dark:border-emerald-400"
                        : "",
                      showFeedback &&
                        selectedOption === index &&
                        index !== currentQuestion.correctIndex
                        ? "border-red-500 dark:border-red-400"
                        : "",
                    )}
                  >
                    {selectedOption === index && (
                      <div
                        className={cn(
                          "w-3 h-3 rounded-full",
                          showFeedback && index === currentQuestion.correctIndex
                            ? "bg-emerald-500 dark:bg-emerald-400"
                            : showFeedback &&
                              index !== currentQuestion.correctIndex
                              ? "bg-red-500 dark:bg-red-400"
                              : "bg-cyan-500 dark:bg-cyan-400",
                        )}
                      />
                    )}
                  </div>
                  <span>{option}</span>
                </button>
              ))}
            </div>
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
