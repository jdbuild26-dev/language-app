import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  BookmarkIcon,
  BookOpenIcon,
  RectangleStackIcon,
  Squares2X2Icon,
  LanguageIcon,
} from "@heroicons/react/24/outline";
import { fetchVocabulary } from "../../../services/vocabularyApi";
import { useLanguage } from "@/contexts/LanguageContext";

// Action button component
function ActionButton({ icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors group"
      title={label}
    >
      <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center group-hover:bg-sky-100 dark:group-hover:bg-sky-900/30 transition-colors">
        <Icon className="w-4 h-4 text-gray-500 dark:text-slate-400 group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-colors" />
      </div>
    </button>
  );
}

// Vocabulary Card component - displays a word from the topic
function VocabularyCard({ word, topic }) {
  return (
    <Link
      to={`/vocabulary/lessons/learn/topic/${topic}/${word.id}`}
      className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-5 flex flex-col hover:shadow-md transition-all cursor-pointer"
    >
      {/* Image and Bookmark */}
      <div className="relative mb-4">
        {/* Placeholder image */}
        <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-600 rounded-xl flex items-center justify-center">
          <div className="w-20 h-20 bg-gray-200 dark:bg-slate-600 rounded-full flex items-center justify-center">
            <span className="text-3xl">📖</span>
          </div>
        </div>
        {/* Bookmark */}
        <button
          onClick={(e) => e.preventDefault()}
          className="absolute top-2 right-2 p-1.5 bg-white/80 dark:bg-slate-700/80 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors"
        >
          <BookmarkIcon className="w-4 h-4 text-gray-400 dark:text-slate-500" />
        </button>
      </div>

      {/* Title - fixed height for consistency */}
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 line-clamp-2 h-14">
        {word.english}
      </h3>

      {/* French forms - fixed height for consistency */}
      <p className="text-sm text-gray-500 dark:text-slate-400 mb-4 line-clamp-2 h-10">
        {word.forms && word.forms.length > 0
          ? word.forms.map((f) => f.word).join(", ")
          : "Learn this word"}
      </p>

      {/* Bottom section - pushed to bottom with mt-auto */}
      <div className="mt-auto">
        {/* Progress bar - placeholder for now */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 h-1.5 bg-sky-100 dark:bg-sky-900/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-sky-500 rounded-full transition-all"
              style={{ width: "0%" }}
            />
          </div>
          <span className="text-xs text-gray-400 dark:text-slate-500 min-w-[28px] text-right">
            0%
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-slate-400 mb-4 pb-4 border-b border-gray-100 dark:border-slate-700 whitespace-nowrap">
          <span className="flex items-center gap-1">
            <BookOpenIcon className="w-3.5 h-3.5" />
            {word.level || "All Levels"}
          </span>
          <span className="flex items-center gap-1">
            {word.subCategory || word.category}
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div
        className="flex items-center justify-between"
        onClick={(e) => e.preventDefault()}
      >
        <ActionButton icon={RectangleStackIcon} label="Word Card" />
        <ActionButton icon={Squares2X2Icon} label="Learning Card" />
        <ActionButton icon={LanguageIcon} label="Match the pairs" />
        <ActionButton icon={BookOpenIcon} label="Spelling" />
      </div>
    </Link>
  );
}

export default function TopicCategoryPage() {
  const { topic } = useParams();
  const { learningLang, knownLang } = useLanguage();
  const [words, setWords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Format topic name for display (convert slug to title case)
  const topicDisplayName = topic
    ? topic
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
    : "";

  useEffect(() => {
    async function loadWords() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchVocabulary({
          category: topic,
          learningLang,
          knownLang
        });
        setWords(data.words || []);
      } catch (err) {
        console.error("Failed to fetch vocabulary:", err);
        setError("Failed to load vocabulary. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
    loadWords();
  }, [topic, learningLang, knownLang]);

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-slate-400">
              Loading vocabulary...
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
          {topicDisplayName} Vocabulary
        </h1>
        <p className="text-gray-500 dark:text-slate-400">
          Explore {words.length} vocabulary words in this topic. Each word
          includes flashcards and exercises to help you master it.
        </p>
      </div>

      {/* Grid of Vocabulary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {words.map((word) => (
          <VocabularyCard key={word.id} word={word} topic={topic} />
        ))}
      </div>
    </div>
  );
}
