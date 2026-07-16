"use client";

import React, { useState, useEffect } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Languages, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { loadMockCSV } from "@/utils/csvLoader";
import { Button } from "@/components/ui/button";

export default function RewriteSentencePage({ mode = "transformation" }) {
  const handleExit = usePracticeExit();

  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [userInput, setUserInput] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);
  const [showInstructionTranslation, setShowInstructionTranslation] = useState(false);

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

        const tag = new URLSearchParams(window.location.search).get("tag") || undefined;
        const data = await loadMockCSV(file, { tag });
        const transformed = ((data as any[]) || []).map((item) => {
          const content = item.content || item;
          const evaluation = item.evaluation || item;
          const uploadedAnswers = [
            content["Correct Answer_FR_1"],
            content["Correct Answer_FR_2"],
            content["Correct Answer_FR_3"],
            content["Correct Answer_1_FR"],
            content["Correct Answer_2_FR"],
            content["Correct Answer_3_FR"],
            content["Correct Answer_FR"],
            content["Correct answer_FR"],
            content["CorrectAnswer_FR"]
          ].flatMap((answer) =>
            Array.isArray(answer)
              ? answer
              : String(answer || "")
                  .split("|")
                  .map((value) => value.trim()),
          ).filter(Boolean);

          return {
            ...item,
            instruction:
              content.instruction ??
              content.Instruction ??
              content.Instruction_FR ??
              content.Instruction_EN ??
              content.localizedInstruction ??
              "",
            instructionTranslation:
              content.instructionTranslation ??
              content.Instruction_EN ??
              content["Instruction_EN"] ??
              "",
            sentence:
              content.sentence ??
              content.CompleteSentence_FR ??
              content["CompleteSentence_FR"] ??
              content["Complete Sentence_FR"] ??
              content["Complete Passage_FR"] ??
              content["Complete Sentence_EN"] ??
              content.sourceText ??
              "",
            acceptedAnswers: uploadedAnswers,
            answer: uploadedAnswers.join("|"),
            translation:
              evaluation.translation ??
              item.translation ??
              item.eval_translation ??
              content.CompleteSentence_EN ??
              content["CompleteSentence_EN"] ??
              content["Complete Sentence_EN"] ??
              "",
            timeLimitSeconds:
              item.timeLimitSeconds ?? item.TimeLimitSeconds ?? 60,
          };
        });
        setQuestions(transformed);
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
      setShowInstructionTranslation(false);
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
    const allowedAnswers =
      currentQuestion.acceptedAnswers?.length > 0
        ? currentQuestion.acceptedAnswers
        : currentQuestion.answer.split("|");

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
  const displayInstruction =
    currentQuestion?.instruction || "Rewrite the sentence";
  const displayInstructionTranslation =
    currentQuestion?.instructionTranslation || "";

  return (
    <>
      <PracticeGameLayout
        questionType={
          mode === "combination"
            ? "Combine Sentences"
            : false && mode === "rewrite"
              ? "Rewrite – Type in"
              : "Rewrite the sentence"
        }
        instructionFr={
          mode === "combination"
            ? currentQuestion.instruction
            : displayInstruction
        }
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
        disableContentScroll={showFeedback}
        isSubmitEnabled={userInput.length > 0}
        showSubmitButton={!showFeedback}
        submitLabel="Check"
        timerValue={timerString}
      >
        <div
          className={cn(
            "flex flex-col items-center w-[calc(100%-4rem)] max-w-[1500px] mx-auto h-full flex-1 min-h-0 px-8 md:px-14 rounded-[2rem]",
            showFeedback ? "pt-4 pb-[150px] gap-4" : "py-8 gap-5",
          )}
        >
          <div className="w-full max-w-5xl flex items-center justify-center gap-2 text-center">
 {displayInstructionTranslation && (
              <button
                type="button"
                className="shrink-0 text-slate-400 hover:text-sky-500 transition-colors"
                title="Toggle translation"
                aria-label="Toggle translation"
                onClick={() => setShowInstructionTranslation((value) => !value)}
              >
                <Languages className="h-4 w-4" />
              </button>
            )}
            <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
              {showInstructionTranslation && displayInstructionTranslation
                ? displayInstructionTranslation
                : displayInstruction}
            </h3>
          </div>

          {/* Source Sentence */}
          <div
            className={cn(
              "w-full max-w-5xl flex items-center justify-center text-center",
              showFeedback ? "min-h-[86px] flex-none" : "min-h-[110px] flex-none",
            )}
          >
            <p className="text-2xl md:text-3xl lg:text-4xl text-slate-800 dark:text-slate-100 font-semibold leading-relaxed">
              {currentQuestion.sentence}
            </p>
          </div>

          {/* Input Area */}
          <div className="w-full max-w-none">
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              disabled={showFeedback}
              placeholder="Type your answer here..."
              className={cn(
                "w-full bg-slate-100 dark:bg-slate-800 border rounded-xl p-6 text-xl md:text-2xl resize-none outline-none transition-all",
                showFeedback ? "min-h-[130px]" : "min-h-[220px]",
                "focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 placeholder:text-slate-300 dark:placeholder:text-slate-600",
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

            {showFeedback && currentQuestion?.acceptedAnswers?.length > 0 && (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  Correct rewritten sentence:
                </p>
                <p className="mt-2 text-base md:text-lg font-semibold text-emerald-700 dark:text-emerald-300">
                  {currentQuestion.acceptedAnswers[0]}
                </p>
                {currentQuestion.translation && (
                  <p className="mt-3 text-sm md:text-base font-medium italic text-slate-500 dark:text-slate-400">
                    {currentQuestion.translation}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </PracticeGameLayout>

      {/* Feedback Banner */}
      {showFeedback && (
        <FeedbackBanner
          isCorrect={isCorrect}
          feedbackTone={isCorrect ? "success" : "error"}
          correctAnswer={!isCorrect ? currentQuestion.acceptedAnswers?.[0] || currentQuestion.answer.split("|")[0] : null}
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
