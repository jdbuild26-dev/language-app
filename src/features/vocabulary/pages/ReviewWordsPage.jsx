import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import {
  ArrowLeft,
  Clock,
  Trash2,
  Loader2,
  ChevronRight,
  Play,
} from "lucide-react";
import {
  fetchReviewCards,
  removeFromReview,
} from "../../../services/reviewCardsApi";

export default function ReviewWordsPage() {
  const navigate = useNavigate();
  const { user, isLoaded } = useUser();
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

      const data = await fetchReviewCards(user.id, { limit: 100 });
      setCards(data.cards);
    } catch (err) {
      console.error("Failed to fetch review cards:", err);
      setError("Failed to load review cards. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load cards when user is available
  useEffect(() => {
    if (isLoaded && user) {
      loadCards();
    }
  }, [isLoaded, user, loadCards]);

  // Handle remove card
  const handleRemoveCard = async (e, cardId) => {
    e.stopPropagation();
    if (!user || removingCardId) return;

    setRemovingCardId(cardId);
    try {
      await removeFromReview(user.id, cardId);
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
    <div className="max-w-7xl mx-auto px-4 py-6">
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

      {/* Cards List */}
      {!isLoading && !error && cards.length > 0 && (
        <div className="space-y-2">
          {cards.map((card, index) => (
            <div
              key={card.id}
              onClick={handleStartReview}
              className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 hover:border-sky-200 dark:hover:border-sky-800 hover:shadow-sm transition-all cursor-pointer group"
            >
              {/* Left: Number + Content */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* Number */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600 dark:text-slate-300">
                    {index + 1}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-base font-medium text-gray-900 dark:text-white truncate">
                      {card.cardData.english}
                    </h3>
                    <span className="flex-shrink-0 px-2 py-0.5 text-xs font-medium bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 rounded-full">
                      {card.cardData.level}
                    </span>
                    {card.cardData.category && (
                      <span className="flex-shrink-0 px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400 rounded-full">
                        {card.cardData.category}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm text-gray-500 dark:text-slate-400 truncate">
                      {card.cardData.forms.map((f) => f.word).join(" / ")}
                    </p>
                    <span className="text-xs text-gray-400 dark:text-slate-500 flex-shrink-0">
                      Added{" "}
                      {new Date(card.markedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2 ml-4">
                {/* Remove Button */}
                <button
                  onClick={(e) => handleRemoveCard(e, card.cardId)}
                  disabled={removingCardId === card.cardId}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                  title="Remove from review"
                >
                  {removingCardId === card.cardId ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>

                {/* Arrow */}
                <ChevronRight className="w-5 h-5 text-gray-300 dark:text-slate-600 group-hover:text-sky-500 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
