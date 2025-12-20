import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRightIcon,
  BookmarkIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";
import { fetchAllTopics } from "../../../services/vocabularyApi";

// Topic Card Component
function TopicCard({ name, slug, wordCount, subcategories }) {
  return (
    <div className="relative rounded-xl border-2 border-gray-200 dark:border-slate-700 p-4 flex gap-4 bg-white dark:bg-slate-800 hover:shadow-lg transition-shadow">
      {/* Topic Icon */}
      <div className="w-20 h-24 rounded-lg bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center flex-shrink-0">
        <span className="text-3xl">📚</span>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        {/* Header with title and bookmark */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            {name}
          </h3>
          <button
            className="p-1 text-gray-400 hover:text-sky-500 dark:hover:text-sky-400 transition-colors"
            title="Add to My Wordlist"
          >
            <BookmarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-2 my-2">
          {subcategories.length > 0
            ? subcategories.slice(0, 3).join(", ")
            : "Learn vocabulary in this topic"}
        </p>

        {/* Stats and Arrow */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <BookOpenIcon className="w-3.5 h-3.5" />
              {wordCount} Words
            </span>
            <span className="flex items-center gap-1">
              {subcategories.length} Subcategories
            </span>
          </div>

          <Link
            to={`/vocabulary/lessons/learn/topic/${slug}`}
            className="text-sky-500 hover:text-sky-600 dark:text-sky-400 dark:hover:text-sky-300 transition-colors"
          >
            <ArrowRightIcon className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function TopicsPage() {
  const [topics, setTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadTopics() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchAllTopics();
        setTopics(data.topics || []);
      } catch (err) {
        console.error("Failed to fetch topics:", err);
        setError("Failed to load topics. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
    loadTopics();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-slate-400">
              Loading topics...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Explore by Topic
        </h1>
        <p className="text-gray-500 dark:text-slate-400">
          Expand your vocabulary with curated wordlists for every situation.
          Browse {topics.length} topics from daily life to professional
          environments.
        </p>
      </div>

      {/* Grid of Topic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {topics.map((topic) => (
          <TopicCard key={topic.slug} {...topic} />
        ))}
      </div>
    </div>
  );
}
