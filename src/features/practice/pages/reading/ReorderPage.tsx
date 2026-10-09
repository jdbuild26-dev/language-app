"use client";

import React, { useState, useEffect, Suspense } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { GripVertical, Loader2 } from "lucide-react";
import { Reorder } from "framer-motion";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { loadMockCSV } from "@/utils/csvLoader";
import { Button } from "@/components/ui/button";
import { useQuestionLanguage } from "@/hooks/useQuestionLanguage";
import { usePracticeComplete } from "@/hooks/usePracticeComplete";
import { useSearchParams } from "next/navigation";
import { useTranslateText } from "@/hooks/useTranslateText";
import { TranslateButton } from "@/components/ui/TranslateButton";

type ReorderQuestion = {
  id: string | number;
  title?: string;
  title_fr?: string;
  title_en?: string;
  level?: string;
  // new bilingual
  correctOrder_fr?: string[];
  correctOrder_en?: string[];
  // legacy
  correctOrder: string[];
  timeLimitSeconds?: number;
};

type OrderItem = {
  itemId: string;
  text: string;
  index: number; // original correct index for EN lookup
};

function parseArr(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter(Boolean).map(String);
  if (typeof v === "string" && v) {
    try { return JSON.parse(v); } catch { return []; }
  }
  return [];
}

export default function ReorderPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    }>
      <ReorderContent />
    </Suspense>
  );
}

