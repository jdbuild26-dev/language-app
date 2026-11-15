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
    title_fr: textValue(content.title_fr, item.title_fr, content.passage_title_fr, item.passage_title_fr, content["Passage Title_FR"], item["Passage Title_FR"], content["Context Title_FR"], item["Context Title_FR"]),
    title_en: textValue(content.title_en, item.title_en, content.passage_title_en, item.passage_title_en, content["Passage Title_EN"], item["Passage Title_EN"], content["Context Title_EN"], item["Context Title_EN"]),
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
  const { speak, isSpeaking, cancel } = useTextToSpeech();
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
  const [playingRate, setPlayingRate] = useState(0.9);

  const currentQuestion = questions[currentIndex];
  const { learningLang, pick } = useQuestionLanguage(currentQuestion?.level);
  const headingText = pick(currentQuestion?.title_fr, currentQuestion?.title_en) || "Passage";
  const headingSourceLang = headingText === currentQuestion?.title_en ? "en" : "fr";
  const headingCounterpart = headingSourceLang === "fr" ? currentQuestion?.title_en : currentQuestion?.title_fr;
  const { displayText: headingDisplayText, toggle: toggleHeading, reset: resetHeading, isTranslating: isTranslatingHeading } = useTranslateText(headingText, headingSourceLang, headingCounterpart);
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
        resetHeading();
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
  // resetHeading is intentionally excluded: the shared hook recreates it each render.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tag]);

  const playSentence = (text: string, itemId: string, rate: number) => {
    setPlayingRate(rate);
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
    cancel();
    resetHeading();
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
      <div className="mx-auto flex min-h-0 w-full max-w-[1200px] flex-1 flex-col py-4 sm:py-6">
        {headingText && <div className="mx-3 flex shrink-0 items-start gap-2 border-b border-slate-200 pb-3 dark:border-slate-700 sm:mx-4 sm:pb-4">
          <h2 className="practice-type-content-heading min-w-0 flex-1 text-center text-slate-900 dark:text-slate-100 !font-medium">{headingDisplayText}</h2>
          <div className="h-8 w-8 shrink-0">
            {showFeedback && <TranslateButton onClick={toggleHeading} isLoading={isTranslatingHeading} aria-label="Translate passage title" iconSize="md" />}
          </div>
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
                  playingRate={playingRate}
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
  playingRate,
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
  playingRate: number;
  onPlay: (rate: number) => void;
}) {
  const { displayText, isTranslating, showTranslation, toggle } = useTranslateText(item.text, "fr", englishTranslation);
  const [showProvidedTranslation, setShowProvidedTranslation] = useState(false);

  const isTranslationVisible = englishTranslation ? showProvidedTranslation : showTranslation;
  const sentenceText = isTranslationVisible && englishTranslation ? englishTranslation : displayText;
  const playbackButtonClass = (rate: number) => cn(
    "flex h-10 w-10 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2",
    isPlaying && playingRate === rate
      ? "bg-sky-500 text-white shadow-[0_0_0_3px_rgba(14,165,233,0.2)] hover:bg-sky-600 dark:bg-sky-600 dark:text-white"
      : "bg-sky-100 text-sky-700 hover:bg-sky-200 dark:bg-sky-900/40 dark:text-sky-300 dark:hover:bg-sky-900/60",
  );

  return (
    <Reorder.Item
      value={item}
      dragListener={!showFeedback}
      className={cn(
        "flex w-full min-h-[80px] items-center gap-2 rounded-2xl border-2 bg-white p-3 transition-colors duration-200 select-none dark:bg-slate-800 sm:gap-3 sm:p-4",
        !showFeedback && "cursor-grab active:cursor-grabbing hover:border-slate-300 dark:hover:border-slate-600",
        isCorrectPosition ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" :
          isWrongPosition ? "border-red-500 bg-red-50 dark:bg-red-900/20" : "border-slate-200 dark:border-slate-700",
      )}
      whileDrag={!showFeedback ? { scale: 1.02, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.15)", zIndex: 50 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <>
          <GripVertical className="mt-1 h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500 sm:h-5 sm:w-5" aria-hidden="true" />
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-500 dark:bg-slate-700 dark:text-slate-400 sm:h-8 sm:w-8" aria-label={showFeedback ? `Correct position ${correctIndex + 1}` : `Position ${positionIndex + 1}`}>
            {showFeedback ? correctIndex + 1 : positionIndex + 1}
          </span>
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              <button type="button" onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); onPlay(0.55); }} aria-label="Play sentence slowly" aria-pressed={isPlaying && playingRate === 0.55} title="Slow speed" className={playbackButtonClass(0.55)}>
                <Turtle className="h-5 w-5" aria-hidden="true" />
              </button>
              <button type="button" onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); onPlay(0.9); }} aria-label="Play sentence at normal speed" aria-pressed={isPlaying && playingRate === 0.9} title="Normal speed" className={playbackButtonClass(0.9)}>
                <Volume2 className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className="relative grid min-w-0 flex-1 items-center">
              <span aria-hidden="true" className="invisible col-start-1 row-start-1 practice-type-content break-words font-normal">{item.text}</span>
              <span aria-hidden="true" className="invisible col-start-1 row-start-1 practice-type-content break-words font-normal">{englishTranslation}</span>
              {showFeedback ? (
                <span className="col-start-1 row-start-1 practice-type-content break-words font-normal text-slate-700 dark:text-slate-200">{sentenceText}</span>
              ) : (
                <AudioWaveform isPlaying={isPlaying} decorative className="absolute inset-x-0" />
              )}
            </div>
            <div className="h-8 w-8 shrink-0">
              {showFeedback && learningLang === "fr" && (
                <TranslateButton iconVariant="option" onClick={() => englishTranslation ? setShowProvidedTranslation(visible => !visible) : toggle()} onPointerDown={event => event.stopPropagation()} isLoading={!englishTranslation && isTranslating} aria-label={isTranslationVisible ? "Show original sentence" : "Translate sentence"} aria-pressed={isTranslationVisible} />
              )}
            </div>
          </div>
      </>
    </Reorder.Item>
  );
}
