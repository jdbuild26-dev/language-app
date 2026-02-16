import React from "react";

/**
 * DialectPicker — shown below the language grid when a
 * language with dialects is selected (Step 2).
 */
const DialectPicker = ({ language, dialects, selected, onSelect }) => {
  if (!dialects || dialects.length === 0) return null;

  return (
    <div className="mt-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
      <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-3">
        Pick a dialect for {language}
      </h4>
      <div className="flex flex-wrap gap-3">
        {dialects.map((dialect) => (
          <button
            key={dialect}
            onClick={() => onSelect(dialect)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all
              border-2 cursor-pointer
              ${
                selected === dialect
                  ? "border-brand-blue-1 bg-brand-blue-3/10 text-brand-blue-1"
                  : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-brand-blue-1/40"
              }
            `}
          >
            {dialect}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DialectPicker;
