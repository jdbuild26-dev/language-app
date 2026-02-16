import React from "react";

/**
 * InterestBubble — pill/bubble tag for interest selection.
 * Used in Step 8 (Interests).
 */
const InterestBubble = ({ label, selected, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 rounded-full text-sm font-medium
        transition-all cursor-pointer border-2
        ${
          selected
            ? "border-brand-blue-1 bg-brand-blue-1 text-white shadow-sm"
            : "border-gray-200 dark:border-gray-700 bg-white dark:bg-card-dark text-gray-700 dark:text-gray-300 hover:border-brand-blue-1/40"
        }
      `}
    >
      {label}
    </button>
  );
};

export default InterestBubble;
