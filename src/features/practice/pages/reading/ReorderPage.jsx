import React, { useState, useEffect } from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { GripVertical } from "lucide-react";
import { Reorder, useDragControls } from "framer-motion";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { getFeedbackMessage } from "@/utils/feedbackMessages";

// Mock data for Reorder Sentences exercise
const MOCK_QUESTIONS = [
  {
    id: 1,
    correctOrder: [
      "Marie se réveille à sept heures.",
      "Elle prend son petit déjeuner.",
      "Elle prend le bus pour aller au travail.",
      "Elle arrive au bureau à huit heures et demie.",
    ],
    timeLimitSeconds: 60,
  },
  {
    id: 2,
    correctOrder: [
      "D'abord, je vais au supermarché.",
      "Ensuite, j'achète des légumes et des fruits.",
      "Après, je paye à la caisse.",
      "Finalement, je rentre chez moi.",
    ],
    timeLimitSeconds: 60,
  },
  {
    id: 3,
    correctOrder: [
      "Le matin, le soleil se lève.",
      "À midi, il fait très chaud.",
      "Le soir, le soleil se couche.",
      "La nuit, les étoiles brillent.",
    ],
    timeLimitSeconds: 60,
  },
  {
    id: 4,
    correctOrder: [
      "Nous arrivons à l'aéroport.",
      "Nous passons le contrôle de sécurité.",
      "Nous attendons à la porte d'embarquement.",
      "Nous montons dans l'avion.",
    ],
    timeLimitSeconds: 60,
  },
  {
    id: 5,
    correctOrder: [
      "Je choisis un livre dans la bibliothèque.",
      "Je m'assieds dans un fauteuil confortable.",
      "Je lis pendant deux heures.",
      "Je rends le livre avant de partir.",
    ],
    timeLimitSeconds: 60,
  },
];

// Shuffle array helper
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export default function ReorderPage() {
  const handleExit = usePracticeExit();

  const [questions] = useState(MOCK_QUESTIONS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentOrder, setCurrentOrder] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);

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
          {/* Sentence list */}
          <div className="w-full space-y-3">
            <Reorder.Group
              axis="y"
              values={currentOrder}
              onReorder={setCurrentOrder}
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
              : "bg-teal-100 dark:bg-teal-900/30 text-teal-600",
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

      {/* Sentence text */}
      <span className="flex-1 text-slate-700 dark:text-slate-200 font-medium select-none">
        {sentence}
      </span>
    </Reorder.Item>
  );
};
