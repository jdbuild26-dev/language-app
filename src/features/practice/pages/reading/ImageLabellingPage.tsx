"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { loadMockCSV } from "@/utils/csvLoader";
import { CheckCircle2 } from "lucide-react";

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
  items?: ImageLabelItem[];
};

type PlacedItem = ImageLabelItem & {
  isCorrect: boolean | null;
};

export default function ImageLabellingPage() {
  const handleExit = usePracticeExit();
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });

  // Game Data
  const [questions, setQuestions] = useState<ImageLabellingQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [bankItems, setBankItems] = useState<string[]>([]);
  const [placedItems, setPlacedItems] = useState<PlacedItem[]>([]);
  const [isCompleted, setIsCompleted] = useState(false); // Entirely finished all exercises
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const data = await loadMockCSV("practice/reading/image_labelling.csv");
      setQuestions(Array.isArray(data) ? (data as ImageLabellingQuestion[]) : []);
      setIsLoading(false);
    };
    fetchData();
  }, []);
    const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
    const [selectedTarget, setSelectedTarget] = useState<ImageLabelItem | null>(
      null,
    );

    useEffect(() => {
      const fetchData = async () => {
        const data = await loadMockCSV("practice/reading/image_labelling.csv");
        setQuestions(Array.isArray(data) ? (data as ImageLabellingQuestion[]) : []);
        setIsLoading(false);
      };
      fetchData();
    }, []);

    const currentExercise = questions[currentIndex];
    const items = currentExercise?.items || [];

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

    const resetGame = () => {
      if (!currentExercise) return;

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
      }
    }, [currentIndex, currentExercise]); // eslint-disable-line react-hooks/exhaustive-deps

    const { timerString } = useExerciseTimer({
      mode: "stopwatch",
      onExpire: () => {},
      isPaused: isCompleted || showFeedback,
    });

    const handleLabelClick = (name: string) => {
      if (showFeedback) return;

      if (selectedTarget) {
        placeItem(name, selectedTarget);
        setSelectedTarget(null);
        setSelectedLabel(null);
      } else {
        setSelectedLabel(selectedLabel === name ? null : name);
      }
    };

    const handleTargetClick = (target: ImageLabelItem) => {
      if (showFeedback) return;

      const alreadyPlaced = placedItems.find(
        (p) => p.x === target.x && p.y === target.y,
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
        const target = items.find((k) => k.x === placed.x && k.y === placed.y);
        if (!target) return placed;

        const isHit = target.name === placed.name;
        if (isHit) correct++;

        return { ...placed, isCorrect: isHit };
      });

      setPlacedItems(newPlacedItems);
      setScore(correct);

      if (correct === total) {
        setIsCorrect(true);
        setFeedbackMessage(`Perfect! You identified all ${total} items correctly!`);
      } else {
        setIsCorrect(false);
        setFeedbackMessage(
          `You got ${correct} out of ${total} correct. Check your placements!`,
        );
      }

      setShowFeedback(true);
    };

    const handleContinue = () => {
      if (isCorrect) {
        if (currentIndex < questions.length - 1) {
          setCurrentIndex((prev) => prev + 1);
        } else {
          setIsCompleted(true);
        }
      }

      setShowFeedback(false);
    };

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (!currentExercise) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
          <p className="text-xl text-slate-600 dark:text-slate-400">
            No questions available.
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

    const itemCount = items.length;
    const progress =
      questions.length > 0
        ? ((currentIndex + placedItems.length / (itemCount || 1)) /
            questions.length) *
          100
        : 0;

    const submitLabel = showFeedback
      ? isCorrect
        ? currentIndex < questions.length - 1
          ? "NEXT EXERCISE"
          : "FINISH"
        : "TRY AGAIN"
      : "Check Answers";

    const handleNext = showFeedback ? handleContinue : handleCheck;

    return (
      <PracticeGameLayout
        questionType={currentExercise.title || "Image Labelling"}
        questionTypeFr="Étiquetage d'image"
        questionTypeEn="Image Labelling"
        localizedInstruction={currentExercise.localizedInstruction}
        instructionFr={currentExercise.instructionFr || "Étiquetez l'image"}
        instructionEn={currentExercise.instructionEn || "Label the image"}
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        questionCounterValue={currentIndex + 1}
        currentQuestionIndex={currentIndex + 1}
        totalQuestions={itemCount}
        onExit={handleExit}
        onNext={handleNext}
        onRestart={() => {
          setCurrentIndex(0);
          setIsCompleted(false);
        }}
        isSubmitEnabled={placedItems.length > 0 && !showFeedback}
        showSubmitButton={true}
        submitLabel={submitLabel}
        feedbackTone={showFeedback ? (isCorrect ? "success" : "error") : "neutral"}
        showFeedback={showFeedback}
        isCorrect={isCorrect}
        feedbackMessage={feedbackMessage}
        correctAnswer={undefined}
        timerValue={timerString}
      >
        <div className="flex flex-col md:flex-row-reverse gap-3 p-3 md:p-4 mx-auto w-full flex-1 pb-[108px] overflow-hidden">
          <div className="flex-1 shrink-0 flex flex-col bg-slate-100 dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            <div className="px-4 py-2 lg:py-3 bg-slate-200/70 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-600 flex lg:flex-col justify-between items-center lg:items-center">
              <h3 className="text-[10px] lg:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                Labels
              </h3>
              <p className="text-[10px] lg:text-xs font-bold text-sky-600 dark:text-sky-400">
                {bankItems.length} left
              </p>
            </div>

            <div className="flex lg:flex-col flex-row gap-2 p-3 overflow-x-auto lg:overflow-y-auto custom-scrollbar no-scrollbar lg:flex-1">
              {bankItems.length === 0 && placedItems.length === itemCount ? (
                <div className="flex flex-1 items-center justify-center gap-2 text-slate-400 min-w-full">
                  <CheckCircle2 className="w-5 h-5 opacity-50 text-emerald-500" />
                  <span className="text-xs font-semibold">Done!</span>
                </div>
              ) : (
                bankItems.map((name) => (
                  <button
                    key={name}
                    onClick={() => handleLabelClick(name)}
                    className={cn(
                      "px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm border transition-all active:scale-95 select-none whitespace-nowrap lg:whitespace-normal text-center min-w-[120px] lg:min-w-0 flex-shrink-0 lg:flex-shrink",
                      selectedLabel === name
                        ? "bg-blue-600 text-white border-blue-400 shadow-md ring-4 ring-blue-100 dark:ring-blue-900/50"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-slate-700/50",
                    )}
                  >
                    {name}
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900/40 rounded-2xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm relative">
            <div className="absolute top-4 left-4 right-4 z-10 pointer-events-none text-center">
              <span className="inline-block px-4 py-1.5 bg-slate-900/80 backdrop-blur-md text-white text-[10px] lg:text-xs font-bold rounded-full shadow-lg border border-white/20">
                {selectedLabel
                  ? `📍 Tap a dot for "${selectedLabel}"`
                  : selectedTarget
                    ? "🏷️ Tap a label now"
                    : "Tap a label then a dot"}
              </span>
            </div>

            <div className="flex-1 flex items-center justify-center p-4 min-h-0 overflow-hidden">
              <div
                className="relative transition-transform duration-500 ease-out shadow-2xl rounded-2xl overflow-hidden"
                style={{
                  width: imgSize.width || "auto",
                  height: imgSize.height || "auto",
                  maxWidth: "100%",
                  maxHeight: "100%",
                }}
              >
                <img
                  ref={imageRef}
                  src={currentExercise.image || ""}
                  alt={currentExercise.title || "Image labelling"}
                  onLoad={handleImageLoad}
                  className="block max-w-full max-h-[calc(100vh-320px)] lg:max-h-[calc(100vh-280px)] w-auto h-auto object-contain pointer-events-none select-none"
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
                        "absolute w-2 h-2 lg:w-6 lg:h-6 rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all cursor-pointer flex items-center justify-center z-20",
                        isSelected
                          ? "bg-blue-500 ring-2 ring-blue-200 dark:ring-blue-900 scale-110 shadow-xl"
                          : isPlaced
                            ? "opacity-0 pointer-events-none"
                            : "bg-amber-400/90 hover:bg-amber-500 hover:scale-110 border-2 border-white dark:border-slate-800 shadow-lg animate-pulse",
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
                    key={item.name}
                    onClick={() => handleReturnToBank(item.name)}
                    className={cn(
                      "absolute px-2.5 py-1.5 lg:px-4 lg:py-2 rounded-lg lg:rounded-xl font-bold text-[10px] lg:text-sm shadow-xl transform -translate-x-1/2 -translate-y-1/2 transition-all z-30 select-none whitespace-nowrap border-2 active:scale-95 group overflow-visible",
                      item.isCorrect === true
                        ? "bg-emerald-500 text-white border-emerald-400 ring-2 ring-emerald-100 dark:ring-emerald-900/30"
                        : item.isCorrect === false
                          ? "bg-red-500 text-white border-red-400 ring-2 ring-red-100 dark:ring-red-900/30"
                          : "bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm text-slate-800 dark:text-white border-white dark:border-slate-600 hover:border-red-400 hover:bg-red-50",
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
