"use client";

import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { fetchPracticeQuestions } from "@/services/vocabularyApi";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { gradeHighlightSelection, parseHighlightAnswers } from "@/features/vocabulary/lib/highlightWordAnswers";
import { TranslateButton } from "@/components/ui/TranslateButton";
import { useTranslateText } from "@/hooks/useTranslateText";
import { useLanguage } from "@/contexts/LanguageContext";

type HighlightQuestion = {
  sentence: string;
  correctWords: string[];
  prompt: string;
  promptTranslation: string;
  sentenceTranslation: string;
  QuestionType?: string;
  Instruction_FR?: string;
  Instruction_EN?: string;
};

function LoadingHighlightWord() {
  return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
      </div>
    );
}

export default function HighlightWordGamePage() {
  const { languagesReady, learningLang, knownLang } = useLanguage();
  if (!languagesReady) return <LoadingHighlightWord />;
  return <HighlightWordRound key={JSON.stringify([learningLang, knownLang])} learningLang={learningLang} knownLang={knownLang} />;
}

function HighlightWordRound({ learningLang, knownLang }: { learningLang: string; knownLang: string }) {
  const router = useRouter();
  const { speak } = useTextToSpeech();
  const [questions, setQuestions] = useState<HighlightQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [selectedWordIndices, setSelectedWordIndices] = useState<Set<number>>(new Set());

  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  useEffect(() => {
    let active = true;
    const loadQuestions = async () => {
      try {
        setLoading(true);
        const response = await fetchPracticeQuestions("highlight_word", { apiOnly: true, learningLang, knownLang });
        if (response && response.data && response.data.length > 0) {
          const formattedQuestions = response.data
            .filter(
              (q) =>
                (q.passage || q.sentence || q.Sentence) &&
                (q.passage || q.sentence || q.Sentence) !== "None",
            )
            .map((q) => {
              const rawAnswer =
                q.correctWord ||
                q.correctAnswer ||
                q.CorrectAnswer ||
                q.Answer ||
                q.eval_correctWord ||
                "";

              const correctWords = parseHighlightAnswers(rawAnswer);

              return {
                ...q,
                sentence:
                  q.passage ||
                  q.sentence ||
                  q.Sentence ||
                  q["Complete sentence"] ||
                  "",
                correctWords,
                prompt: (
                  q.question ||
                  q.instructionEn ||
                  q.Instruction_EN ||
                  q.Question_EN ||
                  ""
                )?.trim(),
                promptTranslation: String(q.question_fr || q.Question_FR || q.prompt_fr || q.content?.question_fr || ""),
                sentenceTranslation: String(q.passage_en || q.Passage_EN || q.sentence_en || q.Sentence_EN || q.content?.passage_en || q.content?.sentence_en || ""),
              };
            });
          if (learningLang === "fr" && knownLang === "en" &&
              formattedQuestions.some(question => !question.promptTranslation || !question.sentenceTranslation)) {
            try {
              const stored = await fetch("/mock-data/csv/highlight_word.csv");
              if (stored.ok) {
                const rows = Papa.parse<{
                  passage: string; question: string; passage_en: string; question_fr: string;
                }>(await stored.text(), { header: true, skipEmptyLines: true }).data;
                const normalize = (value: string) => value.trim().normalize("NFC").replace(/’/g, "'");
                for (const question of formattedQuestions) {
                  const match = rows.find(row => row.passage && normalize(row.passage) === normalize(question.sentence)
                    && row.question && normalize(row.question) === normalize(question.prompt));
                  if (match) {
                    question.promptTranslation ||= match.question_fr || "";
                    question.sentenceTranslation ||= match.passage_en || "";
                  }
                }
              }
            } catch {
              // The exercise remains playable if the bundled translations cannot be loaded.
            }
          }
          if (active) setQuestions(formattedQuestions);
        } else {
          console.error("[HighlightWord] ❌ No valid questions received");
          if (active) setQuestions([]);
        }
      } catch (error) {
        console.error("[HighlightWord] ❌ Failed to load:", error);
        if (active) setQuestions([]);
      } finally {
        if (active) setLoading(false);
      }
    };
    void loadQuestions();
    return () => { active = false; };
  }, [learningLang, knownLang]);

  const { timerString, resetTimer } = useExerciseTimer({
    duration: 30,
    mode: "timer",
    onExpire: () => {
      if (!isAnswered && !isGameOver && !showFeedback) {
        if (selectedWordIndices.size === 0) {
          setIsAnswered(true);
          setIsCorrect(false);
          setFeedbackMessage("Time's up!");
          setShowFeedback(true);
        } else {
          handleCheck();
        }
      }
    },
    isPaused: loading || isGameOver || isAnswered || showFeedback,
  });

  useEffect(() => {
    resetTimer();
  }, [currentIndex, resetTimer]);

  const currentItem = questions[currentIndex];
  const words = currentItem ? currentItem.sentence.split(" ") : [];
  const promptTranslation = useTranslateText(
    currentItem?.prompt || "",
    knownLang.toLowerCase(),
    currentItem?.promptTranslation,
    learningLang.toLowerCase(),
  );
  const sentenceTranslation = useTranslateText(
    currentItem?.sentence || "",
    learningLang.toLowerCase(),
    currentItem?.sentenceTranslation,
    knownLang.toLowerCase(),
  );

  // ── Single-select handler ──────────────────────────────────────────────
  const handleWordClick = (index: number) => {
    if (isAnswered) return;
    speak(words[index], "fr-FR");
    setSelectedWordIndices((previous) => {
      const next = new Set(previous);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  // ── Check answer ───────────────────────────────────────────────────────
  const handleCheck = () => {
    if (selectedWordIndices.size === 0) return;
    const { isCorrect: correct } = gradeHighlightSelection(words, currentItem.correctWords, selectedWordIndices);
    setIsAnswered(true);
    setIsCorrect(correct);
    setFeedbackMessage(getFeedbackMessage(correct));
    setShowFeedback(true);
    if (correct) setScore((prev) => prev + 1);
  };

  const handleNext = () => {
    if (!isAnswered) {
      handleCheck();
      return;
    }
    setShowFeedback(false);
    if (currentIndex < questions.length - 1) {
      promptTranslation.reset();
      sentenceTranslation.reset();
      setCurrentIndex((prev) => prev + 1);
      setSelectedWordIndices(new Set());
      setIsAnswered(false);
      resetTimer();
    } else {
      setIsGameOver(true);
    }
  };

  const progress =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  // ── Submit enabled guard ───────────────────────────────────────────────
  const isSubmitEnabled = selectedWordIndices.size > 0;

  const correctAnswerDisplay = !isCorrect ? currentItem?.correctWords.join(" • ") : null;

  if (loading) return <LoadingHighlightWord />;

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-red-500">
        <p className="text-xl font-bold">No questions found</p>
        <Button
          className="mt-4"
          variant="outline"
          onClick={() => router.push("/vocabulary/practice")}
        >
          Back to Practice
        </Button>
      </div>
    );
  }

  const hasPromptTranslation = Boolean(currentItem.promptTranslation.trim());
  const hasSentenceTranslation = Boolean(currentItem.sentenceTranslation.trim());
  const correctIndices = gradeHighlightSelection(words, currentItem.correctWords, selectedWordIndices).correctIndices;

  return (
    <>
      <PracticeGameLayout
        questionType={currentItem?.QuestionType}
        instructionFr={currentItem?.Instruction_FR}
        instructionEn={currentItem?.Instruction_EN}
        progress={progress}
        currentQuestionIndex={currentIndex}
        isGameOver={isGameOver}
        score={score}
        totalQuestions={questions.length}
        onExit={() => router.push("/vocabulary/practice")}
        onNext={handleNext}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={isSubmitEnabled}
        showSubmitButton={true}
        submitLabel={
          showFeedback
            ? currentIndex + 1 === questions.length
              ? "FINISH"
              : "CONTINUE"
            : isAnswered
              ? "Next"
              : "Submit"
        }
        timerValue={timerString}
        showFeedback={showFeedback}
        isCorrect={isCorrect}
        correctAnswer={correctAnswerDisplay && <span className="text-lg font-semibold leading-relaxed md:text-xl">{correctAnswerDisplay}</span>}
        onFeedbackTranslate={hasSentenceTranslation ? () => { void sentenceTranslation.toggle(); } : undefined}
        feedbackTranslationVisible={sentenceTranslation.showTranslation}
        feedbackMessage={feedbackMessage}
      >
        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-start gap-8 px-4 pb-6 pt-14 sm:gap-12 sm:pt-20 lg:gap-14 lg:pt-24">
          <div className="w-full text-center">
            <div className="flex items-start justify-center gap-1">
              <TranslateButton
                aria-label={promptTranslation.showTranslation ? "Show original question" : "Translate question"}
                aria-pressed={promptTranslation.showTranslation}
                disabled={!hasPromptTranslation}
                title={hasPromptTranslation ? undefined : "Saved translation unavailable"}
                onClick={() => { if (hasPromptTranslation) void promptTranslation.toggle(); }}
              />
              <h3 lang={promptTranslation.showTranslation ? learningLang.toLowerCase() : knownLang.toLowerCase()} className="mb-2 text-xl font-bold text-gray-800 dark:text-gray-100 md:text-2xl">
                {promptTranslation.displayText}
              </h3>
            </div>
            {promptTranslation.error && <p role="status" className="text-sm text-red-700 dark:text-red-400">{promptTranslation.error}</p>}
          </div>

          <div className="relative w-full max-w-4xl">
            {showFeedback && (
              <TranslateButton
                className="absolute left-0 top-0"
                aria-label={sentenceTranslation.showTranslation ? "Hide sentence translation" : "Translate sentence"}
                aria-pressed={sentenceTranslation.showTranslation}
                disabled={!hasSentenceTranslation}
                title={hasSentenceTranslation ? undefined : "Saved translation unavailable"}
                onClick={() => { if (hasSentenceTranslation) void sentenceTranslation.toggle(); }}
              />
            )}
            <div className={`mx-auto flex flex-wrap justify-center gap-3 text-lg font-medium leading-relaxed md:text-xl ${showFeedback ? "px-9" : ""}`} role="group" aria-label="Sentence words" lang={learningLang.toLowerCase()}>
              {words.map((word, index) => {
                const isTarget = correctIndices.has(index);
                const wasSelected = selectedWordIndices.has(index);
                const isWrongSelection = isAnswered && wasSelected && !isTarget;
                let styles = "bg-transparent text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg px-2 py-1 cursor-pointer transition-all border border-transparent";
                if (isAnswered) {
                  styles = isTarget
                    ? "bg-green-100 text-green-800 ring-2 ring-green-400 rounded-lg px-2 py-1 shadow-sm"
                    : wasSelected
                      ? "bg-red-100 text-red-800 ring-2 ring-red-400 rounded-lg px-2 py-1"
                      : "text-slate-700 dark:text-slate-200 rounded-lg px-2 py-1";
                } else if (wasSelected) {
                  styles = "bg-blue-100 text-blue-800 ring-2 ring-blue-300 rounded-lg px-2 py-1 shadow-sm";
                }

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleWordClick(index)}
                    disabled={isAnswered}
                    aria-pressed={wasSelected}
                    aria-invalid={isWrongSelection}
                    aria-label={isAnswered && isTarget ? `${word}, correct answer` : isWrongSelection ? `${word}, incorrect selection` : word}
                    className={`${styles} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:cursor-default`}
                  >
                    {word}
                  </button>
                );
              })}
            </div>
            {showFeedback && sentenceTranslation.showTranslation && (
              <p lang={knownLang.toLowerCase()} className="mt-5 text-center text-lg font-medium leading-relaxed text-slate-800 dark:text-slate-100 md:text-xl">
                {sentenceTranslation.displayText}
              </p>
            )}
            {showFeedback && sentenceTranslation.error && <p role="status" className="mt-2 text-center text-sm text-red-700 dark:text-red-400">{sentenceTranslation.error}</p>}
          </div>
        </div>
      </PracticeGameLayout>
    </>
  );
}
