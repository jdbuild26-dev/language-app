import React, { useState, useEffect } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Volume2, GripVertical, Turtle } from "lucide-react";
import { Reorder } from "framer-motion";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { loadMockCSV } from "@/utils/csvLoader";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Shuffle helper
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export default function ListenOrderPage() {
  const handleExit = usePracticeExit();
  const { speak, isSpeaking } = useTextToSpeech();

  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [currentOrder, setCurrentOrder] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);
  const [playedAudio, setPlayedAudio] = useState(false);

  const currentQuestion = questions[currentIndex];
  const timerDuration = currentQuestion?.timeLimitSeconds || 90;

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
    isPaused: isCompleted || showFeedback || !playedAudio || isLoading,
  });

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await loadMockCSV("practice/listening/listen_order.csv");
        setQuestions(data);
      } catch (error) {
        console.error("Error loading mock data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (currentQuestion && !isCompleted) {
      setCurrentOrder(shuffleArray(currentQuestion.correctOrder));
      setPlayedAudio(false);
      resetTimer();
    }
  }, [currentIndex, currentQuestion, isCompleted, resetTimer]);

  const handlePlaySlow = () => {
    // Play all sentences in correct order slowly
    const text = currentQuestion.correctOrder.join(". ");
    speak(text, "fr-FR", 0.6);
    setPlayedAudio(true);
  };

  const handlePlayItem = (text, e) => {
    e.stopPropagation(); // Prevent drag when clicking play button
    speak(text, "fr-FR");
  };

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
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="animate-spin text-orange-500 w-8 h-8" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <p className="text-xl text-slate-600 dark:text-slate-400">
          No content available.
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
        questionType="Listen and Order"
        instructionFr="Écoutez et mettez dans l'ordre"
        instructionEn="Listen and put in order"
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={questions.length}
        onExit={handleExit}
        onNext={handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={playedAudio && !showFeedback}
        showSubmitButton={!showFeedback}
        submitLabel="Check"
        timerValue={playedAudio ? timerString : "--:--"}
      >
        <div className="flex flex-col items-center w-full max-w-2xl mx-auto px-4 py-6">
          {/* Play all button */}
          {/* Slow button */}
          <button
            onClick={handlePlaySlow}
            disabled={isSpeaking}
            className={cn(
              "flex items-center gap-3 px-6 py-3 rounded-full text-base font-semibold transition-all mb-6",
              isSpeaking
                ? "bg-orange-100 text-orange-600 animate-pulse"
                : "bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:shadow-lg",
            )}
          >
            <Turtle className="w-5 h-5" />
            {playedAudio ? "Replay Slow" : "Slow"}
          </button>

          {/* Sentence list with drag-and-drop */}
          <div className="w-full space-y-3">
            <Reorder.Group
              axis="y"
              values={currentOrder}
              onReorder={showFeedback ? () => {} : setCurrentOrder}
              className="w-full space-y-3"
            >
              {currentOrder.map((sentence, index) => {
                const isCorrectPosition =
                  showFeedback &&
                  sentence === currentQuestion.correctOrder[index];
                const isWrongPosition = showFeedback && !isCorrectPosition;

                return (
                  <SortableItem
                    key={sentence}
                    sentence={sentence}
                    index={index}
                    isCorrectPosition={isCorrectPosition}
                    isWrongPosition={isWrongPosition}
                    showFeedback={showFeedback}
                    onPlayItem={handlePlayItem}
                  />
                );
              })}
            </Reorder.Group>
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
  index,
  isCorrectPosition,
  isWrongPosition,
  showFeedback,
  onPlayItem,
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
      whileDrag={{
        scale: 1.02,
        boxShadow: "0 10px 30px -10px rgba(0,0,0,0.15)",
        zIndex: 50,
      }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {/* Position number */}
      <span
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
          isCorrectPosition
            ? "bg-emerald-500 text-white"
            : isWrongPosition
              ? "bg-red-500 text-white"
              : "bg-orange-100 dark:bg-orange-900/30 text-orange-600",
        )}
      >
        {index + 1}
      </span>

      {/* Grip icon - Visual cue only, entire card is draggable */}
      {!showFeedback && (
        <div className="text-slate-400">
          <GripVertical className="w-5 h-5" />
        </div>
      )}

      {/* Play button */}
      <button
        onClick={(e) => onPlayItem(sentence, e)}
        className="text-slate-400 hover:text-orange-500 shrink-0"
      >
        <Volume2 className="w-4 h-4" />
      </button>

      {/* Waveform or Sentence text */}
      <div className="flex-1">
        {!showFeedback ? (
          /* Waveform SVG (Visible before submit) */
          <svg
            width="120"
            height="30"
            viewBox="0 0 120 40"
            className="text-orange-400 dark:text-orange-500"
          >
            <rect
              x="10"
              y="15"
              width="3"
              height="10"
              fill="currentColor"
              rx="1.5"
            />
            <rect
              x="16"
              y="10"
              width="3"
              height="20"
              fill="currentColor"
              rx="1.5"
            />
            <rect
              x="22"
              y="5"
              width="3"
              height="30"
              fill="currentColor"
              rx="1.5"
            />
            <rect
              x="28"
              y="12"
              width="3"
              height="16"
              fill="currentColor"
              rx="1.5"
            />
            <rect
              x="34"
              y="18"
              width="3"
              height="4"
              fill="currentColor"
              rx="1.5"
            />
            <rect
              x="40"
              y="8"
              width="3"
              height="24"
              fill="currentColor"
              rx="1.5"
            />
            <rect
              x="46"
              y="14"
              width="3"
              height="12"
              fill="currentColor"
              rx="1.5"
            />
            <rect
              x="52"
              y="11"
              width="3"
              height="18"
              fill="currentColor"
              rx="1.5"
            />
            <rect
              x="58"
              y="16"
              width="3"
              height="8"
              fill="currentColor"
              rx="1.5"
            />
            <rect
              x="64"
              y="13"
              width="3"
              height="14"
              fill="currentColor"
              rx="1.5"
            />
          </svg>
        ) : (
          /* Text Reveal (Visible after submit) */
          <span className="text-slate-700 dark:text-slate-200 font-medium select-none">
            {sentence}
          </span>
        )}
      </div>
    </Reorder.Item>
  );
};
