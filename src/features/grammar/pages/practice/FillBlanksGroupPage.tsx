"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { loadMockCSV } from "@/utils/csvLoader";
import { Button } from "@/components/ui/button";

const splitAnswerParts = (value, { preserveEmpty = false } = {}) => {
  if (value === undefined || value === null || String(value) === "") return [];
  const parts = String(value)
    .split(/\s*\+\s*/)
    .map((part) => part.trim());
  return preserveEmpty ? parts : parts.filter(Boolean);
};

const alignHintsToBlanks = (hints, blankCount) =>
  Array.from({ length: blankCount }, (_, index) => hints[index] || "");

const normalizeAnswer = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[.,!?;:'"()[\]{}\-_/\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export default function FillBlanksGroupPage({ type = "simple" }) {
  const handleExit = usePracticeExit();

  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [inputs, setInputs] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);

  // We need to store focus state to hide hints when input is focused
  const [focusedInput, setFocusedInput] = useState(null);

  const currentQuestion = questions[currentIndex];
  // Default to 60 seconds if not specified
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
        const tag = new URLSearchParams(window.location.search).get("tag") || undefined;
        const file =
          type === "question"
            ? "grammar/grammar_fill_blanks_question.csv"
            : "grammar/grammar_fill_blanks.csv";
        let data = await loadMockCSV(file, { tag });

        if (type === "simple" && tag && (!data || data.length === 0)) {
          data = await loadMockCSV("grammar/fill_blanks_options.csv", { tag });
        }

        const transformed = data.map((item) => {
          const content = item.content || item;
          const evaluation = item.evaluation || item;
          const blanksData = evaluation.blanksData || item.blanksData || {};
          const blanksFromEvaluation = Object.keys(blanksData)
            .sort((a, b) => Number(a) - Number(b))
            .map((key) => blanksData[key]?.correct || blanksData[key])
            .filter(Boolean);
          const answerFrValue =
            content["Correct Answer_FR"] ||
            content["Correct answer_FR"] ||
            content.CorrectAnswer_FR ||
            item.blanks;
          const answerEnValue =
            content["Correct Answer_EN"] ||
            content["Correct answer_EN"] ||
            content.CorrectAnswer_EN ||
            item.hints;
          const hasCsvEnglishAnswers =
            content["Correct Answer_EN"] !== undefined ||
            content["Correct answer_EN"] !== undefined ||
            content.CorrectAnswer_EN !== undefined;

          const blanks =
            blanksFromEvaluation.length > 0
              ? blanksFromEvaluation
              : Array.isArray(item.blanks)
                ? item.blanks
                : splitAnswerParts(answerFrValue);
          const hintParts = Array.isArray(item.hints)
            ? item.hints.map((hint) => String(hint || "").trim())
            : splitAnswerParts(answerEnValue, { preserveEmpty: hasCsvEnglishAnswers });
          const sentence =
            content.sentence ||
            content["Fill Sentence_FR"] ||
            content["Fill Paragraph_FR"] ||
            content.SentenceWithBlank ||
            content["Sentence With Blank"] ||
            content["Complete Sentence_FR"] ||
            content["Complete Passage_FR"] ||
            item.sentence ||
            "";

          return {
            ...item,
            question: content.Question_FR || content.question || item.question || "",
            sentence,
            blanks,
            hints: alignHintsToBlanks(hintParts, blanks.length),
            translation:
              content["Complete Passage_EN"] ||
              content["Complete Sentence_EN"] ||
              content["Fill Paragraph_EN"] ||
              item.translation ||
              "",
          };
        }).filter((item) => item.sentence && item.blanks.length > 0);

        setQuestions(transformed || []);
      } catch (error) {
        console.error("Error loading questions:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, [type]);

  // Reset state on question change
  useEffect(() => {
    if (currentQuestion && !isCompleted) {
      setInputs({});
      setShowFeedback(false);
      resetTimer();
    }
  }, [currentIndex, currentQuestion, isCompleted, resetTimer]);

  const handleInputChange = (index, value) => {
    setInputs((prev) => ({ ...prev, [index]: value }));
  };

  const handleSubmit = () => {
    if (showFeedback) return;

    // Validate inputs
    // We assume blank order corresponds to input order
    // But wait, the sentence structure is "J'ai ___ un chat."
    // We need to render the sentence and inject inputs at ___

    // Check correctness
    let allCorrect = true;
    const blankValues = currentQuestion.blanks;

    // We need to map inputs to blanks.
    // This logic depends on how we render.
    // If we have 1 blank, input index 0 corresponds to blank 0.

    for (let i = 0; i < blankValues.length; i++) {
      const userVal = normalizeAnswer(inputs[i]);
      const correctVal = normalizeAnswer(blankValues[i]);
      if (userVal !== correctVal) {
        allCorrect = false;
      }
    }

    setIsCorrect(allCorrect);
    setFeedbackMessage(getFeedbackMessage(allCorrect));
    setShowFeedback(true);

    if (allCorrect) {
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

  // Helper to render sentence with inputs
  const renderSentence = () => {
    const parts = currentQuestion.sentence.split(/(?:\[\d+\]\s*)?_{2,}/g);
    // parts length will be blanks.length + 1

    const elements = [];
    parts.forEach((part, index) => {
      elements.push(
        <span key={`text-${index}`} className="leading-loose">
          {part}
        </span>,
      );

      if (index < parts.length - 1) {
        // Render input
        const hint = currentQuestion.hints[index] || "";
        const val = inputs[index] || "";
        const isFocused = focusedInput === index;

        const isWrong =
          showFeedback &&
          normalizeAnswer(val) !== normalizeAnswer(currentQuestion.blanks[index]);
        const isRight =
          showFeedback &&
          normalizeAnswer(val) === normalizeAnswer(currentQuestion.blanks[index]);

        elements.push(
          <span
            key={`input-${index}`}
            className="relative inline-block mx-2 align-baseline"
          >
            <input
              type="text"
              value={val}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onFocus={() => setFocusedInput(index)}
              onBlur={() => setFocusedInput(null)}
              disabled={showFeedback}
              className={cn(
                "w-36 border-0 border-b-2 bg-transparent px-1 pb-1 text-center text-[1em] leading-none font-medium outline-none transition-all",
                "border-slate-300 dark:border-slate-600 focus:border-indigo-500 dark:focus:border-indigo-400",
                // Placeholder styling simulation mechanism if we want hint to disappear on CLICK/FOCUS
                // Native placeholder disappears on type usually, but user asked: "Word will be given in English... when they click on it... the English word goes"
                // Standard placeholder behavior is: shows if empty. Disappears if typed.
                // BUT user said "when they click on it". So on FOCUS.
                // We can use actual placeholder prop but manage visibility via focus state/value?
                // Actually, standard placeholder stays until type.
                // To make it vanish on focus, we iterate:
                val === "" && !isFocused
                  ? "text-transparent"
                  : "text-slate-900 dark:text-white", // Hide value if empty+not focused? No, value is empty.

                isWrong && "border-red-500 text-red-600",
                isRight && "border-green-500 text-green-600",
              )}
              autoComplete="off"
            />
            {/* Custom Placeholder Overlay that disappears on Focus */}
            {val === "" && !isFocused && (
              <span className="pointer-events-none absolute inset-x-1 bottom-1 flex items-baseline justify-center text-[1em] leading-none text-slate-400 italic">
                {hint}
              </span>
            )}
          </span>,
        );
      }
    });
    return elements;
  };

  return (
    <>
      <PracticeGameLayout
        questionType={
          type === "question" ? "Question & Answer" : "Fill in the Blanks"
        }
        instructionFr="Complétez la phrase"
        instructionEn="Fill in the blanks with the correct French words"
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={questions.length}
        onExit={handleExit}
        onNext={handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={true} // Allow check anytime? Or check if inputs filled? User didn't specify, standard is usually enabled.
        showSubmitButton={!showFeedback}
        submitLabel="Check"
        timerValue={timerString}
      >
        <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto px-4 py-6 min-h-[50vh] gap-8">
          {/* Question Prompt (only for 'question' type) */}
          {type === "question" && currentQuestion.question && (
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl border-2 border-indigo-100 dark:border-indigo-900/50 shadow-sm w-full max-w-2xl text-center">
              <h3 className="text-xl md:text-2xl font-bold text-indigo-900 dark:text-indigo-200">
                {currentQuestion.question}
              </h3>
            </div>
          )}

          {/* Sentence Area */}
          <div className="text-2xl md:text-3xl lg:text-4xl leading-relaxed text-center text-slate-800 dark:text-slate-100 font-medium max-w-3xl">
            {renderSentence()}
          </div>

          {/* Translation (Shown after submission) */}
          {showFeedback && currentQuestion?.translation && (
            <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <p className="text-lg text-indigo-600 dark:text-indigo-400 font-medium italic">
                {currentQuestion.translation}
              </p>
            </div>
          )}
        </div>
      </PracticeGameLayout>

      {/* Feedback Banner */}
      {showFeedback && (
        <FeedbackBanner
          isCorrect={isCorrect}
          correctAnswer={
            !isCorrect ? `Correct: ${currentQuestion.blanks.join(", ")}` : null
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
