import React, { useState, useEffect, useRef } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import kitchenImage from "@/assets/kitchen.jpg";
import { CheckCircle2 } from "lucide-react";

// Initial Configuration
const MOCK_DATA = [
  {
    id: 1,
    title: "Body Parts & Clothing",
    instructionFr: "Étiquetez les parties du corps et les vêtements",
    instructionEn: "Label body parts and clothing",
    image: "https://res.cloudinary.com/danch6kwx/image/upload/v1770134279/m2p6rbunlfbvrhn13hox.jpg",
    items: [
      { name: "nose", x: 0.3727, y: 0.3567 },
      { name: "glasses", x: 0.3455, y: 0.2956 },
      { name: "tshirt", x: 0.3511, y: 0.7578 },
      { name: "jacket", x: 0.1739, y: 0.9614 },
    ],
  },
  {
    id: 2,
    title: "Kitchen Labelling",
    instructionFr: "Étiquetez la cuisine",
    instructionEn: "Label the kitchen",
    image: kitchenImage,
    items: [
      { name: "Refrigerator", x: 0.88, y: 0.55 },
      { name: "Microwave", x: 0.62, y: 0.28 },
      { name: "Stove", x: 0.62, y: 0.60 },
      { name: "Sink", x: 0.40, y: 0.52 },
      { name: "Toaster", x: 0.12, y: 0.52 },
      { name: "Cabinets", x: 0.25, y: 0.18 },
      { name: "Dishwasher", x: 0.50, y: 0.70 },
      { name: "Counter", x: 0.30, y: 0.52 },
    ],
  }
];

