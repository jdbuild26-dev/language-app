import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Timer, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

// EXPANDED MOCK DATA (50 pairs to support "infinite" play)
const FULL_MOCK_DATA = [
  { id: "1", english: "Dog", french: "Chien" },
  { id: "2", english: "Cat", french: "Chat" },
  { id: "3", english: "Apple", french: "Pomme" },
  { id: "4", english: "Car", french: "Voiture" },
  { id: "5", english: "House", french: "Maison" },
  { id: "6", english: "Book", french: "Livre" },
  { id: "7", english: "Tree", french: "Arbre" },
  { id: "8", english: "Flower", french: "Fleur" },
  { id: "9", english: "Computer", french: "Ordinateur" },
  { id: "10", english: "Mouse", french: "Souris" },
  { id: "11", english: "Keyboard", french: "Clavier" },
  { id: "12", english: "Phone", french: "Téléphone" },
  { id: "13", english: "Screen", french: "Écran" },
  { id: "14", english: "Table", french: "Table" },
  { id: "15", english: "Chair", french: "Chaise" },
  { id: "16", english: "Window", french: "Fenêtre" },
  { id: "17", english: "Door", french: "Porte" },
  { id: "18", english: "School", french: "École" },
  { id: "19", english: "Teacher", french: "Professeur" },
  { id: "20", english: "Student", french: "Étudiant" },
  { id: "21", english: "Pencil", french: "Crayon" },
  { id: "22", english: "Pen", french: "Stylo" },
  { id: "23", english: "Paper", french: "Papier" },
  { id: "24", english: "Water", french: "Eau" },
  { id: "25", english: "Bread", french: "Pain" },
  { id: "26", english: "Cheese", french: "Fromage" },
  { id: "27", english: "Wine", french: "Vin" },
  { id: "28", english: "Beer", french: "Bière" },
  { id: "29", english: "Coffee", french: "Café" },
  { id: "30", english: "Tea", french: "Thé" },
  { id: "31", english: "Milk", french: "Lait" },
  { id: "32", english: "Sun", french: "Soleil" },
  { id: "33", english: "Moon", french: "Lune" },
  { id: "34", english: "Star", french: "Étoile" },
  { id: "35", english: "Sky", french: "Ciel" },
  { id: "36", english: "Cloud", french: "Nuage" },
  { id: "37", english: "Rain", french: "Pluie" },
  { id: "38", english: "Snow", french: "Neige" },
  { id: "39", english: "Wind", french: "Vent" },
  { id: "40", english: "Fire", french: "Feu" },
  { id: "41", english: "Bird", french: "Oiseau" },
  { id: "42", english: "Fish", french: "Poisson" },
  { id: "43", english: "Horse", french: "Cheval" },
  { id: "44", english: "Cow", french: "Vache" },
  { id: "45", english: "Pig", french: "Cochon" },
  { id: "46", english: "Sheep", french: "Mouton" },
  { id: "47", english: "Chicken", french: "Poulet" },
  { id: "48", english: "Duck", french: "Canard" },
  { id: "49", english: "Rabbit", french: "Lapin" },
  { id: "50", english: "Snake", french: "Serpent" },
];

const GAME_DURATION = 180; // 3 minutes in seconds
const INITIAL_PAIRS_COUNT = 6;

