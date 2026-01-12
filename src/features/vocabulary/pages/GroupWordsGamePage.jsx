import React, { useState } from "react";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  RotateCcw,
  Layers,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

// MOCK DATA for "Group Words"
// Users sort words into two categories.
const MOCK_LEVELS = [
  {
    id: 1,
    title: "Animals vs Food",
    groups: [
      { id: "A", name: "Animals", icon: "🐶" },
      { id: "B", name: "Food", icon: "🍎" },
    ],
    items: [
      { word: "Chien", group: "A" },
      { word: "Pomme", group: "B" },
      { word: "Chat", group: "A" },
      { word: "Pain", group: "B" },
      { word: "Oiseau", group: "A" },
      { word: "Fromage", group: "B" },
    ],
  },
  {
    id: 2,
    title: "Masculine vs Feminine",
    groups: [
      { id: "A", name: "Masculine (Le/Un)", icon: "👨" },
      { id: "B", name: "Feminine (La/Une)", icon: "👩" },
    ],
    items: [
      { word: "Garçon", group: "A" },
      { word: "Fille", group: "B" },
      { word: "Livre", group: "A" },
      { word: "Maison", group: "B" },
      { word: "Soleil", group: "A" },
      { word: "Lune", group: "B" },
    ],
  },
];

export default function GroupWordsGamePage() {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [itemIndex, setItemIndex] = useState(0); // Current card in the deck
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong'
  const [isGameOver, setIsGameOver] = useState(false);

  // Completed items valid storage for UI feedback showing sorted piles?
  // Maybe just score is enough for now.

  const currentLevel = MOCK_LEVELS[currentLevelIndex];
  const currentItem = currentLevel.items[itemIndex];
  const totalItems = currentLevel.items.length;

  const progress = (itemIndex / totalItems) * 100;

  const handleSort = (groupId) => {
    if (feedback) return; // Wait for animation/feedback to clear

    const isCorrect = currentItem.group === groupId;

    if (isCorrect) {
      setFeedback("correct");
      setScore((prev) => prev + 1);
    } else {
      setFeedback("wrong");
    }

    // Auto Advance
    setTimeout(() => {
      setFeedback(null);
      if (itemIndex + 1 < totalItems) {
        setItemIndex((prev) => prev + 1);
      } else {
        // End of current level
        // For this mock, let's just finish the "game" or go to next level?
        // Let's finish for simplicity.
        setIsGameOver(true);
      }
    }, 800);
  };

  const restartGame = () => {
    setItemIndex(0);
    setScore(0);
    setFeedback(null);
    setIsGameOver(false);
  };

  // Switch level logic (cycle mock levels)
  const nextLevel = () => {
    const nextIdx = (currentLevelIndex + 1) % MOCK_LEVELS.length;
    setCurrentLevelIndex(nextIdx);
    restartGame();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Link
          to="/vocabulary/practice"
          className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Practice
        </Link>
        <div className="text-sm font-medium text-gray-500">
          Level {currentLevelIndex + 1}: {currentLevel.title}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full mb-12 overflow-hidden">
        <div
          className="bg-indigo-500 h-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {!isGameOver ? (
        <div className="flex-1 flex flex-col items-center justify-center -mt-10">
          {/* Deck Counter */}
          <div className="mb-6 flex flex-col items-center text-gray-400 dark:text-gray-500">
            <Layers className="w-8 h-8 mb-2 opacity-50" />
            <span className="text-sm font-medium">
              {totalItems - itemIndex} cards remaining
            </span>
          </div>

          {/* Card Area */}
          <div className="relative w-full max-w-sm h-64 mb-12 flex items-center justify-center">
            {/* The Card */}
            <div
              className={`
                w-full h-full bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700
                flex flex-col items-center justify-center p-8 text-center transition-all duration-300
                ${
                  feedback === "correct"
                    ? "scale-110 border-green-500 bg-green-50 dark:bg-green-900/20 translate-y-[-20px] opacity-0"
                    : ""
                }
                ${
                  feedback === "wrong"
                    ? "border-red-500 bg-red-50 dark:bg-red-900/20 animate-shake"
                    : ""
                }
             `}
            >
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {currentItem.word}
              </h2>
              <div className="text-gray-400 text-sm mt-4">
                Where does this belong?
              </div>
            </div>
          </div>

          {/* Sorting Buttons */}
          <div className="grid grid-cols-2 gap-6 w-full max-w-lg">
            {currentLevel.groups.map((group) => (
              <button
                key={group.id}
                onClick={() => handleSort(group.id)}
                className="
                        flex flex-col items-center justify-center p-6 rounded-2xl
                        bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700
                        hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20
                        transition-all active:scale-95
                    "
              >
                <span className="text-4xl mb-3">{group.icon}</span>
                <span className="font-semibold text-gray-700 dark:text-gray-200">
                  {group.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        // Game Over Screen
        <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-6">
            <span className="text-4xl">⚖️</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Sorting Complete!
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            You sorted{" "}
            <span className="font-bold text-indigo-600">{score}</span> items
            correctly.
          </p>

          <Button
            onClick={nextLevel}
            size="lg"
            className="w-full max-w-xs mb-4"
          >
            Next Challenge (
            {MOCK_LEVELS[(currentLevelIndex + 1) % MOCK_LEVELS.length].title})
          </Button>

          <Button
            variant="outline"
            onClick={restartGame}
            className="w-full max-w-xs gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Replay Level
          </Button>
        </div>
      )}
    </div>
  );
}
