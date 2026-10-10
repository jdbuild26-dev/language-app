"use client";

import React, { Suspense, useEffect, useState } from "react";
import { Reorder } from "framer-motion";
import { GripVertical, Loader2, Turtle, Volume2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { usePracticeComplete } from "@/hooks/usePracticeComplete";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useQuestionLanguage } from "@/hooks/useQuestionLanguage";
import { useTranslateText } from "@/hooks/useTranslateText";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { TranslateButton } from "@/components/ui/TranslateButton";
import AudioWaveform from "@/components/ui/AudioWaveform";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { fetchPracticeData } from "@/utils/practiceFetcher";

type ListenOrderQuestion = {
  id: string | number;
  correctOrder: string[];
  correctOrder_en: string[];
  title_fr: string;
  title_en: string;
  timeLimitSeconds: number;
  level: string;
};

type OrderItem = {
  itemId: string;
  text: string;
  correctIndex: number;
};

function parseArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return value.split("+").map((part) => part.trim()).filter(Boolean);
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function textValue(...values: unknown[]): string {
  return values.find((value): value is string => typeof value === "string" && value.trim().length > 0) || "";
}

function getContent(item: Record<string, unknown>) {
  return asRecord(item.content);
}

function mapListenOrderQuestion(raw: unknown, index: number): ListenOrderQuestion | null {
  const item = asRecord(raw);
  const content = getContent(item);
  const evaluation = asRecord(item.evaluation);
  const config = asRecord(item.config);

  const frenchNodes = parseArray(content.sentences_fr ?? item.sentences_fr);
  const englishNodes = parseArray(content.sentences_en ?? item.sentences_en);
  const rawFrenchOrder = parseArray(
    content.correctOrder_fr ?? item.correctOrder_fr ??
    content.correctOrder ?? evaluation.correctOrder ?? item.correctOrder ?? item["CorrectOrder"],
  );
  const rawEnglishOrder = parseArray(content.correctOrder_en ?? item.correctOrder_en);

  let correctOrder: string[] = [];
  let correctOrder_en: string[] = [];

  if (rawFrenchOrder.length > 0 && typeof rawFrenchOrder[0] === "number") {
    const orderIndexes = rawFrenchOrder.map(Number);
    correctOrder = orderIndexes
      .map((nodeIndex) => String(frenchNodes[nodeIndex] ?? ""))
      .filter(Boolean);

    const englishSource = rawEnglishOrder.length > 0 ? rawEnglishOrder : englishNodes;
    correctOrder_en = orderIndexes
      .map((nodeIndex, orderIndex) => {
        const candidate = englishSource.length === frenchNodes.length
          ? englishSource[nodeIndex]
          : englishSource[orderIndex];
        return typeof candidate === "string" ? candidate : "";
      });
  } else {
    correctOrder = rawFrenchOrder.map(String).filter(Boolean);
    correctOrder_en = rawEnglishOrder.map(String);

    if (correctOrder.length === 0 && frenchNodes.length > 0) {
      correctOrder = frenchNodes.map(String).filter(Boolean);
      correctOrder_en = englishNodes.map(String);
    } else if (correctOrder_en.length === 0 && frenchNodes.length === englishNodes.length) {
      correctOrder_en = correctOrder.map((sentence) => {
        const nodeIndex = frenchNodes.findIndex((node) => String(node) === sentence);
        return nodeIndex >= 0 && typeof englishNodes[nodeIndex] === "string" ? String(englishNodes[nodeIndex]) : "";
      });
    }
  }

  if (correctOrder.length < 2) return null;

  return {
    id: textValue(item.external_id, item.ExerciseID, item.id) || `listen-order-${index}`,
    correctOrder,
    correctOrder_en,
    title_fr: textValue(content.title_fr, item.title_fr, content["Passage Title_FR"]),
    title_en: textValue(content.title_en, item.title_en, content["Passage Title_EN"]),
    timeLimitSeconds: Number(config.timeLimitSeconds || content.timeLimitSeconds || item.timeLimitSeconds || item.Time || 90),
    level: textValue(item.Level, item.level) || "A1",
  };
}

export default function ListenOrderPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div>}>
      <ListenOrderContent />
    </Suspense>
  );
}

