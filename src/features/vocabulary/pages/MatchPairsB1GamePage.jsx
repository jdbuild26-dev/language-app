import React, { useState, useEffect } from "react";
import { fetchVocabulary } from "../../../services/vocabularyApi";
import { Loader2, ArrowLeft, RotateCcw, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

export default function MatchPairsB1GamePage() {
  const { speak } = useTextToSpeech();
  const [loading, setLoading] = useState(true);
  const [pairs, setPairs] = useState([]);
  const [cards, setCards] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Use B1 level for this specific game
      const response = await fetchVocabulary({ level: "B1", limit: 50 });
      if (response && response.data) {
        // Randomly select 6 pairs
        const shuffled = [...response.data]
          .sort(() => 0.5 - Math.random())
          .slice(0, 6);

        setPairs(shuffled);
        prepareCards(shuffled);
      }
    } catch (error) {
      console.error("Error loading vocabulary:", error);
    } finally {
      setLoading(false);
    }
  };

  const prepareCards = (vocabularyPairs) => {
    const newCards = [];
    vocabularyPairs.forEach((pair) => {
      // Card 1: French Word (Text + Audio on click)
      newCards.push({
        id: `fr-${pair.id}`,
        pairId: pair.id,
        content: pair.forms?.[0]?.word || pair.english, // Fallback
        type: "french",
        audioText: pair.forms?.[0]?.word || pair.english, // For TTS
      });
      // Card 2: English Meaning (Text only)
      newCards.push({
        id: `en-${pair.id}`,
        pairId: pair.id,
        content: pair.english,
        type: "english",
        audioText: null,
      });
    });

    // Shuffle cards
    setCards(newCards.sort(() => 0.5 - Math.random()));
  };

  const handleCardClick = (card) => {
    if (
      gameCompleted ||
      matchedPairs.includes(card.pairId) ||
      selectedCards.find((c) => c.id === card.id) ||
      selectedCards.length >= 2
    ) {
      return;
    }

    // Play Audio if it's a French card
    if (card.audioText) {
      speak(card.audioText, "fr-FR");
    }

    const newSelected = [...selectedCards, card];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      checkForMatch(newSelected);
    }
  };

  const checkForMatch = (currentSelected) => {
    const [card1, card2] = currentSelected;
    const isMatch = card1.pairId === card2.pairId;

    if (isMatch) {
      setMatchedPairs((prev) => [...prev, card1.pairId]);
      setScore((prev) => prev + 10);
      setSelectedCards([]);

      // Check for game completion
      if (matchedPairs.length + 1 === pairs.length) {
        setGameCompleted(true);
      }
    } else {
      setErrors((prev) => prev + 1);
      // Delay to show error state
      setTimeout(() => {
        setSelectedCards([]);
      }, 1000);
    }
  };

  const handleRestart = () => {
    setMatchedPairs([]);
    setSelectedCards([]);
    setScore(0);
    setErrors(0);
    setGameCompleted(false);
    loadData();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <p className="text-slate-600 dark:text-slate-400">
          Loading vocabulary...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/vocabulary/practice">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Exit
            </Button>
          </Link>
          <div className="flex items-center gap-6">
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Pairs: {matchedPairs.length} / {pairs.length}
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              Score: {score}
            </div>
          </div>
        </div>

        {/* Game Area */}
        {gameCompleted ? (
          <div className="flex-1 flex flex-col items-center justify-center animate-in zoom-in duration-300">
            <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
              <span className="text-5xl">🎉</span>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Excellent!
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md text-center">
              You've successfully matched all {pairs.length} pairs with only{" "}
              {errors} errors.
            </p>
            <div className="flex gap-4">
              <Link to="/vocabulary/practice">
                <Button variant="outline" size="lg">
                  Done
                </Button>
              </Link>
              <Button onClick={handleRestart} size="lg" className="gap-2">
                <RotateCcw className="w-4 h-4" /> Play Again
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-fr">
            {cards.map((card) => {
              const isSelected = selectedCards.find((c) => c.id === card.id);
              const isMatched = matchedPairs.includes(card.pairId);
              let cardStyle =
                "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:-translate-y-1";

              if (isSelected) {
                cardStyle =
                  "bg-blue-50 dark:bg-blue-900/20 border-blue-500 ring-2 ring-blue-500 shadow-lg scale-[1.02] z-10";
              }
              if (isMatched) {
                cardStyle =
                  "bg-green-50 dark:bg-green-900/20 border-green-500 opacity-50 grayscale cursor-default";
              }
              // Error state if 2 selected and not match
              if (
                selectedCards.length === 2 &&
                isSelected &&
                selectedCards[0].pairId !== selectedCards[1].pairId
              ) {
                cardStyle =
                  "bg-red-50 dark:bg-red-900/20 border-red-500 animate-shake";
              }

              return (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(card)}
                  disabled={isMatched}
                  className={cn(
                    "relative flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all duration-200 shadow-sm min-h-[140px]",
                    cardStyle
                  )}
                >
                  <span className="text-lg md:text-xl font-medium text-center text-slate-800 dark:text-slate-100">
                    {card.content}
                  </span>

                  {card.audioText && !isMatched && (
                    <Volume2 className="w-4 h-4 text-slate-400 absolute bottom-3 right-3 opacity-50" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
