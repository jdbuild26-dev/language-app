import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import { ArrowLeft, Clock, Trash2, Loader2, Play } from "lucide-react";
import {
  fetchReviewCards,
  removeFromReview,
} from "../../../services/reviewCardsApi";
import VocabularyListRow from "../components/VocabularyListRow";

export default function ReviewWordsPage() {
  const navigate = useNavigate();
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingCardId, setRemovingCardId] = useState(null);

  // Fetch review cards
  const loadCards = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      const token = await getToken();
      const data = await fetchReviewCards(token, { limit: 100 });
      setCards(data.cards);
    } catch (err) {
      console.error("Failed to fetch review cards:", err);
      setError("Failed to load review cards. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [user, getToken]);

  // Load cards when user is available
  useEffect(() => {
    if (isLoaded && user) {
      loadCards();
    }
  }, [isLoaded, user, loadCards]);

  // Handle remove card
  const handleRemoveCard = async (cardId) => {
    if (!user || removingCardId) return;

    setRemovingCardId(cardId);
    try {
      const token = await getToken();
      await removeFromReview(token, cardId);
      setCards((prev) => prev.filter((c) => c.cardId !== cardId));
    } catch (err) {
      console.error("Failed to remove card:", err);
    } finally {
      setRemovingCardId(null);
    }
  };

  // Start review session
  const handleStartReview = () => {
    navigate("/vocabulary/lessons/review/words/session");
  };

  // Loading state (waiting for auth)
  if (!isLoaded) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-slate-400">
            Please sign in to view your wordlist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/vocabulary/lessons/review"
          className="inline-flex items-center gap-2 text-gray-500 dark:text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Review
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              My Wordlist
            </h1>
            <p className="text-gray-500 dark:text-slate-400">
              {cards.length > 0
                ? `${cards.length} word${
                    cards.length !== 1 ? "s" : ""
                  } saved for practice`
                : "No words saved yet"}
            </p>
          </div>

          {/* Start Review Button */}
          {cards.length > 0 && !isLoading && (
            <button
              onClick={handleStartReview}
              className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors shadow-sm"
            >
              <Play className="w-4 h-4" />
              Start Review
            </button>
          )}
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="flex flex-col items-center justify-center min-h-[40vh] bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={() => loadCards()}
            className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && cards.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[40vh] bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-700">
          <div className="w-16 h-16 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center mb-4">
            <Clock className="w-8 h-8 text-sky-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Words Saved
          </h2>
          <p className="text-gray-500 dark:text-slate-400 text-center max-w-md mb-6">
            Save words while learning by clicking the bookmark icon on
            flashcards.
          </p>
          <Link
            to="/vocabulary/lessons/learn"
            className="px-6 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
          >
            Start Learning
          </Link>
        </div>
      )}

      {/* Cards List Table */}
      {!isLoading && !error && cards.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {/* Header */}
            <div className="flex items-center min-w-full border-b border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50 px-4 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
              <div className="w-12 flex-shrink-0">CEFR level</div>
              <div className="w-32 flex-shrink-0 pr-2">Category</div>
              <div className="w-24 flex-shrink-0 pr-2">Sub-Category</div>
              <div className="w-20 flex-shrink-0">Grammar</div>
              <div className="w-28 flex-shrink-0">English</div>
              <div className="w-28 flex-shrink-0">Masculine</div>
              <div className="w-28 flex-shrink-0">Feminine</div>
              <div className="w-20 flex-shrink-0">Neutral</div>
              <div className="w-20 flex-shrink-0">Frequency</div>
              <div className="w-20 flex-shrink-0">Accuracy</div>
              <div className="flex-1 text-right">Action</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-gray-100 dark:divide-slate-700">
              {cards.map((card, index) => (
                <VocabularyListRow
                  key={card.cardId || card.id}
                  word={{
                    ...card.cardData,
                    id: card.cardId,
                  }}
                  index={index}
                  ActionIcon={Trash2}
                  onAction={() => handleRemoveCard(card.cardId)}
                  isActionLoading={removingCardId === card.cardId}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
