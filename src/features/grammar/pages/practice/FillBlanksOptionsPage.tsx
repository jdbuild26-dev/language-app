"use client";

import React, { useState, useEffect } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { loadMockCSV } from "@/utils/csvLoader";
import { Button } from "@/components/ui/button";

export default function FillBlanksOptionsPage() {
  const handleExit = usePracticeExit();

  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [selectedOption, setSelectedOption] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);

  const currentQuestion = questions[currentIndex];
  const timerDuration = currentQuestion?.timeLimitSeconds || 45;

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
    const fetchAndTransformQuestions = async () => {
      try {
        const tag = new URLSearchParams(window.location.search).get("tag") || undefined;
        const data = (await loadMockCSV("grammar/fill_blanks_options.csv", { tag })) as any[];

        if (!data || data.length === 0) {
          setQuestions([]);
          setIsLoading(false);
          return;
        }

        // Transform data into the stable frontend model used by this page.
        const transformed = (data as any[]).map((item) => {
          let parsedOptions: any[] = [];
          try {
            if (Array.isArray(item.options)) {
              parsedOptions = item.options;
            } else if (typeof item.options === "string") {
              parsedOptions = JSON.parse(item.options.replace(/'/g, '"'));
            } else if (Array.isArray(item.Options)) {
              parsedOptions = item.Options;
            } else if (typeof item.Options === "string") {
              parsedOptions = JSON.parse(item.Options.replace(/'/g, '"'));
            }
          } catch (e) {
            console.error("Error parsing options", e);
            parsedOptions = ["Error loading options"];
          }

          const uploadedOptionsFr = [
            item["Correct Answer_FR"],
            item["Distractor_1_FR"],
            item["Distractor_2_FR"],
            item["Distractor_3_FR"],
          ].filter(Boolean);
          const uploadedOptionsEn = [
            item["Correct Answer_EN"],
            item["Distractor_1_EN"],
            item["Distractor_2_EN"],
            item["Distractor_3_EN"],
          ].filter(Boolean);
          const uploadedOptions =
            uploadedOptionsFr.length > 0 ? uploadedOptionsFr : uploadedOptionsEn;
          const options = parsedOptions.length > 0 ? parsedOptions : uploadedOptions;
          const uploadedCorrectIndex = uploadedOptions.length > 0 ? 0 : undefined;
          const parsedCorrectIndex = Number.parseInt(
            item.correctIndex ?? item.CorrectIndex,
            10,
          );

          return {
            ...item,
            id: item.id ?? item.ExerciseID,
            sentence:
              item.sentence ??
              item["Complete Sentence_FR"] ??
              item["Complete Passage_FR"] ??
              item["Complete Sentence_EN"] ??
              item["Complete Passage_EN"] ??
              "",
            question: item.question ?? item.Question ?? item.Question_EN ?? "",
            options,
            correctIndex: Number.isNaN(parsedCorrectIndex)
              ? uploadedCorrectIndex
              : parsedCorrectIndex,
            translation:
              item.translation ??
              item["Complete Sentence_EN"] ??
              item["Complete Passage_EN"] ??
              item["Correct Answer_EN"] ??
              "",
            timeLimitSeconds:
              item.timeLimitSeconds ?? item.TimeLimitSeconds ?? 45,
          };
        });

        setQuestions(transformed);
      } catch (error) {
        console.error("Error loading mock data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAndTransformQuestions();
  }, []);

  // Reset state on question change
  useEffect(() => {
    if (currentQuestion && !isCompleted) {
      setSelectedOption(null);
      resetTimer();
    }
  }, [currentIndex, currentQuestion, isCompleted, resetTimer]);

  const handleOptionClick = (index) => {
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

  // Fill in the blank in the sentence
  const sentenceWithBlank = currentQuestion?.sentence.replace("___", "______");

  return (
    <>
      <PracticeGameLayout
        questionType="Fill in the Blanks"
        instructionFr="Choisissez la bonne réponse"
        instructionEn="Choose the correct answer"
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
        <div className="flex flex-col lg:flex-row items-center justify-center w-full h-full flex-1 min-h-0 px-4 py-6 gap-8 lg:gap-16">
          {/* Left Column - Main Sentence */}
          <div className="flex-1 w-full max-w-2xl flex items-center justify-center">
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-semibold leading-relaxed text-slate-800 dark:text-slate-100 text-center lg:text-left">
              {sentenceWithBlank}
            </h3>
          </div>

          {/* Right Column - Question & Options */}
          <div className="flex-1 w-full max-w-xl flex flex-col gap-8 justify-center">
            {/* Question */}
            <div className="w-full">
              <h4 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-2">
                {currentQuestion?.question || "Fill in the blank"}
              </h4>

              {/* Translation (Shown after submission) */}
              {showFeedback && currentQuestion?.translation && (
                <div className="mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-lg text-indigo-600 dark:text-indigo-400 font-medium italic">
                    {currentQuestion.translation}
                  </p>
                </div>
              )}
            </div>

            {/* Options Grid */}
            <div className="w-full grid grid-cols-1 gap-4">
              {currentQuestion?.options.map((option, index) => {
                const isSelected = selectedOption === index;
                const isCorrectOption = index === currentQuestion.correctIndex;
                const isWrongSelection =
                  showFeedback && isSelected && !isCorrectOption;
                const isCorrectHighlight = showFeedback && isCorrectOption;

                return (
                  <button
                    key={index}
                    onClick={() => handleOptionClick(index)}
                    disabled={showFeedback}
                    className={cn(
                      "group relative p-4 px-6 rounded-xl border-2 text-left transition-all flex items-center gap-4 bg-white dark:bg-slate-950 shadow-sm min-h-[72px]",
                      // Default state
                      "border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md",
                      // Selected (pre-submission)
                      isSelected &&
                        !showFeedback &&
                        "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10 ring-2 ring-indigo-500",
                      // Feedback: Correct
                      isCorrectHighlight &&
                        "border-green-500 bg-green-50 dark:bg-green-900/20 ring-2 ring-green-500",
                      // Feedback: Wrong
                      isWrongSelection &&
                        "border-red-500 bg-red-50 dark:bg-red-900/20 ring-2 ring-red-500",
                    )}
                  >
                    {/* Selection Indicator */}
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0",
                        isSelected || isCorrectHighlight
                          ? "border-indigo-500 bg-indigo-500 text-white"
                          : "border-slate-300 dark:border-slate-600 group-hover:border-indigo-300",
                        isCorrectHighlight && "border-green-500 bg-green-500",
                        isWrongSelection && "border-red-500 bg-red-500",
                      )}
                    >
                      {isCorrectHighlight && (
                        <span className="font-bold text-xs">✓</span>
                      )}
                      {isWrongSelection && (
                        <span className="font-bold text-xs">✕</span>
                      )}
                      {!isCorrectHighlight &&
                        !isWrongSelection &&
                        isSelected && (
                          <div className="w-2.5 h-2.5 bg-white rounded-full" />
                        )}
                    </div>

                    {/* Option Text */}
                    <div className="flex-1">
                      <p
                        className={cn(
                          "text-lg font-medium transition-colors",
                          isSelected && !showFeedback && "text-indigo-700",
                          isCorrectHighlight && "text-green-700",
                          isWrongSelection && "text-red-700",
                          !isSelected &&
                            !showFeedback &&
                            "text-slate-700 dark:text-slate-200",
                        )}
                      >
                        {option}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </PracticeGameLayout>

      {/* Feedback Banner */}
      {showFeedback && (
        <FeedbackBanner
          isCorrect={isCorrect}
          feedbackTone={isCorrect ? "success" : "error"}
          correctAnswer={!isCorrect ? currentQuestion?.translation : null}
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
