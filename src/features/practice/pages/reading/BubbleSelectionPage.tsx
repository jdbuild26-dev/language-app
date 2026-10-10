"use client";

import React, { Suspense, useState, useEffect, useLayoutEffect, useRef } from "react";
import { motion } from "framer-motion";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { usePracticeFeedbackLabels } from "@/utils/practiceFeedbackLabels";
import { fetchPracticeData } from "@/utils/practiceFetcher";
import { loadMockCSV } from "@/utils/csvLoader";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePracticeComplete } from "@/hooks/usePracticeComplete";
import WordTileBuilder from "@/features/practice/components/WordTileBuilder";
const PRACTICE_READING_SECTION_TEXT_CLASS =
  "practice-type-content-large font-sans font-medium";
type BubbleQuestion = {
  bubble_tokens?: unknown;
  wordBubbles?: unknown;
  BubbleTokens?: unknown;
  localizedInstruction?: string;
  instructionFr?: string;
  instructionEn?: string;
  // new bilingual fields
  source_sentence?: string;
  sourceSentence?: string;
  sourceText?: string;
  SourceSentence?: string;
  target_sentence?: string;
  targetSentence?: string;
  correctAnswer?: string;
  TargetSentence?: string;
  CorrectAnswer?: string;
  level?: string;
  timeLimitSeconds?: number;
  explanation?: string;
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

function textValue(...values: unknown[]): string {
  return values.find((value): value is string => typeof value === "string" && value.trim().length > 0) || "";
}

function objectValue(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function BubbleSelectionPageContent() {
  const handleExit = usePracticeExit();
  const { speak } = useTextToSpeech();
  const { learningLang = "", knownLang = "" } = useLanguage() as {
    learningLang?: string;
    knownLang?: string;
  };
  const labels = usePracticeFeedbackLabels(knownLang);
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
  const initializedQuestionKey = useRef<string | null>(null);
  const questionContentRef = useRef<HTMLDivElement>(null);

  const currentQuestion = questions[currentIndex];
  const sourceSentence =
    currentQuestion?.source_sentence ||
    currentQuestion?.sourceSentence ||
    currentQuestion?.sourceText ||
    currentQuestion?.SourceSentence;
  const correctSentence =
    currentQuestion?.target_sentence ||
    currentQuestion?.targetSentence ||
    currentQuestion?.correctAnswer ||
    currentQuestion?.TargetSentence ||
    currentQuestion?.CorrectAnswer;
  const timerDuration = currentQuestion?.timeLimitSeconds || 360;

  usePracticeComplete({ isGameOver: isCompleted, score, totalQuestions: questions.length, exerciseType: "translate_bubbles", level: currentQuestion?.level });

  const { timerString, resetTimer } = useExerciseTimer({
    duration: timerDuration,
    mode: "timer",
    onExpire: () => {
      if (!isCompleted && !showFeedback) {
        setIsCorrect(false);
        setFeedbackMessage(labels.time_up);
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
            tag: tag ?? undefined,
          });
          // Map backend nested structure to flat BubbleQuestion shape
          const raw = Array.isArray(fetched) ? fetched : [];
          data = raw.map((item: Record<string, unknown>) => {
            const c = objectValue(item.content) || item;
            const e = objectValue(item.evaluation) || item;
            const cfg = objectValue(item.config) || item;
            return {
              level:              textValue(item.Level, item.level),
              instructionEn:      textValue(item.instructionEn, item.Instruction_EN) || 'Translate the sentence',
              instructionFr:      textValue(item.instructionFr, item.Instruction_FR) || 'Traduire la phrase',
              // Source (EN) — what learner reads
              source_sentence:    textValue(c.source_sentence, item.source_sentence, item.SourceSentence, item.sourceText),
              // Target (FR) — correct answer
              target_sentence:    textValue(c.target_sentence, item.target_sentence, item.TargetSentence),
              correctAnswer:      textValue(e.correctAnswer, item.correctAnswer, item.CorrectAnswer, c.target_sentence),
              explanation:        textValue(e.explanation, item.explanation, item.Explanation),
              // Bubble tokens — already shuffled by backend
              bubble_tokens:      c.bubble_tokens || item.bubble_tokens || item.BubbleTokens || item.wordBubbles || [],
              timeLimitSeconds:   Number(cfg.timeLimitSeconds || item.timeLimitSeconds || item.TimeLimitSeconds || 360),
            } as BubbleQuestion;
          });
        } catch (error) {
          console.warn("Bubble selection backend fetch failed, falling back to CSV:", error);
        }

        if (!Array.isArray(data) || data.length === 0) {
          const fallback = await loadMockCSV(
            "practice/reading/translate_bubbles.csv",
            { learningLang, knownLang },
          );
          // Map flat CSV format
          const raw = Array.isArray(fallback) ? fallback : [];
          data = raw.map((item: Record<string, unknown>) => ({
            level:           textValue(item.Level, item.level),
            instructionEn:   textValue(item.Instruction_EN) || 'Translate the sentence',
            instructionFr:   textValue(item.Instruction_FR) || 'Traduire la phrase',
            source_sentence: textValue(item.SourceSentence, item.source_sentence, item.SourceText),
            target_sentence: textValue(item.TargetSentence, item.target_sentence, item.CorrectAnswer),
            correctAnswer:   textValue(item.CorrectAnswer, item.correctAnswer, item.TargetSentence),
            explanation:     textValue(item.Explanation, item.explanation),
            bubble_tokens:   item.BubbleTokens || item.bubble_tokens || item.wordBubbles || [],
            timeLimitSeconds: Number(item.timeLimitSeconds || item.TimeLimitSeconds || 360),
          } as BubbleQuestion));
        }

        setQuestions(data.filter(q =>
          (q.source_sentence || q.sourceSentence || q.sourceText) &&
          (q.bubble_tokens || q.wordBubbles || q.BubbleTokens)
        ));
      } catch (error) {
        console.error("Error loading practice data:", error);
        setQuestions([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, [learningLang, knownLang, tag]);

  // A data refresh can replace the question object without changing the question.
  // Preserve the learner's in-progress answer and feedback in that case.
  useLayoutEffect(() => {
    if (!currentQuestion) return;

    const bubbles = getBubbleTokens(currentQuestion);
    const questionKey = JSON.stringify([
      currentIndex,
      sourceSentence,
      correctSentence,
      timerDuration,
      [...bubbles].sort(),
    ]);
    if (initializedQuestionKey.current === questionKey) return;
    initializedQuestionKey.current = questionKey;

    setWordBankSlots(shuffleArray(bubbles));
    setSelectedWords([]);
    setShowFeedback(false);
    setIsCorrect(false);
    setFeedbackMessage("");
    resetTimer();
  }, [currentIndex, currentQuestion, sourceSentence, correctSentence, timerDuration, resetTimer]);

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
    setFeedbackMessage(correct ? labels.correct : labels.incorrect);
    setShowFeedback(true);

    if (correct) {
      setScore((prev) => prev + 1);
    }
  };

  const handleContinue = () => {
    questionContentRef.current?.closest("main")?.scrollTo({ top: 0, behavior: "instant" });
    setSelectedWords([]);
    setWordBankSlots([]);
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
          currentQuestion?.instructionEn || "Build the sentence in French"
        }
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        questionCounterValue={currentIndex + 1}
        currentQuestionIndex={currentIndex}
        totalQuestions={questions.length}
        onExit={handleExit}
        onNext={showFeedback ? handleContinue : handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={selectedWords.length > 0 && !showFeedback}
        showSubmitButton
        submitLabel={showFeedback ? labels.continue : labels.submit_answer}
        showFeedback={showFeedback}
        isCorrect={isCorrect}
        feedbackMessage={feedbackMessage}
        correctAnswer={!isCorrect ? correctSentence : null}
        correctAnswerLabel={labels.correct_answer}
        feedbackChildren={currentQuestion?.explanation || null}
        compactFeedback
        feedbackInFlow
        feedbackTone={
          showFeedback ? (isCorrect ? "success" : "error") : "neutral"
        }
        timerValue={timerString}
      >
        <div
          ref={questionContentRef}
          className={cn(
            "practice-reading-page-shell flex flex-col items-center justify-start max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-6 md:pt-10 md:pb-8 xl:pt-24 xl:pb-10 flex-1 min-h-full shrink-0",
          )}
        >
          {/* Source Sentence */}
          <div className="w-full mb-6 md:mb-8 xl:mb-12 flex justify-center items-center">
            <p
              className={`${PRACTICE_READING_SECTION_TEXT_CLASS} text-center text-slate-800 dark:text-slate-100`}
            >
              {sourceSentence}
            </p>
          </div>

          {/* Correct translation stays in the same word-bubble format as the learner's answer. */}
          {showFeedback && !isCorrect && correctSentence && (
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="w-full max-w-7xl border-t border-slate-200 dark:border-slate-700 pt-6 pb-8"
              >
                <div className="flex flex-wrap justify-center gap-3" role="group" aria-label={`${labels.correct_answer} ${correctSentence}`}>
                  {correctSentence.trim().split(/\s+/).map((word, index) => (
                    <span
                      key={`correct-${index}`}
                      className="practice-type-content px-4 py-2.5 xl:px-6 xl:py-3.5 rounded-2xl border border-emerald-400 bg-emerald-50 text-emerald-900 dark:border-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-100 font-sans font-semibold"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </motion.div>
          )}

          <WordTileBuilder
            selectedWords={selectedWords}
            wordBankSlots={wordBankSlots}
            showFeedback={showFeedback}
            isCorrect={isCorrect}
            onWordSelect={handleWordSelect}
            onWordRemove={handleWordRemove}
          />
        </div>
      </PracticeGameLayout>

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
