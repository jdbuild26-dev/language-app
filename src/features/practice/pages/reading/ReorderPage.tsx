"use client";

import React, { useState, useEffect } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { GripVertical, Languages } from "lucide-react";
import { Reorder } from "framer-motion";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { loadMockCSV } from "@/utils/csvLoader";
import { Button } from "@/components/ui/button";

type ReorderQuestion = {
  id: string | number;
  title?: string;
  correctOrder: string[];
  timeLimitSeconds?: number;
};

type OrderItem = {
  itemId: string;
  text: string;
};

export default function ReorderPage() {
  const handleExit = usePracticeExit();

  const [questions, setQuestions] = useState<ReorderQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const data = await loadMockCSV("practice/reading/reorder.csv");
      const normalizedData = (Array.isArray(data) ? data : [])
        .map((q, idx) => {
          let order = q?.correctOrder;
          if (typeof order === "string") {
            try {
              order = JSON.parse(order);
            } catch {
              order = [];
            }
          }
          if (!Array.isArray(order)) order = [];

          return {
            ...q,
            id: q?.id ?? `reorder-${idx}`,
            correctOrder: order.filter(
              (sentence) => typeof sentence === "string" && sentence.trim(),
            ),
          };
        })
        .filter((q) => q.correctOrder.length > 0);

      setQuestions(normalizedData);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const shuffleArray = (array: string[]) => {
    if (!array) return [];
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const currentQuestion = questions[currentIndex];
  const timerDuration = currentQuestion?.timeLimitSeconds || 60;

  const buildOrderItems = (sentences: string[], questionId: string | number) =>
    sentences.map((sentence, idx) => ({
      itemId: `${questionId}-${idx}-${sentence}`,
      text: sentence,
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
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentOrder(buildOrderItems(shuffled, currentQuestion.id));
      resetTimer();
    }
  }, [currentIndex, currentQuestion, isCompleted, resetTimer]);

  const handleSubmit = () => {
    if (showFeedback) return;

    if (!currentQuestion?.correctOrder?.length) return;

    const userOrderText = currentOrder.map((item) => item.text);
    const correct =
      JSON.stringify(userOrderText) ===
      JSON.stringify(currentQuestion.correctOrder);
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
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (questions.length === 0) {
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

  const progress =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  return (
    <>
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
        onNext={handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={!showFeedback}
        showSubmitButton={!showFeedback}
        submitLabel="Submit Answer"
        timerValue={timerString}
      >
        <div className="practice-reading-page-shell flex flex-col items-center justify-center w-full max-w-7xl mx-auto px-3 sm:px-4">
          <h1 className="w-full max-w-4xl mx-auto mb-8 text-center text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center justify-center gap-2">
            <Languages className="w-5 h-5 text-blue-500 shrink-0" />
            <span>{currentQuestion?.title || "Reorder the Sentences"}</span>
          </h1>

          {/* ✅ Removed the external static numbers column. Numbers now live inside each card. */}
          <div className="w-full max-w-4xl mx-auto">
            <Reorder.Group
              axis="y"
              values={currentOrder}
              onReorder={setCurrentOrder}
              className="w-full space-y-3"
            >
              {currentOrder.map((item, index) => {
                const sentence = item.text;
                const isCorrectPosition =
                  showFeedback &&
                  sentence === currentQuestion.correctOrder[index];
                const isWrongPosition = showFeedback && !isCorrectPosition;

                const correctIndex =
                  currentQuestion.correctOrder.indexOf(sentence);

                return (
                  <SortableItem
                    key={item.itemId}
                    itemValue={item}
                    sentence={sentence}
                    // ✅ Pass current position index so the badge shows the live position number
                    positionIndex={index}
                    correctIndex={correctIndex}
                    isCorrectPosition={isCorrectPosition}
                    isWrongPosition={isWrongPosition}
                    showFeedback={showFeedback}
                  />
                );
              })}
            </Reorder.Group>
          </div>

          {/* Full Sentence Display - Shown after submit */}
          {/* {showFeedback && (
            <div className="mt-8 w-full  animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-6 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl border-2 border-indigo-100 dark:border-indigo-900/50">
                <h3 className="text-xs uppercase tracking-wider text-indigo-500 font-bold mb-4 flex items-center justify-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                  Correct Order
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                </h3>
                <div className="flex flex-col gap-3 text-left max-w-lg mx-auto">
                  {currentQuestion.correctOrder.map((sentence, index) => (
                    <div
                      key={index}
                      className="flex gap-3 text-lg md:text-xl font-medium text-slate-700 dark:text-slate-200"
                    >
                      <span className="font-bold text-indigo-500 shrink-0 select-none">
                        {index + 1}.
                      </span>
                      <span>{sentence}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div> */}
          {/* )} */}
        </div>
      </PracticeGameLayout>

      {showFeedback && (
        <FeedbackBanner
          isCorrect={isCorrect}
          feedbackTone={isCorrect ? "success" : "error"}
          correctAnswer={undefined}
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

const SortableItem = ({
  itemValue,
  sentence,
  positionIndex, // ✅ live position in the current order (1-based label)
  correctIndex, // true position in correctOrder (for feedback badge)
  isCorrectPosition,
  isWrongPosition,
  showFeedback,
}: {
  itemValue: OrderItem;
  sentence: string;
  positionIndex: number;
  correctIndex: number;
  isCorrectPosition: boolean;
  isWrongPosition: boolean;
  showFeedback: boolean;
}) => {
  return (
    <Reorder.Item
      value={itemValue}
      className={cn(
        "flex items-center gap-3 p-4 rounded-2xl border-2 transition-colors duration-200 select-none bg-white dark:bg-slate-800",
        !showFeedback &&
          "cursor-grab active:cursor-grabbing hover:border-slate-300 dark:hover:border-slate-600",
        isCorrectPosition
          ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500"
          : isWrongPosition
            ? "bg-red-50 dark:bg-red-900/20 border-red-500"
            : "border-slate-200 dark:border-slate-700",
      )}
      style={{ height: "60px" }}
      whileDrag={{
        scale: 1.02,
        boxShadow: "0 10px 30px -10px rgba(0,0,0,0.15)",
        zIndex: 50,
      }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {/* Grip icon */}
      <GripVertical className="w-5 h-5 text-slate-400 dark:text-slate-500 shrink-0" />

      {/* ✅ Number badge — always inside the card */}
      <div className="w-8 h-8 flex items-center justify-center shrink-0">
        {showFeedback ? (
          // After submit: show the sentence's TRUE correct position number
          <span
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
              isCorrectPosition
                ? "bg-emerald-500 text-white"
                : "bg-teal-500 text-white",
            )}
          >
            {correctIndex + 1}
          </span>
        ) : (
          // Before submit: show live position number inside a rounded badge
          <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-500 dark:text-slate-400">
            {positionIndex + 1}
          </span>
        )}
      </div>

      {/* Sentence text */}
      <span className="flex-1 text-slate-700 dark:text-slate-200 font-medium select-none break-words">
        {sentence}
      </span>
    </Reorder.Item>
  );
};
