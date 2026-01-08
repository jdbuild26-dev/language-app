import React, { useState, useEffect } from "react";
import { ArrowLeft, Timer, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

// MOCK DATA (Matches the Excel structure we populated)
const MOCK_DATA = [
  { id: "1", english: "Dog", french: "Chien", image: null },
  { id: "2", english: "Cat", french: "Chat", image: null },
  { id: "3", english: "Apple", french: "Pomme", image: null },
  { id: "4", english: "Car", french: "Voiture", image: null },
  { id: "5", english: "House", french: "Maison", image: null },
  { id: "6", english: "Book", french: "Livre", image: null },
];

export default function MatchPairsGamePage() {
  const [cards, setCards] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [timer, setTimer] = useState(0); // Seconds
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Initialize Game
  useEffect(() => {
    startNewGame();
  }, []);

  useEffect(() => {
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => setTimer((prev) => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const startNewGame = () => {
    // 1. Prepare cards: Create 2 cards for each data item (English & French)
    const gamePairs = MOCK_DATA.slice(0, 6); // Use first 6 pairs
    const deck = [];

    gamePairs.forEach((pair) => {
      // Card 1: English
      deck.push({
        id: `${pair.id}-en`,
        pairId: pair.id,
        content: pair.english,
        type: "english",
        state: "default", // default, selected, matched, error
      });
      // Card 2: French
      deck.push({
        id: `${pair.id}-fr`,
        pairId: pair.id,
        content: pair.french,
        type: "french",
        state: "default",
      });
    });

    // 2. Shuffle
    const shuffled = deck.sort(() => Math.random() - 0.5);

    setCards(shuffled);
    setMatchedPairs([]);
    setSelectedCards([]);
    setIsGameOver(false);
    setTimer(0);
    setIsTimerRunning(true);
  };

  const handleCardClick = (clickedCard) => {
    if (
      isGameOver ||
      clickedCard.state === "matched" ||
      clickedCard.state === "selected" ||
      selectedCards.length >= 2
    ) {
      return;
    }

    // Update state to selected
    const newCards = cards.map((c) =>
      c.id === clickedCard.id ? { ...c, state: "selected" } : c
    );
    setCards(newCards);

    const newSelected = [...selectedCards, clickedCard];
    setSelectedCards(newSelected);

    // Check Match if 2 cards selected
    if (newSelected.length === 2) {
      checkForMatch(newSelected, newCards);
    }
  };

  const checkForMatch = (selected, currentCards) => {
    const [card1, card2] = selected;
    const isMatch = card1.pairId === card2.pairId;

    if (isMatch) {
      // Success: Mark as matched
      const updatedCards = currentCards.map((c) =>
        c.id === card1.id || c.id === card2.id ? { ...c, state: "matched" } : c
      );
      setCards(updatedCards);
      setMatchedPairs((prev) => [...prev, card1.pairId]);
      setSelectedCards([]);

      // Check Win Condition
      if (updatedCards.every((c) => c.state === "matched")) {
        setIsGameOver(true);
        setIsTimerRunning(false);
      }
    } else {
      // Failure: Show error state briefly then reset
      const errorCards = currentCards.map((c) =>
        c.id === card1.id || c.id === card2.id ? { ...c, state: "error" } : c
      );
      setCards(errorCards);

      setTimeout(() => {
        const resetCards = errorCards.map((c) =>
          c.id === card1.id || c.id === card2.id
            ? { ...c, state: "default" }
            : c
        );
        setCards(resetCards);
        setSelectedCards([]);
      }, 1000);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm border border-gray-100 dark:border-gray-700">
          <Timer className="w-5 h-5 text-blue-500" />
          <span className="font-mono font-medium text-lg text-gray-900 dark:text-white">
            {formatTime(timer)}
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Match the Pairs
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Find the matching pairs to clear the board!
        </p>

        {/* Game Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 w-full max-w-2xl mb-8">
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card)}
              disabled={card.state === "matched"}
              className={`
                aspect-[4/3] rounded-xl text-lg font-medium transition-all duration-300 transform
                flex items-center justify-center p-2 text-center
                ${
                  card.state === "default"
                    ? "bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:shadow-md text-gray-700 dark:text-gray-200"
                    : ""
                }
                ${
                  card.state === "selected"
                    ? "bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-500 text-blue-700 dark:text-blue-300 scale-105 shadow-lg"
                    : ""
                }
                ${
                  card.state === "matched"
                    ? "bg-green-50 dark:bg-green-900/30 border-2 border-green-500 text-green-700 dark:text-green-300 opacity-50 scale-95"
                    : ""
                }
                ${
                  card.state === "error"
                    ? "bg-red-50 dark:bg-red-900/30 border-2 border-red-500 text-red-700 dark:text-red-300 animate-shake"
                    : ""
                }
              `}
            >
              {card.state === "matched" ? (
                <CheckCircleIcon />
              ) : (
                <span>{card.content}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Game Over Modal */}
      {isGameOver && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🎉</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Well Done!
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              You cleared the board in{" "}
              <span className="font-bold">{formatTime(timer)}</span>.
            </p>
            <div className="flex gap-3 justify-center">
              <Link to="/vocabulary/practice">
                <Button variant="outline">Exit</Button>
              </Link>
              <Button onClick={startNewGame} className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Play Again
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CheckCircleIcon() {
  return (
    <svg
      className="w-8 h-8 opacity-50"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}
