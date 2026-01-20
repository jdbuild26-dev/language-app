import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { BookOpenIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolidIcon } from "@heroicons/react/24/solid";
import { useStoriesByTheme } from "../../../services/storiesApi";

// Story Card Component
function StoryCard({ story }) {
  const navigate = useNavigate();
  const progress = 0;
  const isCompleted = false;

  const handleCardClick = () => {
    navigate(`/stories/${story.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-5 flex flex-col hover:shadow-md transition-all cursor-pointer relative group"
    >
      {/* Image */}
      <div className="relative mb-4">
        <div className="w-full h-32 bg-gradient-to-br from-purple-100 to-pink-200 dark:from-purple-900 dark:to-pink-800 rounded-xl flex items-center justify-center">
          <div className="w-16 h-16 bg-white/50 dark:bg-slate-700/50 rounded-full flex items-center justify-center">
            <span className="text-2xl">📖</span>
          </div>
        </div>

        <div className="absolute top-2 right-2">
          {isCompleted ? (
            <CheckCircleSolidIcon className="w-6 h-6 text-green-500" />
          ) : (
            <CheckCircleIcon className="w-6 h-6 text-gray-300 dark:text-slate-600" />
          )}
        </div>
      </div>

      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 line-clamp-2">
        {story.title}
      </h3>

      <p className="text-sm text-gray-500 dark:text-slate-400 mb-4 line-clamp-2 flex-1">
        {story.description || "Click to read story"}
      </p>

      {/* Progress bar */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1 h-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs text-gray-400 dark:text-slate-500">
          {progress}%
        </span>
      </div>

      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-slate-400">
        <span className="flex items-center gap-1">
          <BookOpenIcon className="w-3.5 h-3.5" />
          {story.estimatedMinutes || 5} min
        </span>
        <span className="capitalize">{story.type}</span>
        {story.hasQuiz && <span className="text-green-500">Quiz</span>}
      </div>
    </div>
  );
}

export default function StoriesByThemePage() {
  const { theme } = useParams();
  const { stories, loading, error, getStoriesByTheme } = useStoriesByTheme();

  useEffect(() => {
    if (theme) {
      getStoriesByTheme(theme);
    }
  }, [theme, getStoriesByTheme]);

  const displayTheme = theme
    ?.replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-slate-400">
              Loading stories...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Stories: {displayTheme}
        </h1>
        <p className="text-gray-600 dark:text-slate-400 max-w-3xl mx-auto">
          Explore stories related to {displayTheme?.toLowerCase()}.
        </p>
      </div>

      {stories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-slate-400">
            No stories found for this theme yet.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stories.map((story) => (
          <StoryCard key={story.id} story={story} />
        ))}
      </div>
    </div>
  );
}
