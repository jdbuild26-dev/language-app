"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { fetchPracticeData } from "@/utils/practiceFetcher";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { Button } from "@/components/ui/button";
import { TranslateButton } from "@/components/ui/TranslateButton";

const ACCENT_KEYS = ["é", "è", "ê", "à", "ç", "â", "î", "ô", "û", "ë", "ï", "ü"];

/** Normalise a string for loose comparison: lowercase, trim, collapse spaces, strip punctuation */
function normalise(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[''`]/g, "'")
    .replace(/[^\w\s']/g, "")
    .replace(/\s+/g, " ");
}

function isAnswerCorrect(userInput: string, question: any): boolean {
  const user = normalise(userInput);
  const candidates: string[] = [];

  if (Array.isArray(question?.acceptableAnswers)) {
    candidates.push(...question.acceptableAnswers.map(String));
  }
  if (question?.correctAnswer) candidates.push(String(question.correctAnswer));

  return candidates.some((c) => normalise(c) === user);
}

/** Normalise a raw API item into the shape this page expects */
function normaliseQuestion(raw: any) {
  // Resolve source text (English sentence the user must translate)
  const sourceText =
    raw.sourceText ||
    raw.SourceText ||
    raw.source_text ||
    raw["Complete Sentence_EN"] ||
    raw["Complete Sentence_en"] ||
    raw.Question ||
    raw.question ||
    "";

  // Resolve correct answer (French translation) — be explicit, never fall back to English fields
  const correctAnswer =
    raw["Correct answer_FR"] ||
    raw["Correct answer_fr"] ||
    raw["correct answer_fr"] ||
    raw["Complete Sentence_FR"] ||
    raw["Complete Sentence_fr"] ||
    raw.correctAnswer_fr ||
    // Only use generic correctAnswer if it's clearly not the same as sourceText
    (raw.correctAnswer && raw.correctAnswer !== sourceText ? raw.correctAnswer : "") ||
    (raw.CorrectAnswer && raw.CorrectAnswer !== sourceText ? raw.CorrectAnswer : "") ||
    "";

  // Resolve acceptable answers array
  const acceptableAnswers: string[] = (() => {
    if (Array.isArray(raw.acceptableAnswers) && raw.acceptableAnswers.length > 0) {
      // Filter out any English sentences that snuck in
      const filtered = raw.acceptableAnswers.filter((a: string) => a !== sourceText);
      if (filtered.length > 0) return filtered;
    }
    const raw_aa =
      raw["Correct answer_FR"] ||
      raw["Correct answer_fr"] ||
      raw.AcceptableAnswers ||
      correctAnswer;
    if (typeof raw_aa === "string" && raw_aa.includes("|"))
      return raw_aa.split("|").map((s: string) => s.trim()).filter(Boolean);
    return correctAnswer ? [correctAnswer] : [];
  })();

  const timeLimitSeconds =
    raw.timeLimitSeconds ||
    raw.TimeLimitSeconds ||
    raw.config?.timeLimitSeconds ||
    60;

  return {
    ...raw,
    sourceText,
    correctAnswer,
    acceptableAnswers,
    timeLimitSeconds,
  };
}

export default function TranslateTypedPage() {
  const handleExit = usePracticeExit();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showQuestionTranslation, setShowQuestionTranslation] = useState(false);
  const [showAnswerTranslation, setShowAnswerTranslation] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchPracticeData("translate_typed");
        setQuestions(data.map(normaliseQuestion));
      } catch (err) {
        console.error("[TranslateTypedPage] Failed to load exercises:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const currentQuestion = questions[currentIndex];
  const timerDuration = currentQuestion?.timeLimitSeconds || 60;

  const { timerString, resetTimer } = useExerciseTimer({
    duration: timerDuration,
    mode: "timer",
    onExpire: () => {
      if (currentQuestion && !isCompleted && !showFeedback) {
        setIsCorrect(false);
        setFeedbackMessage("Time's up!");
        setShowFeedback(true);
      }
    },
    isPaused: isLoading || isCompleted || showFeedback,
  });

  useEffect(() => {
    if (currentQuestion && !isCompleted) {
      setUserInput("");
      setShowQuestionTranslation(false);
      setShowAnswerTranslation(false);
      resetTimer();
    }
  }, [currentIndex, currentQuestion, isCompleted, resetTimer]);

  const handleSubmit = () => {
    if (showFeedback || !userInput.trim()) return;
    const correct = isAnswerCorrect(userInput, currentQuestion);
    setIsCorrect(correct);
    setFeedbackMessage(getFeedbackMessage(correct));
    if (correct) setScore((prev) => prev + 1);
    setShowFeedback(true);
  };

  const handleContinue = () => {
    setShowFeedback(false);
    setFeedbackMessage("");
    setShowQuestionTranslation(false);
    setShowAnswerTranslation(false);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && !showFeedback && userInput.trim()) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const correctAnswer = currentQuestion?.correctAnswer || currentQuestion?.acceptableAnswers?.[0] || "";
  const characterLimit = Math.max(
    100,
    correctAnswer.length,
    ...(currentQuestion?.acceptableAnswers || []).map((answer: string) => answer.length),
  );

  const insertCharacter = (char: string) => {
    const el = textareaRef.current;
    if (!el || showFeedback) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const nextValue = userInput.slice(0, start) + char + userInput.slice(end);
    if (nextValue.length > characterLimit) return;
    setUserInput(nextValue);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + 1, start + 1);
    });
  };

  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  return (
    <PracticeGameLayout
        questionType="Translate the Sentence"
        instructionFr="Traduisez la phrase en français"
        instructionEn="Translate the sentence into French"
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        currentQuestionIndex={currentIndex}
        totalQuestions={questions.length}
        onExit={handleExit}
        onNext={showFeedback ? handleContinue : handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={showFeedback || userInput.trim().length > 0}
        showSubmitButton
        showFeedback={showFeedback}
        isCorrect={isCorrect}
        feedbackMessage={feedbackMessage}
        feedbackInFlow
        compactFeedback
        onFeedbackTranslate={() => setShowAnswerTranslation((visible) => !visible)}
        feedbackTranslationVisible={showAnswerTranslation}
        submitLabel={showFeedback ? (currentIndex + 1 === questions.length ? "Finish" : "Continue") : "Check"}
        timerValue={timerString}
      >
        <div className="mx-auto flex w-full max-w-[888px] flex-col px-4 pb-8 pt-8 sm:px-6 sm:pt-12">
          <div className="flex min-h-[76px] w-full items-center justify-center self-center text-center sm:min-h-[84px]">
            <p className="practice-type-content-large min-w-0 break-words font-medium text-slate-900 dark:text-slate-100">
              {showFeedback && showQuestionTranslation ? correctAnswer : currentQuestion?.sourceText}
            </p>
            {showFeedback && (
              <TranslateButton
                onClick={() => setShowQuestionTranslation((visible) => !visible)}
                aria-label={showQuestionTranslation ? "Show English question" : "Translate question to French"}
                aria-pressed={showQuestionTranslation}
                title={showQuestionTranslation ? "Show English" : "Translate to French"}
                className="ml-1 h-10 w-10"
              />
            )}
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-2.5 sm:mt-12" aria-label="French accent keyboard">
            {ACCENT_KEYS.map((char) => (
              <button
                key={char}
                type="button"
                disabled={showFeedback || userInput.length >= characterLimit}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => insertCharacter(char)}
                aria-label={`Insert ${char}`}
                className="flex h-[50px] w-[50px] items-center justify-center rounded-2xl border border-slate-200 bg-white text-base font-semibold text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-[background-color,border-color,box-shadow,transform] duration-150 hover:border-sky-300 hover:bg-sky-50 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 motion-safe:active:scale-[0.94] motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                {char}
              </button>
            ))}
          </div>

          <div className="relative mt-8 w-full sm:mt-9">
            {showFeedback && (
              <TranslateButton
                iconVariant="option"
                iconSize="md"
                onClick={() => setShowAnswerTranslation((visible) => !visible)}
                aria-label={showAnswerTranslation ? "Show correct French sentence" : "Translate answer to English"}
                aria-pressed={showAnswerTranslation}
                title={showAnswerTranslation ? "Show French" : "Translate to English"}
                className="absolute left-4 top-4 z-10 h-10 w-10 rounded-none border-0 bg-transparent shadow-none hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:[&_svg]:scale-125"
              />
            )}
            <label className="sr-only" htmlFor="translate-typed-answer">
              {showFeedback ? (showAnswerTranslation ? "English translation" : "Correct French sentence") : "Type your French translation"}
            </label>
            <textarea
              id="translate-typed-answer"
              ref={textareaRef}
              value={showFeedback ? (showAnswerTranslation ? currentQuestion.sourceText : correctAnswer) : userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
              readOnly={showFeedback}
              maxLength={characterLimit}
              placeholder="Type your translation here..."
              rows={5}
              autoFocus
              className={cn(
                "block min-h-[200px] w-full resize-none rounded-[20px] border-2 border-slate-200 bg-white px-6 py-5 text-lg font-normal leading-relaxed text-slate-900 outline-none transition-[background-color,border-color,box-shadow] duration-200 motion-reduce:transition-none placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100",
                !showFeedback && "focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:focus:ring-sky-900/30",
                showFeedback && "pl-20 font-medium",
                showFeedback && isCorrect && "border-green-500 bg-green-50 text-green-950 focus:border-green-500 dark:border-green-500 dark:bg-green-950/30 dark:text-green-100",
                showFeedback && !isCorrect && "border-red-500 bg-red-50 text-red-950 focus:border-red-500 dark:border-red-500 dark:bg-red-950/30 dark:text-red-100",
              )}
            />
          </div>
          {!showFeedback && (
            <div className="mt-3 w-full text-right text-sm tabular-nums text-slate-500 dark:text-slate-400">
              {userInput.length}/{characterLimit}
            </div>
          )}
        </div>
      </PracticeGameLayout>
  );
}
