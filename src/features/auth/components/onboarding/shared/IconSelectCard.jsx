import React from "react";

/**
 * IconSelectCard — icon + label card for single-select grids.
 * Used in Steps 5 (Main Reason) and 9 (Referral Source).
 */
const IconSelectCard = ({ icon, label, selected, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-center justify-center gap-2
        p-5 rounded-xl border-2 transition-all cursor-pointer
        hover:shadow-md hover:border-brand-blue-1/40
        ${
          selected
            ? "border-brand-blue-1 bg-brand-blue-3/10 shadow-sm"
            : "border-gray-200 dark:border-gray-700 bg-white dark:bg-card-dark"
        }
      `}
    >
      <span className="text-2xl">{icon}</span>
      <span
        className={`text-sm font-medium text-center leading-tight ${
          selected ? "text-brand-blue-1" : "text-gray-700 dark:text-gray-300"
        }`}
      >
        {label}
      </span>
    </button>
  );
};

export default IconSelectCard;
