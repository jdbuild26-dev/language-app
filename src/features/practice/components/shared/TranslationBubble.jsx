import React, { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * A component that displays a translation tooltip on hover.
 * @param {string} text - The text to display.
 * @param {string} translation - The translation to show in the tooltip.
 * @param {string} className - Additional classes for the wrapper.
 */
export default function TranslationBubble({ text, translation, className }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <span
      className={cn(
        "relative inline-block cursor-help border-b-2 border-dotted border-slate-300 dark:border-slate-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded px-0.5 transition-colors",
        className,
      )}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {text}

      {/* Tooltip */}
      {showTooltip && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-800 text-white text-sm rounded-lg shadow-lg whitespace-nowrap z-50 animate-in fade-in zoom-in-95 duration-200">
          {translation}
          {/* Arrow */}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
        </span>
      )}
    </span>
  );
}
