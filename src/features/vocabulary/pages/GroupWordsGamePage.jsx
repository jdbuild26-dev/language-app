import React, { useState } from "react";
import { Layers, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";

// MOCK DATA for "Group Words"
const MOCK_LEVELS = [
  {
    id: 1,
    title: "Animals vs Food",
    instructionFr: "Triez les mots",
    instructionEn: "Sort the words into correct groups",
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
    instructionFr: "Masculin ou Féminin ?",
    instructionEn: "Sort by gender",
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
  const navigate = useNavigate();
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [itemIndex, setItemIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong'
  const [isGameOver, setIsGameOver] = useState(false);

  const currentLevel = MOCK_LEVELS[currentLevelIndex];
  const currentItem = currentLevel.items[itemIndex];
  const totalItems = currentLevel.items.length;
  const progress = (itemIndex / totalItems) * 100;

  const handleSort = (groupId) => {
    if (feedback) return;

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

  const nextLevel = () => {
    const nextIdx = (currentLevelIndex + 1) % MOCK_LEVELS.length;
    setCurrentLevelIndex(nextIdx);
    restartGame();
  };

  return (
    <PracticeGameLayout
      questionType={currentLevel.title || "Group Words"}
      instructionFr={currentLevel.instructionFr || "Triez les mots"}
      instructionEn={currentLevel.instructionEn || "Sort the words"}
      progress={progress}
      isGameOver={isGameOver}
      score={score}
      totalQuestions={totalItems} // Per level
      onExit={() => navigate("/vocabulary/practice")}
      onRestart={restartGame}
      isSubmitEnabled={false}
      showSubmitButton={false} // Instant feedback game
    >
      <div className="flex-1 flex flex-col items-center justify-center -mt-10">
        {/* Deck Counter */}
        <div className="mb-6 flex flex-col items-center text-gray-400 dark:text-gray-500">
          <Layers className="w-8 h-8 mb-2 opacity-50" />
          <span className="text-sm font-medium">
            {totalItems - itemIndex} cards remaining
          </span>
        </div>

        {/* Card Area */}
        <div className="relative w-full max-w-sm h-64 mb-12 flex items-center justify-center px-4">
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
              {currentItem?.word}
            </h2>
            <div className="text-gray-400 text-sm mt-4">
              Where does this belong?
            </div>
          </div>
        </div>

        {/* Sorting Buttons */}
        <div className="grid grid-cols-2 gap-6 w-full max-w-lg px-4">
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

        {/* Game Over Actions Override (Customize next level button) */}
        {/* Note: PracticeGameLayout handles 'Try Again' but not 'Next Level'. 
               If we want 'Next Level', we might need to modify layout or just accept standard exit/retry. 
               For now, standard retry is fine, or I can add a custom 'Next Level' inside the children if I hide standard game over?
               Actually PracticeGameLayout shows Game Over screen full stop. 
               I'll stick to standard behavior for now to standardize UI.
           */}
      </div>
    </PracticeGameLayout>
  );
}
