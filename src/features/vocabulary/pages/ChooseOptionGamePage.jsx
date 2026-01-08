import React, { useState } from "react";
import { ArrowLeft, CheckCircle, XCircle, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

// MOCK DATA for "Choose from Options"
const MOCK_QUESTIONS = [
  {
    id: 1,
    question: "What is the French word for 'Dog'?",
    correctAnswer: "Chien",
    options: ["Chat", "Chien", "Lapin", "Oiseau"],
  },
  {
    id: 2,
    question: "Select the correct translation for 'House'.",
    correctAnswer: "Maison",
    options: ["Maison", "École", "Voiture", "Arbre"],
  },
  {
    id: 3,
    question: "Which word means 'Apple'?",
    correctAnswer: "Pomme",
    options: ["Poire", "Banane", "Pomme", "Orange"],
  },
  {
    id: 4,
    question: "Translate: 'Good Morning'",
    correctAnswer: "Bonjour",
    options: ["Bonsoir", "Salut", "Bonjour", "Au revoir"],
  },
  {
    id: 5,
    question: "What is 'Red' in French?",
    correctAnswer: "Rouge",
    options: ["Bleu", "Vert", "Jaune", "Rouge"],
  },
];

export default function ChooseOptionGamePage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null); // The option user clicked
  const [isAnswered, setIsAnswered] = useState(false); // Has user answered current Q?
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  const currentQuestion = MOCK_QUESTIONS[currentIndex];
  const progress = ((currentIndex + 1) / MOCK_QUESTIONS.length) * 100;

  const handleOptionClick = (option) => {
    if (isAnswered) return;

    setSelectedOption(option);
    setIsAnswered(true);

    if (option === currentQuestion.correctAnswer) {
      setScore((prev) => prev + 1);
      // Auto-advance if correct (0.7s delay to see feedback)
      setTimeout(() => {
        // Use functional state update to ensure we don't use stale closure values if clicked rapidly
        // But since we can't easily access the latest check inside timeout without ref or functional update to a "next" logic...
        // Actually, logic needs to be safe.
        // We'll call nextQuestion directly. Since valid current index doesn't change during the 0.7s, it is fine.
        // However, we need to ensure the component hasn't unmounted or state changed strangely.
        nextQuestion();
      }, 700);
    }
  };

  const nextQuestion = () => {
    // Check based on current state
    if (currentIndex + 1 < MOCK_QUESTIONS.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsGameOver(true);
    }
  };

  const restartGame = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsGameOver(false);
  };

  const getOptionStyle = (option) => {
    const baseStyle =
      "w-full p-4 rounded-xl border-2 text-lg font-medium transition-all duration-200 flex items-center justify-between";

    if (!isAnswered) {
      return `${baseStyle} bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-700 dark:text-gray-200`;
    }

    // Correct Answer Logic
    if (option === currentQuestion.correctAnswer) {
      return `${baseStyle} bg-green-50 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-300`;
    }

    // Wrong Answer Logic (only if selected)
    if (option === selectedOption && option !== currentQuestion.correctAnswer) {
      return `${baseStyle} bg-red-50 dark:bg-red-900/30 border-red-500 text-red-700 dark:text-red-300`;
    }

    // Disable non-selected options
    return `${baseStyle} bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 text-gray-400 opacity-60`;
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
          Question {currentIndex + 1} / {MOCK_QUESTIONS.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full mb-8 overflow-hidden">
        <div
          className="bg-blue-500 h-full transition-all duration-500 ease-out"
          style={{ width: `${(currentIndex / MOCK_QUESTIONS.length) * 100}%` }}
        />
      </div>

      {!isGameOver ? (
        <div className="flex-1 flex flex-col">
          {/* Question Card */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {currentQuestion.question}
            </h1>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 gap-4 mb-8">
            {currentQuestion.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleOptionClick(option)}
                disabled={isAnswered}
                className={getOptionStyle(option)}
              >
                <span>{option}</span>
                {isAnswered && option === currentQuestion.correctAnswer && (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                )}
                {isAnswered &&
                  option === selectedOption &&
                  option !== currentQuestion.correctAnswer && (
                    <XCircle className="w-6 h-6 text-red-600" />
                  )}
              </button>
            ))}
          </div>

          {/* Continue Button - Only show if wrong (Change: Auto-advance on correct) */}
          {isAnswered && selectedOption !== currentQuestion.correctAnswer && (
            <div className="mt-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
              <Button
                onClick={nextQuestion}
                className="w-full h-12 text-lg"
                size="lg"
              >
                {currentIndex + 1 === MOCK_QUESTIONS.length
                  ? "Finish"
                  : "Next Question"}
              </Button>
            </div>
          )}
        </div>
      ) : (
        // Game Over Screen
        <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6">
            <span className="text-4xl">🏆</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Quiz Complete!
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            You scored <span className="font-bold text-blue-600">{score}</span>{" "}
            out of {MOCK_QUESTIONS.length}
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