export default function MatchPairsGamePage() {
  const [cards, setCards] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [matchedCount, setMatchedCount] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [timer, setTimer] = useState(GAME_DURATION);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const availablePairsRef = useRef([]);

  // Initialize Game
  useEffect(() => {
    startNewGame();
  }, []);

  useEffect(() => {
    let interval;
    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timer === 0 && isTimerRunning) {
      endGame();
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timer]);

  const endGame = () => {
    setIsGameOver(true);
    setIsTimerRunning(false);
  };

  const startNewGame = () => {
    // 1. Reset pools
    const shuffledData = [...FULL_MOCK_DATA].sort(() => Math.random() - 0.5);

    // Take first 6 for initial board
    const initialPairs = shuffledData.slice(0, INITIAL_PAIRS_COUNT);
    // Keep the rest in "available" pool
    availablePairsRef.current = shuffledData.slice(INITIAL_PAIRS_COUNT);

    const deck = [];
    initialPairs.forEach((pair) => {
      createPairCards(pair, deck);
    });

    // Shuffle deck
    const shuffledDeck = deck.sort(() => Math.random() - 0.5);

    setCards(shuffledDeck);
    setMatchedCount(0);
    setSelectedCards([]);
    setIsGameOver(false);
    setTimer(GAME_DURATION);
    setIsTimerRunning(true);
  };

  const createPairCards = (pair, deckArray) => {
    // Add English Card
    deckArray.push({
      id: `${pair.id}-en`,
      pairId: pair.id,
      content: pair.english,
      type: "english",
      state: "default",
    });
    // Add French Card
    deckArray.push({
      id: `${pair.id}-fr`,
      pairId: pair.id,
      content: pair.french,
      type: "french",
      state: "default",
    });
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

    // Select card
    const newCards = cards.map((c) =>
      c.id === clickedCard.id ? { ...c, state: "selected" } : c
    );
    setCards(newCards);

    const newSelected = [...selectedCards, clickedCard];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      checkForMatch(newSelected, newCards);
    }
  };

  const checkForMatch = (selected, currentCards) => {
    const [card1, card2] = selected;
    const isMatch = card1.pairId === card2.pairId;

    if (isMatch) {
      // 1. Mark as matched (visual feedback)
      // Use functional update to ensure we don't clobber state if fast clicking happened although logic selectedCards prevents > 2
      setCards((prev) =>
        prev.map((c) =>
          c.id === card1.id || c.id === card2.id
            ? { ...c, state: "matched" }
            : c
        )
      );
      setMatchedCount((prev) => prev + 1);
      setSelectedCards([]);

      // 2. Wait, then replace
      setTimeout(() => {
        replaceMatchedPair(card1.pairId);
      }, 500); // 0.5s delay
    } else {
      // Failure logic
      setCards((prev) =>
        prev.map((c) =>
          c.id === card1.id || c.id === card2.id ? { ...c, state: "error" } : c
        )
      );

      setTimeout(() => {
        setCards((prev) =>
          prev.map((c) =>
            c.id === card1.id || c.id === card2.id
              ? { ...c, state: "default" }
              : c
          )
        );
        setSelectedCards([]);
      }, 1000);
    }
  };

  const replaceMatchedPair = (matchedPairId) => {
    // Get new pair from pool
    const nextPair = availablePairsRef.current.shift();

    if (!nextPair) {
      if (availablePairsRef.current.length === 0) {
        // Reshuffle FULL_MOCK_DATA to replenish pool
        const available = [...FULL_MOCK_DATA].sort(() => Math.random() - 0.5);
        availablePairsRef.current = available;

        const retryPair = availablePairsRef.current.shift();
        if (retryPair) insertNewPair(retryPair, matchedPairId);
      } else {
        insertNewPair(nextPair, matchedPairId);
      }
    } else {
      insertNewPair(nextPair, matchedPairId);
    }
  };

  const insertNewPair = (newPair, oldPairId) => {
    setCards((prevCards) => {
      // Find indices of the two cards that matched
      const indices = [];
      prevCards.forEach((c, idx) => {
        if (c.pairId === oldPairId) indices.push(idx);
      });

      if (indices.length !== 2) return prevCards;

      // Create new card objects
      const newCard1 = {
        id: `${newPair.id}-en`,
        pairId: newPair.id,
        content: newPair.english,
        type: "english",
        state: "default",
      };
      const newCard2 = {
        id: `${newPair.id}-fr`,
        pairId: newPair.id,
        content: newPair.french,
        type: "french",
        state: "default",
      };

      const random = Math.random() > 0.5;
      const firstCard = random ? newCard1 : newCard2;
      const secondCard = random ? newCard2 : newCard1;

      const newCardList = [...prevCards];
      newCardList[indices[0]] = firstCard;
      newCardList[indices[1]] = secondCard;

      return newCardList;
    });
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
        <div className="flex items-center gap-4">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Score: {matchedCount}
          </div>
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-sm border ${
              timer < 10
                ? "bg-red-50 border-red-200 text-red-600"
                : "bg-white border-gray-100 text-gray-900"
            } dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-colors`}
          >
            <Timer
              className={`w-5 h-5 ${
                timer < 10 ? "animate-pulse" : "text-blue-500"
              }`}
            />
            <span className="font-mono font-medium text-lg">
              {formatTime(timer)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Match the Pairs
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Match pairs before time runs out!
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
                <span className="animate-in fade-in duration-300">
                  {card.content}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Game Over Modal */}
      {isGameOver && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Timer className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Time's Up!
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              You matched{" "}
              <span className="font-bold text-xl">{matchedCount}</span> pairs in
              3 minutes.
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
