"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Loader2, Volume2, Image as ImageIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { fetchMatchPairsData } from "@/services/vocabularyApi";

type Pair = { id: string; french: string; english: string; image?: string | null };
type Card = { id: string; pairId: string; content: string; type: "top" | "bottom"; isImage?: boolean };

export default function MatchWordsActivityPage({ mode = "text" }) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-sky-500" /></div>}>
      <MatchWordsContent mode={mode} />
    </Suspense>
  );
}

function MatchWordsContent({ mode = "text" }) {
  // mode: 'text' (English <-> French) or 'image' (Image <-> French)
  const router = useRouter();
  const { speak } = useTextToSpeech();
  const searchParams = useSearchParams();

  // Allow overriding mode via query param if needed, though prop is cleaner for distinct routes
  const currentMode = searchParams?.get("mode") || mode;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topCards, setTopCards] = useState<Card[]>([]); // French words
  const [bottomCards, setBottomCards] = useState<Card[]>([]); // English words or Images

  const [selectedTopId, setSelectedTopId] = useState<string | null>(null);
  const [selectedBottomId, setSelectedBottomId] = useState<string | null>(null);

  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [errorIds, setErrorIds] = useState<string[]>([]);
  const [successIds, setSuccessIds] = useState<string[]>([]);

  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const PAIRS_PER_ROUND = 5;

  useEffect(() => {
    loadData();
  }, [currentMode]);

  const { timerString, resetTimer } = useExerciseTimer({
    duration: 60,
    mode: "timer",
    onExpire: () => setIsGameOver(true),
    isPaused: loading || isGameOver,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchMatchPairsData();

      if (!data || data.length === 0) {
        throw new Error("No match pairs data available");
      }

      initializeGame(data);
    } catch (err) {
      console.error("[MatchWordsActivity] ❌ Failed to fetch:", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const initializeGame = (data: Pair[]) => {
    const shuffledSource = [...data].sort(() => 0.5 - Math.random());
    const activePairs = shuffledSource.slice(0, PAIRS_PER_ROUND);

    const top: Card[] = activePairs
      .map((p) => ({
        id: `fr-${p.id}`,
        pairId: p.id,
        content: p.french,
        type: "top" as const,
      }))
      .sort(() => 0.5 - Math.random());

    const bottom: Card[] = activePairs
      .map((p) => ({
        id: `bottom-${p.id}`,
        pairId: p.id,
        content: currentMode === "image" ? p.image || p.english : p.english,
        type: "bottom" as const,
        isImage: currentMode === "image" && !!p.image,
      }))
      .sort(() => 0.5 - Math.random());

    setTopCards(top);
    setBottomCards(bottom);

    // Reset state
    setMatchedIds([]);
    setScore(0);
    setIsGameOver(false);
    resetTimer();
  };

  const handleTopClick = (card: Card) => {
    if (
      isGameOver ||
      matchedIds.includes(card.pairId) ||
      successIds.includes(card.id)
    )
      return;

    speak(card.content, "fr-FR");
    setSelectedTopId(card.id);

    if (selectedBottomId) {
      checkMatch(card.id, selectedBottomId);
    }
  };

  const handleBottomClick = (card: Card) => {
    if (
      isGameOver ||
      matchedIds.includes(card.pairId) ||
      successIds.includes(card.id)
    )
      return;

    if (!card.isImage) speak(card.content, "en-US");
    setSelectedBottomId(card.id);

    if (selectedTopId) {
      checkMatch(selectedTopId, card.id);
    }
  };

  const checkMatch = (topId: string, bottomId: string) => {
    const topCard = topCards.find((c) => c.id === topId);
    const bottomCard = bottomCards.find((c) => c.id === bottomId);

    if (!topCard || !bottomCard) return;

    if (topCard.pairId === bottomCard.pairId) {
      // MATCH
      setSuccessIds([topId, bottomId]);
      setSelectedTopId(null);
      setSelectedBottomId(null);

      setTimeout(() => {
        setSuccessIds([]);
        setMatchedIds((prev) => [...prev, topCard.pairId]);
        setScore((prev) => prev + 1);

        if (matchedIds.length + 1 === PAIRS_PER_ROUND) {
          setTimeout(() => setIsGameOver(true), 500);
        }
      }, 1000);
    } else {
      // MISMATCH
      setErrorIds([topId, bottomId]);
      setTimeout(() => {
        setErrorIds([]);
        setSelectedTopId(null);
        setSelectedBottomId(null);
      }, 800);
    }
  };

  const instruction =
    currentMode === "image"
      ? "Match the image to the correct French word"
      : "Match the English word to the French word";

  const getCardStyle = (card, isSelected, isError, isMatched, isSuccess) => {
    let base =
      "relative aspect-square rounded-2xl border-2 flex items-center justify-center p-4 text-center font-bold text-lg md:text-xl transition-all duration-200 cursor-pointer shadow-sm overflow-hidden ";

    if (isMatched) return "opacity-0 pointer-events-none";

    if (isSuccess)
      return (
        base +
        "bg-green-100 border-green-500 text-green-800 scale-105 shadow-md"
      );
    if (isError)
      return base + "bg-red-100 border-red-500 text-red-800 animate-shake";
    if (isSelected)
      return (
        base +
        "bg-blue-50 border-blue-500 text-blue-700 ring-4 ring-blue-500/20"
      );

    return (
      base +
      "bg-white border-gray-200 hover:border-blue-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
    );
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );

  return (
    <PracticeGameLayout
      questionType={
        currentMode === "image"
          ? "Match Images (Activities)"
          : "Match Words (Activities)"
      }
      instructionFr="Associez les paires"
      instructionEn={instruction}
      progress={(matchedIds.length / PAIRS_PER_ROUND) * 100}
      isGameOver={isGameOver}
      score={score}
      totalQuestions={PAIRS_PER_ROUND}
      onExit={() => router.push("/vocabulary/lessons/activities")}
      onRestart={() => window.location.reload()}
      showSubmitButton={false}
      timerValue={timerString}
    >
      <div className="flex flex-col w-full max-w-7xl gap-6 md:gap-12 px-4 -mt-6">
        {/* Top Row: French Words */}
        <div className="flex justify-center w-full">
          <div className="grid grid-cols-5 gap-4 w-full">
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
                {!matchedIds.includes(card.pairId) && (
                  <Volume2 className="absolute top-2 right-2 w-4 h-4 text-gray-300 opacity-70" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Row: English / Images */}
        <div className="flex justify-center w-full">
          <div className="grid grid-cols-5 gap-4 w-full">
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
                {card.isImage ? (
                  <img
                    src={card.content}
                    alt="Match"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  card.content
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </PracticeGameLayout>
  );
}
