"use client";

import React, { useState, useEffect } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { loadMockCSV } from "@/utils/csvLoader";
import PracticeOptions from "@/components/ui/PracticeOptions";
import { Languages } from "lucide-react";

import { useLanguage } from "@/contexts/LanguageContext";

type ComprehensionQuestion = {
  passage?: string;
  question?: string;
  options: string[];
  correctIndex: number;
  localizedInstruction?: string;
  instructionFr?: string;
  instructionEn?: string;
  timeLimitSeconds?: number;
};

export default function ComprehensionPage() {
  const handleExit = usePracticeExit();
  const { learningLang = "", knownLang = "" } = useLanguage() as {
    learningLang?: string;
    knownLang?: string;
  };

  const [questions, setQuestions] = useState<ComprehensionQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await loadMockCSV("practice/reading/comprehension.csv", {
          learningLang,
          knownLang,
        });
        setQuestions(
          Array.isArray(data) ? (data as ComprehensionQuestion[]) : [],
        );
      } catch (error) {
        console.error("Error loading mock data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [learningLang, knownLang]);

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

  const handleOptionSelect = (index: number) => {
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
        <p className="text-xl text-slate-600 dark:text-slate-400">
          No questions available.
        </p>
        <button
          onClick={() => handleExit()}
          className="mt-4 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Back
        </button>
      </div>
    );
  }

  const progress =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  return (
    <>
      <PracticeGameLayout
        questionType="Reading Comprehension"
        questionTypeFr="Compréhension de lecture"
        questionTypeEn="Reading Comprehension"
        localizedInstruction={currentQuestion?.localizedInstruction}
        instructionFr={
          currentQuestion?.instructionFr || "Lisez le passage et répondez"
        }
        instructionEn={
          currentQuestion?.instructionEn || "Read the passage and answer"
        }
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={questions.length}
        onExit={handleExit}
        onNext={showFeedback ? handleContinue : handleSubmit}
        onRestart={() => window.location.reload()}
        currentQuestionIndex={currentIndex}
        questionCounterValue={currentIndex + 1}
        isSubmitEnabled={selectedOption !== null || showFeedback}
        showSubmitButton={true}
        submitLabel={
          showFeedback
            ? currentIndex + 1 === questions.length
              ? "FINISH"
              : "CONTINUE"
            : "Submit Answer"
        }
        timerValue={timerString}
        feedbackTone={
          showFeedback ? (isCorrect ? "success" : "error") : "neutral"
        }
      >
        <div className="practice-reading-page-shell flex flex-col md:flex-row gap-3 p-3 mx-auto overflow-hidden flex-1 min-h-0">
          {/* Left Column - Passage */}
          <div className="flex-1 min-h-0 bg-white dark:bg-slate-800 p-5 md:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">
            <p className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">
              PASSAGE
            </p>
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-1">
              <p className="practice-reading-option-text font-medium text-slate-700 dark:text-slate-200">
                {currentQuestion?.passage}
              </p>
            </div>
          </div>

          {/* Right Column - Question & Options */}
          <div className="flex-1 min-h-0 flex flex-col dark:bg-slate-900 rounded-2xl border border-slate-200 bg-white dark:border-slate-700 p-5 md:p-8 gap-5 overflow-y-auto">
            {/* Question */}
            <h3 className="mb-2 flex items-start gap-2">
              <Languages className="w-5 h-5 text-blue-500 shrink-0 mt-1" />
              <span className="practice-reading-option-text font-medium">
                {currentQuestion?.question}
              </span>
            </h3>

            {/* Options */}
            <PracticeOptions
              options={currentQuestion?.options || []}
              selectedOption={selectedOption}
              correctIndex={currentQuestion?.correctIndex ?? -1}
              showFeedback={showFeedback}
              onSelect={handleOptionSelect}
              renderLabel={(option) => option}
            />
          </div>
        </div>
      </PracticeGameLayout>

      {/* Feedback Banner */}
      {showFeedback && (
        <FeedbackBanner
          isCorrect={isCorrect}
          feedbackTone={isCorrect ? "success" : "error"}
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