function ListenOrderContent() {
  const handleExit = usePracticeExit();
  const { speak, isSpeaking } = useTextToSpeech();
  const searchParams = useSearchParams();
  const tag = searchParams?.get("tag") ?? undefined;

  const [questions, setQuestions] = useState<ListenOrderQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);
  const [playedAudio, setPlayedAudio] = useState(false);
  const [playingItemId, setPlayingItemId] = useState<string | null>(null);

  const currentQuestion = questions[currentIndex];
  const { learningLang, pick } = useQuestionLanguage(currentQuestion?.level);
  const headingText = pick(currentQuestion?.title_fr, currentQuestion?.title_en);
  const timerDuration = currentQuestion?.timeLimitSeconds || 90;

  usePracticeComplete({
    isGameOver: isCompleted,
    score,
    totalQuestions: questions.length,
    exerciseType: "listen_order",
    level: currentQuestion?.level,
  });

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
    isPaused: isCompleted || !playedAudio || showFeedback || isLoading,
  });

  useEffect(() => {
    if (currentQuestion) resetTimer();
  }, [currentQuestion, resetTimer]);

  useEffect(() => {
    let isCurrent = true;
    const fetchQuestions = async () => {
      try {
        setIsLoading(true);
        const data = await fetchPracticeData("listen_order", { tag, limit: 5 });
        const mapped = (Array.isArray(data) ? data : [])
          .map(mapListenOrderQuestion)
          .filter((question): question is ListenOrderQuestion => question !== null);
        if (!isCurrent) return;
        const selectedQuestions = mapped.length > 5 ? shuffleArray(mapped).slice(0, 5) : mapped;
        setQuestions(selectedQuestions);
        setCurrentIndex(0);
        setCurrentOrder(selectedQuestions.length > 0 ? createOrderItems(selectedQuestions[0]) : []);
        setShowFeedback(false);
        setScore(0);
        setPlayedAudio(false);
      } catch (error) {
        console.error("Error loading listen order data:", error);
        if (isCurrent) setQuestions([]);
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    };
    fetchQuestions();
    return () => { isCurrent = false; };
  }, [tag]);

  const playSentence = (text: string, itemId: string, rate: number) => {
    speak(text, "fr-FR", rate);
    setPlayingItemId(itemId);
    setPlayedAudio(true);
  };

  const handleReorder = (newOrder: OrderItem[]) => {
    setCurrentOrder(newOrder);
    setPlayedAudio(true);
  };

  const handleSubmit = () => {
    if (showFeedback || !currentQuestion) return;
    const correct = currentOrder.every((item, index) => item.correctIndex === index);
    setIsCorrect(correct);
    setFeedbackMessage(getFeedbackMessage(correct));
    setShowFeedback(true);
    if (correct) setScore((previous) => previous + 1);
  };

  const handleContinue = () => {
    setShowFeedback(false);
    setPlayedAudio(false);
    if (currentIndex < questions.length - 1) {
      setCurrentOrder(createOrderItems(questions[currentIndex + 1]));
      setPlayingItemId(null);
      setCurrentIndex((previous) => previous + 1);
    } else {
      setIsCompleted(true);
    }
  };

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div>;
  }

  if (questions.length === 0 || !currentQuestion) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
        <p className="text-xl text-slate-600 dark:text-slate-400">No content available.</p>
        <Button onClick={() => handleExit()} variant="outline" className="mt-4">Back</Button>
      </div>
    );
  }

  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <PracticeGameLayout
      questionType="Reorder Sentences"
      questionTypeFr="Réorganisez les phrases"
      questionTypeEn="Reorder Sentences"
      instructionFr="Écoutez les phrases et mettez-les dans le bon ordre"
      instructionEn="Listen to the sentences and put them in the correct order"
      localizedInstruction={learningLang === "fr" ? "Écoutez les phrases et mettez-les dans le bon ordre" : "Listen to the sentences and put them in the correct order"}
      progress={progress}
      isGameOver={isCompleted}
      score={score}
      totalQuestions={questions.length}
      currentQuestionIndex={currentIndex}
      questionCounterValue={currentIndex + 1}
      feedbackTone={showFeedback ? (isCorrect ? "success" : "error") : "neutral"}
      onExit={handleExit}
      onNext={showFeedback ? handleContinue : handleSubmit}
      onRestart={() => window.location.reload()}
      isSubmitEnabled={playedAudio && !showFeedback}
      showSubmitButton
      submitLabel={showFeedback ? (currentIndex + 1 === questions.length ? "FINISH" : "CONTINUE") : "Submit Answer"}
      disableContentScroll
      showFeedback={showFeedback}
      isCorrect={isCorrect}
      feedbackMessage={feedbackMessage}
      compactFeedback
      feedbackInFlow
      timerValue={timerString}
    >
      <div className="flex min-h-0 w-full flex-1 flex-col py-4 sm:py-6">
        {headingText && <div className="mx-auto flex w-full max-w-4xl shrink-0 items-center justify-center border-b border-slate-200 px-3 pb-3 dark:border-slate-700 sm:px-4 sm:pb-4">
          <h2 className="practice-type-content-heading text-center text-slate-900 dark:text-slate-100">{headingText}</h2>
        </div>}

        <div className={cn("min-h-0 w-full flex-1", headingText && "mt-4 sm:mt-6")}>
          <Reorder.Group
            axis="y"
            values={currentOrder}
            onReorder={showFeedback ? () => undefined : handleReorder}
            layoutScroll
            className="practice-game-scroll h-full w-full space-y-3 overflow-x-hidden overflow-y-auto px-3 pb-2 sm:px-4"
          >
            {currentOrder.map((item, index) => {
              const correctIndex = item.correctIndex;
              const isCorrectPosition = showFeedback && correctIndex === index;
              const isWrongPosition = showFeedback && !isCorrectPosition;
              const englishTranslation = currentQuestion.correctOrder_en[correctIndex] || "";

              return (
                <ListenOrderRow
                  key={item.itemId}
                  item={item}
                  positionIndex={index}
                  correctIndex={correctIndex}
                  englishTranslation={englishTranslation}
                  learningLang={learningLang}
                  showFeedback={showFeedback}
                  isCorrectPosition={isCorrectPosition}
                  isWrongPosition={isWrongPosition}
                  isPlaying={isSpeaking && playingItemId === item.itemId}
                  onPlay={(rate) => playSentence(item.text, item.itemId, rate)}
                />
              );
            })}
          </Reorder.Group>
        </div>
      </div>
    </PracticeGameLayout>
  );
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let index = shuffled.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[other]] = [shuffled[other], shuffled[index]];
  }
  return shuffled;
}

