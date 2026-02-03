import React, { useState, useEffect, useRef } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import kitchenImage from "@/assets/kitchen.jpg";
import { CheckCircle2 } from "lucide-react";

// Initial Configuration
// TODO: Load this data dynamically based on props or URL params (e.g. ?id=kitchen)
const KITCHEN_ITEMS = [
  { name: "Refrigerator", x: 88, y: 55, radius: 8 },
  { name: "Microwave", x: 62, y: 28, radius: 6 },
  { name: "Stove", x: 62, y: 60, radius: 6 },
  { name: "Sink", x: 40, y: 52, radius: 6 },
  { name: "Toaster", x: 12, y: 52, radius: 5 },
  { name: "Cabinets", x: 25, y: 18, radius: 7 },
  { name: "Dishwasher", x: 50, y: 70, radius: 6 },
  { name: "Counter", x: 30, y: 52, radius: 8 },
];

export default function ImageLabellingPage() {
  const handleExit = usePracticeExit();

  // State
  const [bankItems, setBankItems] = useState([]);
  const [placedItems, setPlacedItems] = useState([]); // Array of { name, x, y, isCorrect }
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);

  // New Selection State
  const [selectedLabel, setSelectedLabel] = useState(null); // String (name)
  const [selectedTarget, setSelectedTarget] = useState(null); // Object from KITCHEN_ITEMS

  // Initialize
  useEffect(() => {
    resetGame();
  }, []);

  const resetGame = () => {
    // Shuffle items for the bank
    const shuffled = [...KITCHEN_ITEMS]
      .map((item) => item.name)
      .sort(() => Math.random() - 0.5);
    setBankItems(shuffled);
    setPlacedItems([]);
    setIsCompleted(false);
    setShowFeedback(false);
    setScore(0);
    setIsCorrect(false);
    setSelectedLabel(null);
    setSelectedTarget(null);
  };

  const { timerString, stopTimer } = useExerciseTimer({
    mode: "stopwatch",
    isPaused: isCompleted || showFeedback,
  });

  const handleLabelClick = (name) => {
    if (showFeedback) return;

    if (selectedTarget) {
      // Place selected label into selected target
      placeItem(name, selectedTarget);
      setSelectedTarget(null);
      setSelectedLabel(null);
    } else {
      // Just select or toggle the label
      setSelectedLabel(selectedLabel === name ? null : name);
    }
  };

  const handleTargetClick = (target) => {
    if (showFeedback) return;

    // Check if there's already an item at this target
    const alreadyPlaced = placedItems.find(
      (p) => p.x === target.x && p.y === target.y
    );

    if (alreadyPlaced) {
      // Return to bank
      handleReturnToBank(alreadyPlaced.name);
      return;
    }

    if (selectedLabel) {
      // Place selected label into this target
      placeItem(selectedLabel, target);
      setSelectedLabel(null);
      setSelectedTarget(null);
    } else {
      // Just select or toggle the target
      setSelectedTarget(selectedTarget === target ? null : target);
    }
  };

  const placeItem = (name, target) => {
    // 1. Remove from bank
    setBankItems((prev) => prev.filter((i) => i !== name));

    // 2. Add to placed items
    setPlacedItems((prev) => [
      ...prev,
      { name, x: target.x, y: target.y, isCorrect: null },
    ]);
  };

  const handleReturnToBank = (name) => {
    if (showFeedback) return;
    setPlacedItems((prev) => prev.filter((p) => p.name !== name));
    setBankItems((prev) => {
      if (!prev.includes(name)) return [...prev, name];
      return prev;
    });
  };

  const handleCreateCheck = () => {
    let correct = 0;
    const total = KITCHEN_ITEMS.length;

    const newPlacedItems = placedItems.map((placed) => {
      const target = KITCHEN_ITEMS.find(
        (k) => k.x === placed.x && k.y === placed.y
      );
      if (!target) return placed;

      const isHit = target.name === placed.name;
      if (isHit) correct++;

      return {
        ...placed,
        isCorrect: isHit,
      };
    });

    setPlacedItems(newPlacedItems);
    setScore(correct);

    if (correct === total) {
      setIsCorrect(true);
      setFeedbackMessage(
        `Perfect! You identified all ${total} items correctly!`
      );
      setIsCompleted(true);
      stopTimer();
    } else {
      setIsCorrect(false);
      setFeedbackMessage(
        `You got ${correct} out of ${total} correct. Keep trying!`
      );
    }
    setShowFeedback(true);
  };

  return (
    <>
      <PracticeGameLayout
        questionType="Kitchen Labelling"
        instructionFr="Étiquetez la cuisine"
        instructionEn="Label the kitchen"
        progress={(placedItems.length / KITCHEN_ITEMS.length) * 100}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={KITCHEN_ITEMS.length}
        onExit={handleExit}
        onNext={handleCreateCheck}
        onRestart={resetGame}
        isSubmitEnabled={placedItems.length > 0 && !showFeedback}
        showSubmitButton={!showFeedback}
        submitLabel="Check Answers"
        timerValue={timerString}
      >
        {/* Main Container - Two Column Layout */}
        <div className="flex flex-row w-full h-full gap-4 p-4 overflow-hidden">
          {/* Left Column - Label Bank */}
          <div className="w-48 shrink-0 flex flex-col bg-slate-100 dark:bg-slate-900 rounded-xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Bank Header */}
            <div className="px-4 py-3 bg-slate-200/70 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-600">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide text-center">
                Labels
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-1">
                {bankItems.length} / {KITCHEN_ITEMS.length} remaining
              </p>
            </div>

            {/* Bank Items */}
            <div className="flex-1 p-3 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
              {bankItems.length === 0 &&
                placedItems.length === KITCHEN_ITEMS.length ? (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400">
                  <CheckCircle2 className="w-8 h-8 opacity-50" />
                  <span className="text-xs font-medium text-center">
                    All items placed!
                  </span>
                </div>
              ) : (
                bankItems.map((name) => (
                  <button
                    key={name}
                    onClick={() => handleLabelClick(name)}
                    className={cn(
                      "px-3 py-2 rounded-lg font-medium text-sm shadow-sm border transition-all active:scale-95 select-none text-center",
                      selectedLabel === name
                        ? "bg-blue-600 text-white border-blue-400 shadow-md ring-2 ring-blue-300 ring-offset-1"
                        : "bg-white dark:bg-slate-700 text-slate-800 dark:text-white border-slate-200 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-slate-600"
                    )}
                  >
                    {name}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right Column - Image Workspace */}
          <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-900/50 rounded-xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Workspace Header */}
            <div className="px-4 py-2 bg-slate-200/70 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-600 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 leading-none">
                🎯 {selectedLabel ? `Now select a dot for "${selectedLabel}"` : selectedTarget ? "Now select a label for the highlighted dot" : "Select a label and then a dot (or vice-versa)"}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-300/50 dark:bg-slate-700 px-2 py-1 rounded-full">
                {placedItems.length} placed
              </span>
            </div>

            {/* Image Container */}
            <div className="flex-1 flex items-center justify-center p-4 min-h-0 overflow-hidden">
              <div className="relative inline-block max-w-full max-h-full">
                <img
                  src={kitchenImage}
                  alt="Kitchen"
                  className="block max-w-full max-h-[calc(100vh-280px)] w-auto h-auto object-contain rounded-lg shadow-lg border-2 border-slate-300 dark:border-slate-600 pointer-events-none select-none"
                />

                {/* Targets (Dots) */}
                {KITCHEN_ITEMS.map((target, idx) => {
                  const isPlaced = placedItems.some(
                    (p) => p.x === target.x && p.y === target.y
                  );
                  const isSelected = selectedTarget === target;

                  return (
                    <button
                      key={idx}
                      onClick={() => handleTargetClick(target)}
                      className={cn(
                        "absolute w-6 h-6 rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all cursor-pointer flex items-center justify-center",
                        isSelected
                          ? "w-8 h-8 bg-blue-500 ring-4 ring-blue-300 z-20"
                          : isPlaced
                            ? "opacity-0 pointer-events-none" // Hide target dots if already covered
                            : "bg-amber-400/80 hover:bg-amber-500 hover:scale-125 border-2 border-white shadow-md animate-pulse"
                      )}
                      style={{
                        left: `${target.x}%`,
                        top: `${target.y}%`,
                      }}
                    >
                      {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                    </button>
                  );
                })}

                {/* Placed Labels */}
                {placedItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => handleReturnToBank(item.name)}
                    className={cn(
                      "absolute px-3 py-1.5 rounded-lg font-semibold text-sm shadow-lg transform -translate-x-1/2 -translate-y-1/2 transition-all z-10 select-none whitespace-nowrap border-2 active:scale-95 group",
                      item.isCorrect === true
                        ? "bg-emerald-500 text-white border-emerald-400 ring-2 ring-emerald-300"
                        : item.isCorrect === false
                          ? "bg-red-500 text-white border-red-400 ring-2 ring-red-300"
                          : "bg-white text-slate-800 dark:bg-slate-700 dark:text-white border-slate-300 dark:border-slate-500 hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    )}
                    style={{ left: `${item.x}%`, top: `${item.y}%` }}
                  >
                    {item.name}
                    {item.isCorrect === null && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
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

      {showFeedback && (
        <FeedbackBanner
          isCorrect={isCorrect}
          correctAnswer={null}
          onContinue={() => setShowFeedback(false)}
          message={feedbackMessage}
          continueLabel={isCorrect ? "FINISH" : "TRY AGAIN"}
        />
      )}
    </>
  );
}
