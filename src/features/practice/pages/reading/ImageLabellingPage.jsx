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
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);

  // Refs for measurements
  const dropZoneRef = useRef(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const draggedItemRef = useRef(null);

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
    setDraggedItem(null);
  };

  const { timerString, stopTimer } = useExerciseTimer({
    mode: "stopwatch",
    isPaused: isCompleted || showFeedback,
  });

  const startDrag = (e, itemName, source) => {
    if (showFeedback) return;

    // Prevent default to avoid scrolling on touch
    e.preventDefault();

    const isTouch = e.type === "touchstart";
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;

    const rect = e.currentTarget.getBoundingClientRect();
    dragOffset.current = {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };

    setDraggedItem({ name: itemName, source });
    draggedItemRef.current = { name: itemName, source };

    setDragPosition({
      x: clientX - dragOffset.current.x,
      y: clientY - dragOffset.current.y,
    });

    const onMove = (moveEvent) => {
      moveEvent.preventDefault();
      const moveClientX =
        moveEvent.type === "touchmove"
          ? moveEvent.touches[0].clientX
          : moveEvent.clientX;
      const moveClientY =
        moveEvent.type === "touchmove"
          ? moveEvent.touches[0].clientY
          : moveEvent.clientY;

      setDragPosition({
        x: moveClientX - dragOffset.current.x,
        y: moveClientY - dragOffset.current.y,
      });
    };

    const onUp = (upEvent) => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);

      const upClientX =
        upEvent.type === "touchend"
          ? upEvent.changedTouches[0].clientX
          : upEvent.clientX;
      const upClientY =
        upEvent.type === "touchend"
          ? upEvent.changedTouches[0].clientY
          : upEvent.clientY;

      if (dropZoneRef.current) {
        const dropRect = dropZoneRef.current.getBoundingClientRect();

        // Check intersection
        if (
          upClientX >= dropRect.left &&
          upClientX <= dropRect.right &&
          upClientY >= dropRect.top &&
          upClientY <= dropRect.bottom
        ) {
          const elementWidth = rect.width;
          const elementHeight = rect.height;

          const droppedLeft = upClientX - dragOffset.current.x;
          const droppedTop = upClientY - dragOffset.current.y;

          const centerX = droppedLeft + elementWidth / 2;
          const centerY = droppedTop + elementHeight / 2;

          let relativeX = ((centerX - dropRect.left) / dropRect.width) * 100;
          let relativeY = ((centerY - dropRect.top) / dropRect.height) * 100;

          // Snap Logic
          let bestTarget = null;
          let minDistance = Infinity;
          const SNAP_THRESHOLD = 10; // Threshold in %

          for (const target of KITCHEN_ITEMS) {
            const distance = Math.sqrt(
              Math.pow(relativeX - target.x, 2) +
                Math.pow(relativeY - target.y, 2),
            );

            if (distance <= SNAP_THRESHOLD && distance < minDistance) {
              minDistance = distance;
              bestTarget = target;
            }
          }

          if (bestTarget) {
            // Valid snap found
            relativeX = bestTarget.x;
            relativeY = bestTarget.y;

            // Update State
            // 1. Remove from bank if it was there
            setBankItems((prev) => prev.filter((i) => i !== itemName));

            // 2. Remove from placed items if it was already placed
            setPlacedItems((prev) => {
              const filtered = prev.filter((p) => p.name !== itemName);
              return [
                ...filtered,
                { name: itemName, x: relativeX, y: relativeY, isCorrect: null },
              ];
            });
          } else {
            // No snap target found -> Return to bank (even if inside container)
            setPlacedItems((prev) => prev.filter((p) => p.name !== itemName));
            setBankItems((prev) => {
              if (!prev.includes(itemName)) return [...prev, itemName];
              return prev;
            });
          }
        } else {
          // Dropped outside -> Return to bank
          setPlacedItems((prev) => prev.filter((p) => p.name !== itemName));
          setBankItems((prev) => {
            if (!prev.includes(itemName)) return [...prev, itemName];
            return prev;
          });
        }
      }

      setDraggedItem(null);
      draggedItemRef.current = null;
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);
  };

  const handleCreateCheck = () => {
    let correct = 0;
    const total = KITCHEN_ITEMS.length;

    const newPlacedItems = placedItems.map((placed) => {
      const target = KITCHEN_ITEMS.find((k) => k.name === placed.name);
      if (!target) return placed;

      // Checking exact match since we have snapping now
      // But let's verify distance just in case
      const distance = Math.sqrt(
        Math.pow(placed.x - target.x, 2) + Math.pow(placed.y - target.y, 2),
      );

      const isHit = distance <= 1; // Strict check since properly snapped
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
        `Perfect! You identified all ${total} items correctly!`,
      );
      setIsCompleted(true);
      stopTimer();
    } else {
      setIsCorrect(false);
      setFeedbackMessage(
        `You got ${correct} out of ${total} correct. Keep trying!`,
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
        <div className="flex flex-col items-center w-full max-w-5xl mx-auto gap-4 px-4 py-2 h-full overflow-hidden">
          <div className="w-full h-full flex flex-col gap-4">
            {/* Image Container - Flexible */}
            <div className="flex-1 min-h-0 flex items-center justify-center">
              <div
                ref={dropZoneRef}
                className="relative inline-block max-w-full max-h-full"
              >
                <img
                  src={kitchenImage}
                  alt="Kitchen"
                  className="block w-auto h-auto max-w-full max-h-[60vh] object-contain rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 pointer-events-none select-none"
                />

                {/* Targets (Hints) */}
                {KITCHEN_ITEMS.map((item, idx) => (
                  <div
                    key={idx}
                    className="absolute w-4 h-4 border-2 border-red-400/50 bg-red-400/20 rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ left: `${item.x}%`, top: `${item.y}%` }}
                  />
                ))}

                {/* Placed Labels */}
                {placedItems.map((item) => (
                  <div
                    key={item.name}
                    onMouseDown={(e) => startDrag(e, item.name, "placed")}
                    onTouchStart={(e) => startDrag(e, item.name, "placed")}
                    className={cn(
                      "absolute px-3 py-1.5 md:px-4 md:py-2 rounded-full font-semibold text-xs md:text-sm shadow-md cursor-grab active:cursor-grabbing transform -translate-x-1/2 -translate-y-1/2 transition-all z-10 select-none touch-none whitespace-nowrap",
                      item.isCorrect === true
                        ? "bg-emerald-500 text-white border-emerald-600"
                        : "",
                      item.isCorrect === false
                        ? "bg-red-500 text-white border-red-600"
                        : "",
                      item.isCorrect === null
                        ? "bg-white text-slate-800 dark:bg-slate-700 dark:text-white border-slate-200 dark:border-slate-600"
                        : "",
                    )}
                    style={{ left: `${item.x}%`, top: `${item.y}%` }}
                  >
                    {item.name}
                  </div>
                ))}
              </div>
            </div>

            {/* Label Bank */}
            <div className="min-h-[80px] md:min-h-[100px] shrink-0 bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-wrap gap-2 justify-center items-center overflow-y-auto max-h-[150px]">
              {bankItems.length === 0 &&
                placedItems.length === KITCHEN_ITEMS.length && (
                  <div className="flex flex-col items-center gap-1 text-slate-400">
                    <CheckCircle2 className="w-6 h-6 opacity-50" />
                    <span className="text-xs font-medium">
                      All items placed
                    </span>
                  </div>
                )}
              {bankItems.map((name) => (
                <div
                  key={name}
                  onMouseDown={(e) => startDrag(e, name, "bank")}
                  onTouchStart={(e) => startDrag(e, name, "bank")}
                  className="px-3 py-1.5 bg-white dark:bg-slate-700 text-slate-800 dark:text-white rounded-full font-semibold text-xs md:text-sm shadow-sm border border-slate-200 dark:border-slate-600 cursor-grab active:cursor-grabbing hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-95 select-none touch-none whitespace-nowrap"
                >
                  {name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </PracticeGameLayout>

      {/* Drag Portal */}
      {draggedItem && (
        <div
          className="fixed z-50 px-3 py-1.5 bg-blue-600 text-white rounded-full font-semibold text-xs md:text-sm shadow-xl pointer-events-none opacity-90 select-none whitespace-nowrap transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: dragPosition.x,
            top: dragPosition.y,
          }}
        >
          {draggedItem.name}
        </div>
      )}

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
