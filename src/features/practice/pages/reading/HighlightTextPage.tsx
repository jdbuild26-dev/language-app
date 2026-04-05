
"use client";

import React, { useState, useEffect } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { RefreshCw, Loader2, Languages } from "lucide-react";
import { loadMockCSV } from "@/utils/csvLoader";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

type HighlightTextQuestion = {
  title?: string;
  passage: string;
  questionTitle?: string;
  question: string;
  requiredCore: string;
  acceptableBoundary: string;
  correctAnswer?: string;
  timeLimitSeconds?: number;
  instructionFr?: string;
  instructionEn?: string;
  localizedInstruction?: string;
};

export default function HighlightTextPage() {
  const handleExit = usePracticeExit();
  const { knownLang = "en" } = useLanguage() as { knownLang?: string };

  const [questions, setQuestions] = useState<HighlightTextQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await loadMockCSV("practice/reading/highlight_text.csv");
        setQuestions(
          Array.isArray(data) ? (data as HighlightTextQuestion[]) : [],
        );
      } catch (error) {
        console.error("Error loading mock data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const passageRef = React.useRef<HTMLDivElement | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedText, setSelectedText] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);
  const [translatedQuestion, setTranslatedQuestion] = useState("");
  const [showTranslation, setShowTranslation] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  const getFeedbackMessage = (correct: boolean) => {
    if (correct) {
      return "Correct! You highlighted the key information.";
    }
    return "Not quite. Try to find the specific text that answers the question.";
  };

  const currentQuestion = questions[currentIndex];
  // More time for reading
  const timerDuration = currentQuestion?.timeLimitSeconds || 120;

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
    isPaused: isCompleted || showFeedback || loading,
  });

  useEffect(() => {
    if (currentQuestion && !isCompleted) {
      setSelectedText("");
      resetTimer();
    }
  }, [currentIndex, currentQuestion, isCompleted, resetTimer]);

  // Improved selection logic using document selectionchange
  useEffect(() => {
    const handleSelectionChange = () => {
      if (showFeedback) return;

      const selection = window.getSelection();
      if (!selection) return;

      // Check if selection is within the passage container
      if (
        !passageRef.current ||
        !passageRef.current.contains(selection.anchorNode) ||
        !passageRef.current.contains(selection.focusNode)
      ) {
        return;
      }

      const text = selection.toString().trim();

      // Only update if we have a valid selection
      if (text.length > 0) {
        setSelectedText(text);
      }
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, [showFeedback]);

  // Helper to normalize strings for comparison (ignores case and simple punctuation differences)
  const normalize = (str: string | undefined) => {
    if (!str) return "";
    return str
      .toLowerCase()
      .replace(/[.,;:"']/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  const handleSubmit = () => {
    if (showFeedback || !selectedText) return;

    const userNorm = normalize(selectedText);
    const coreNorm = normalize(currentQuestion.requiredCore);
    const boundaryNorm = normalize(currentQuestion.acceptableBoundary);
    const passageNorm = normalize(currentQuestion.passage);

    // Algorithm implementation:
    // 1. Must contain the required core part of the answer
    const containsCore = userNorm.includes(coreNorm);

    // 2. Must be within the larger acceptable boundary (context)
    const withinBoundary = boundaryNorm.includes(userNorm);

    // 3. Must not be the entire passage/paragraph
    const isNotFullPassage = userNorm.length < passageNorm.length * 0.9;

    // 4. Must have a reasonable length (avoid tiny fragments that just happen to match)
    const isReasonableLength = userNorm.length >= coreNorm.length * 0.8;

    const correct =
      containsCore && withinBoundary && isNotFullPassage && isReasonableLength;

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

  const handleTranslateQuestion = async () => {
    if (!currentQuestion?.question) return;

    if (showTranslation) {
      setShowTranslation(false);
      return;
    }

    if (translatedQuestion) {
      setShowTranslation(true);
      return;
    }

    try {
      setIsTranslating(true);
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: currentQuestion.question,
          target_lang: knownLang || "en",
        }),
      });

      if (!res.ok) throw new Error("Translation failed");
      const data = (await res.json()) as { translation?: string };
      setTranslatedQuestion(data.translation || "");
      setShowTranslation(true);
    } catch {
      setTranslatedQuestion("");
      setShowTranslation(false);
    } finally {
      setIsTranslating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (questions.length === 0 || !currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <p className="text-xl text-slate-600 dark:text-slate-400">
          No questions available.
        </p>
        <Button onClick={() => handleExit()} variant="outline" className="mt-4">
          Back
        </Button>
      </div>
    );
  }

  return (
    <>
      <PracticeGameLayout
        disableContentScroll
        questionType="Highlight the Text"
        questionTypeFr="Surligner le texte"
        questionTypeEn="Highlight Text"
        localizedInstruction={
          currentQuestion.localizedInstruction ||
          "Surlignez le texte dans le passage"
        }
        instructionFr={
          currentQuestion.instructionFr || "Surlignez le texte dans le passage"
        }
        instructionEn={
          currentQuestion.instructionEn || "Highlight text in the passage"
        }
        progress={((currentIndex + 1) / questions.length) * 100}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={questions.length}
        currentQuestionIndex={currentIndex}
        questionCounterValue={currentIndex + 1}
        onExit={handleExit}
        onNext={showFeedback ? handleContinue : handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={!!selectedText || showFeedback}
        showSubmitButton={true}
        submitLabel={
          showFeedback
            ? currentIndex + 1 === questions.length
              ? "FINISH"
              : "CONTINUE"
            : "Submit Answer"
        }
        timerValue={timerString}
        showFeedback={showFeedback}
        isCorrect={isCorrect}
        feedbackTone={
          showFeedback ? (isCorrect ? "success" : "error") : "error"
        }
        correctAnswer={!isCorrect ? currentQuestion.correctAnswer : undefined}
        feedbackMessage={feedbackMessage}
      >
        <div className="practice-reading-page-shell flex flex-col flex-1 min-h-0 gap-4 p-3 sm:gap-5 sm:p-4 md:grid md:grid-cols-2 md:gap-5 md:overflow-hidden md:p-5 md:h-full">
          {/* Left Column: Passage*/}
          <div className="w-full md:min-h-0 bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-4 md:p-4 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden min-h-[200px]">
            <div className="flex flex-col gap-1.5 border-b border-slate-200 pb-2 mb-3 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                {currentQuestion.title}
              </h3>
              <div className="text-sm text-slate-400 italic flex items-center gap-2 sm:justify-end">
                <RefreshCw className="w-3 h-3" />
                Drag text to answer
              </div>
            </div>
            <div
              ref={passageRef}
              className="practice-reading-passage-text prose dark:prose-invert max-w-none select-text flex-1 min-h-[120px] md:min-h-0 overflow-y-auto custom-scrollbar"
            >
              {currentQuestion.passage}
            </div>
          </div>

          {/* Right Column: Interaction */}
          <div className="w-full md:min-h-0 bg-white dark:bg-slate-800 rounded-xl p-3 sm:p-4 md:p-4 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col overflow-y-auto custom-scrollbar min-h-[160px]">
              <div className="mb-3 sm:mb-4 flex items-start gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={handleTranslateQuestion}
                  disabled={isTranslating}
                  aria-label={
                    showTranslation ? "Show original text" : "Translate text"
                  }
                  title={
                    showTranslation ? "Show original text" : "Translate text"
                  }
                  className="inline-flex items-center justify-center shrink-0 mt-1 text-blue-500 hover:text-blue-600 disabled:opacity-60"
                >
                  {isTranslating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Languages className="w-5 h-5" />
                  )}
                </button>
                <h2 className="practice-reading-heading leading-tight text-xl md:text-2xl">
                  {showTranslation && translatedQuestion
                    ? translatedQuestion
                    : currentQuestion.question}
                </h2>
              </div>

              {/* Selection Box */}
              <div
                className={cn(
                  "border-2 rounded-xl p-3 mt-4 sm:p-4 min-h-[80px] sm:min-h-[96px] flex items-center justify-center text-center text-base sm:text-lg transition-all bg-slate-50 dark:bg-slate-900/50 break-words",
                  selectedText
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10 text-slate-800 dark:text-slate-200"
                    : "border-dashed border-slate-300 dark:border-slate-600 text-slate-400",
                )}
              >
                {selectedText || "Drag to select text in the passage"}
              </div>

              {selectedText && (
                <div className="mt-2 flex justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-slate-600"
                    onClick={() => setSelectedText("")}
                  >
                    Clear Selection
                  </Button>
                </div>
              )}
          </div>
        </div>
      </PracticeGameLayout>
    </>
  );
}
