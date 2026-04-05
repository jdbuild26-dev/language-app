"use client";

import React, { Suspense, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { fetchPracticeData } from "@/utils/practiceFetcher";
import { loadMockCSV } from "@/utils/csvLoader";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
const PRACTICE_READING_SECTION_TEXT_CLASS =
  "font-sans text-2xl md:text-3xl font-medium leading-relaxed";
const PRACTICE_READING_OPTION_TEXT_CLASS =
  "font-sans text-lg md:text-xl font-semibold leading-relaxed";
type BubbleQuestion = {
  bubble_tokens?: unknown;
  wordBubbles?: unknown;
  BubbleTokens?: unknown;
  localizedInstruction?: string;
  instructionFr?: string;
  instructionEn?: string;
  source_sentence?: string;
  sourceSentence?: string;
  sourceText?: string;
  target_sentence?: string;
  targetSentence?: string;
  correctAnswer?: string;
  timeLimitSeconds?: number;
};

// Fisher-Yates shuffle algorithm
function shuffleArray(array: string[]): string[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function normalizeBubbleTokens(tokens: unknown): string[] {
  if (Array.isArray(tokens)) {
    return tokens.filter(Boolean).map(String);
  }

  if (typeof tokens === "string") {
    const trimmed = tokens.trim();

    if (!trimmed) return [];

    if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
      try {
        const parsed = JSON.parse(trimmed);
        return Array.isArray(parsed) ? parsed.filter(Boolean).map(String) : [];
      } catch (error) {
        console.warn("Failed to parse bubble tokens:", error);
      }
    }
    return trimmed
      .split("|")
      .map((token) => token.trim())
      .filter(Boolean);
  }

  return [];
}

function getBubbleTokens(question?: BubbleQuestion): string[] {
  const tokenSources = [
    question?.bubble_tokens,
    question?.wordBubbles,
    question?.BubbleTokens,
  ];

  for (const tokenSource of tokenSources) {
    const normalized = normalizeBubbleTokens(tokenSource);
    if (normalized.length > 0) {
      return normalized;
    }
  }

  return [];
}

function BubbleSelectionPageContent() {
  const handleExit = usePracticeExit();
  const { speak } = useTextToSpeech();
  const { learningLang = "", knownLang = "" } = useLanguage() as {
    learningLang?: string;
    knownLang?: string;
  };
  const searchParams = useSearchParams();
  const tag = searchParams?.get("tag");

  const [questions, setQuestions] = useState<BubbleQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [wordBankSlots, setWordBankSlots] = useState<(string | null)[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);

  const currentQuestion = questions[currentIndex];
  const sourceSentence =
    currentQuestion?.source_sentence ||
    currentQuestion?.sourceSentence ||
    currentQuestion?.sourceText;
  const correctSentence =
    currentQuestion?.target_sentence ||
    currentQuestion?.targetSentence ||
    currentQuestion?.correctAnswer;
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
    const fetchQuestions = async () => {
      try {
        setIsLoading(true);
        let data: BubbleQuestion[] = [];

        try {
          const fetched = await fetchPracticeData("translate_bubbles", {
            learningLang,
            knownLang,
            tag,
          });
          data = Array.isArray(fetched) ? (fetched as BubbleQuestion[]) : [];
        } catch (error) {
          console.warn(
            "Bubble selection backend fetch failed, falling back to CSV:",
            error,
          );
        }

        if (!Array.isArray(data) || data.length === 0) {
          const fallback = await loadMockCSV(
            "practice/reading/translate_bubbles.csv",
            {
              learningLang,
              knownLang,
            },
          );
          data = Array.isArray(fallback) ? (fallback as BubbleQuestion[]) : [];
        }

        setQuestions(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error loading practice data:", error);
        setQuestions([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, [learningLang, knownLang, tag]);

  // Initialize available words when question changes (shuffled)
  useEffect(() => {
    if (currentQuestion) {
      // Shuffle the word bubbles for randomized display
      const bubbles = getBubbleTokens(currentQuestion);
      setWordBankSlots(shuffleArray(bubbles));
      setSelectedWords([]);
      resetTimer();
    }
  }, [currentIndex, currentQuestion, resetTimer]);

  const handleWordSelect = (word: string, slotIndex: number) => {
    if (showFeedback) return;

    // Play audio for the selected word
    speak(word, "fr-FR");

    // Add word to selected and leave a ghost slot in bank
    setSelectedWords((prev) => [...prev, word]);
    const newSlots = [...wordBankSlots];
    newSlots[slotIndex] = null;
    setWordBankSlots(newSlots);
  };

  const handleWordRemove = (word: string, index: number) => {
    if (showFeedback) return;

    // Play audio for the removed word
    speak(word, "fr-FR");

    // Remove word from selected and add back to available
    const newSelected = [...selectedWords];
    newSelected.splice(index, 1);
    setSelectedWords(newSelected);

    const newSlots = [...wordBankSlots];
    const emptyIdx = newSlots.findIndex((slot) => slot === null);
    if (emptyIdx !== -1) {
      newSlots[emptyIdx] = word;
    } else {
      newSlots.push(word);
    }
    setWordBankSlots(newSlots);
  };

  const handleSubmit = () => {
    if (showFeedback || selectedWords.length === 0) return;

    // Normalize answers - remove punctuation and extra whitespace, lowercase
    const normalize = (str: string) =>
      str
        .toLowerCase()
        .replace(/[.,!?;:'"]/g, "")
        .replace(/\s+/g, " ")
        .trim();

    const userAnswer = normalize(selectedWords.join(" "));
    const correctAnswer = normalize(correctSentence || "");
    const correct = userAnswer === correctAnswer;

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
        <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <p className="text-xl text-slate-600 dark:text-slate-400">
          No content available.
        </p>
        <button
          onClick={() => handleExit()}
          className="mt-4 px-4 py-2 border border-slate-300 rounded hover:bg-slate-100"
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
        questionType="Translate the Sentence"
        questionTypeFr="Traduire la Phrase"
        questionTypeEn="Translate the Sentence"
        localizedInstruction={currentQuestion?.localizedInstruction}
        instructionFr={
          currentQuestion?.instructionFr || "Construisez la phrase en français"
        }
        instructionEn={
          currentQuestion?.instructionEn ||
          "Build the sentence in French "
        }
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        questionCounterValue={currentIndex + 1}
        currentQuestionIndex={currentIndex}
        totalQuestions={questions.length}
        onExit={handleExit}
        onNext={handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={selectedWords.length > 0 && !showFeedback}
        showSubmitButton={!showFeedback}
        submitLabel="Submit Answer"
        feedbackTone={
          showFeedback ? (isCorrect ? "success" : "error") : "neutral"
        }
        timerValue={timerString}
      >
        <div className="practice-reading-page-shell flex flex-col items-center justify-center max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-10 flex-1 min-h-0">
          {/* Source Sentence */}
          <div className="w-full mb-10 md:mb-12 flex justify-center items-center">
            <p
              className={`${PRACTICE_READING_SECTION_TEXT_CLASS} text-center text-slate-800 dark:text-slate-100`}
            >
              {sourceSentence}
            </p>
          </div>

          {/* Correct Answer Pop-down */}
          <AnimatePresence>
            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, y: -20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -20, height: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="w-full max-w-4xl bg-white dark:bg-slate-800 rounded-2xl p-7 md:p-8 mb-8 border-2 border-emerald-500 shadow-lg overflow-hidden"
              >
                <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 mb-2 font-medium">
                  Correct Answer:
                </p>
                <p
                  className={`${PRACTICE_READING_SECTION_TEXT_CLASS} text-slate-800 dark:text-white`}
                >
                  {correctSentence}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="w-full max-w-4xl border-t border-slate-200 dark:border-slate-700 py-8 flex flex-col gap-6">
            {/* Answer Area - Selected Words */}
            <div className="w-full min-h-[92px] flex flex-wrap gap-3 justify-center items-center px-1">
              {selectedWords.length === 0 ? (
                <span className="w-[2px] h-10 bg-slate-500 dark:bg-slate-300 rounded-full animate-caret-blink" />
              ) : (
                <>
                  {selectedWords.map((word, index) => (
                    <button
                      key={`selected-${index}`}
                      onClick={() => handleWordRemove(word, index)}
                      disabled={showFeedback}
                      className={cn(
                        `px-6 py-3.5 rounded-2xl transition-all duration-200 border ${PRACTICE_READING_OPTION_TEXT_CLASS}`,
                        showFeedback && isCorrect
                          ? "bg-emerald-100 text-emerald-700 border-emerald-400 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700"
                          : showFeedback && !isCorrect
                            ? "bg-red-100 text-red-700 border-red-400 dark:bg-red-950/40 dark:text-red-300 dark:border-red-700"
                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:border-blue-400 active:scale-95",
                      )}
                    >
                      {word}
                    </button>
                  ))}
                  {!showFeedback && (
                    <span className="w-[2px] h-10 bg-slate-500 dark:bg-slate-300 rounded-full animate-caret-blink" />
                  )}
                </>
              )}
            </div>

            {/* Word Bank */}
            <div className="w-full flex flex-wrap gap-3 border-t border-slate-200 dark:border-slate-700 pt-6 justify-center px-1">
              {wordBankSlots.map((word, index) =>
                word === null ? (
                  <div
                    key={`ghost-${index}`}
                    className="px-6 py-3.5 rounded-2xl text-lg md:text-xl font-semibold border border-dashed border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800/40 text-transparent select-none"
                    aria-hidden="true"
                  >
                    &nbsp;&nbsp;&nbsp;&nbsp;
                  </div>
                ) : (
                  <button
                    key={`available-${index}`}
                    onClick={() => handleWordSelect(word, index)}
                    disabled={showFeedback}
                    className={cn(
                      `px-6 py-3.5 rounded-2xl transition-all duration-200 border ${PRACTICE_READING_OPTION_TEXT_CLASS}`,
                      "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200",
                      "border-slate-300 dark:border-slate-600",
                      "hover:border-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700",
                      "active:scale-95",
                      showFeedback && "opacity-50 cursor-not-allowed",
                    )}
                  >
                    {word}
                  </button>
                ),
              )}
            </div>
          </div>
        </div>
      </PracticeGameLayout>

      {/* Feedback Banner */}
      {showFeedback && (
        <FeedbackBanner
          isCorrect={isCorrect}
          feedbackTone={isCorrect ? "success" : "error"}
          correctAnswer={!isCorrect ? correctSentence : null}
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

function BubbleSelectionFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
    </div>
  );
}

export default function BubbleSelectionPage() {
  return (
    <Suspense fallback={<BubbleSelectionFallback />}>
      <BubbleSelectionPageContent />
    </Suspense>
  );
}
