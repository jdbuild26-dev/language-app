import React, { useState } from "react";
import { CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import FeedbackBanner from "@/components/ui/FeedbackBanner";
import { cn } from "@/lib/utils";

// MOCK DATA for "Pick 4" (Group Words)
const MOCK_QUESTIONS = [
  {
    id: 1,
    title: "Pick 4",
    instructionFr: "Triez les mots",
    instructionEn: "Select 4 words that are related",
    theme: "Fruits",
    allWords: [
      "Pomme",
      "Chien",
      "Banane",
      "Voiture",
      "Orange",
      "Livre",
      "Raisin",
      "Stylo",
      "Fraise",
      "Lampe",
      "Chat",
      "Vélo",
    ],
    correctWords: ["Pomme", "Banane", "Orange", "Raisin", "Fraise"], // Wait, usually 4. Let's stick to 4.
    // Let's refine mock data to have exactly 4 correct words from the prompt "Pick 4"
    // Modified list to ensure 4 distinct fruits: Pomme, Banane, Orange, Raisin. (Fraise removed from logic if we want strict 4)
    // Actually let's use 4 correct.
    correctGroup: ["Pomme", "Banane", "Orange", "Raisin"],
    reason: "These are all fruits.",
  },
  {
    id: 2,
    title: "Pick 4",
    instructionFr: "Triez les mots",
    instructionEn: "Select 4 words related to Time",
    theme: "Time",
    correctGroup: ["Lundi", "Janvier", "Heure", "Minute"],
    // Need to ensure these are in allWords.
    allWords: [
      "Lundi",
      "Rouge",
      "Janvier",
      "Manger",
      "Heure",
      "Grand",
      "Minute",
      "Fleur",
      "Soleil",
      "Petit",
      "Chat",
      "Mer",
    ],
    reason: "These are all related to time.",
  },
];

export default function GroupWordsGamePage() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedWords, setSelectedWords] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const currentQuestion = MOCK_QUESTIONS[currentIndex];
  // Ensure we rely on 'correctGroup' being exactly 4 items for "Pick 4" logic
  // If backend returns more, we might need to adjust, but for now we enforce 4.
  const targetCount = 4;

  const totalQuestions = MOCK_QUESTIONS.length;
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  const handleWordClick = (word) => {
    if (isSubmitted) return;

    if (selectedWords.includes(word)) {
      setSelectedWords((prev) => prev.filter((w) => w !== word));
    } else {
      if (selectedWords.length < targetCount) {
        setSelectedWords((prev) => [...prev, word]);
      }
    }
  };

  const handleSubmit = () => {
    if (isSubmitted) {
      // Next Logic
      setShowFeedback(false);
      if (currentIndex + 1 < totalQuestions) {
        setCurrentIndex((prev) => prev + 1);
        setSelectedWords([]);
        setIsSubmitted(false);
      } else {
        setIsGameOver(true);
      }
      return;
    }

    // Submit Logic
    if (selectedWords.length !== targetCount) return;
    setIsSubmitted(true);

    // Check if checks are correct
    // Are all selected words in the correctGroup?
    const allCorrect = selectedWords.every((w) =>
      currentQuestion.correctGroup.includes(w),
    );

    setIsCorrect(allCorrect);
    setFeedbackMessage(allCorrect ? "Great job!" : currentQuestion.reason);
    setShowFeedback(true);

    if (allCorrect) {
      setScore((prev) => prev + 1);
    }
  };

  let submitLabel = "Submit";
  if (isSubmitted) {
    submitLabel =
      currentIndex + 1 === totalQuestions ? "Finish" : "Next Question";
  }

  return (
    <>
      <PracticeGameLayout
        questionType="Pick 4"
        instructionFr={currentQuestion.instructionFr || "Triez les mots"}
        instructionEn={
          currentQuestion.instructionEn || `Select ${targetCount} related words`
        }
        progress={progress}
        isGameOver={isGameOver}
        score={score}
        totalQuestions={totalQuestions}
        onExit={() => navigate("/vocabulary/practice")}
        onNext={handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={selectedWords.length === targetCount}
        showSubmitButton={true}
        submitLabel={submitLabel}
      >
        <div className="flex-1 flex flex-col items-center justify-center -mt-10 w-full max-w-7xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-100">
              {currentQuestion.theme
                ? `Topic: ${currentQuestion.theme}`
                : "Find the related words"}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-3 text-lg">
              Select the {targetCount} words that belong together
            </p>
          </div>

          {/* Grid: 6 columns for 12 items = 2 rows. Wide spacing. */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-12 w-full px-4 md:px-0">
            {currentQuestion.allWords.map((word, idx) => {
              const isSelected = selectedWords.includes(word);
              const isTargetWord = currentQuestion.correctGroup.includes(word);

              // Square cards: aspect-square, remove fixed height
              let cardStyle =
                "aspect-square rounded-2xl border-2 flex items-center justify-center text-lg md:text-xl font-medium transition-all duration-200 cursor-pointer relative shadow-sm";

              if (showFeedback) {
                if (isTargetWord) {
                  // Always show correct words in green
                  cardStyle +=
                    " bg-green-100 border-green-500 text-green-800 dark:bg-green-900/30 dark:text-green-300";
                } else if (isSelected && !isTargetWord) {
                  // Wrong selection
                  cardStyle +=
                    " bg-red-100 border-red-500 text-red-800 dark:bg-red-900/30 dark:text-red-300 opacity-80";
                } else {
                  // Unrelated, unselected words
                  cardStyle +=
                    " bg-gray-50 border-gray-100 text-gray-400 opacity-30 dark:bg-gray-800/50 dark:border-gray-800";
                }
              } else {
                if (isSelected) {
                  cardStyle +=
                    " bg-blue-50 border-blue-500 text-blue-700 ring-4 ring-blue-500/20 dark:bg-blue-900/20 dark:text-blue-300";
                } else {
                  cardStyle +=
                    " bg-white border-gray-200 hover:border-blue-300 hover:shadow-lg hover:-translate-y-1 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleWordClick(word)}
                  disabled={isSubmitted}
                  className={cardStyle}
                >
                  {word}
                </button>
              );
            })}
          </div>
        </div>
      </PracticeGameLayout>

      {/* Feedback Banner */}
      {showFeedback && (
        <FeedbackBanner
          isCorrect={isCorrect}
          correctAnswer={!isCorrect ? currentQuestion.reason : null}
          onContinue={handleSubmit}
          message={feedbackMessage}
          continueLabel={
            currentIndex + 1 === totalQuestions ? "FINISH" : "CONTINUE"
          }
        />
      )}
    </>
  );
}
