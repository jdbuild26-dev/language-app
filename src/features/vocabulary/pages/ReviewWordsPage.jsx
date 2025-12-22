import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { ArrowLeft, Clock, Trash2, Loader2 } from "lucide-react";
import {
  fetchReviewCards,
  removeFromReview,
} from "../../../services/reviewCardsApi";

export default function ReviewWordsPage() {
  const { user, isLoaded } = useUser();
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [removingCardId, setRemovingCardId] = useState(null);

  // Fetch review cards
  const loadCards = useCallback(
    async (cursor = null) => {
      if (!user) return;

      try {
        if (cursor) {
          setLoadingMore(true);
        } else {
          setIsLoading(true);
        }
        setError(null);

        const data = await fetchReviewCards(user.id, { limit: 20, cursor });

        if (cursor) {
          // Append to existing cards
          setCards((prev) => [...prev, ...data.cards]);
        } else {
          // Replace cards
          setCards(data.cards);
        }

        setNextCursor(data.nextCursor);
        setHasMore(data.hasMore);
      } catch (err) {
        console.error("Failed to fetch review cards:", err);
        setError("Failed to load review cards. Please try again.");
      } finally {
        setIsLoading(false);
        setLoadingMore(false);
      }
    },
    [user]
  );

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
      await removeFromReview(user.id, cardId);
      setCards((prev) => prev.filter((c) => c.cardId !== cardId));
    } catch (err) {
      console.error("Failed to remove card:", err);
    } finally {
      setRemovingCardId(null);
    }
  };

  // Handle load more
  const handleLoadMore = () => {
    if (nextCursor && !loadingMore) {
      loadCards(nextCursor);
    }
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
            Please sign in to view your review cards.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/vocabulary/lessons/review"
          className="inline-flex items-center gap-2 text-gray-500 dark:text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Review
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Review Words
        </h1>
        <p className="text-gray-500 dark:text-slate-400">
          {cards.length > 0
            ? `You have ${cards.length} card${
                cards.length !== 1 ? "s" : ""
              } marked for review.`
            : "Review vocabulary cards you've marked for learning."}
        </p>
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
            No Words to Review
          </h2>
          <p className="text-gray-500 dark:text-slate-400 text-center max-w-md">
            Words you mark for review while learning will appear here. Start
            learning vocabulary and mark cards to build your review list.
          </p>
          <Link
            to="/vocabulary/lessons/learn"
            className="mt-6 px-6 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
          >
            Start Learning
          </Link>
        </div>
      )}

      {/* Cards grid */}
      {!isLoading && !error && cards.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((card) => (
              <div
                key={card.id}
                className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4 hover:shadow-md transition-shadow"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="inline-block px-2 py-0.5 text-xs font-medium bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 rounded-full mb-2">
                      {card.cardData.level}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {card.cardData.english}
                    </h3>
                  </div>
                  <button
                    onClick={() => handleRemoveCard(card.cardId)}
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
                </div>

                {/* French Forms */}
                <div className="space-y-2 mb-3">
                  {card.cardData.forms.map((form, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-base font-medium text-gray-900 dark:text-white">
                        {form.word}
                      </span>
                      <span className={`text-xs ${form.genderColor}`}>
                        {form.gender}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Example */}
                {card.cardData.exampleTarget && (
                  <div className="border-t border-gray-100 dark:border-slate-700 pt-3">
                    <p className="text-sm text-gray-600 dark:text-slate-300 italic">
                      "{card.cardData.exampleTarget}"
                    </p>
                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                      {card.cardData.exampleNative}
                    </p>
                  </div>
                )}

                {/* Category & Date */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
                  <span className="text-xs text-gray-400 dark:text-slate-500">
                    {card.cardData.category}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-slate-500">
                    {new Date(card.markedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center mt-8">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-6 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
                {loadingMore ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
