import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { Loader2, ArrowLeft } from "lucide-react";

import { FlashCard } from "../components/lesson-learn";
import { getWordlist } from "../../../services/progressApi";

export default function LearnedCardsSessionPage() {
  const navigate = useNavigate();
  const { user, isLoaded } = useUser();
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all learned cards
  const loadCards = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      const data = await getWordlist(user.id, { limit: 100 });

      // Transform to flashcard format
      const transformedCards = data.cards.map((card) => ({
        ...card.cardData,
        id: card.cardId,
        learnedAt: card.learnedAt,
      }));

      setCards(transformedCards);
    } catch (err) {
      console.error("Failed to fetch learned cards:", err);
      setError("Failed to load cards. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isLoaded && user) {
      loadCards();
    }
  }, [isLoaded, user, loadCards]);

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleExit = () => {
    navigate("/vocabulary/lessons/review/wordlists");
  };

  // Loading state
  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-sky-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-slate-400">Loading cards...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={handleExit}
            className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // No cards
  if (cards.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-slate-400 mb-4">
            No learned cards to review.
          </p>
          <button
            onClick={handleExit}
            className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          {/* Exit Button */}
          <button
            onClick={handleExit}
            className="flex items-center gap-2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Exit Review</span>
          </button>

          {/* Progress */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-600 dark:text-slate-300">
              {currentIndex + 1} / {cards.length}
            </span>
            <div className="w-32 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-500 transition-all duration-300"
                style={{
                  width: `${((currentIndex + 1) / cards.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Placeholder for symmetry */}
          <div className="w-24"></div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-start pt-12 p-4 relative">
        <div className="w-full max-w-5xl relative">
          <FlashCard word={cards[currentIndex]} showBookmark={true} />

          {/* Navigation Buttons */}
          <div className="absolute top-1/2 -translate-y-1/2 -left-4 md:-left-16 z-20">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full shadow-lg border-2 border-gray-100 dark:border-slate-700 flex items-center justify-center text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed hover:text-sky-500 hover:border-sky-100 transition-all hover:scale-110"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
          </div>
          <div className="absolute top-1/2 -translate-y-1/2 -right-4 md:-right-16 z-20">
            <button
              onClick={handleNext}
              disabled={currentIndex === cards.length - 1}
              className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full shadow-lg border-2 border-gray-100 dark:border-slate-700 flex items-center justify-center text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed hover:text-sky-500 hover:border-sky-100 transition-all hover:scale-110"
            >
              <ChevronRightIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Card Info */}
        <div className="mt-6 text-center text-sm text-gray-500 dark:text-slate-400">
          <span className="px-2 py-1 bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 rounded-full text-xs font-medium">
            {cards[currentIndex]?.level || "Review"}
          </span>
          {cards[currentIndex]?.category && (
            <span className="ml-2 text-gray-400 dark:text-slate-500">
              {cards[currentIndex].category}
            </span>
          )}
        </div>
      </main>
    </div>
  );
}
