import React, { useState, useEffect } from "react";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Loader2, Volume2, AlertCircle } from "lucide-react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { fetchPracticeQuestions } from "@/services/vocabularyApi";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";

export default function MatchPairsPage() {
  const handleExit = usePracticeExit();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tag = searchParams.get("tag");
  const level = searchParams.get("level");

  const { speak } = useTextToSpeech();
  const { learningLang, knownLang } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [exercises, setExercises] = useState([]);
  const [topCards, setTopCards] = useState([]); // English
  const [bottomCards, setBottomCards] = useState([]); // French

  const [selectedTopId, setSelectedTopId] = useState(null);
  const [selectedBottomId, setSelectedBottomId] = useState(null);

  const [matchedIds, setMatchedIds] = useState([]);
  const [errorIds, setErrorIds] = useState([]);
  const [successIds, setSuccessIds] = useState([]);

  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [currentExercise, setCurrentExercise] = useState(null);

  const [errorMsg, setErrorMsg] = useState("");

  const PAIRS_PER_ROUND = 6;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setErrorMsg("");

        // Pass the tag to the API if available
        const searchConfig = {
          learningLang,
          knownLang,
          limit: 10, // Grab multiple to give some variety
        };

        // Optional filters from TagTopicSelectionPage
        if (tag) searchConfig.tag = tag;

        const response = await fetchPracticeQuestions(
          "match_pairs",
          searchConfig,
        );

        if (response && response.data && response.data.length > 0) {
          setExercises(response.data);
        } else {
          console.error("No valid questions received from backend");
          setExercises([]);
          setErrorMsg("No match pairs found for the selected topic/level.");
        }
      } catch (error) {
        console.error("Error loading match pairs data:", error);
        setErrorMsg("Failed to load exercises. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [learningLang, knownLang, tag, level]);

  useEffect(() => {
    if (exercises.length > 0) {
      initializeGame();
    }
  }, [exercises]);

  // Timer Hook
  const { timerString, resetTimer, isPaused } = useExerciseTimer({
    duration: currentExercise?.timeLimitSeconds || 60,
    mode: "timer",
    onExpire: () => setIsGameOver(true),
    isPaused: loading || isGameOver,
  });

  const initializeGame = () => {
    if (exercises.length === 0) return;

    // Pick a random exercise from loaded data
    const randomIndex = Math.floor(Math.random() * exercises.length);
    const exercise = exercises[randomIndex];
    setCurrentExercise(exercise);

    // Try to handle API structure which might use "pairs" list or single items
    let pairs = [];
    if (exercise.pairs && Array.isArray(exercise.pairs)) {
      pairs = exercise.pairs;
    } else {
      // Handle generic fallback if format is different
      console.warn(
        "Match pair did not have 'pairs' array in content",
        exercise,
      );
      // Sometimes backend formats them as individual pairs
      if (exercise.completeSentence || exercise.correctAnswer) {
        pairs = [
          {
            id: exercise.id,
            left: exercise.question || exercise.sourceText || "Q",
            right: exercise.correctAnswer || "A",
          },
        ];
      }
    }

    if (pairs.length === 0) {
      setErrorMsg("Exercise format invalid. No pairs found.");
      return;
    }

    // Pick pairs up to PAIRS_PER_ROUND
    const selectedPairs = pairs
      .sort(() => 0.5 - Math.random())
      .slice(0, PAIRS_PER_ROUND);

    const top = selectedPairs
      .map((p) => ({
        id: `left-${p.id || Math.random()}`,
        pairId: p.id,
        content: p.left || p.English || p.english || p.word_en,
        type: "top",
      }))
      .sort(() => 0.5 - Math.random());

    const bottom = selectedPairs
      .map((p) => ({
        id: `right-${p.id || Math.random()}`,
        pairId: p.id,
        content: p.right || p.Word || p.french || p.word_fr,
        type: "bottom",
      }))
      .sort(() => 0.5 - Math.random());

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

    setSelectedTopId(card.id);

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

    // Play French audio
    speak(card.content, "fr-FR");

    setSelectedBottomId(card.id);

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
      setSuccessIds([topId, bottomId]);
      setSelectedTopId(null);
      setSelectedBottomId(null);

      setTimeout(() => {
        setSuccessIds([]);
        setMatchedIds((prev) => [...prev, topCard.pairId]);
        setScore((prev) => prev + 1);

        const newMatchedCount = matchedIds.length + 1;
        if (newMatchedCount === topCards.length) {
          setTimeout(() => setIsGameOver(true), 500);
        }
      }, 800);
    } else {
      // MISMATCH
      setErrorIds([topId, bottomId]);

      setTimeout(() => {
        setErrorIds([]);
        setSelectedTopId(null);
        setSelectedBottomId(null);
      }, 600);
    }
  };

  const getCardStyle = (card, isSelected, isError, isMatched, isSuccess) => {
    let base =
      "aspect-square rounded-2xl border-2 flex items-center justify-center p-4 text-center font-bold text-lg md:text-xl transition-all duration-200 cursor-pointer shadow-sm relative";

    if (isMatched) return "opacity-0 pointer-events-none";

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

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
      </div>
    );

  if (errorMsg || (!currentExercise && !loading)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <AlertCircle className="w-12 h-12 text-blue-500 mb-4 opacity-50" />
        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-md text-center">
          {errorMsg ||
            "No match pairs available for this topic or difficulty level."}
        </p>
        <Button
          onClick={() => navigate("/practice")}
          variant="outline"
          className="mt-6"
        >
          Back to Practice
        </Button>
      </div>
    );
  }

  const progress = (matchedIds.length / topCards.length) * 100;

  return (
    <PracticeGameLayout
      questionType="Match the Pairs"
      localizedInstruction={currentExercise?.localizedInstruction}
      instructionFr={currentExercise?.instructionFr || "Associez les paires"}
      instructionEn={currentExercise?.instructionEn || "Match the pairs"}
      progress={progress}
      currentQuestionIndex={matchedIds.length}
      isGameOver={isGameOver}
      score={score}
      totalQuestions={topCards.length}
      onExit={handleExit}
      onRestart={initializeGame}
      showSubmitButton={false}
      timerValue={timerString}
    >
      <div className="flex flex-col w-full max-w-7xl gap-8 md:gap-16 px-4 -mt-6">
        {/* Top Row: French (with TTS) */}
        <div className="flex justify-center w-full">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 md:gap-6 w-full">
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
                {!matchedIds.includes(card.pairId) && (
                  <Volume2 className="absolute top-2 right-2 w-4 h-4 text-gray-300" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Row: English */}
        <div className="flex justify-center w-full">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 md:gap-6 w-full">
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
              </button>
            ))}
          </div>
        </div>
      </div>
    </PracticeGameLayout>
  );
}
