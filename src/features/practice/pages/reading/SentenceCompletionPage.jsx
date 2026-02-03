import React, { useState, useEffect } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { loadMockCSV } from "@/utils/csvLoader";
import { Button } from "@/components/ui/button";

export default function SentenceCompletionPage() {
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
      const data = await loadMockCSV("practice/reading/sentence_completion.csv");
      setQuestions(data);
      setIsLoading(false);
    };
    fetchData();
  }, []);


  const currentQuestion = questions[currentIndex];
  const timerDuration = currentQuestion?.timeLimitSeconds || 120;

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
        questionType="Complete the passage"
        instructionFr="Choisissez la meilleure phrase"
        instructionEn="Select the best sentence to complete the passage"
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
        <div className="flex flex-col lg:flex-row w-full max-w-6xl mx-auto px-4 md:px-6 py-6 gap-6">
          {/* Left Column - Passage */}
          <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 md:p-8">
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">
              PASSAGE
            </p>
            <div className="text-sm md:text-base leading-relaxed text-slate-700 dark:text-slate-300 space-y-4">
              <p>{currentQuestion?.passageBefore}</p>

              {/* Blank indicator */}
              <div className={cn(
                "py-3 px-4 bg-slate-100 dark:bg-slate-700/50 border-l-4 rounded-r-lg transition-all duration-300",
                showFeedback
                  ? (isCorrect ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" : "border-red-500 bg-red-50 dark:bg-red-900/20")
                  : "border-cyan-500",
                !selectedOption && !showFeedback && "py-4 px-2 bg-slate-50 dark:bg-slate-800/50"
              )}>
                {/* Mobile: Horizontal options carousel when nothing is selected */}
                {!selectedOption && !showFeedback ? (
                  <>
                    <div className="lg:hidden flex flex-col gap-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-1 px-1">Choose the best sentence:</p>
                      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x scrollbar-hide">
                        {currentQuestion?.options.map((option, index) => (
                          <button
                            key={index}
                            onClick={() => handleOptionSelect(index)}
                            className="flex-shrink-0 w-64 snap-center p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-left shadow-sm active:scale-[0.98] transition-all"
                          >
                            <div className="flex gap-2 items-start">
                              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500 border border-slate-200 dark:border-slate-600">
                                {String.fromCharCode(65 + index)}
                              </span>
                              <span className="text-slate-700 dark:text-slate-200 leading-snug">{option}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Desktop: Placeholder */}
                    <span className="hidden lg:inline text-slate-400 dark:text-slate-500 italic">
                      [Select the best sentence to complete the passage]
                    </span>
                  </>
                ) : (
                  <div
                    className={cn(
                      "flex flex-col gap-1",
                      !showFeedback && selectedOption !== null && "cursor-pointer group"
                    )}
                    onClick={() => !showFeedback && selectedOption !== null && setSelectedOption(null)}
                  >
                    <span className={cn(
                      "italic transition-all duration-300",
                      selectedOption !== null
                        ? "text-slate-900 dark:text-slate-100 font-medium not-italic"
                        : "text-slate-400 dark:text-slate-500",
                      showFeedback && selectedOption !== null && (
                        isCorrect ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                      )
                    )}>
                      {selectedOption !== null
                        ? currentQuestion.options[selectedOption]
                        : "[Select the best sentence to complete the passage]"}
                    </span>
                    {!showFeedback && selectedOption !== null && (
                      <span className="lg:hidden text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase flex items-center gap-1 opacity-70">
                        Tap to change
                      </span>
                    )}
                  </div>
                )}
              </div>

              <p>{currentQuestion?.passageAfter}</p>
            </div>
          </div>

          {/* Vertical Divider (visible on lg screens) */}
          <div className="hidden lg:block w-px bg-cyan-400 dark:bg-cyan-500 self-stretch" />

          {/* Right Column - Question & Options (Hidden on Mobile) */}
          <div className="hidden lg:block flex-1 lg:max-w-md">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 md:p-8">
              {/* Question */}
              <h3 className="text-base md:text-lg font-bold text-slate-800 dark:text-slate-100 mb-6">
                Select the best sentence to complete the passage
              </h3>

              {/* Options */}
              <div className="space-y-3">
                {currentQuestion?.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleOptionSelect(index)}
                    disabled={showFeedback}
                    className={cn(
                      "w-full py-3 px-4 rounded-lg text-left text-sm font-medium transition-all duration-200 border flex items-start gap-3",
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
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5",
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
                            "w-2.5 h-2.5 rounded-full",
                            showFeedback &&
                              index === currentQuestion.correctIndex
                              ? "bg-emerald-500 dark:bg-emerald-400"
                              : showFeedback &&
                                index !== currentQuestion.correctIndex
                                ? "bg-red-500 dark:bg-red-400"
                                : "bg-cyan-500 dark:bg-cyan-400",
                          )}
                        />
                      )}
                    </div>
                    <span className="leading-relaxed">{option}</span>
                  </button>
                ))}
              </div>
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
