import React, { useState, useEffect } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { GripVertical } from "lucide-react";
import { Reorder, useDragControls } from "framer-motion";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { loadMockCSV } from "@/utils/csvLoader";
import { Button } from "@/components/ui/button";

export default function ReorderPage() {
  const handleExit = usePracticeExit();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentOrder, setCurrentOrder] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const data = await loadMockCSV("practice/reading/reorder.csv");
      setQuestions(data);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  // Shuffle array helper
  const shuffleArray = (array) => {
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
      setCurrentOrder(shuffleArray(currentQuestion.correctOrder));
      resetTimer();
    }
  }, [currentIndex, currentQuestion, isCompleted, resetTimer]);

  const handleSubmit = () => {
    if (showFeedback) return;

    const correct =
      JSON.stringify(currentOrder) ===
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
        instructionFr="Mettez les phrases dans le bon ordre"
        instructionEn="Put the sentences in the correct order"
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={questions.length}
        onExit={handleExit}
        onNext={handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={!showFeedback}
        showSubmitButton={!showFeedback}
        submitLabel="Check"
        timerValue={timerString}
      >
        <div className="flex flex-col items-center w-full max-w-2xl mx-auto px-4 py-6">
          <div className="w-full flex gap-4">
            {/* Left Column: Static Numbers */}
            <div className="flex flex-col gap-3 pt-3">
              {currentOrder.map((_, i) => (
                <div
                  key={i}
                  className="w-8 h-8 flex items-center justify-center font-bold text-slate-400 dark:text-slate-500"
                  style={{ height: "60px" }} // Approximate height matching the card
                >
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Right Column: Draggable List */}
            <div className="flex-1 w-full space-y-3">
              <Reorder.Group
                axis="y"
                values={currentOrder}
                onReorder={setCurrentOrder}
                className="w-full space-y-3"
              >
                {currentOrder.map((sentence) => {
                  const index = currentOrder.indexOf(sentence);
                  const isCorrectPosition =
                    showFeedback &&
                    sentence === currentQuestion.correctOrder[index];
                  const isWrongPosition = showFeedback && !isCorrectPosition;

                  // Find the true original index of this sentence
                  const correctIndex =
                    currentQuestion.correctOrder.indexOf(sentence);

                  return (
                    <SortableItem
                      key={sentence}
                      sentence={sentence}
                      correctIndex={correctIndex}
                      isCorrectPosition={isCorrectPosition}
                      isWrongPosition={isWrongPosition}
                      showFeedback={showFeedback}
                    />
                  );
                })}
              </Reorder.Group>
            </div>
          </div>
        </div>
      </PracticeGameLayout>

      {/* Feedback Banner */}
      {showFeedback && (
        <FeedbackBanner
          isCorrect={isCorrect}
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
  sentence,
  correctIndex,
  isCorrectPosition,
  isWrongPosition,
  showFeedback,
}) => {
  return (
    <Reorder.Item
      value={sentence}
      className={cn(
        "flex items-center gap-3 p-4 rounded-xl border-2 transition-colors duration-200 select-none bg-white dark:bg-slate-800",
        !showFeedback &&
          "cursor-grab active:cursor-grabbing hover:border-slate-300 dark:hover:border-slate-600",
        isCorrectPosition
          ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500"
          : isWrongPosition
            ? "bg-red-50 dark:bg-red-900/20 border-red-500"
            : "border-slate-200 dark:border-slate-700",
      )}
      style={{ height: "60px" }} // Enforce height for alignment with numbers
      whileDrag={{
        scale: 1.02,
        boxShadow: "0 10px 30px -10px rgba(0,0,0,0.15)",
        zIndex: 50,
      }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {/* Position number / Grip - Only show number on feedback */}
      <div className="w-8 h-8 flex items-center justify-center shrink-0">
        {showFeedback ? (
          <span
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
              isCorrectPosition
                ? "bg-emerald-500 text-white"
                : "bg-teal-500 text-white", // Show the true index in teal/blue if wrong position
            )}
          >
            {correctIndex + 1}
          </span>
        ) : (
          <GripVertical className="w-5 h-5 text-slate-400" />
        )}
      </div>

      {/* Sentence text */}
      <span className="flex-1 text-slate-700 dark:text-slate-200 font-medium select-none truncate">
        {sentence}
      </span>
    </Reorder.Item>
  );
};
