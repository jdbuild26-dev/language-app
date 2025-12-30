import React from "react";
import { Volume2, Loader2 } from "lucide-react";

export default function VocabularyListRow({
  word,
  index,
  ActionIcon,
  onAction,
  isActionLoading,
  renderActions, // New prop for custom action rendering
}) {
  // Helper to play audio (placeholder for now)
  const playAudio = (e, text) => {
    e.stopPropagation();
    // Implementation for audio playing would go here
    console.log("Play audio for:", text);
  };

  // Helper to get form by gender
  const getForm = (gender) => {
    return word.forms.find((f) => f.gender.startsWith(gender));
  };

  const masculine = getForm("Masculine");
  const feminine = getForm("Feminine");
  const neutral = getForm("Neutral");

  return (
    <div className="group flex items-center min-w-full border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors text-sm py-3 px-4">
      {/* CEFR Level */}
      <div className="w-12 flex-shrink-0 font-medium text-gray-900 dark:text-white">
        {word.level || "-"}
      </div>

      {/* Category */}
      <div
        className="w-32 flex-shrink-0 pr-2 truncate text-gray-600 dark:text-slate-300"
        title={word.category}
      >
        {word.category || "-"}
      </div>

      {/* Sub-Category */}
      <div
        className="w-24 flex-shrink-0 pr-2 truncate text-gray-500 dark:text-slate-400"
        title={word.subCategory}
      >
        {word.subCategory || "-"}
      </div>

      {/* Grammar */}
      <div className="w-20 flex-shrink-0 text-gray-500 dark:text-slate-400 truncate">
        {/* Placeholder */}
        Noun
      </div>

      {/* English */}
      <div
        className="w-28 flex-shrink-0 font-medium text-gray-900 dark:text-white truncate"
        title={word.english}
      >
        {word.english}
      </div>

      {/* Masculine */}
      <div className="w-28 flex-shrink-0 flex items-center gap-2 text-gray-600 dark:text-slate-300">
        {masculine ? (
          <>
            <button
              onClick={(e) => playAudio(e, masculine.word)}
              className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors"
            >
              <Volume2 className="w-3.5 h-3.5 text-gray-400 hover:text-sky-500" />
            </button>
            <span className="truncate" title={masculine.word}>
              {masculine.word}
            </span>
          </>
        ) : (
          <span className="text-gray-300">-</span>
        )}
      </div>

      {/* Feminine */}
      <div className="w-28 flex-shrink-0 flex items-center gap-2 text-gray-600 dark:text-slate-300">
        {feminine ? (
          <>
            <button
              onClick={(e) => playAudio(e, feminine.word)}
              className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors"
            >
              <Volume2 className="w-3.5 h-3.5 text-gray-400 hover:text-sky-500" />
            </button>
            <span className="truncate" title={feminine.word}>
              {feminine.word}
            </span>
          </>
        ) : (
          <span className="text-gray-300">-</span>
        )}
      </div>

      {/* Neutral */}
      <div className="w-20 flex-shrink-0 text-gray-500 dark:text-slate-400 truncate">
        {neutral ? neutral.word : "-"}
      </div>

      {/* Frequency */}
      <div className="w-20 flex-shrink-0 text-gray-500 dark:text-slate-400 truncate">
        {/* Placeholder */}
        Low
      </div>

      {/* Accuracy */}
      <div className="w-20 flex-shrink-0 text-gray-500 dark:text-slate-400 truncate">
        {/* Placeholder */}
        Medium
      </div>

      {/* Action */}
      <div className="flex-1 flex justify-end items-center gap-1">
        {renderActions ? (
          renderActions(word)
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAction && onAction(word.id);
            }}
            disabled={isActionLoading}
            className="p-2 text-gray-400 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-lg transition-colors disabled:opacity-50"
          >
            {isActionLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              ActionIcon && <ActionIcon className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
