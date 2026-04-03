"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { Button } from "@/components/ui/button";
import { loadMockCSV } from "@/utils/csvLoader";
import { CheckCircle2, Loader2, Sparkles } from "lucide-react";

type ImageLabelItem = {
  name: string;
  x: number;
  y: number;
};

type ImageLabellingQuestion = {
  title?: string;
  instructionFr?: string;
  instructionEn?: string;
  localizedInstruction?: string;
  image?: string;
  items?: ImageLabelItem[] | string;
};

type PlacedItem = ImageLabelItem & {
  isCorrect: boolean | null;
};

const parseItems = (
  items: ImageLabellingQuestion["items"],
): ImageLabelItem[] => {
  if (Array.isArray(items)) return items;
  if (typeof items === "string") {
    try {
      const parsed = JSON.parse(items);
      return Array.isArray(parsed) ? (parsed as ImageLabelItem[]) : [];
    } catch {
      return [];
    }
  }
  return [];
};

export default function ImageLabellingPage() {
  const handleExit = usePracticeExit();
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });

  const [questions, setQuestions] = useState<ImageLabellingQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [bankItems, setBankItems] = useState<string[]>([]);
  const [placedItems, setPlacedItems] = useState<PlacedItem[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);

  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<ImageLabelItem | null>(
    null,
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await loadMockCSV("practice/reading/image_labelling.csv");
        setQuestions(
          Array.isArray(data) ? (data as ImageLabellingQuestion[]) : [],
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const currentExercise = questions[currentIndex];
  const items = useMemo(
    () => parseItems(currentExercise?.items),
    [currentExercise?.items],
  );

  const resetGame = () => {
    if (!items.length) return;

    const shuffled = [...items]
      .map((item) => item.name)
      .sort(() => Math.random() - 0.5);

    setBankItems(shuffled);
    setPlacedItems([]);
    setShowFeedback(false);
    setScore(0);
    setIsCorrect(false);
    setSelectedLabel(null);
    setSelectedTarget(null);
  };

  useEffect(() => {
    if (currentExercise) {
      resetGame();
      resetTimer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, currentExercise]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setImgSize({
      width: e.currentTarget.clientWidth,
      height: e.currentTarget.clientHeight,
    });
  };

  useEffect(() => {
    const handleResize = () => {
      if (imageRef.current) {
        setImgSize({
          width: imageRef.current.clientWidth,
          height: imageRef.current.clientHeight,
        });
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { timerString, resetTimer } = useExerciseTimer({
    mode: "stopwatch",
    onExpire: () => {},
    isPaused: isCompleted || showFeedback || isLoading,
  });

  const handleLabelClick = (name: string) => {
    if (showFeedback) return;

    if (selectedTarget) {
      placeItem(name, selectedTarget);
      setSelectedTarget(null);
      setSelectedLabel(null);
      return;
    }

    setSelectedLabel(selectedLabel === name ? null : name);
  };

  const handleTargetClick = (target: ImageLabelItem) => {
    if (showFeedback) return;

    const alreadyPlaced = placedItems.find(
      (p) =>
        Math.abs(p.x - target.x) < 0.0001 && Math.abs(p.y - target.y) < 0.0001,
    );

    if (alreadyPlaced) {
      handleReturnToBank(alreadyPlaced.name);
      return;
    }

    if (selectedLabel) {
      placeItem(selectedLabel, target);
      setSelectedLabel(null);
      setSelectedTarget(null);
    } else {
      setSelectedTarget(selectedTarget === target ? null : target);
    }
  };

  const placeItem = (name: string, target: ImageLabelItem) => {
    setBankItems((prev) => prev.filter((i) => i !== name));
    setPlacedItems((prev) => [
      ...prev,
      { name, x: target.x, y: target.y, isCorrect: null },
    ]);
  };

  const handleReturnToBank = (name: string) => {
    if (showFeedback) return;
    setPlacedItems((prev) => prev.filter((p) => p.name !== name));
    setBankItems((prev) => (prev.includes(name) ? prev : [...prev, name]));
  };

  const handleCheck = () => {
    if (!items.length) return;

    let correct = 0;
    const total = items.length;

    const newPlacedItems = placedItems.map((placed) => {
      const target = items.find(
        (k) =>
          Math.abs(k.x - placed.x) < 0.0001 &&
          Math.abs(k.y - placed.y) < 0.0001,
      );
      if (!target) return placed;

      const isHit = target.name === placed.name;
      if (isHit) correct++;

      return { ...placed, isCorrect: isHit };
    });

    setPlacedItems(newPlacedItems);
    setScore(correct);

    if (correct === total) {
      setIsCorrect(true);
      setFeedbackMessage(
        `Perfect! You identified all ${total} items correctly!`,
      );
    } else {
      setIsCorrect(false);
      setFeedbackMessage(
        `You got ${correct} out of ${total} correct. Check your placements!`,
      );
    }

    setShowFeedback(true);
  };

  const handleContinue = () => {
    if (!showFeedback) return;

    if (isCorrect && currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      return;
    }

    if (isCorrect && currentIndex >= questions.length - 1) {
      setIsCompleted(true);
      return;
    }

    setShowFeedback(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!currentExercise) {
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

  const totalItems = items.length;

  return (
    <PracticeGameLayout
      questionType={currentExercise.title || "Image Labelling"}
      questionTypeFr="Étiquetage d'image"
      questionTypeEn="Image Labelling"
      localizedInstruction={
        currentExercise.localizedInstruction ||
        currentExercise.instructionFr ||
        currentExercise.title
      }
      instructionFr={currentExercise.instructionFr || "Étiquetez l'image"}
      instructionEn={currentExercise.instructionEn || "Label the image"}
      progress={
        ((currentIndex + placedItems.length / (totalItems || 1)) /
          (questions.length || 1)) *
        100
      }
      isGameOver={isCompleted}
      score={score}
      totalQuestions={totalItems}
      currentQuestionIndex={currentIndex}
      questionCounterValue={currentIndex + 1}
      onExit={handleExit}
      onNext={showFeedback ? handleContinue : handleCheck}
      onRestart={() => {
        setCurrentIndex(0);
        setIsCompleted(false);
        setShowFeedback(false);
      }}
      isSubmitEnabled={placedItems.length > 0 || showFeedback}
      showSubmitButton={true}
      submitLabel={
        showFeedback
          ? isCorrect
            ? currentIndex < questions.length - 1
              ? "Next Exercise"
              : "Finish"
            : "Try Again"
          : "Check Answers"
      }
      timerValue={timerString}
      showFeedback={showFeedback}
      isCorrect={isCorrect}
      feedbackTone={
        showFeedback ? (isCorrect ? "success" : "error") : "neutral"
      }
      feedbackMessage={feedbackMessage}
      correctAnswer={undefined}
    >
      <div className="practice-reading-page-shell grid grid-cols-1 md:grid-cols-10 gap-4 p-3 md:p-4 mx-auto overflow-hidden">
        <div className="md:col-span-3 md:order-2 min-h-0 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-[0_8px_26px_-18px_rgba(15,23,42,0.55)]">
          <div className="px-4 py-5 bg-slate-50/90 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <h3 className="text-[11px] lg:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.18em]">
              Labels
            </h3>
            <p className="text-xs font-semibold text-sky-600 dark:text-sky-400">
              {bankItems.length} left
            </p>
          </div>

          <div className="flex flex-row flex-wrap md:flex-nowrap md:flex-col gap-2 p-3 overflow-x-visible md:overflow-y-auto custom-scrollbar no-scrollbar md:flex-1">
            {bankItems.length === 0 && placedItems.length === totalItems ? (
              <div className="flex flex-1 items-center justify-center gap-2 text-slate-400 dark:text-slate-500 min-w-full">
                <CheckCircle2 className="w-5 h-5 opacity-50 text-emerald-500" />
                <span className="text-xs font-semibold">Done!</span>
              </div>
            ) : (
              bankItems.map((name) => (
                <button
                  key={name}
                  onClick={() => handleLabelClick(name)}
                  className={cn(
                    "practice-reading-option-text px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-lg font-semibold text-xs sm:text-sm shadow-sm border transition-all duration-200 active:scale-[0.98] select-none whitespace-nowrap md:whitespace-normal text-center min-w-[84px] sm:min-w-[110px] md:min-w-0 flex-shrink-0 md:flex-shrink",
                    selectedLabel === name
                      ? "bg-sky-600 text-white border-sky-500 shadow-md ring-4 ring-sky-100 dark:ring-sky-900/40"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600 hover:border-sky-400 hover:bg-sky-50 dark:hover:bg-slate-700/60",
                  )}
                >
                  {name}
                </button>
              ))
            )}
          </div>
        </div>

        <div className="md:col-span-7 md:order-1 min-h-0 flex flex-col min-w-0 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-[0_12px_36px_-24px_rgba(15,23,42,0.6)] relative">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-900/80">
            <p className="practice-reading-option-text text-slate-700 dark:text-slate-200 font-medium text-center flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-500" />
              {selectedLabel
                ? `Tap a marker for "${selectedLabel}"`
                : selectedTarget
                  ? "Select the matching label now"
                  : "Select a label, then place it on a marker"}
            </p>
          </div>

          <div className="flex-1 flex items-center justify-center p-2 min-h-0 overflow-hidden bg-[radial-gradient(ellipse_at_top,rgba(148,163,184,0.14),transparent_58%)] dark:bg-none">
            <div
              className="relative transition-all duration-500 ease-out rounded-2xl overflow-hidden border border-slate-200/70 dark:border-slate-700/70 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.7)]"
              style={{
                width: imgSize.width || undefined,
                height: imgSize.height || undefined,
                maxWidth: "100%",
                maxHeight: "100%",
              }}
            >
              <img
                ref={imageRef}
                src={currentExercise.image || ""}
                alt={currentExercise.title || "Image labelling"}
                onLoad={handleImageLoad}
                className="block w-full h-auto max-h-[62vh] md:max-h-[68vh] object-contain pointer-events-none select-none"
              />

              {items.map((target, idx) => {
                const isPlaced = placedItems.some(
                  (p) =>
                    Math.abs(p.x - target.x) < 0.0001 &&
                    Math.abs(p.y - target.y) < 0.0001,
                );
                const isSelected = selectedTarget === target;

                return (
                  <button
                    key={idx}
                    onClick={() => handleTargetClick(target)}
                    className={cn(
                      "absolute w-4 h-4 lg:w-6 lg:h-6 rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 cursor-pointer flex items-center justify-center z-20",
                      isSelected
                        ? "bg-sky-600 ring-4 ring-sky-100 dark:ring-sky-900/50 scale-110 shadow-lg"
                        : isPlaced
                          ? "opacity-0 pointer-events-none"
                          : "bg-slate-100 hover:bg-sky-100 hover:scale-110 border-2 border-sky-500/70 dark:border-sky-400/70 shadow-md",
                    )}
                    style={{
                      left: `${target.x * 100}%`,
                      top: `${target.y * 100}%`,
                    }}
                  >
                    {isSelected && (
                      <div className="w-1.5 h-1.5 bg-white rounded-full shadow-inner" />
                    )}
                  </button>
                );
              })}

              {placedItems.map((item) => (
                <button
                  key={`${item.name}-${item.x}-${item.y}`}
                  onClick={() => handleReturnToBank(item.name)}
                  className={cn(
                    "absolute practice-reading-option-text px-2.5 py-1.5 lg:px-4 lg:py-2 rounded-lg lg:rounded-xl font-semibold text-[10px] lg:text-sm shadow-lg transform -translate-x-1/2 -translate-y-1/2 transition-all z-30 select-none whitespace-normal sm:whitespace-nowrap border active:scale-[0.98] group overflow-visible max-w-[44vw] sm:max-w-none break-words",
                    item.isCorrect === true
                      ? "bg-emerald-600 text-white border-emerald-500 ring-2 ring-emerald-100 dark:ring-emerald-900/30"
                    : item.isCorrect === false
                        ? "bg-rose-600 text-white border-rose-500 ring-2 ring-rose-100 dark:ring-rose-900/30"
                        : "bg-sky-50/95 dark:bg-slate-800/95 backdrop-blur-sm text-slate-900 dark:text-white border-sky-300 dark:border-slate-600 hover:border-rose-400 hover:bg-rose-50 dark:hover:bg-slate-700/60",
                  )}
                  style={{
                    left: `${item.x * 100}%`,
                    top: `${item.y * 100}%`,
                  }}
                >
                  {item.name}
                  {!showFeedback && item.isCorrect === null && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[8px] opacity-0 group-hover:opacity-100 transition-all shadow-lg scale-0 group-hover:scale-100">
                      ✕
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PracticeGameLayout>
  );
}
