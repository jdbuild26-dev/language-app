import React, { useState } from "react";
import { ArrowLeft, CheckCircle, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

// MOCK DATA for "Highlight the Word"
// In a real app, backend would likely provide the sentence split or we split by space.
const MOCK_DATA = [
  {
    id: 1,
    prompt: "Select the French word for 'Dog'",
    sentence: "Le chien joue dans le parc.",
    correctWord: "chien",
    meaning: "Dog",
  },
  {
    id: 2,
    prompt: "Select the French word for 'Red'",
    sentence: "Ma voiture est rouge et rapide.",
    correctWord: "rouge",
    meaning: "Red",
  },
  {
    id: 3,
    prompt: "Select the French word for 'To Eat'",
    sentence: "J'aime manger des pommes.",
    correctWord: "manger",
    meaning: "To Eat",
  },
  {
    id: 4,
    prompt: "Select the French word for 'Happy'",
    sentence: "Elle est très heureuse aujourd'hui.",
    correctWord: "heureuse",
    meaning: "Happy",
  },
  {
    id: 5,
    prompt: "Select the French word for 'Book'",
    sentence: "Le livre est sur la table.",
    correctWord: "livre",
    meaning: "Book",
  },
];

export default function HighlightWordGamePage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedWordIndex, setSelectedWordIndex] = useState(null); // Index of word user clicked
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  const currentItem = MOCK_DATA[currentIndex];

  // Split sentence into words for rendering
  // Note: Simple split by space. In production, need better tokenizer handling punctuation.
  const words = currentItem.sentence.split(" ");

  // Clean a word for comparison (remove punctuation)
  const cleanWord = (word) => word.toLowerCase().replace(/[.,!?;:]/g, "");

  const progress = ((currentIndex + 1) / MOCK_DATA.length) * 100;

  const handleWordClick = (word, index) => {
    if (isAnswered) return;

    setSelectedWordIndex(index);
    setIsAnswered(true);

    const isCorrect = cleanWord(word) === currentItem.correctWord.toLowerCase();

    if (isCorrect) {
      setScore((prev) => prev + 1);
      // Auto-advance if correct
      setTimeout(() => {
        nextQuestion();
      }, 700);
    }
  };

  const nextQuestion = () => {
    if (currentIndex + 1 < MOCK_DATA.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedWordIndex(null);
      setIsAnswered(false);
    } else {
      setIsGameOver(true);
    }
  };

  const restartGame = () => {
    setCurrentIndex(0);
    setSelectedWordIndex(null);
    setIsAnswered(false);
    setScore(0);
    setIsGameOver(false);
  };

  const getWordStyle = (word, index) => {
    const isSelected = selectedWordIndex === index;
    const isCorrect = cleanWord(word) === currentItem.correctWord.toLowerCase();

    // Base style
    let style =
      "px-3 py-2 rounded-lg text-xl cursor-pointer transition-all duration-200 border-2 border-transparent ";

    if (!isAnswered) {
      return (
        style +
        "hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:border-blue-200"
      );
    }

    // Logic after answer
    if (isCorrect) {
      // Must be the correct word
      if (isSelected) {
        return (
          style +
          "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-500 font-medium"
        );
      }
      // If user got it wrong, highlight correct one?
      // Let's highlight correct answer regardless if user was wrong?
      // For now, if user clicked wrong, they see red. The correct one stays neutral until they find it?
      // Or show correct one? Let's show correct one if they got it wrong.
      if (
        selectedWordIndex !== null &&
        cleanWord(words[selectedWordIndex]) !==
          currentItem.correctWord.toLowerCase()
      ) {
        return (
          style +
          "bg-green-50 dark:bg-green-900/20 text-green-600 border-green-200 dashed"
        );
      }
    } else if (isSelected) {
      // Selected wrong word
      return (
        style +
        "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-500 animate-shake"
      );
    }

    return style + "opacity-50";
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 min-h-screen flex flex-col">
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
          Question {currentIndex + 1} / {MOCK_DATA.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full mb-12 overflow-hidden">
        <div
          className="bg-blue-500 h-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {!isGameOver ? (
        <div className="flex-1 flex flex-col items-center justify-center -mt-20">
          {/* Prompt */}
          <h2 className="text-gray-500 dark:text-gray-400 text-lg uppercase tracking-wide font-medium mb-8">
            {currentItem.prompt}
          </h2>

          {/* Sentence Container */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 w-full text-center leading-loose">
            <div className="flex flex-wrap justify-center gap-2">
              {words.map((word, idx) => (
                <span
                  key={idx}
                  onClick={() => handleWordClick(word, idx)}
                  className={getWordStyle(word, idx)}
                >
                  {word}
                </span>
              ))}
            </div>
          </div>

          {/* Feedback / Continue */}
          {isAnswered && (
            <div className="mt-12 w-full max-w-sm animate-in fade-in slide-in-from-bottom-4">
              {selectedWordIndex !== null &&
                cleanWord(words[selectedWordIndex]) !==
                  currentItem.correctWord.toLowerCase() && (
                  <div className="text-center mb-4 text-red-500 font-medium">
                    Oops! Correct answer:{" "}
                    <span className="font-bold">{currentItem.correctWord}</span>
                  </div>
                )}

              {/* Only show NEXT button if answer was WRONG (since correct auto-advances) */}
              {selectedWordIndex !== null &&
                cleanWord(words[selectedWordIndex]) !==
                  currentItem.correctWord.toLowerCase() && (
                  <Button
                    onClick={nextQuestion}
                    className="w-full h-12 text-lg"
                  >
                    Next Question
                  </Button>
                )}
            </div>
          )}
        </div>
      ) : (
        // Game Over Screen
        <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6">
            <span className="text-4xl">🎯</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Practice Complete!
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            You found <span className="font-bold text-blue-600">{score}</span>{" "}
            word{score !== 1 ? "s" : ""} correctly!
          </p>

          <div className="flex gap-4">
            <Link to="/vocabulary/practice">
              <Button variant="outline" size="lg">
                Back to Menu
              </Button>
            </Link>
            <Button onClick={restartGame} size="lg" className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Try Again
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