function ReorderContent() {
  const handleExit = usePracticeExit();
  const searchParams = useSearchParams();
  const tag = searchParams?.get("tag") ?? undefined;

  const [questions, setQuestions] = useState<ReorderQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [showSentenceTranslations, setShowSentenceTranslations] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await loadMockCSV("practice/reading/reorder.csv", { tag });
        const mapped = (Array.isArray(data) ? data : []).map((item: any, idx: number) => {
          const c = item.content || item;
          const e = item.evaluation || item;

          // ── New bilingual format (ROS exercises) ──
          const fr = parseArr(c.correctOrder_fr || item.correctOrder_fr);
          const en = parseArr(c.correctOrder_en || item.correctOrder_en);

          // ── Old seed format: Sentences array + CorrectOrder as index array ──
          // e.g. Sentences: ["le lundi...", "le mercredi..."], CorrectOrder: [0,1,2,3]
          let legacySentences: string[] = [];
          const rawSentences = c.Sentences || item.Sentences || item.sentences;
          const rawOrder = e.CorrectOrder || item.CorrectOrder || e.correctOrder || item.correctOrder || item.eval_correctOrder;

          if (rawSentences && Array.isArray(rawSentences)) {
            const orderIndices = Array.isArray(rawOrder)
              ? rawOrder.map(Number)
              : typeof rawOrder === "string"
                ? rawOrder.split(",").map(s => Number(s.trim()))
                : rawSentences.map((_: any, i: number) => i);
            // Reorder sentences by the index array
            legacySentences = orderIndices
              .map((i: number) => rawSentences[i])
              .filter(Boolean)
              .map(String);
          } else if (rawOrder && !Array.isArray(rawOrder)) {
            // Flat string array like "0,1,2,3" with no Sentences — skip
            legacySentences = [];
          }

          const correctOrder = fr.length > 0 ? fr : legacySentences;

          return {
            id:               item.external_id || item.ExerciseID || `reorder-${idx}`,
            level:            item.Level || item.level || '',
            title_fr:         c.title_fr || item.title_fr || c.passage_title_fr || item.passage_title_fr || c.ContextTitle || item.ContextTitle || '',
            title_en:         c.title_en || item.title_en || c.passage_title_en || item.passage_title_en || c.title || item.title || c.ContextTitle || item.ContextTitle || '',
            title:            c.title_en || item.title_en || c.passage_title_en || item.passage_title_en || c.title || item.title || c.ContextTitle || item.ContextTitle || '',
            correctOrder_fr:  fr.length > 0 ? fr : correctOrder,
            correctOrder_en:  en,
            correctOrder,
            timeLimitSeconds: Number(item.timeLimitSeconds || item.TimeLimitSeconds || 360),
          } as ReorderQuestion;
        }).filter(q => q.correctOrder.length > 0);

        setQuestions(mapped);
      } catch (e) {
        console.error("Error loading reorder data:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [tag]);

  const shuffleArray = (array: string[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const currentQuestion = questions[currentIndex];
  const { pick, learningLang } = useQuestionLanguage(currentQuestion?.level);
  usePracticeComplete({ isGameOver: isCompleted, score, totalQuestions: questions.length, exerciseType: "reorder_sentences", level: currentQuestion?.level });
  const headingText = pick(currentQuestion?.title_fr, currentQuestion?.title_en)
    || currentQuestion?.title || "";

  const { displayText: headingDisplayText, isTranslating: isTranslatingH, toggle: toggleTranslate, reset: resetTranslate } = useTranslateText(headingText, learningLang);
  // Reset translation when question changes
  React.useEffect(() => { resetTranslate(); }, [currentIndex]); // eslint-disable-line react-hooks/exhaustive-deps
  const timerDuration = currentQuestion?.timeLimitSeconds || 360;

  const buildOrderItems = (sentences: string[], questionId: string | number): OrderItem[] =>
    sentences.map((sentence, idx) => ({
      itemId:  `${questionId}-${idx}-${sentence.slice(0, 20)}`,
      text:    sentence,
      index:   idx,
    }));

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
    isPaused: isCompleted || showFeedback,
  });

  useEffect(() => {
    if (currentQuestion && !isCompleted) {
      const shuffled = shuffleArray(currentQuestion.correctOrder);
      setCurrentOrder(buildOrderItems(shuffled, currentQuestion.id));
      resetTimer();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, currentQuestion, isCompleted]);

  const handleSubmit = () => {
    if (showFeedback || !currentQuestion?.correctOrder?.length) return;
    const userOrderText = currentOrder.map(item => item.text);
    const correct = JSON.stringify(userOrderText) === JSON.stringify(currentQuestion.correctOrder);
    setIsCorrect(correct);
    setFeedbackMessage(getFeedbackMessage(correct));
    setShowFeedback(true);
    if (correct) setScore(prev => prev + 1);
  };

  const handleContinue = () => {
    setShowFeedback(false);
    setShowSentenceTranslations(false);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
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

  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  return (
      <PracticeGameLayout
        questionType="Reorder Sentences"
        questionTypeFr="Réorganisez les phrases"
        questionTypeEn="Reorder Sentences"
        instructionFr="Mettez les phrases dans le bon ordre"
        instructionEn="Put the sentences in the correct order"
        localizedInstruction="Mettez les phrases dans le bon ordre"
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
        isSubmitEnabled={!showFeedback}
        submitLabel={showFeedback ? (currentIndex + 1 === questions.length ? "FINISH" : "CONTINUE") : "Submit Answer"}
        disableContentScroll
        showFeedback={showFeedback}
        isCorrect={isCorrect}
        feedbackMessage={feedbackMessage}
        compactFeedback
        feedbackInFlow
        onFeedbackTranslate={showFeedback && learningLang === "fr" && Boolean(currentQuestion.correctOrder_en?.length) ? () => setShowSentenceTranslations(value => !value) : undefined}
        feedbackTranslationVisible={showSentenceTranslations}
        timerValue={timerString}
      >
        <div className="flex w-full min-h-0 flex-1 flex-col py-4 sm:py-6">
          {headingText && (
            <div className="mx-auto flex w-full max-w-4xl shrink-0 items-start gap-2 border-b border-slate-200 px-3 pb-3 dark:border-slate-700 sm:px-4 sm:pb-4">
              <h2 className="practice-type-content-heading min-w-0 flex-1 text-center text-slate-900 dark:text-slate-100">
                {headingDisplayText}
              </h2>
              <TranslateButton
                onClick={toggleTranslate}
                isLoading={isTranslatingH}
                aria-label="Translate passage title"
                iconSize="md"
              />
            </div>
          )}

          <div className={cn("w-full min-h-0 flex-1", headingText && "mt-4 sm:mt-6")}>
            <Reorder.Group
              axis="y"
              values={currentOrder}
              onReorder={setCurrentOrder}
              layoutScroll
              className="practice-game-scroll h-full w-full space-y-3 overflow-x-hidden overflow-y-auto px-3 pb-2 sm:px-4"
            >
              {currentOrder.map((item, index) => {
                const sentence = item.text;
                const correctIdx = currentQuestion.correctOrder.indexOf(sentence);
                const isCorrectPosition = showFeedback && sentence === currentQuestion.correctOrder[index];
                const isWrongPosition   = showFeedback && !isCorrectPosition;
                // EN translation: look up by correct position index
                const enSentence = showFeedback && currentQuestion.correctOrder_en?.[correctIdx]
                  ? currentQuestion.correctOrder_en[correctIdx]
                  : null;

                return (
                  <SortableItem
                    key={item.itemId}
                    itemValue={item}
                    sentence={sentence}
                    enSentence={enSentence}
                    positionIndex={index}
                    correctIndex={correctIdx}
                    isCorrectPosition={isCorrectPosition}
                    isWrongPosition={isWrongPosition}
                    showFeedback={showFeedback}
                    learningLang={learningLang}
                  />
                );
              })}
            </Reorder.Group>
          </div>
        </div>
      </PracticeGameLayout>
  );
}

const SortableItem = ({
  itemValue, sentence, enSentence, positionIndex, correctIndex,
  isCorrectPosition, isWrongPosition, showFeedback, learningLang,
}: {
  itemValue: OrderItem;
  sentence: string;
  enSentence: string | null;
  positionIndex: number;
  correctIndex: number;
  isCorrectPosition: boolean;
  isWrongPosition: boolean;
  showFeedback: boolean;
  learningLang: string;
}) => {
  const [showSentenceTranslation, setShowSentenceTranslation] = React.useState(false);

  return (
    <Reorder.Item
      value={itemValue}
      dragListener={!showFeedback}
      className={cn(
        "mx-auto flex w-full max-w-4xl items-start gap-2 rounded-2xl border-2 bg-white p-3 transition-colors duration-200 select-none dark:bg-slate-800 sm:gap-3 sm:p-4",
        !showFeedback && "cursor-grab active:cursor-grabbing hover:border-slate-300 dark:hover:border-slate-600",
        isCorrectPosition ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500"
          : isWrongPosition ? "bg-red-50 dark:bg-red-900/20 border-red-500"
          : "border-slate-200 dark:border-slate-700",
      )}
      whileDrag={{ scale: 1.02, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.15)", zIndex: 50 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <GripVertical className="mt-1 h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500 sm:h-5 sm:w-5" />

      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center sm:h-8 sm:w-8">
        {showFeedback ? (
          <span className={cn(
            "flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold sm:h-8 sm:w-8",
            isCorrectPosition ? "bg-emerald-500 text-white" : "bg-teal-500 text-white",
          )}>
            {correctIndex + 1}
          </span>
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-500 dark:bg-slate-700 dark:text-slate-400 sm:h-8 sm:w-8">
            {positionIndex + 1}
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 items-start gap-2">
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="practice-type-content text-slate-700 dark:text-slate-200 font-medium select-none break-words">
            {showSentenceTranslation && enSentence && learningLang === "fr" ? enSentence : sentence}
          </span>
        </div>
        {showFeedback && enSentence && learningLang === "fr" && (
          <TranslateButton
            iconVariant="option"
            onClick={() => setShowSentenceTranslation(value => !value)}
            aria-label={showSentenceTranslation ? "Show original sentence" : "Translate sentence"}
            title={showSentenceTranslation ? "Show original sentence" : "Translate sentence"}
            aria-pressed={showSentenceTranslation}
          />
        )}
      </div>
    </Reorder.Item>
  );
};
