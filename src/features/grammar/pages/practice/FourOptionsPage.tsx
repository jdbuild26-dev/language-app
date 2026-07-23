"use client";

import React, { useState, useEffect } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Languages, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import PracticeOptions from "@/components/ui/PracticeOptions";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { loadMockCSV } from "@/utils/csvLoader";
import { Button } from "@/components/ui/button";

export default function FourOptionsPage() {
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
  // Default to 45 seconds if not specified
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
        const data = (await loadMockCSV("grammar/four_options.csv", { tag })) as any[];

        if (!data || data.length === 0) {
          setQuestions([]);
          setIsLoading(false);
          return;
        }

        // Transform data into the stable frontend model used by this page.
        const transformed = (data as any[]).map((item) => {
          const content = item.content || item;
          const evaluation = item.evaluation || item;
          let parsedOptions: any[] = [];
          try {
            if (Array.isArray(content.options)) {
              parsedOptions = content.options;
            } else if (typeof content.options === "string") {
              parsedOptions = JSON.parse(content.options.replace(/'/g, '"'));
            } else if (Array.isArray(content.Options)) {
              parsedOptions = content.Options;
            } else if (typeof content.Options === "string") {
              parsedOptions = JSON.parse(content.Options.replace(/'/g, '"'));
            }
          } catch (e) {
            console.error("Error parsing options", e);
            parsedOptions = ["Option A", "Option B", "Option C", "Option D"]; // Default fallback
          }

          const uploadedOptionsFr = [
            content["Correct Answer_FR"],
            content["Distractor_1_FR"],
            content["Distractor_2_FR"],
            content["Distractor_3_FR"],
          ].filter(Boolean);
          const uploadedOptionsEn = [
            content["Correct Answer_EN"],
            content["Distractor_1_EN"],
            content["Distractor_2_EN"],
            content["Distractor_3_EN"],
          ].filter(Boolean);
          const uploadedOptionsGeneric = [
            content["Correct Answer"],
            content.CorrectAnswer,
            content.answer,
            content["Distractor_1"],
            content["Distractor_2"],
            content["Distractor_3"],
          ].filter(Boolean);
          const uploadedOptions =
            uploadedOptionsFr.length > 0
              ? uploadedOptionsFr
              : uploadedOptionsEn.length > 0
                ? uploadedOptionsEn
                : uploadedOptionsGeneric;
          const options = Array.from(
            new Set((parsedOptions.length > 0 ? parsedOptions : uploadedOptions).filter(Boolean).map(String)),
          ).slice(0, 4);
          const optionTranslations = uploadedOptions === uploadedOptionsFr ? uploadedOptionsEn.slice(0, 4) : [];
          const uploadedCorrectIndex = uploadedOptions.length > 0 ? 0 : undefined;
          const parsedCorrectIndex = Number.parseInt(
            evaluation.correctIndex ?? item.correctIndex ?? item.CorrectIndex ?? item.eval_correctIndex,
            10,
          );
          const correctIndex = Number.isNaN(parsedCorrectIndex)
            ? uploadedCorrectIndex
            : parsedCorrectIndex;
          const correctAnswer = options[correctIndex ?? 0] || options[0] || "";
          const englishCorrectAnswer = optionTranslations[correctIndex ?? 0] || "";
          const completeSentence =
            content["Complete Sentence_FR"] ??
            content["Complete Sentence _FR"] ??
            content["Complete Passage_FR"] ??
            content["Fill Paragraph_FR"] ??
            content["Masked Answer_FR"] ??
            content.sentence ??
            content["Complete Sentence_EN"] ??
            content["Complete Sentence _EN"] ??
            content["Complete Passage_EN"] ??
            content["Fill Paragraph_EN"] ??
            content["Masked Answer_EN"] ??
            content.sourceText ??
            "";
          const promptQuestion =
            content["Question_FR"] ??
            content.Question_FR ??
            content.question_fr ??
            content.question ??
            content.Question ??
            content["Question_EN"] ??
            content.Question_EN ??
            content.translation ??
            item.question ??
            item.Question ??
            completeSentence ??
            "";
          const instruction =
            content.instruction_fr ??
            content.Instruction_FR ??
            content.instruction ??
            content.instruction_en ??
            content.Instruction_EN ??
            "Choose the correct option";

          return {
            ...item,
            id: item.id ?? item.ExerciseID,
            sentence: promptQuestion,
            completedSentence: completeSentence,
            question: instruction,
            options,
            optionTranslations,
            correctIndex,
            correctAnswer,
            englishCorrectAnswer,
            translation:
              evaluation.translation ??
              item.translation ??
              item.eval_translation ??
              content["Complete Sentence_EN"] ??
              content["Complete Passage_EN"] ??
              "",
            timeLimitSeconds:
              item.timeLimitSeconds ?? item.TimeLimitSeconds ?? 45,
          };
        }).filter((question) => {
          const optionCount = question.options.filter(Boolean).length;
          return optionCount >= 2 && optionCount <= 4;
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

  return (
    <>
      <PracticeGameLayout
        questionType="Choose from Options"
        instructionFr="Choisissez la bonne réponse"
        instructionEn="Choose the correct answer"
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={questions.length}
        onExit={handleExit}
        onNext={handleSubmit}
        onRestart={() => window.location.reload()}
        disableContentScroll={showFeedback}
        isSubmitEnabled={selectedOption !== null && !showFeedback}
        showSubmitButton={!showFeedback}
        submitLabel="Check"
        timerValue={timerString}
      >
        <div
          className={cn(
            "flex flex-col w-full h-full flex-1 min-h-0 px-4 md:px-10 bg-[#f7f8fb] dark:bg-slate-950",
            showFeedback ? "pt-3 pb-[128px] gap-3" : "py-6 gap-6",
          )}
        >
          {/* Main Sentence */}
          <div
            className={cn(
              "w-full rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950 flex items-center justify-center px-6 transition-all duration-300 ease-out min-h-0",
              showFeedback ? "min-h-[120px] flex-[0.8]" : "min-h-[150px] flex-[0.85]",
            )}
          >
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-semibold leading-relaxed text-slate-900 dark:text-slate-100 text-center">
              {showFeedback
                ? currentQuestion?.completedSentence || currentQuestion?.sentence
                : currentQuestion?.sentence}
            </h3>
          </div>

          {/* Question & Options */}
          <div
            className={cn(
              "w-full rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 px-5 md:px-8 flex flex-col",
              showFeedback ? "py-4 gap-3 flex-none" : "py-6 gap-5",
            )}
          >
            <div className="w-full">
              <div className="mb-2 flex items-center gap-2">
                <Languages className="h-5 w-5 text-sky-500" aria-hidden="true" />
                <h4 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                  {currentQuestion?.question || "Choose the correct option"}
                </h4>
              </div>
            </div>

            <PracticeOptions
              options={currentQuestion?.options || []}
              selectedOption={selectedOption}
              correctIndex={currentQuestion?.correctIndex}
              showFeedback={showFeedback}
              onSelect={handleOptionClick}
              className={cn("grid grid-cols-1 md:grid-cols-2", showFeedback ? "gap-3" : "gap-4")}
              itemClassName={cn("rounded-[22px] border px-5", showFeedback ? "min-h-[82px] py-3.5" : "min-h-[88px] py-4")}
              showCheckIcon
              renderLabel={(option, index) => (
                <>
                  <span className="text-lg font-semibold leading-snug">
                    {option}
                  </span>
                  {showFeedback && currentQuestion?.optionTranslations?.[index] && (
                    <span className="mt-1 flex items-center gap-1.5 text-sm font-medium leading-snug text-slate-500 dark:text-slate-400">
                      <Languages className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                      <span>{currentQuestion.optionTranslations[index]}</span>
                    </span>
                  )}
                </>
              )}
            />
          </div>
        </div>
        {false && (<div className="flex flex-col lg:flex-row items-center justify-center w-full h-full flex-1 min-h-0 px-4 py-6 gap-8 lg:gap-16">
          {/* Left Column - Sentence/Passage */}
          <div className="flex-1 w-full max-w-2xl flex items-center justify-center">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-8 border-2 border-slate-200 dark:border-slate-700 shadow-sm w-full">
              <h3 className="text-xl md:text-2xl font-semibold leading-relaxed text-slate-800 dark:text-slate-100 text-center lg:text-left">
                {currentQuestion?.sentence}
              </h3>
            </div>
          </div>

          {/* Right Column - Question and Options */}
          <div className="flex-1 w-full max-w-xl flex flex-col gap-8 justify-center">
            {/* Question */}
            <div className="w-full">
              <h4 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-2">
                {currentQuestion?.question}
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

            {/* Options */}
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
                    disabled={showFeedback || !option}
                    className={cn(
                      "group relative p-4 px-6 rounded-xl border-2 text-left transition-all flex items-center gap-4 bg-white dark:bg-slate-950 shadow-sm min-h-[70px]",
                      "border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md",
                      isSelected &&
                        !showFeedback &&
                        "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10 ring-2 ring-indigo-500",
                      isCorrectHighlight &&
                        "border-green-500 bg-green-50 dark:bg-green-900/20 ring-2 ring-green-500",
                      isWrongSelection &&
                        "border-red-500 bg-red-50 dark:bg-red-900/20 ring-2 ring-red-500",
                    )}
                  >
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
        </div>)}
      </PracticeGameLayout>

      {/* Feedback Banner */}
      {showFeedback && (
        <FeedbackBanner
          isCorrect={isCorrect}
          feedbackTone={isCorrect ? "success" : "error"}
          correctAnswer={!isCorrect ? currentQuestion?.correctAnswer : null}
          englishCorrectAnswer={!isCorrect ? currentQuestion?.englishCorrectAnswer : ""}
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
