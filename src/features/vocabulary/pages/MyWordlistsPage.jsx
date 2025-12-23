import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { ArrowLeft, BookOpen, Loader2, Trash2 } from "lucide-react";
import {
  getWordlist,
  resetLessonProgress,
} from "../../../services/progressApi";

export default function MyWordlistsPage() {
  const { user, isLoaded } = useUser();
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // For reset functionality
  const [resettingLesson, setResettingLesson] = useState(null);

  // Fetch learned cards
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
    [user]
  );

  useEffect(() => {
    if (isLoaded && user) {
      loadCards();
    }
  }, [isLoaded, user, loadCards]);

  // Handle reset lesson progress
  const handleResetLesson = async (level, category) => {
    if (!user || resettingLesson) return;

    const lessonKey = `${level}-${category}`;
    setResettingLesson(lessonKey);

    try {
      await resetLessonProgress(user.id, level, category);
      // Remove cards from this lesson from state
      setCards((prev) =>
        prev.filter((c) => !(c.level === level && c.category === category))
      );
    } catch (err) {
      console.error("Failed to reset lesson:", err);
    } finally {
      setResettingLesson(null);
    }
  };

  // Handle load more
  const handleLoadMore = () => {
    if (nextCursor && !loadingMore) {
      loadCards(nextCursor);
    }
  };

  // Group cards by lesson (level + category)
  const groupedCards = cards.reduce((acc, card) => {
    const key = `${card.level}-${card.category}`;
    if (!acc[key]) {
      acc[key] = {
        level: card.level,
        category: card.category,
        cards: [],
      };
    }
    acc[key].cards.push(card);
    return acc;
  }, {});

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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          Review Words
        </h1>
        <p className="text-gray-500 dark:text-slate-400">
          {cards.length > 0
            ? `${cards.length} word${cards.length !== 1 ? "s" : ""} learned`
            : "Words you learn will appear here"}
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

      {/* Cards List - Grouped by Lesson */}
      {!isLoading && !error && cards.length > 0 && (
        <div className="space-y-6">
          {Object.values(groupedCards).map((group) => {
            const lessonKey = `${group.level}-${group.category}`;
            const isResetting = resettingLesson === lessonKey;

            return (
              <div
                key={lessonKey}
                className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden"
              >
                {/* Lesson Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-slate-700/50 border-b border-gray-100 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 text-xs font-medium bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 rounded-full">
                      {group.level}
                    </span>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {group.category
                        .replace(/-/g, " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase())}
                    </h3>
                    <span className="text-sm text-gray-400 dark:text-slate-500">
                      ({group.cards.length} words)
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      handleResetLesson(group.level, group.category)
                    }
                    disabled={isResetting}
                    className="flex items-center gap-1.5 px-2 py-1 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50"
                  >
                    {isResetting ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Trash2 className="w-3 h-3" />
                    )}
                    Reset
                  </button>
                </div>

                {/* Cards */}
                <div className="divide-y divide-gray-100 dark:divide-slate-700">
                  {group.cards.map((card) => (
                    <div
                      key={card.id}
                      className="flex items-center justify-between px-4 py-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-0.5">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {card.cardData.english}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-slate-400 truncate">
                          {card.cardData.forms.map((f) => f.word).join(" / ")}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400 dark:text-slate-500 flex-shrink-0">
                        {new Date(card.learnedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center mt-6">
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