export default function ImageLabellingPage() {
  const handleExit = usePracticeExit();
  const imageRef = useRef(null);
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });

  // State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [bankItems, setBankItems] = useState([]);
  const [placedItems, setPlacedItems] = useState([]); // Array of { name, x, y, isCorrect }
  const [isCompleted, setIsCompleted] = useState(false); // Entirely finished all exercises
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);

  const currentExercise = MOCK_DATA[currentIndex];

  // New Selection State
  const [selectedLabel, setSelectedLabel] = useState(null); // String (name)
  const [selectedTarget, setSelectedTarget] = useState(null); // Object from currentExercise.items

  // Handle image load to get dimensions for perfect marker wrapping
  const handleImageLoad = (e) => {
    setImgSize({
      width: e.target.clientWidth,
      height: e.target.clientHeight
    });
  };

  // Update dimensions on resize
  useEffect(() => {
    const handleResize = () => {
      if (imageRef.current) {
        setImgSize({
          width: imageRef.current.clientWidth,
          height: imageRef.current.clientHeight
        });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize/Reset when index changes
  useEffect(() => {
    resetGame();
  }, [currentIndex]);

  const resetGame = () => {
    // Shuffle items for the bank
    const shuffled = [...currentExercise.items]
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

  const { timerString, stopTimer } = useExerciseTimer({
    mode: "stopwatch",
    isPaused: isCompleted || showFeedback,
  });

  const handleLabelClick = (name) => {
    if (showFeedback) return;

    if (selectedTarget) {
      placeItem(name, selectedTarget);
      setSelectedTarget(null);
      setSelectedLabel(null);
    } else {
      setSelectedLabel(selectedLabel === name ? null : name);
    }
  };

  const handleTargetClick = (target) => {
    if (showFeedback) return;

    const alreadyPlaced = placedItems.find(
      (p) => p.x === target.x && p.y === target.y
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

  const placeItem = (name, target) => {
    setBankItems((prev) => prev.filter((i) => i !== name));
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

  const handleCheck = () => {
    let correct = 0;
    const total = currentExercise.items.length;

    const newPlacedItems = placedItems.map((placed) => {
      const target = currentExercise.items.find(
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
    } else {
      setIsCorrect(false);
      setFeedbackMessage(
        `You got ${correct} out of ${total} correct. Check your placements!`
      );
    }
    setShowFeedback(true);
  };

  const handleContinue = () => {
    if (isCorrect) {
      if (currentIndex < MOCK_DATA.length - 1) {
        // Move to next exercise
        setCurrentIndex((prev) => prev + 1);
      } else {
        // Finish the whole thing
        setIsCompleted(true);
        stopTimer();
      }
    }
    setShowFeedback(false);
  };

  return (
    <>
      <PracticeGameLayout
        questionType={currentExercise.title}
        instructionFr={currentExercise.instructionFr}
        instructionEn={currentExercise.instructionEn}
        progress={((currentIndex + placedItems.length / currentExercise.items.length) / MOCK_DATA.length) * 100}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={currentExercise.items.length}
        onExit={handleExit}
        onNext={handleCheck}
        onRestart={() => {
          setCurrentIndex(0);
          setIsCompleted(false);
        }}
        isSubmitEnabled={placedItems.length > 0 && !showFeedback}
        showSubmitButton={!showFeedback}
        submitLabel="Check Answers"
        timerValue={timerString}
      >
        <div className="flex flex-col-reverse lg:flex-row w-full h-full gap-4 p-4 lg:p-6 overflow-hidden">
          {/* Label Bank */}
          <div className="w-full lg:w-56 shrink-0 flex flex-col bg-slate-100 dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            <div className="px-4 py-2 lg:py-3 bg-slate-200/70 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-600 flex lg:flex-col justify-between items-center lg:items-center">
              <h3 className="text-[10px] lg:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                Labels
              </h3>
              <p className="text-[10px] lg:text-xs font-bold text-sky-600 dark:text-sky-400">
                {bankItems.length} left
              </p>
            </div>

            <div className="flex lg:flex-col flex-row gap-2 p-3 overflow-x-auto lg:overflow-y-auto custom-scrollbar no-scrollbar lg:flex-1">
              {bankItems.length === 0 &&
                placedItems.length === currentExercise.items.length ? (
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
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-slate-700/50"
                    )}
                  >
                    {name}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Image Workspace */}
          <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900/40 rounded-3xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm relative">
            <div className="absolute top-4 left-4 right-4 z-10 pointer-events-none text-center">
              <span className="inline-block px-4 py-1.5 bg-slate-900/80 backdrop-blur-md text-white text-[10px] lg:text-xs font-bold rounded-full shadow-lg border border-white/20">
                {selectedLabel ? `📍 Tap a dot for "${selectedLabel}"` : selectedTarget ? "🏷️ Tap a label now" : "Tap a label then a dot"}
              </span>
            </div>

            <div className="flex-1 flex items-center justify-center p-4 min-h-0 overflow-hidden">
              <div
                className="relative transition-transform duration-500 ease-out shadow-2xl rounded-2xl overflow-hidden"
                style={{
                  width: imgSize.width || 'auto',
                  height: imgSize.height || 'auto',
                  maxWidth: '100%',
                  maxHeight: '100%'
                }}
              >
                <img
                  ref={imageRef}
                  src={currentExercise.image}
                  alt={currentExercise.title}
                  onLoad={handleImageLoad}
                  className="block max-w-full max-h-[calc(100vh-320px)] lg:max-h-[calc(100vh-280px)] w-auto h-auto object-contain pointer-events-none select-none"
                />

                {/* Targets (Dots) */}
                {currentExercise.items.map((target, idx) => {
                  const isPlaced = placedItems.some(
                    (p) => Math.abs(p.x - target.x) < 0.0001 && Math.abs(p.y - target.y) < 0.0001
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
                            : "bg-amber-400/90 hover:bg-amber-500 hover:scale-110 border-2 border-white dark:border-slate-800 shadow-lg animate-pulse"
                      )}
                      style={{
                        left: `${target.x * 100}%`,
                        top: `${target.y * 100}%`,
                      }}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full shadow-inner" />}
                    </button>
                  );
                })}

                {/* Placed Labels */}
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
                          : "bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm text-slate-800 dark:text-white border-white dark:border-slate-600 hover:border-red-400 hover:bg-red-50"
                    )}
                    style={{ left: `${item.x * 100}%`, top: `${item.y * 100}%` }}
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

      {showFeedback && (
        <FeedbackBanner
          isCorrect={isCorrect}
          correctAnswer={null}
          onContinue={handleContinue}
          message={feedbackMessage}
          continueLabel={isCorrect ? (currentIndex < MOCK_DATA.length - 1 ? "NEXT EXERCISE" : "FINISH") : "TRY AGAIN"}
        />
      )}
    </>
  );
}
