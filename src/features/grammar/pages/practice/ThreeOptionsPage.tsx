"use client";

import React, { useEffect, useState } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Languages, Loader2 } from "lucide-react";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import PracticeOptions from "@/components/ui/PracticeOptions";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { loadMockCSV } from "@/utils/csvLoader";
import { Button } from "@/components/ui/button";

function parseOptions(value: any, fallback: string[]) {
  try {
    if (Array.isArray(value)) return value.map(String);
    if (typeof value === "string" && value.trim()) {
      return JSON.parse(value.replace(/'/g, '"')).map(String);
    }
  } catch (error) {
    console.error("Error parsing options", error);
  }
  return fallback;
}

function uniqueOptions(values: any[], limit: number) {
  return Array.from(new Set(values.filter(Boolean).map(String))).slice(0, limit);
}

export default function ThreeOptionsPage() {
  const handleExit = usePracticeExit();

  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
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
        const data = await loadMockCSV("grammar/three_options.csv", { tag });

        const transformed = ((data as any[]) || []).map((item) => {
          const content = item.content || item;
          const evaluation = item.evaluation || item;
          const parsedOptions = parseOptions(content.options ?? content.Options, []);
          const uploadedOptionsFr = [
            content["Correct Answer_FR"],
            content["Distractor_1_FR"],
            content["Distractor_2_FR"],
          ].filter(Boolean);
          const uploadedOptionsEn = [
            content["Correct Answer_EN"],
            content["Distractor_1_EN"],
            content["Distractor_2_EN"],
          ].filter(Boolean);
          const uploadedOptions = uploadedOptionsFr.length ? uploadedOptionsFr : uploadedOptionsEn;
          const options = uniqueOptions(parsedOptions.length ? parsedOptions : uploadedOptions, 3);
          const optionTranslations = uploadedOptions === uploadedOptionsFr ? uploadedOptionsEn.slice(0, 3) : [];
          const parsedCorrectIndex = Number.parseInt(
            evaluation.correctIndex ?? item.correctIndex ?? item.CorrectIndex ?? item.eval_correctIndex,
            10,
          );
          const correctIndex = Number.isNaN(parsedCorrectIndex) ? (uploadedOptions.length ? 0 : 0) : parsedCorrectIndex;
          const sentenceFr =
            content["Complete Sentence_FR"] ??
            content["Complete Sentence _FR"] ??
            content["Complete Passage_FR"] ??
            content["Fill Paragraph_FR"] ??
            content.sentence ??
            "";
          const sentenceEn =
            content["Complete Sentence_EN"] ??
            content["Complete Sentence _EN"] ??
            content["Complete Passage_EN"] ??
            content["Fill Paragraph_EN"] ??
            content.translation ??
            item.translation ??
            "";

          return {
            ...item,
            sentence: sentenceFr || sentenceEn || item.sentence || "",
            sentenceTranslation: sentenceFr ? sentenceEn : "",
            question:
              content.Question_FR ??
              content.question ??
              content.Question ??
              content.Question_EN ??
              "Choose the correct option",
            options,
            optionTranslations,
            correctIndex,
            correctAnswer: options[correctIndex] || options[0] || "",
            englishCorrectAnswer: optionTranslations[correctIndex] || "",
            timeLimitSeconds: item.timeLimitSeconds ?? item.TimeLimitSeconds ?? 45,
          };
        }).filter((question) => question.options.length >= 2);

        setQuestions(transformed);
      } catch (error) {
        console.error("Error loading mock data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAndTransformQuestions();
  }, []);

  useEffect(() => {
    if (currentQuestion && !isCompleted) {
      setSelectedOption(null);
      resetTimer();
    }
  }, [currentIndex, currentQuestion, isCompleted, resetTimer]);

  const handleSubmit = () => {
    if (showFeedback || selectedOption === null) return;
    const correct = selectedOption === currentQuestion.correctIndex;
    setIsCorrect(correct);
    setFeedbackMessage(getFeedbackMessage(correct));
    setShowFeedback(true);
    if (correct) setScore((prev) => prev + 1);
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
        <p className="text-xl text-slate-600 dark:text-slate-400">No content available.</p>
        <Button onClick={() => handleExit()} variant="outline" className="mt-4">
          Back
        </Button>
      </div>
    );
  }

  const progress = ((currentIndex + 1) / questions.length) * 100;
  const sentenceWithBlank = currentQuestion?.sentence?.replace("___", "______");

  return (
    <>
      <PracticeGameLayout
        questionType="Choose from 3 Options"
        instructionFr="Choisissez la bonne reponse"
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
        <div className="flex flex-col w-full h-full flex-1 min-h-0 px-4 md:px-10 bg-[#f7f8fb] dark:bg-slate-950 py-6 gap-6">
          <div className="w-full rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950 flex flex-col items-center justify-center px-6 py-8 min-h-[170px]">
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-semibold leading-relaxed text-slate-900 dark:text-slate-100 text-center">
              {sentenceWithBlank}
            </h3>
            {currentQuestion?.sentenceTranslation && (
              <p className="mt-3 flex items-center gap-2 text-base md:text-lg font-medium italic text-slate-500 dark:text-slate-400 text-center">
                <Languages className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                <span>{currentQuestion.sentenceTranslation}</span>
              </p>
            )}
          </div>

          <div className="w-full rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 px-5 md:px-8 py-6 flex flex-col gap-5">
            <div className="mb-2 flex items-center gap-2">
              <Languages className="h-5 w-5 text-sky-500" aria-hidden="true" />
              <h4 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                {currentQuestion?.question || "Choose the correct option"}
              </h4>
            </div>

            <PracticeOptions
              options={currentQuestion?.options || []}
              selectedOption={selectedOption}
              correctIndex={currentQuestion?.correctIndex}
              showFeedback={showFeedback}
              onSelect={setSelectedOption}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
              itemClassName="rounded-[22px] border px-5 min-h-[82px] py-3.5"
              showCheckIcon
              renderLabel={(option, index) => (
                <>
                  <span className="text-lg font-semibold leading-snug">{option}</span>
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
      </PracticeGameLayout>

      {showFeedback && (
        <FeedbackBanner
          isCorrect={isCorrect}
          feedbackTone={isCorrect ? "success" : "error"}
          correctAnswer={!isCorrect ? currentQuestion?.correctAnswer : null}
          englishCorrectAnswer={!isCorrect ? currentQuestion?.englishCorrectAnswer : ""}
          onContinue={handleContinue}
          message={feedbackMessage}
          continueLabel={currentIndex + 1 === questions.length ? "FINISH" : "CONTINUE"}
        />
      )}
    </>
  );
}
