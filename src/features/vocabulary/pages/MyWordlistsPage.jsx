import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import {
  ArrowLeft,
  BookOpen,
  Loader2,
  Bookmark,
  Play,
  Trash2,
} from "lucide-react";
import { getWordlist, deleteLearnedCard } from "../../../services/progressApi";
import {
  addToReview,
  removeFromReview,
  fetchReviewCards,
} from "../../../services/reviewCardsApi";
import VocabularyListRow from "../components/VocabularyListRow";

export default function MyWordlistsPage() {
  const navigate = useNavigate();
  const { user, isLoaded } = useUser();
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Track booked marked IDs
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Track deleting ID for trash action
  const [deletingId, setDeletingId] = useState(null);

  // Fetch initial bookmarked IDs (to show correct state)
  const fetchBookmarks = useCallback(async () => {
    if (!user) return;
    try {
      // Fetch user's review list to know what's already bookmarked
      // Limit 1000 to get most/all
      const data = await fetchReviewCards(user.id, { limit: 1000 });
      const ids = new Set(data.cards.map((c) => c.cardId));
      setBookmarkedIds(ids);
    } catch (err) {
      console.error("Failed to fetch bookmarks:", err);
    }
  }, [user]);

  // Fetch learned cards
  const loadCards = useCallback(
    async (cursor = null) => {
      if (!user) return;

      try {
        if (cursor) {
          setLoadingMore(true);
        } else {
          setIsLoading(true);
          // Fetch bookmarks on initial load
          fetchBookmarks();
        }
        setError(null);

        const data = await getWordlist(user.id, { limit: 50, cursor });

        if (cursor) {
          setCards((prev) => [...prev, ...data.cards]);
        } else {
          setCards(data.cards);
        }

        setNextCursor(data.nextCursor);
        setHasMore(data.hasMore);
      } catch (err) {
        console.error("Failed to fetch wordlist:", err);
        setError("Failed to load your wordlist. Please try again.");
      } finally {
        setIsLoading(false);
        setLoadingMore(false);
      }
    },
    [user, fetchBookmarks]
  );

  useEffect(() => {
    if (isLoaded && user) {
      loadCards();
    }
  }, [isLoaded, user, loadCards]);

  // Handle bookmark toggle (Add/Remove from Review)
  const handleBookmark = async (card) => {
    if (!user || actionLoadingId) return;

    const cardId = card.cardId || card.id;
    setActionLoadingId(cardId);

    const isBookmarked = bookmarkedIds.has(cardId);

    try {
      if (isBookmarked) {
        // REMOVE bookmark
        await removeFromReview(user.id, cardId);
        setBookmarkedIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(cardId);
          return newSet;
        });
      } else {
        // ADD bookmark
        await addToReview(token, {
          english: card.cardData.english,
          forms: card.cardData.forms,
          exampleTarget: card.cardData.exampleTarget,
          exampleNative: card.cardData.exampleNative,
          phonetic: card.cardData.phonetic,
          level: card.cardData.level,
          category: card.cardData.category,
          subCategory: card.cardData.subCategory,
          image: card.cardData.image,
          id: cardId,
        });
        setBookmarkedIds((prev) => new Set(prev).add(cardId));
      }
    } catch (err) {
      console.error("Failed to toggle bookmark:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle delete learned card (Remove from Learned)
  const handleDeleteLearned = async (cardId) => {
    if (!user || deletingId) return;

    if (
      !window.confirm(
        "Are you sure you want to remove this word from your learned list?"
      )
    ) {
      return;
    }

    setDeletingId(cardId);
    try {
      await deleteLearnedCard(user.id, cardId);
      setCards((prev) => prev.filter((c) => (c.cardId || c.id) !== cardId));
    } catch (err) {
      console.error("Failed to delete learned card:", err);
    } finally {
      setDeletingId(null);
    }
  };

  // Handle load more
  const handleLoadMore = () => {
    if (nextCursor && !loadingMore) {
      loadCards(nextCursor);
    }
  };

  // Loading state
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
            Please sign in to view your review words.
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
              Review Words
            </h1>
            <p className="text-gray-500 dark:text-slate-400">
              {cards.length > 0
                ? `${cards.length} word${cards.length !== 1 ? "s" : ""} learned`
                : "Words you learn will appear here"}
            </p>
          </div>

          {/* Start Review Button */}
          {cards.length > 0 && !isLoading && (
            <button
              onClick={() =>
                navigate("/vocabulary/lessons/review/wordlists/session")
              }
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
            <BookOpen className="w-8 h-8 text-sky-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Words Learned
          </h2>
          <p className="text-gray-500 dark:text-slate-400 text-center max-w-md mb-6">
            Complete lessons and save your progress to review the words you've
            learned.
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
              {cards.map((card, index) => {
                const cardId = card.cardId || card.id;
                const isBookmarked = bookmarkedIds.has(cardId);
                const isActionLoading = actionLoadingId === cardId;
                const isDeleting = deletingId === cardId;

                return (
                  <VocabularyListRow
                    key={cardId}
                    word={{
                      ...card.cardData,
                      id: cardId,
                    }}
                    index={index}
                    renderActions={() => (
                      <div className="flex items-center justify-end gap-1">
                        {/* Bookmark Action */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBookmark(card);
                          }}
                          disabled={isActionLoading}
                          className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                            isBookmarked
                              ? "text-sky-500 bg-sky-50 dark:bg-sky-900/20"
                              : "text-gray-400 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                          }`}
                          title={
                            isBookmarked
                              ? "Remove from Review"
                              : "Add to Review"
                          }
                        >
                          {isActionLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Bookmark
                              className="w-5 h-5"
                              fill={isBookmarked ? "currentColor" : "none"}
                            />
                          )}
                        </button>

                        {/* Delete Action */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteLearned(cardId);
                          }}
                          disabled={isDeleting}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                          title="Remove from Learned List"
                        >
                          {isDeleting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Trash2 className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    )}
                  />
                );
              })}
            </div>
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center p-4 border-t border-gray-100 dark:border-slate-700">
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
        </div>
      )}
    </div>
  );
}
