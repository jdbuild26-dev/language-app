import React, { useState, useEffect } from "react";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Loader2, Volume2, CheckCircle2 } from "lucide-react"; // Added CheckCircle2 for visual consistency if needed
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { fetchPracticeQuestions } from "@/services/vocabularyApi";

// MOCK DATA Fallback
const MOCK_DATA = [
  {
    id: 1,
    french: "Chien",
    english: "Dog",
    instructionFr: "Associez les paires",
    instructionEn: "Match the pairs",
  },
  {
    id: 2,
    french: "Chat",
    english: "Cat",
    instructionFr: "Associez les paires",
    instructionEn: "Match the pairs",
  },
  {
    id: 3,
    french: "Maison",
    english: "House",
    instructionFr: "Associez les paires",
    instructionEn: "Match the pairs",
  },
  {
    id: 4,
    french: "Voiture",
    english: "Car",
    instructionFr: "Associez les paires",
    instructionEn: "Match the pairs",
  },
  {
    id: 5,
    french: "Pomme",
    english: "Apple",
    instructionFr: "Associez les paires",
    instructionEn: "Match the pairs",
  },
];

export default function MatchPairsB1GamePage() {
  const navigate = useNavigate();
  const { speak } = useTextToSpeech();

  const [loading, setLoading] = useState(false);

  // Split State for Top (Audio) and Bottom (Text) rows
  const [topCards, setTopCards] = useState([]); // Audio cards
  const [bottomCards, setBottomCards] = useState([]); // Text cards

  const [selectedTopId, setSelectedTopId] = useState(null);
  const [selectedBottomId, setSelectedBottomId] = useState(null);

  const [matchedIds, setMatchedIds] = useState([]); // Array of pairIds
  const [errorIds, setErrorIds] = useState([]); // Array of cardIds showing error

  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);

  // Constants
  const PAIRS_PER_ROUND = 5;

  useEffect(() => {
    initializeGame();
  }, []);

  // Timer Hook
  const { timerString, resetTimer, isPaused } = useExerciseTimer({
    duration: 60,
    mode: "timer",
    onExpire: () => setIsGameOver(true),
    isPaused: loading || isGameOver,
  });

  const initializeGame = async () => {
    setLoading(true);
    try {
      // Fetch or Mock
      // Try fetching "B1.Match the pairs" or similar if exists, otherwise fallback
      let rawData = [];
      try {
        const response = await fetchPracticeQuestions("B1.Match the pairs");
        if (
          response &&
          response.data &&
          response.data.length >= PAIRS_PER_ROUND
        ) {
          rawData = response.data.map((item, idx) => ({
            id: idx,
            french: item.Prompt || item.French, // Audio content
            english: item.Target || item.English, // Text content
            instructionFr: item.Instruction_FR,
            instructionEn: item.Instruction_EN,
          }));
        }
      } catch (e) {
        console.warn("API fetch failed, using mock", e);
      }

      if (rawData.length < PAIRS_PER_ROUND) {
        rawData = MOCK_DATA;
      }

      // Shuffle and pick pairs
      const shuffledSource = [...rawData].sort(() => 0.5 - Math.random());
      const activePairs = shuffledSource.slice(0, PAIRS_PER_ROUND);

      const top = activePairs
        .map((p) => ({
          id: `audio-${p.id}`,
          pairId: p.id,
          content: p.french, // Text to speak
          type: "audio",
        }))
        .sort(() => 0.5 - Math.random());

      const bottom = activePairs
        .map((p) => ({
          id: `text-${p.id}`,
          pairId: p.id,
          content: p.english, // Text to display
          type: "text",
        }))
        .sort(() => 0.5 - Math.random()); // Shuffle bottom row independently

      setTopCards(top);
      setBottomCards(bottom);

      // Reset game state
      setMatchedIds([]);
      setSelectedTopId(null);
      setSelectedBottomId(null);
      setScore(0);
      setIsGameOver(false);
      resetTimer();
    } catch (error) {
      console.error("Game init error", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTopClick = (card) => {
    if (isGameOver || matchedIds.includes(card.pairId)) return;

    // Play Audio logic
    speak(card.content, "fr-FR");

    // Logic: Same row click -> Replace selection
    setSelectedTopId(card.id);

    // Logic: Different row selected -> Check Match
    if (selectedBottomId) {
      checkMatch(card.id, selectedBottomId);
    }
  };

  const handleBottomClick = (card) => {
    if (isGameOver || matchedIds.includes(card.pairId)) return;

    // Logic: Same row click -> Replace selection
    setSelectedBottomId(card.id);

    // Logic: Different row selected -> Check Match
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
      setMatchedIds((prev) => [...prev, topCard.pairId]);
      setScore((prev) => prev + 1);
      setSelectedTopId(null);
      setSelectedBottomId(null);

      // Check Win
      if (matchedIds.length + 1 === PAIRS_PER_ROUND) {
        setTimeout(() => setIsGameOver(true), 1000);
      }
    } else {
      // MISMATCH
      setErrorIds([topId, bottomId]);

      // Reset selection after delay
      setTimeout(() => {
        setErrorIds([]);
        setSelectedTopId(null);
        setSelectedBottomId(null);
      }, 800);
    }
  };

  const progress = (matchedIds.length / PAIRS_PER_ROUND) * 100;

  const getCardStyle = (card, isSelected, isError, isMatched) => {
    let base =
      "aspect-square rounded-2xl border-2 flex items-center justify-center p-4 text-center font-bold text-lg md:text-xl transition-all duration-200 cursor-pointer shadow-sm relative";

    if (isMatched) return "opacity-0 pointer-events-none"; // Disappear

    if (isError)
      return base + " bg-red-100 border-red-500 text-red-800 animate-shake";

    if (isSelected)
      return (
        base +
        " bg-blue-50 border-blue-500 text-blue-700 ring-4 ring-blue-500/20 scale-105 shadow-md z-10"
      );

    return (
      base +
      " bg-white border-gray-200 hover:border-blue-300 hover:shadow-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:hover:border-blue-500"
    );
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
      </div>
    );

  return (
    <PracticeGameLayout
      questionType="Match the Pairs (Audio)"
      instructionFr="Écoutez et associez les paires"
      instructionEn="Listen and match the pairs"
      progress={progress}
      isGameOver={isGameOver}
      score={score}
      totalQuestions={PAIRS_PER_ROUND}
      onExit={() => navigate("/vocabulary/practice")}
      onRestart={() => window.location.reload()}
      showSubmitButton={false}
      timerValue={timerString}
    >
      <div className="flex flex-col w-full max-w-7xl gap-8 md:gap-16 px-4 -mt-6">
        {/* Top Row: Audio Cards */}
        <div className="flex justify-center w-full">
          <div className="grid grid-cols-5 gap-4 md:gap-6 w-full">
            {topCards.map((card) => (
              <button
                key={card.id}
                onClick={() => handleTopClick(card)}
                className={getCardStyle(
                  card,
                  selectedTopId === card.id,
                  errorIds.includes(card.id),
                  matchedIds.includes(card.pairId),
                )}
              >
                <Volume2 className="w-8 h-8 md:w-10 md:h-10 text-blue-500" />
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Row: Text Cards */}
        <div className="flex justify-center w-full">
          <div className="grid grid-cols-5 gap-4 md:gap-6 w-full">
            {bottomCards.map((card) => (
              <button
                key={card.id}
                onClick={() => handleBottomClick(card)}
                className={getCardStyle(
                  card,
                  selectedBottomId === card.id,
                  errorIds.includes(card.id),
                  matchedIds.includes(card.pairId),
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
