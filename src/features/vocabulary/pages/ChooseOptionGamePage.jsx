import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { fetchPracticeQuestions } from "@/services/vocabularyApi";

export default function ChooseOptionGamePage() {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null); // The option user clicked
  const [isAnswered, setIsAnswered] = useState(false); // Has user answered current Q?
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper to shuffle array
  const shuffleArray = (array) => {
    return [...array].sort(() => Math.random() - 0.5);
  };

  useEffect(() => {
    const loadGameData = async () => {
      try {
        setLoading(true);
        // Fetch practice questions from specific sheet
        const response = await fetchPracticeQuestions("A2_choose from options");
        const practiceData = response.data || [];

        if (!practiceData || practiceData.length === 0) {
          throw new Error("No practice questions found.");
        }

        // Shuffle and pick a subset (e.g., 10 questions)
        const gameQuestionsRaw = shuffleArray(practiceData).slice(0, 10);

        const generatedQuestions = gameQuestionsRaw.map((item) => {
          // Structure from API: Question, Option1, Option2, Option3, Option4, CorrectAnswer
          const options = [
            item.Option1,
            item.Option2,
            item.Option3,
            item.Option4,
          ].filter(Boolean); // Ensure no empty options

          // Shuffle options if needed, though usually they might come pre-shuffled or fixed order.
          // The sheet data has "ShuffleOptions": "TRUE", but let's shuffle client side to be sure.
          const shuffledOptions = shuffleArray(options);

          return {
            id: item.ExerciseID || Math.random().toString(),
            question: item.Question,
            correctAnswer: item.CorrectAnswer,
            options: shuffledOptions,
          };
        });

        setQuestions(generatedQuestions);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load game data:", err);
        setError(
          "Failed to load questions. Please check the sheet name or try again."
        );
        setLoading(false);
      }
    };

    loadGameData();
  }, []);

  const currentQuestion = questions[currentIndex];
  const progress =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  const handleOptionClick = (option) => {
    if (isAnswered) return;

    setSelectedOption(option);
    setIsAnswered(true);

    if (option === currentQuestion.correctAnswer) {
      setScore((prev) => prev + 1);
      // Auto-advance if correct (0.7s delay to see feedback)
      setTimeout(() => {
        nextQuestion();
      }, 700);
    }
  };

  const nextQuestion = () => {
    // Check based on current state
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsGameOver(true);
    }
  };

  const restartGame = () => {
    // Reload data to get new random questions?
    // Or just restart with same set? For "Try Again" usually same set or similar.
    // Let's re-fetch/re-shuffle logic for a fresh game experience:
    // Actually, simple restart: reset states, maybe reshuffle logic could be better but let's stick to simple reset for now
    // or trigger re-mount key.
    // Let's simply reload the window or re-trigger effect.
    // Simplest: window.location.reload() or internal reset.
    // Let's implement internal reset with re-generation if possible, or just reset indices.
    // For a true "Try Again" experience, let's just reset the current set.
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-500">Loading vocabulary...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <XCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Error
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
        <Link to="/vocabulary/practice">
          <Button variant="outline">Back to Practice</Button>
        </Link>
      </div>
    );
  }

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
          Question {currentIndex + 1} / {questions.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full mb-8 overflow-hidden">
        <div
          className="bg-blue-500 h-full transition-all duration-500 ease-out"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {!isGameOver && currentQuestion ? (
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
                {currentIndex + 1 === questions.length
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
            out of {questions.length}
          </p>

          <div className="flex gap-4">
            <Link to="/vocabulary/practice">
              <Button variant="outline" size="lg">
                Back to Menu
              </Button>
            </Link>
            <Button
              onClick={() => window.location.reload()}
              size="lg"
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Try Again
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
