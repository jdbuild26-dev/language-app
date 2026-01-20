import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRightIcon, BookOpenIcon } from "@heroicons/react/24/outline";
import { useStoriesThemes } from "../../../services/storiesApi";

// Default themes if API returns empty
const defaultThemes = [
  {
    theme: "Daily Life",
    storyCount: 0,
    image:
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=500",
  },
  {
    theme: "Travel",
    storyCount: 0,
    image:
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=500",
  },
  {
    theme: "Food",
    storyCount: 0,
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=500",
  },
  {
    theme: "Work",
    storyCount: 0,
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=500",
  },
  {
    theme: "Science",
    storyCount: 0,
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=500",
  },
  {
    theme: "Literature",
    storyCount: 0,
    image:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=500",
  },
];

// Theme Card Component
function ThemeCard({ theme, storyCount, image }) {
  const slug = theme.toLowerCase().replace(/\s+/g, "-");

  return (
    <Link
      to={`/stories/learn/by-theme/${slug}`}
      className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-5 flex flex-col hover:shadow-md transition-all group"
    >
      {/* Image */}
      <div className="relative mb-4">
        <div className="w-full h-32 bg-gradient-to-br from-purple-100 to-pink-200 dark:from-purple-900 dark:to-pink-800 rounded-xl overflow-hidden">
          {image && (
            <img
              src={image}
              alt={theme}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
        {theme}
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

export default function StoriesThemesPage() {
  const { themes, loading, error, getThemes } = useStoriesThemes();

  useEffect(() => {
    getThemes();
  }, [getThemes]);

  const displayThemes = themes.length > 0 ? themes : defaultThemes;

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-slate-400">
              Loading themes...
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
          Stories by Theme
        </h1>
        <p className="text-gray-600 dark:text-slate-400 max-w-3xl mx-auto">
          Explore stories organized by themes like daily life, travel, food, and
          more. Each theme contains stories that help you learn vocabulary and
          expressions relevant to that topic.
        </p>
      </div>

      {/* Grid of Theme Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayThemes.map((item) => (
          <ThemeCard
            key={item.theme}
            theme={item.theme}
            storyCount={item.storyCount}
            image={item.image}
          />
        ))}
      </div>
    </div>
  );
}
