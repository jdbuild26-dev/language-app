import React, { useState, useEffect } from "react";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { fetchMatchPairsData } from "@/services/vocabularyApi";

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

const Waveform = () => (
  <div className="flex items-center gap-[2px] h-6">
    <div className="w-[3px] h-3 bg-blue-400 rounded-full" />
    <div className="w-[3px] h-5 bg-blue-400 rounded-full" />
    <div className="w-[3px] h-4 bg-blue-400 rounded-full" />
    <div className="w-[3px] h-6 bg-blue-400 rounded-full" />
    <div className="w-[3px] h-3 bg-blue-400 rounded-full" />
    <div className="w-[3px] h-5 bg-blue-400 rounded-full" />
    <div className="w-[3px] h-2 bg-blue-400 rounded-full" />
  </div>
);

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
  const [successIds, setSuccessIds] = useState([]); // Array of cardIds showing success (Green)

  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);

  // Constants
  const PAIRS_PER_ROUND = 5;

  useEffect(() => {
    initializeGame();
  }, []);

  // Timer Hook
  const { timerString, resetTimer } = useExerciseTimer({
    duration: 60,
    mode: "timer",
    onExpire: () => setIsGameOver(true),
    isPaused: loading || isGameOver,
  });

  const initializeGame = async () => {
    setLoading(true);
    try {
      // Fetch specialized Match Pairs data
      console.log(
        `[MatchPairsB1] 📡 Fetching data from backend (fetchMatchPairsData("B1"))...`,
      );
      const data = await fetchMatchPairsData("B1");

      if (!data || data.length === 0) {
        throw new Error("No data returned from API");
      }
      console.log(`[MatchPairsB1] ✅ Loaded ${data.length} pairs`, {
        sample: data[0],
      });

      const rawData = data.map((item, idx) => ({
        id: item.id || idx,
        french: item.french, // Text to speak (French word/sentence)
        english: item.english, // Text to display (English translation)
        instructionFr: item.instructionFr || "Associez les paires",
        instructionEn: item.instructionEn || "Match the pairs",
      }));

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
        .sort(() => 0.5 - Math.random());

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
    if (
      isGameOver ||
      matchedIds.includes(card.pairId) ||
      successIds.includes(card.id)
    )
      return;

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
    if (
      isGameOver ||
      matchedIds.includes(card.pairId) ||
      successIds.includes(card.id)
    )
      return;

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
          setTimeout(() => setIsGameOver(true), 500);
        }
      }, 1000);
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

  const getCardStyle = (card, isSelected, isError, isMatched, isSuccess) => {
    // Hidden state
    if (isMatched) return "opacity-0 pointer-events-none";

    // Common Base
    let classes =
      "relative flex items-center shadow-sm transition-all duration-200 cursor-pointer border-2 ";

    // Size logic could be unified or specific
    // The previous implementation used aspect-square for everything, creating big boxes.
    // The new design looks like a horizontal pill/bar for audio.
    // However, the grid is likely uniform. If we change audio to pills, we need to check if grid works.
    // Previous: w-full via grid, aspect-square.
    // Let's keep aspect-square or similar sizing to ensure layout consistency, AS long as content fits.
    // Actually the design image shows a long horizontal bar.
    // If I change the top row to bars, I should probably remove aspect-square for top row or change grid.
    // But specific "replace speaker" request... I will try to fit it in the existing box,
    // OR ideally make it look like the pill.
    // Let's use `p-3 md:p-4 rounded-xl` and maybe `w-full`.
    // The existing grid is `grid-cols-5`. 5 horizontal bars in a row?
    // That might be too squished if they are long.
    // If they are small chips, it's fine.

    // Unified Styling for both Audio and Text
    classes +=
      "aspect-square rounded-2xl md:rounded-3xl justify-center text-center font-bold text-lg md:text-xl p-4 ";

    if (isSuccess) {
      return (
        classes +
        "bg-green-100 border-green-500 text-green-800 scale-105 shadow-md"
      );
    }

    if (isError) {
      return classes + "bg-red-100 border-red-500 text-red-800 animate-shake";
    }

    if (isSelected) {
      return (
        classes +
        "bg-blue-50 border-blue-500 text-blue-700 ring-4 ring-blue-500/20"
      );
    }

    return (
      classes +
      "bg-white border-gray-200 hover:border-blue-300 hover:shadow-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:hover:border-blue-500"
    );
  };

  const renderAudioContent = (isSelected, isSuccess) => {
    return (
      <div className="flex items-center justify-center w-full h-full">
        {/* Waveform Box */}
        <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg">
          <Waveform />
        </div>
      </div>
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
      <div className="flex flex-col w-full max-w-7xl gap-10 md:gap-16 px-4 -mt-6">
        {/* Top Row: Audio Cards */}
        {/* Changed grid for audio cards to allow wider pill shape if needed, 
            but kept grid-cols-5 for now to match bottom. 
            However, 5 pills in a row might be tight. 
            If they are just icons, it works. 
        */}
        <div className="flex justify-center w-full">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full">
            {topCards.map((card) => {
              const isSelected = selectedTopId === card.id;
              const isSucc = successIds.includes(card.id);
              return (
                <button
                  key={card.id}
                  onClick={() => handleTopClick(card)}
                  className={getCardStyle(
                    card,
                    isSelected,
                    errorIds.includes(card.id),
                    matchedIds.includes(card.pairId),
                    isSucc,
                  )}
                >
                  {renderAudioContent(isSelected, isSucc)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Row: Text Cards */}
        {/* Using standard grid for square cards */}
        <div className="flex justify-center w-full">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full">
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
