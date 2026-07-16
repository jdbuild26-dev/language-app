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

export default function FillBlanksOptionsPage() {
  const handleExit = usePracticeExit();

  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [selectedOption, setSelectedOption] = useState<any[]>([]);
  const [activeBlankIndex, setActiveBlankIndex] = useState(0);
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
            parsedOptions = ["Error loading options"];
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
          const optionColumns = [
            content.Option1,
            content.Option2,
            content.Option3,
            content.Option4,
          ].filter(Boolean);
          const uploadedOptions =
            uploadedOptionsFr.length > 0
              ? uploadedOptionsFr
              : uploadedOptionsEn.length > 0
                ? uploadedOptionsEn
                : optionColumns;
          const options = (parsedOptions.length > 0 ? parsedOptions : uploadedOptions).filter(Boolean).slice(0, 4);
          const optionTranslations = uploadedOptions === uploadedOptionsFr ? uploadedOptionsEn.slice(0, 4) : [];
          const uploadedCorrectIndex = uploadedOptions.length > 0 ? 0 : undefined;
          const parsedCorrectIndex = Number.parseInt(
            evaluation.correctIndex ??
              item.correctIndex ??
              item.CorrectIndex ??
              item.eval_correctIndex,
            10,
          );
          const correctIndexes = Array.isArray(evaluation.correctIndexes ?? item.correctIndexes)
            ? evaluation.correctIndexes ?? item.correctIndexes
            : [Number.isNaN(parsedCorrectIndex) ? uploadedCorrectIndex : parsedCorrectIndex];
          const blankCount = (String(
            content.sentence ??
              content["Fill Sentence_FR"] ??
              content["Fill Paragraph_EN"] ??
              content.SentenceWithBlank ??
              content["Sentence With Blank"] ??
              content["Complete Sentence_FR"] ??
              content["Complete Passage_FR"] ??
              "",
          ).match(/_{2,}/g) || []).length || 1;

          return {
            ...item,
            id: item.id ?? item.ExerciseID,
            headingFr: item.instruction_fr ?? content.Heading_FR ?? content.Instruction_FR ?? "Fill in the blanks",
            sentence:
              content.sentence ??
              content["Fill Sentence_FR"] ??
              content["Fill Paragraph_EN"] ??
              content.SentenceWithBlank ??
              content["Sentence With Blank"] ??
              content["Complete Sentence_FR"] ??
              content["Complete Passage_FR"] ??
              content["Complete Sentence_EN"] ??
              content["Complete Passage_EN"] ??
              "",
            blank: content.blank ?? item.blank,
            question: content.Question_FR ?? content.question ?? content.Question ?? content.Question_EN ?? "",
            options,
            optionTranslations,
            correctIndex: Number.isNaN(parsedCorrectIndex)
              ? uploadedCorrectIndex
              : parsedCorrectIndex,
            correctIndexes: Array.from(
              { length: blankCount },
              (_, index) => correctIndexes[index] ?? correctIndexes[0],
            ),
            translation:
              evaluation.translation ??
              item.translation ??
              item.eval_translation ??
              content["Complete Sentence_EN"] ??
              content["Complete Passage_EN"] ??
              content["Correct Answer_EN"] ??
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
      setSelectedOption([]);
      setActiveBlankIndex(0);
      resetTimer();
    }
  }, [currentIndex, currentQuestion, isCompleted, resetTimer]);

  const handleOptionClick = (index) => {
    if (showFeedback) return;
    setSelectedOption((prev) => {
      const next = [...prev];
      const correctIndexes = currentQuestion?.correctIndexes || [currentQuestion?.correctIndex];
      if (correctIndexes.length > 1 && String(currentQuestion?.options?.[index] || "").includes("+")) {
        correctIndexes.forEach((_, blankIndex) => {
          next[blankIndex] = index;
        });
      } else {
        next[activeBlankIndex] = index;
      }
      const nextBlank = (currentQuestion?.correctIndexes || [currentQuestion?.correctIndex]).findIndex(
        (_, blankIndex) => next[blankIndex] === undefined,
      );
      setActiveBlankIndex(nextBlank === -1 ? activeBlankIndex : nextBlank);
      return next;
    });
  };

  const handleSubmit = () => {
    const correctIndexes = currentQuestion?.correctIndexes || [currentQuestion?.correctIndex];
    if (showFeedback || correctIndexes.some((_, index) => selectedOption[index] === undefined)) return;

    const correct = correctIndexes.every((correctIndex, index) => selectedOption[index] === correctIndex);
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
  const sentenceForBlank =
    currentQuestion?.sentence.match(/_{2,}/)
      ? currentQuestion.sentence
      : currentQuestion?.blank
        ? currentQuestion.sentence.replace(currentQuestion.blank, "___")
        : currentQuestion?.sentence;
  const sentenceParts = sentenceForBlank?.split(/_{2,}/g) || [];
  const correctIndexes = currentQuestion?.correctIndexes || [currentQuestion?.correctIndex];
  const selectedOptionIndex = selectedOption.find((value) => value !== undefined) ?? null;

  return (
    <>
      <PracticeGameLayout
        questionType="Choose from options"
        instructionFr={currentQuestion?.headingFr || "Choisissez la bonne réponse"}
        instructionEn="Choose the correct answer"
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={questions.length}
        onExit={handleExit}
        onNext={handleSubmit}
        onRestart={() => window.location.reload()}
        disableContentScroll={showFeedback}
        isSubmitEnabled={!correctIndexes.some((_, index) => selectedOption[index] === undefined) && !showFeedback}
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
              showFeedback ? "min-h-[150px] flex-1" : "min-h-[200px] flex-1",
            )}
          >
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-semibold leading-relaxed text-slate-900 dark:text-slate-100 text-center">
              {sentenceParts.map((part, index) => (
                <React.Fragment key={index}>
                  {part}
                  {index < sentenceParts.length - 1 && (
                    <button
                      type="button"
                      disabled={showFeedback}
                      onClick={() => setActiveBlankIndex(index)}
                      className={cn(
                        "mx-1 inline-flex min-w-[6rem] justify-center border-b-[3px] border-slate-300 px-2 text-slate-900 transition-colors dark:border-slate-600 dark:text-slate-100",
                        activeBlankIndex === index && !showFeedback && "border-slate-400 dark:border-slate-500",
                        showFeedback &&
                          selectedOption[index] === correctIndexes[index] &&
                          "border-emerald-500 text-emerald-700 dark:text-emerald-300",
                        showFeedback &&
                          selectedOption[index] !== correctIndexes[index] &&
                          "border-rose-500 text-rose-700 dark:text-rose-300",
                      )}
                    >
                      {selectedOption[index] !== undefined
                        ? String(currentQuestion.options[selectedOption[index]])
                            .split(/\s*\+\s*/)[index] || currentQuestion.options[selectedOption[index]]
                        : "\u00a0"}
                    </button>
                  )}
                </React.Fragment>
              ))}
            </h3>
          </div>

          {/* Question & Options */}
          <div
            className={cn(
              "w-full rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 px-5 md:px-8 flex flex-col",
              showFeedback ? "py-4 gap-3 flex-none" : "py-6 gap-5",
            )}
          >
            {/* Question */}
            <div className="w-full">
              <div className="mb-2 flex items-center gap-2">
                <Languages className="h-5 w-5 text-sky-500" aria-hidden="true" />
                <h4 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                  {currentQuestion?.question || "Fill in the blank"}
                </h4>
              </div>
            </div>

            {/* Options Grid */}
            <PracticeOptions
              options={currentQuestion?.options || []}
              selectedOption={selectedOptionIndex}
              correctIndex={currentQuestion?.correctIndex}
              showFeedback={showFeedback}
              onSelect={handleOptionClick}
              className={cn("grid grid-cols-1 md:grid-cols-2", showFeedback ? "gap-3" : "gap-4")}
              itemClassName={cn("rounded-[22px] border px-5", showFeedback ? "min-h-[74px] py-3" : "min-h-[76px] py-3.5")}
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
            {false && (<div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentQuestion?.options.map((option, index) => {
                const isSelected = selectedOption.includes(index);
                const isCorrectOption = correctIndexes.includes(index);
                const isWrongSelection =
                  showFeedback && isSelected && !isCorrectOption;
                const isCorrectHighlight = showFeedback && isCorrectOption;

                return (
                  <button
                    key={index}
                    onClick={() => handleOptionClick(index)}
                    disabled={showFeedback || !option}
                    className={cn(
                      "group relative px-6 rounded-lg border text-left transition-all flex items-center gap-4 bg-white dark:bg-slate-950 shadow-sm",
                      "min-h-[72px] p-4",
                      // Default state
                      "border-slate-200 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-700 hover:bg-sky-50/40 dark:hover:bg-sky-950/20 hover:shadow-md",
                      // Selected (pre-submission)
                      isSelected &&
                        !showFeedback &&
                        "border-sky-500 bg-sky-50 dark:bg-sky-950/30 ring-2 ring-sky-100 dark:ring-sky-900/60 shadow-md",
                      // Feedback: Correct
                      isCorrectHighlight &&
                        "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 ring-2 ring-emerald-100 dark:ring-emerald-900/60",
                      // Feedback: Wrong
                      isWrongSelection &&
                        "border-rose-500 bg-rose-50 dark:bg-rose-950/30 ring-2 ring-rose-100 dark:ring-rose-900/60",
                    )}
                  >
                    {/* Selection Indicator */}
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0",
                        isSelected || isCorrectHighlight
                          ? "border-sky-500 bg-sky-500 text-white"
                          : "border-slate-300 dark:border-slate-600 group-hover:border-sky-300",
                        isCorrectHighlight && "border-emerald-500 bg-emerald-500",
                        isWrongSelection && "border-rose-500 bg-rose-500",
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
                          isSelected && !showFeedback && "text-sky-800 dark:text-sky-200",
                          isCorrectHighlight && "text-emerald-800 dark:text-emerald-200",
                          isWrongSelection && "text-rose-800 dark:text-rose-200",
                          !isSelected &&
                            !showFeedback &&
                            "text-slate-800 dark:text-slate-200",
                        )}
                      >
                        {option}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>)}
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
