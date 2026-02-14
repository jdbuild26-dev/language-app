import React from "react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

/**
 * LanguageFlagCard — clickable card with flag emoji + language name.
 * Used in Steps 2, 3, 4 for language selection.
 */
const LanguageFlagCard = ({ language, flag, selected, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`
        relative flex flex-col items-center justify-center gap-2
        p-4 rounded-xl border-2 transition-all cursor-pointer
        hover:shadow-md hover:border-brand-blue-1/40
        ${
          selected
            ? "border-brand-blue-1 bg-brand-blue-3/10 shadow-sm"
            : "border-gray-200 dark:border-gray-700 bg-white dark:bg-card-dark"
        }
      `}
    >
      <span className="text-3xl">{flag}</span>
      <span
        className={`text-sm font-medium ${
          selected ? "text-brand-blue-1" : "text-gray-700 dark:text-gray-300"
        }`}
      >
        {language}
      </span>
      {selected && (
        <CheckCircleIcon className="absolute top-2 right-2 h-5 w-5 text-brand-blue-1" />
      )}
    </button>
  );
};

export default LanguageFlagCard;
