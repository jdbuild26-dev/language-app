import React from "react";
import { cn } from "@/lib/utils";

const ACCENTS = ["é", "è", "ê", "à", "ç", "â", "î", "ô", "û", "ë", "ï", "ü"];

/**
 * AccentKeyboard - A row of French accent character buttons.
 *
 * @param {function} onAccentClick - Called with the accent character when a button is clicked.
 * @param {boolean}  disabled      - Disables all buttons (e.g. during feedback).
 * @param {string}   className     - Optional extra classes on the wrapper.
 */
export default function AccentKeyboard({
  onAccentClick,
  disabled = false,
  className,
}) {
  return (
    <div
      className={cn("flex flex-wrap justify-center gap-1.5 py-2", className)}
      aria-label="French accent keyboard"
    >
      {ACCENTS.map((char) => (
        <button
          key={char}
          type="button"
          disabled={disabled}
          onMouseDown={(e) => {
            // Prevent the textarea/input from losing focus when clicking accent buttons
            e.preventDefault();
            onAccentClick(char);
          }}
          className={cn(
            "w-9 h-9 rounded-lg text-base font-semibold transition-all duration-150 select-none",
            "border border-slate-200 dark:border-slate-700 shadow-sm",
            disabled
              ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
              : "bg-white dark:bg-slate-800 text-slate-800 dark:text-white hover:bg-sky-50 dark:hover:bg-sky-900/30 hover:border-sky-400 dark:hover:border-sky-600 hover:text-sky-700 dark:hover:text-sky-300 active:scale-90",
          )}
        >
          {char}
        </button>
      ))}
    </div>
  );
}
