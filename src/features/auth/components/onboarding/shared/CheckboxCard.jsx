import React from "react";
import { CheckIcon } from "@heroicons/react/24/solid";

/**
 * CheckboxCard — multi-select checkbox card.
 * Used in Step 6 (Learning Goals).
 */
const CheckboxCard = ({ label, checked, onChange }) => {
  return (
    <button
      onClick={onChange}
      className={`
        flex items-center gap-3 p-4 rounded-xl border-2
        text-left transition-all cursor-pointer w-full
        hover:shadow-sm hover:border-brand-blue-1/40
        ${
          checked
            ? "border-brand-blue-1 bg-brand-blue-3/10"
            : "border-gray-200 dark:border-gray-700 bg-white dark:bg-card-dark"
        }
      `}
    >
      {/* Checkbox indicator */}
      <div
        className={`
          flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
          ${
            checked
              ? "border-brand-blue-1 bg-brand-blue-1"
              : "border-gray-300 dark:border-gray-600"
          }
        `}
      >
        {checked && <CheckIcon className="h-3.5 w-3.5 text-white" />}
      </div>

      <span
        className={`text-sm font-medium ${
          checked ? "text-brand-blue-1" : "text-gray-700 dark:text-gray-300"
        }`}
      >
        {label}
      </span>
    </button>
  );
};

export default CheckboxCard;
