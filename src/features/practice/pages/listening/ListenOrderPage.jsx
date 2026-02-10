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
  // Default timer to 90s if not specified
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

  const handlePlayItem = (text, e) => {
    e.stopPropagation(); // Prevent drag when clicking play button
    speak(text, "fr-FR", 0.9);
    setPlayedAudio(true);
  };

  const handlePlaySlowItem = (text, e) => {
    e.stopPropagation();
    speak(text, "fr-FR", 0.55); // Slower speed
    setPlayedAudio(true);
  };

  const handleReorder = (newOrder) => {
    setCurrentOrder(newOrder);
    setPlayedAudio(true);
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
          <div className="w-full flex gap-4">
            {/* Left Column: Static Numbers */}
            <div className="flex flex-col gap-3 pt-3">
              {currentOrder.map((_, i) => (
                <div
                  key={i}
                  className="w-8 h-8 flex items-center justify-center font-bold text-slate-400 dark:text-slate-500"
                  style={{ height: "60px" }} // Height matching the card
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
                onReorder={showFeedback ? () => {} : handleReorder}
                className="w-full space-y-3"
              >
                {currentOrder.map((sentence, index) => {
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
                      isCorrectPosition={isCorrectPosition}
                      isWrongPosition={isWrongPosition}
                      showFeedback={showFeedback}
                      onPlayItem={handlePlayItem}
                      onPlaySlowItem={handlePlaySlowItem}
                      correctIndex={correctIndex}
                    />
                  );
                })}
              </Reorder.Group>
            </div>
          </div>

          {/* Full Sentence Display - Shown after submit */}
          {showFeedback && (
            <div className="mt-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                      {/* Play button for correct answer line */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          speak(sentence, "fr-FR");
                        }}
                        className="text-slate-400 hover:text-indigo-500 transition-colors mt-1"
                      >
                        <Volume2 className="w-5 h-5" />
                      </button>
                      <span>{sentence}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
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
  isCorrectPosition,
  isWrongPosition,
  showFeedback,
  onPlayItem,
  onPlaySlowItem,
  correctIndex,
}) => {
  return (
    <Reorder.Item
      value={sentence}
      onClick={(e) => onPlayItem(sentence, e)}
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
      style={{ height: "60px" }} // Enforce height
      whileDrag={{
        scale: 1.02,
        boxShadow: "0 10px 30px -10px rgba(0,0,0,0.15)",
        zIndex: 50,
      }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {/* Play buttons - Now inside the card */}
      <div className="flex gap-2 shrink-0">
        <button
          onClick={(e) => onPlayItem(sentence, e)}
          className="text-slate-400 hover:text-orange-500 p-1 rounded-full hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
          title="Play normal speed"
        >
          <Volume2 className="w-5 h-5" />
        </button>
        <button
          onClick={(e) => onPlaySlowItem(sentence, e)}
          className="text-slate-400 hover:text-emerald-500 p-1 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
          title="Play slow speed"
        >
          <Turtle className="w-5 h-5" />
        </button>
      </div>

      {/* Position indicator (Feedback only) or Grip */}
      <div className="w-6 flex justify-center shrink-0">
        {showFeedback ? (
          <span
            className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
              isCorrectPosition
                ? "bg-emerald-500 text-white"
                : "bg-teal-500 text-white", // Show correct index
            )}
          >
            {correctIndex + 1}
          </span>
        ) : (
          <div className="text-slate-300 dark:text-slate-600">
            <GripVertical className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Waveform or Sentence text */}
      <div className="flex-1 flex justify-center overflow-hidden">
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
          <span className="text-slate-700 dark:text-slate-200 font-medium select-none text-left w-full pl-2 truncate">
            {sentence}
          </span>
        )}
      </div>
    </Reorder.Item>
  );
};
