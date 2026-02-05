import React, { useState, useEffect } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Loader2, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { loadMockCSV } from "@/utils/csvLoader";
import { Button } from "@/components/ui/button";

export default function FindErrorPage() {
  const handleExit = usePracticeExit();

  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [selectedSegmentIndex, setSelectedSegmentIndex] = useState(null);

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
    isPaused: isCompleted || showFeedback || isLoading,
  });

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await loadMockCSV("grammar/grammar_find_error.csv");
        // Parse sentence_parts "He|go|to..." -> array
        const transformed = data.map((item) => ({
          ...item,
          parts: item.sentence_parts.split("|"),
          errorIndex: parseInt(item.error_index),
        }));
        setQuestions(transformed || []);
      } catch (error) {
        console.error("Error loading questions:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (currentQuestion && !isCompleted) {
      setSelectedSegmentIndex(null);
      setShowFeedback(false);
      resetTimer();
    }
  }, [currentIndex, currentQuestion, isCompleted, resetTimer]);

  const handleSegmentClick = (index) => {
    if (showFeedback) return;
    setSelectedSegmentIndex(index);
  };

  const handleSubmit = () => {
    if (showFeedback) return;
    if (selectedSegmentIndex === null) return;

    const correct = selectedSegmentIndex === currentQuestion.errorIndex;

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
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="animate-spin text-indigo-500 w-8 h-8" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <p className="text-xl text-slate-600 dark:text-slate-400">
          No content available.
        </p>
        <Button onClick={() => handleExit()} variant="outline" className="mt-4">
          Back
        </Button>
      </div>
    );
  }

  const progress =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  return (
    <>
      <PracticeGameLayout
        questionType="Find the Error"
        instructionFr="Identifiez l'erreur"
        instructionEn="Click on the incorrect part of the sentence"
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={questions.length}
        onExit={handleExit}
        onNext={handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={selectedSegmentIndex !== null}
        showSubmitButton={!showFeedback}
        submitLabel="Check"
        timerValue={timerString}
      >
        <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto px-4 py-8 gap-12 min-h-[50vh]">
          <div className="flex flex-wrap justify-center gap-3 md:gap-4 max-w-3xl">
            {currentQuestion.parts.map((part, index) => {
              let statusClass =
                "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-indigo-400 dark:hover:border-indigo-500";

              const isSelected = selectedSegmentIndex === index;

              if (showFeedback) {
                if (index === currentQuestion.errorIndex) {
                  // This is the error part
                  statusClass =
                    "bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-300 shadow-green-200 dark:shadow-green-900/20";
                  // Highlight the error as "Correctly Identified" if user picked it, or "This was the answer" if user missed it?
                  // Usually we highlight the correct ANSWER (the error) in Green, or highlight user's WRONG choice in Red.
                  // Let's standardise:
                  // If User Correct: User selection (Error) -> Green.
                  // If User Wrong: User selection -> Red. Actual Error -> Green.
                } else if (isSelected && !isCorrect) {
                  // Wrongly selected part
                  statusClass =
                    "bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-300";
                } else {
                  statusClass = "opacity-50 grayscale";
                }
              } else if (isSelected) {
                statusClass =
                  "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-lg ring-2 ring-indigo-500/20";
              }

              return (
                <button
                  key={index}
                  onClick={() => handleSegmentClick(index)}
                  disabled={showFeedback}
                  className={cn(
                    "px-4 py-3 md:px-6 md:py-4 rounded-xl border-2 text-xl md:text-2xl font-medium transition-all duration-200",
                    "active:scale-95",
                    statusClass,
                  )}
                >
                  {part}
                  {showFeedback && index === currentQuestion.errorIndex && (
                    <CheckCircle2 className="inline-block ml-2 w-5 h-5 md:w-6 md:h-6" />
                  )}
                  {showFeedback && isSelected && !isCorrect && (
                    <XCircle className="inline-block ml-2 w-5 h-5 md:w-6 md:h-6" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Card */}
          {showFeedback && (
            <div className="bg-slate-50 dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 max-w-2xl w-full text-center animate-in fade-in slide-in-from-bottom-4">
              <div className="mb-4">
                <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                  Grammar Note
                </h4>
              </div>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-6">
                {currentQuestion.explanation}
              </p>
              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 inline-block">
                <span className="text-slate-400 text-sm font-bold uppercase tracking-wider block mb-1">
                  Correction
                </span>
                <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  {currentQuestion.correct_text}
                </span>
              </div>
            </div>
          )}
        </div>
      </PracticeGameLayout>

      {/* Feedback Banner - Simplified since we show detailed explanation inline */}
      {showFeedback && (
        <FeedbackBanner
          isCorrect={isCorrect}
          correctAnswer={null} // Hiding standard answer display as we have custom explanation
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
