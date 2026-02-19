import React, { useState, useEffect } from "react";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Loader2, Volume2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

import { fetchMatchPairsData } from "@/utils/practiceFetcher";

export default function MatchPairsGamePage() {
  const navigate = useNavigate();
  const { speak } = useTextToSpeech();

  const [loading, setLoading] = useState(true);
  const [exercises, setExercises] = useState([]);
  const [topCards, setTopCards] = useState([]); // French
  const [bottomCards, setBottomCards] = useState([]); // English

  const [selectedTopId, setSelectedTopId] = useState(null);
  const [selectedBottomId, setSelectedBottomId] = useState(null);

  const [matchedIds, setMatchedIds] = useState([]); // Array of pairIds
  const [errorIds, setErrorIds] = useState([]); // Array of cardIds showing error
  const [successIds, setSuccessIds] = useState([]); // Array of cardIds showing success (Green)

  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);

  // Constants
  const PAIRS_PER_ROUND = 5;

  useEffect(() => {
    const loadContent = async () => {
      try {
        const data = await fetchMatchPairsData();

        setExercises(data);
        if (data.length > 0) {
          initializeGame(data);
        }
      } catch (error) {
        console.error("[MatchPairs] ❌ Failed to load:", error);
      } finally {
        setLoading(false);
      }
    };
    loadContent();
  }, []);

  // Timer Hook
  const { timerString, resetTimer, isPaused } = useExerciseTimer({
    duration: 60,
    mode: "timer",
    onExpire: () => setIsGameOver(true),
    isPaused: loading || isGameOver,
  });

  const initializeGame = (data = exercises) => {
    // Shuffle and pick pairs
    const shuffledSource = [...data].sort(() => 0.5 - Math.random());
    const activePairs = shuffledSource.slice(0, PAIRS_PER_ROUND);

    const top = activePairs
      .map((p) => ({
        id: `fr-${p.id}`,
        pairId: p.id,
        content: p.french,
        type: "top",
      }))
      .sort(() => 0.5 - Math.random()); // Shuffle top row

    const bottom = activePairs
      .map((p) => ({
        id: `en-${p.id}`,
        pairId: p.id,
        content: p.english,
        type: "bottom",
      }))
      .sort(() => 0.5 - Math.random()); // Shuffle bottom row

    setTopCards(top);
    setBottomCards(bottom);
    setMatchedIds([]);
    setScore(0);
    setIsGameOver(false);
  };

  const handleTopClick = (card) => {
    if (
      isGameOver ||
      matchedIds.includes(card.pairId) ||
      successIds.includes(card.id)
    )
      return;

    // Play Audio (Top only)
    speak(card.content, "fr-FR");

    // Replace previous top selection
    setSelectedTopId(card.id);

    // If bottom is already selected, check match immediately
    if (selectedBottomId) {
      checkMatch(card.id, selectedBottomId);
    }
  };

  const handleBottomClick = (card) => {
    if (
      isGameOver ||
      matchedIds.includes(card.pairId) ||
      successIds.includes(card.id)
    )
      return;

    // No Audio for bottom

    // Replace previous bottom selection
    setSelectedBottomId(card.id);

    // If top is already selected, check match immediately
    if (selectedTopId) {
      checkMatch(selectedTopId, card.id);
    }
  };

  const checkMatch = (topId, bottomId) => {
    const topCard = topCards.find((c) => c.id === topId);
    const bottomCard = bottomCards.find((c) => c.id === bottomId);

    if (!topCard || !bottomCard) return;

    if (topCard.pairId === bottomCard.pairId) {
      // MATCH
      // 1. Show Green Success State
      setSuccessIds([topId, bottomId]);
      setSelectedTopId(null);
      setSelectedBottomId(null);

      // 2. Wait 1 second (Green Phase)
      setTimeout(() => {
        // 3. Make them disappear (Matched Phase)
        setSuccessIds([]);
        setMatchedIds((prev) => [...prev, topCard.pairId]);
        setScore((prev) => prev + 1);

        // Check Win
        if (matchedIds.length + 1 === PAIRS_PER_ROUND) {
          // Game Over Success handling if needed, or refill
          // For now let's just finish
          setTimeout(() => setIsGameOver(true), 500); // Slight delay after disappearance
        }
      }, 1000);
    } else {
      // MISMATCH
      // Show error state for a brief moment then reset selection
      setErrorIds([topId, bottomId]);

      setTimeout(() => {
        setErrorIds([]);
        setSelectedTopId(null);
        setSelectedBottomId(null);
      }, 800);
    }
  };

  const instructionFr = "Associez les paires";
  const instructionEn = "Match the pairs";
  const progress = (matchedIds.length / PAIRS_PER_ROUND) * 100;

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
      </div>
    );

  const getCardStyle = (card, isSelected, isError, isMatched, isSuccess) => {
    let base =
      "aspect-square rounded-2xl border-2 flex items-center justify-center p-4 text-center font-bold text-lg md:text-xl transition-all duration-200 cursor-pointer shadow-sm relative relative";

    if (isMatched) return "opacity-0 pointer-events-none"; // Disappear

    if (isSuccess)
      return (
        base +
        " bg-green-100 border-green-500 text-green-800 scale-105 shadow-md"
      );

    if (isError)
      return base + " bg-red-100 border-red-500 text-red-800 animate-shake";

    if (isSelected)
      return (
        base +
        " bg-blue-50 border-blue-500 text-blue-700 ring-4 ring-blue-500/20"
      );

    return (
      base +
      " bg-white border-gray-200 hover:border-blue-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
    );
  };

  return (
    <PracticeGameLayout
      questionType="Match the Pairs"
      instructionFr={instructionFr || "Associez les paires"}
      instructionEn={instructionEn || "Match the pairs"}
      progress={progress}
      currentQuestionIndex={matchedIds.length}
      isGameOver={isGameOver}
      score={score}
      totalQuestions={PAIRS_PER_ROUND}
      onExit={() => navigate("/vocabulary/practice")}
      onRestart={() => window.location.reload()}
      showSubmitButton={false}
      timerValue={timerString}
    >
      <div className="flex flex-col w-full max-w-7xl gap-8 md:gap-16 px-4 -mt-6">
        {/* Top Row: French */}
        <div className="flex justify-center w-full">
          <div className="grid grid-cols-5 gap-4 md:gap-8 w-full">
            {topCards.map((card) => (
              <button
                key={card.id}
                onClick={() => handleTopClick(card)}
                className={getCardStyle(
                  card,
                  selectedTopId === card.id,
                  errorIds.includes(card.id),
                  matchedIds.includes(card.pairId),
                  successIds.includes(card.id),
                )}
              >
                {card.content}
                {/* Audio Icon Hint */}
                {!matchedIds.includes(card.pairId) && (
                  <Volume2 className="absolute top-2 right-2 w-4 h-4 text-gray-300" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Row: English */}
        <div className="flex justify-center w-full">
          <div className="grid grid-cols-5 gap-4 md:gap-8 w-full">
            {bottomCards.map((card) => (
              <button
                key={card.id}
                onClick={() => handleBottomClick(card)}
                className={getCardStyle(
                  card,
                  selectedBottomId === card.id,
                  errorIds.includes(card.id),
                  matchedIds.includes(card.pairId),
                  successIds.includes(card.id),
                )}
              >
                {card.content}
              </button>
            ))}
          </div>
        </div>
      </div>
    </PracticeGameLayout>
  );
}
