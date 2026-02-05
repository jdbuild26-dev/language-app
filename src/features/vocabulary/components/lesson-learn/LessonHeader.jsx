import { Link, useParams } from "react-router-dom";
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";
import { SegmentedProgressBar } from "@/components/ui/SegmentedProgressBar";

export default function LessonHeader({
  currentIndex,
  total,
  onExit,
  onSaveAndExit,
  isSaving = false,
  words,
}) {
  const { level, category } = useParams();

  // Format category name for display
  const formatCategoryName = (name) => {
    if (!name) return "";
    return name
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-2">
        {/* Top Row: Breadcrumb, Progress, Controls */}
        <div className="flex items-center justify-between gap-4 mb-4">
          {/* Breadcrumb */}
          <div className="hidden md:flex items-center gap-2 text-sm text-sky-500 font-medium">
            <Link
              to={`/vocabulary/lessons/learn/${level || "a1"}`}
              className="hover:underline"
            >
              {level?.toUpperCase() || "A1"} Level Wordlist
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-500 dark:text-slate-400">
              {formatCategoryName(category)}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="flex-1 flex justify-center mx-4">
            <SegmentedProgressBar current={currentIndex + 1} total={total} />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Save & Exit Button */}
            {onSaveAndExit && (
              <button
                onClick={onSaveAndExit}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-green-500 hover:bg-green-600 rounded-lg transition-colors disabled:opacity-50"
                title="Save progress and exit"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckIcon className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">Save</span>
              </button>
            )}

            {/* Exit Button (discard) */}
            <button
              onClick={onExit}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
              title="Exit without saving"
            >
              <XMarkIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Exit</span>
            </button>
          </div>
        </div>

        {/* Bottom Row: Pills */}
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-4">
          {words.map((word, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={word.id}
                className={`
                  px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors
                  ${
                    isActive
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 ring-1 ring-green-200 dark:ring-green-800"
                      : "bg-gray-50 text-gray-500 dark:bg-slate-800 dark:text-slate-400 hover:bg-gray-100"
                  }
                `}
              >
                {idx + 1}- {word.english.toLowerCase()}
              </button>
            );
          })}
          <button className="px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border border-gray-200 text-gray-400 hover:bg-gray-50">
            lesson summary
          </button>
        </div>
      </div>
    </div>
  );
}
