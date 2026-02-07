import React, { useState, useEffect } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Loader2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { loadMockCSV } from "@/utils/csvLoader";
import { Button } from "@/components/ui/button";

export default function RewriteSentencePage({ mode = "transformation" }) {
  const handleExit = usePracticeExit();

  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
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
        handleSubmit();
      }
    },
    isPaused: isCompleted || showFeedback || isLoading,
  });

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        let file = "grammar/grammar_transformation.csv";
        if (mode === "combination") {
          file = "grammar/grammar_combination.csv";
        } else if (mode === "rewrite") {
          file = "grammar/grammar_rewrite.csv";
        }

        const data = await loadMockCSV(file);
        setQuestions(data || []);
      } catch (error) {
        console.error("Error loading questions:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, [mode]);

  useEffect(() => {
    if (currentQuestion && !isCompleted) {
      setUserInput("");
      setShowFeedback(false);
      resetTimer();
    }
  }, [currentIndex, currentQuestion, isCompleted, resetTimer]);

  const normalize = (str) => {
    // Remove trailing punctuation, multiple spaces, and lowercase
    return str
      .toLowerCase()
      .replace(/[.,!?;:]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  const handleSubmit = () => {
    if (showFeedback) return;

    // Validation Logic
    // We support multiple correct answers separated by '|'
    const allowedAnswers = currentQuestion.answer.split("|");

    // Check if user input matches any of the allowed variants
    const userNorm = normalize(userInput);
    const matched = allowedAnswers.some((ans) => normalize(ans) === userNorm);

    setIsCorrect(matched);
    setFeedbackMessage(getFeedbackMessage(matched));
    setShowFeedback(true);

    if (matched) {
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
        questionType={
          mode === "combination"
            ? "Combine Sentences"
            : mode === "rewrite"
              ? "Rewrite – Type in"
              : "Sentence Transformation"
        }
        instructionFr={currentQuestion.instruction}
        instructionEn={
          mode === "combination"
            ? "Combine the sentences using the target structure"
            : mode === "rewrite"
              ? "Rewrite the sentence as instructed"
              : "Rewrite the sentence as instructed"
        }
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={questions.length}
        onExit={handleExit}
        onNext={handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={userInput.length > 0}
        showSubmitButton={!showFeedback}
        submitLabel="Check"
        timerValue={timerString}
      >
        <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto px-4 py-8 gap-8 min-h-[50vh]">
          {/* Instruction Bubble */}
          <div className="bg-indigo-50 dark:bg-indigo-900/20 px-6 py-3 rounded-2xl border-2 border-indigo-100 dark:border-indigo-900/50 shadow-sm text-center">
            <h3 className="text-lg md:text-xl font-bold text-indigo-800 dark:text-indigo-200 uppercase tracking-wide">
              {currentQuestion.instruction}
            </h3>
          </div>

          {/* Source Sentence */}
          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700 w-full max-w-2xl text-center">
            <p className="text-2xl md:text-3xl text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
              {currentQuestion.sentence}
            </p>
          </div>

          <ArrowRight className="w-8 h-8 text-slate-300 dark:text-slate-600 animate-pulse hidden md:block" />

          {/* Input Area */}
          <div className="w-full max-w-2xl">
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              disabled={showFeedback}
              placeholder="Type your answer here..."
              className={cn(
                "w-full bg-white dark:bg-slate-800 border-2 rounded-2xl p-6 text-xl md:text-2xl text-center resize-none outline-none transition-all shadow-sm min-h-[140px]",
                "focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-300 dark:placeholder:text-slate-600",
                showFeedback &&
                  isCorrect &&
                  "border-green-500 bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-300",
                showFeedback &&
                  !isCorrect &&
                  "border-red-500 bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-300",
                !showFeedback && "border-slate-200 dark:border-slate-700",
              )}
              autoFocus
            />
          </div>
        </div>
      </PracticeGameLayout>

      {/* Feedback Banner */}
      {showFeedback && (
        <FeedbackBanner
          isCorrect={isCorrect}
          correctAnswer={
            !isCorrect ? currentQuestion.answer.split("|")[0] : null
          } // Show first valid option
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
