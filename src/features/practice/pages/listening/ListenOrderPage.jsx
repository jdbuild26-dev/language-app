import React, { useState, useEffect } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Volume2, ArrowUp, ArrowDown, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

// Mock data for Listen and Order exercise
const MOCK_QUESTIONS = [
  {
    id: 1,
    correctOrder: [
      "Premier, je me lève.",
      "Ensuite, je prends une douche.",
      "Après, je prends le petit déjeuner.",
      "Finalement, je vais au travail.",
    ],
    timeLimitSeconds: 90,
  },
  {
    id: 2,
    correctOrder: [
      "D'abord, mélangez la farine et le sucre.",
      "Puis, ajoutez les œufs.",
      "Ensuite, versez le lait.",
      "Enfin, faites cuire au four.",
    ],
    timeLimitSeconds: 90,
  },
  {
    id: 3,
    correctOrder: [
      "Nous arrivons à l'aéroport.",
      "Nous enregistrons nos bagages.",
      "Nous passons la sécurité.",
      "Nous embarquons dans l'avion.",
    ],
    timeLimitSeconds: 90,
  },
];

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

  const [questions] = useState(MOCK_QUESTIONS);
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
    isPaused: isCompleted || showFeedback || !playedAudio,
  });

  useEffect(() => {
    if (currentQuestion && !isCompleted) {
      setCurrentOrder(shuffleArray(currentQuestion.correctOrder));
      setPlayedAudio(false);
      resetTimer();
    }
  }, [currentIndex, currentQuestion, isCompleted, resetTimer]);

  const handlePlayAll = () => {
    // Play all sentences in correct order
    const text = currentQuestion.correctOrder.join(". ");
    speak(text, "fr-FR");
    setPlayedAudio(true);
  };

  const handlePlayItem = (text) => {
    speak(text, "fr-FR");
  };

  const moveItem = (index, direction) => {
    if (showFeedback) return;

    const newOrder = [...currentOrder];
    const newIndex = direction === "up" ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= newOrder.length) return;

    [newOrder[index], newOrder[newIndex]] = [
      newOrder[newIndex],
      newOrder[index],
    ];
    setCurrentOrder(newOrder);
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
        showSubmitButton={true}
        submitLabel="Check"
        timerValue={playedAudio ? timerString : "--:--"}
      >
        <div className="flex flex-col items-center w-full max-w-2xl mx-auto px-4 py-6">
          {/* Play all button */}
          <button
            onClick={handlePlayAll}
            disabled={isSpeaking}
            className={cn(
              "flex items-center gap-3 px-6 py-3 rounded-full text-base font-semibold transition-all mb-6",
              isSpeaking
                ? "bg-orange-100 text-orange-600 animate-pulse"
                : "bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:shadow-lg",
            )}
          >
            <Volume2 className="w-5 h-5" />
            {playedAudio ? "Replay All" : "Play Audio"}
          </button>

          {/* Sentence list */}
          <div className="w-full space-y-3">
            {currentOrder.map((sentence, index) => {
              const isCorrectPosition =
                showFeedback &&
                sentence === currentQuestion.correctOrder[index];
              const isWrongPosition = showFeedback && !isCorrectPosition;

              return (
                <div
                  key={sentence}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200",
                    isCorrectPosition
                      ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500"
                      : isWrongPosition
                        ? "bg-red-50 dark:bg-red-900/20 border-red-500"
                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700",
                  )}
                >
                  {/* Position number */}
                  <span
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0",
                      isCorrectPosition
                        ? "bg-emerald-500 text-white"
                        : isWrongPosition
                          ? "bg-red-500 text-white"
                          : "bg-orange-100 dark:bg-orange-900/30 text-orange-600",
                    )}
                  >
                    {index + 1}
                  </span>

                  <GripVertical className="w-5 h-5 text-slate-400 flex-shrink-0" />

                  {/* Play button */}
                  <button
                    onClick={() => handlePlayItem(sentence)}
                    className="text-slate-400 hover:text-orange-500 flex-shrink-0"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  {/* Sentence text */}
                  <span className="flex-1 text-slate-700 dark:text-slate-200 font-medium text-sm">
                    {sentence}
                  </span>

                  {/* Movement buttons */}
                  {!showFeedback && (
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      <button
                        onClick={() => moveItem(index, "up")}
                        disabled={index === 0}
                        className={cn(
                          "p-1 rounded transition-colors",
                          index === 0
                            ? "text-slate-300 cursor-not-allowed"
                            : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700",
                        )}
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveItem(index, "down")}
                        disabled={index === currentOrder.length - 1}
                        className={cn(
                          "p-1 rounded transition-colors",
                          index === currentOrder.length - 1
                            ? "text-slate-300 cursor-not-allowed"
                            : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700",
                        )}
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
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
