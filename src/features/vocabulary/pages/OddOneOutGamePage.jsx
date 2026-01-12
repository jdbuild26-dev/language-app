import React, { useState } from "react";
import { ArrowLeft, CheckCircle, XCircle, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

// MOCK DATA for "Odd One Out"
const MOCK_QUESTIONS = [
  {
    id: 1,
    words: ["Chien", "Chat", "Lapin", "Pomme"],
    correctAnswer: "Pomme",
    reason: "'Pomme' is a fruit, the others are animals.",
  },
  {
    id: 2,
    words: ["Rouge", "Bleu", "Voiture", "Vert"],
    correctAnswer: "Voiture",
    reason: "'Voiture' is a vehicle, the others are colors.",
  },
  {
    id: 3,
    words: ["Manger", "Boire", "Dormir", "Heureux"],
    correctAnswer: "Heureux",
    reason: "'Heureux' is an adjective, the others are verbs.",
  },
  {
    id: 4,
    words: ["Lundi", "Mardi", "Janvier", "Mercredi"],
    correctAnswer: "Janvier",
    reason: "'Janvier' is a month, the others are days.",
  },
  {
    id: 5,
    words: ["Un", "Deux", "Trois", "Livre"],
    correctAnswer: "Livre",
    reason: "'Livre' is an object, the others are numbers.",
  },
];

export default function OddOneOutGamePage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedWord, setSelectedWord] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  const currentQuestion = MOCK_QUESTIONS[currentIndex];
  const progress = ((currentIndex + 1) / MOCK_QUESTIONS.length) * 100;

  const handleWordClick = (word) => {
    if (isAnswered) return;

    setSelectedWord(word);
    setIsAnswered(true);

    if (word === currentQuestion.correctAnswer) {
      setScore((prev) => prev + 1);
      // Auto-advance if correct
      setTimeout(() => {
        nextQuestion();
      }, 1000); // Slightly longer delay to read the reason (optional)?
      // Actually 1s is good to quickly see "Correct".
    }
  };

  const nextQuestion = () => {
    if (currentIndex + 1 < MOCK_QUESTIONS.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedWord(null);
      setIsAnswered(false);
    } else {
      setIsGameOver(true);
    }
  };

  const restartGame = () => {
    setCurrentIndex(0);
    setSelectedWord(null);
    setIsAnswered(false);
    setScore(0);
    setIsGameOver(false);
  };

  const getWordStyle = (word) => {
    const baseStyle =
      "h-24 rounded-2xl border-2 text-xl font-medium transition-all duration-200 flex items-center justify-center relative overflow-hidden";

    if (!isAnswered) {
      return `${baseStyle} bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-purple-400 hover:shadow-md cursor-pointer text-gray-700 dark:text-gray-200`;
    }

    // Correct Answer Logic
    if (word === currentQuestion.correctAnswer) {
      return `${baseStyle} bg-green-50 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-300`;
    }

    // Wrong Answer Logic
    if (word === selectedWord && word !== currentQuestion.correctAnswer) {
      return `${baseStyle} bg-red-50 dark:bg-red-900/30 border-red-500 text-red-700 dark:text-red-300 opacity-80`;
    }

    // Other non-selected words
    return `${baseStyle} bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 text-gray-400 opacity-50`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 min-h-screen flex flex-col">
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
          Question {currentIndex + 1} / {MOCK_QUESTIONS.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full mb-12 overflow-hidden">
        <div
          className="bg-purple-500 h-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {!isGameOver ? (
        <div className="flex-1 flex flex-col items-center justify-center -mt-20">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center">
            Find the Odd One Out
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-10 text-center">
            Select the word that doesn't belong in the group.
          </p>

          {/* Grid */}
          <div className="grid grid-cols-2 gap-4 w-full max-w-2xl mb-8">
            {currentQuestion.words.map((word, idx) => (
              <button
                key={idx}
                onClick={() => handleWordClick(word)}
                disabled={isAnswered}
                className={getWordStyle(word)}
              >
                <span>{word}</span>
                {isAnswered && word === currentQuestion.correctAnswer && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Feedback Section */}
          <div className="h-24 w-full max-w-2xl">
            {isAnswered && (
              <div className="animate-in fade-in slide-in-from-bottom-4 bg-gray-50 dark:bg-gray-800/80 rounded-xl p-4 border border-gray-100 dark:border-gray-700 text-center">
                <p className="text-gray-900 dark:text-gray-100 font-medium text-lg mb-2">
                  {selectedWord === currentQuestion.correctAnswer
                    ? "Correct!"
                    : "Not quite!"}
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  {currentQuestion.reason}
                </p>
              </div>
            )}
          </div>

          {/* Next Button (Only if failure, otherwise auto-advance logic handles it, or wait... 
              If I have a text explanation "Reason", user needs time to read it!
              Auto-advance of 1s might be too fast to read the "Reason".
              Maybe 2s? Or just requiring manual click for Odd One Out because of the educational value of the reason?
              User asked for "correct -> move to next". 
              I'll stick to that strictly: If correct -> move.
              If wrong -> show button.
              But the 'Reason' is valuable even if correct. 
              I will start with 1.5s delay for correct.
          */}
          {isAnswered && selectedWord !== currentQuestion.correctAnswer && (
            <div className="w-full max-w-2xl mt-4 animate-in fade-in">
              <Button onClick={nextQuestion} className="w-full h-12 text-lg">
                Next Question
              </Button>
            </div>
          )}
        </div>
      ) : (
        // Game Over Screen
        <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-6">
            <span className="text-4xl">🤔</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Session Complete!
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            You scored{" "}
            <span className="font-bold text-purple-600">{score}</span> /{" "}
            {MOCK_QUESTIONS.length}
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