function createOrderItems(question: ListenOrderQuestion): OrderItem[] {
  return shuffleArray(question.correctOrder.map((text, correctIndex) => ({ text, correctIndex })))
    .map(({ text, correctIndex }) => ({
      itemId: `${question.id}-${correctIndex}-${text.slice(0, 20)}`,
      text,
      correctIndex,
    }));
}

function ListenOrderRow({
  item,
  positionIndex,
  correctIndex,
  englishTranslation,
  learningLang,
  showFeedback,
  isCorrectPosition,
  isWrongPosition,
  isPlaying,
  onPlay,
}: {
  item: OrderItem;
  positionIndex: number;
  correctIndex: number;
  englishTranslation: string;
  learningLang: string;
  showFeedback: boolean;
  isCorrectPosition: boolean;
  isWrongPosition: boolean;
  isPlaying: boolean;
  onPlay: (rate: number) => void;
}) {
  const { displayText, isTranslating, showTranslation, toggle } = useTranslateText(item.text, learningLang);
  const [showProvidedTranslation, setShowProvidedTranslation] = useState(false);

  const isTranslationVisible = englishTranslation ? showProvidedTranslation : showTranslation;
  const sentenceText = isTranslationVisible && englishTranslation ? englishTranslation : displayText;

  return (
    <Reorder.Item
      value={item}
      dragListener={!showFeedback}
      className={cn(
        "mx-auto flex w-full max-w-4xl items-start gap-2 rounded-2xl border-2 bg-white p-3 transition-colors duration-200 select-none dark:bg-slate-800 sm:gap-3 sm:p-4",
        !showFeedback && "cursor-grab active:cursor-grabbing hover:border-slate-300 dark:hover:border-slate-600",
        isCorrectPosition ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" :
          isWrongPosition ? "border-red-500 bg-red-50 dark:bg-red-900/20" : "border-slate-200 dark:border-slate-700",
      )}
      whileDrag={!showFeedback ? { scale: 1.02, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.15)", zIndex: 50 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {!showFeedback ? (
        <>
          <GripVertical className="mt-1 h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500 sm:h-5 sm:w-5" aria-hidden="true" />
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-500 dark:bg-slate-700 dark:text-slate-400 sm:h-8 sm:w-8" aria-label={`Position ${positionIndex + 1}`}>
            {positionIndex + 1}
          </span>
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              <button type="button" onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); onPlay(0.9); }} aria-label="Play sentence" title="Normal speed" className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-sky-50 hover:text-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:text-slate-300 dark:hover:bg-sky-900/30">
                <Volume2 className="h-5 w-5" aria-hidden="true" />
              </button>
              <button type="button" onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); onPlay(0.55); }} aria-label="Play sentence slowly" title="Slow speed" className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-sky-50 hover:text-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:text-slate-300 dark:hover:bg-sky-900/30">
                <Turtle className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <AudioWaveform isPlaying={isPlaying} decorative className="flex-1" />
          </div>
        </>
      ) : (
        <>
          {learningLang === "fr" && (englishTranslation || item.text) && (
            <TranslateButton
              iconVariant="option"
              onClick={() => englishTranslation ? setShowProvidedTranslation((visible) => !visible) : toggle()}
              onPointerDown={(event) => event.stopPropagation()}
              isLoading={!englishTranslation && isTranslating}
              aria-label={isTranslationVisible ? "Show original sentence" : "Translate sentence"}
              title={isTranslationVisible ? "Show original sentence" : "Translate sentence"}
              aria-pressed={isTranslationVisible}
            />
          )}
          <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold", isCorrectPosition ? "bg-emerald-500 text-white" : "bg-teal-500 text-white")} aria-label={`Correct position ${correctIndex + 1}`}>
            {correctIndex + 1}
          </span>
          <span className="practice-type-content min-w-0 flex-1 break-words font-medium text-slate-700 dark:text-slate-200">{sentenceText}</span>
        </>
      )}
    </Reorder.Item>
  );
}
