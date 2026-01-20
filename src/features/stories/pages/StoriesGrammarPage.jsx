import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRightIcon, BookOpenIcon } from "@heroicons/react/24/outline";
import { useStoriesGrammarTopics } from "../../../services/storiesApi";

// Default grammar topics if API returns empty
const defaultTopics = [
  { topic: "Present Tense", storyCount: 0 },
  { topic: "Past Tense", storyCount: 0 },
  { topic: "Future Tense", storyCount: 0 },
  { topic: "Adjectives", storyCount: 0 },
  { topic: "Adverbs", storyCount: 0 },
  { topic: "Modal Verbs", storyCount: 0 },
  { topic: "Conditional", storyCount: 0 },
  { topic: "Professional Language", storyCount: 0 },
];

// Grammar Topic Card Component
function GrammarCard({ topic, storyCount }) {
  const slug = topic.toLowerCase().replace(/\s+/g, "-");

  return (
    <Link
      to={`/stories/learn/by-grammar/${slug}`}
      className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-5 flex flex-col hover:shadow-md transition-all group"
    >
      {/* Icon */}
      <div className="relative mb-4">
        <div className="w-full h-24 bg-gradient-to-br from-green-100 to-teal-200 dark:from-green-900 dark:to-teal-800 rounded-xl flex items-center justify-center">
          <span className="text-3xl">📝</span>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
        {topic}
      </h3>

      {/* Stats and Arrow */}
      <div className="flex items-center justify-between mt-auto">
        <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400">
          <BookOpenIcon className="w-3.5 h-3.5" />
          {storyCount} Stories
        </span>
        <ArrowRightIcon className="w-5 h-5 text-sky-500 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
}

export default function StoriesGrammarPage() {
  const { topics, loading, error, getTopics } = useStoriesGrammarTopics();

  useEffect(() => {
    getTopics();
  }, [getTopics]);

  const displayTopics = topics.length > 0 ? topics : defaultTopics;

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-slate-400">
              Loading grammar topics...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Stories by Grammar Topic
        </h1>
        <p className="text-gray-600 dark:text-slate-400 max-w-3xl mx-auto">
          Learn grammar in context through stories. Each grammar topic contains
          stories that demonstrate how to use specific grammar patterns
          naturally.
        </p>
      </div>

      {/* Grid of Grammar Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayTopics.map((item) => (
          <GrammarCard
            key={item.topic}
            topic={item.topic}
            storyCount={item.storyCount}
          />
        ))}
      </div>
    </div>
  );
}
