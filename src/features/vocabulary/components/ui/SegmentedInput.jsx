import React from "react";
import { cn } from "@/lib/utils";

/**
 * Reusable segmented input component for character-by-character entry.
 * Displays inputs as a joined group with a single outer border.
 *
 * @param {string[]} values - Array of character strings
 * @param {function} onChange - Callback (index, value) => void
 * @param {function} onKeyDown - Callback (index, event) => void
 * @param {function} onPaste - Optional callback (index, event) => void
 * @param {boolean} disabled - Whether interactions are disabled
 * @param {number[]} hints - Array of indices that should be treated as hints (read-only)
 * @param {boolean} showFeedback - Whether to show feedback validation styles
 * @param {boolean} isCorrect - Whether the answer is correct (only used if showFeedback is true)
 * @param {React.MutableRefObject<HTMLInputElement[]>} inputRefs - Ref object for input elements
 * @param {string} className - Optional container class names
 */
export default function SegmentedInput({
  values,
  onChange,
  onKeyDown,
  onPaste,
  onFocus,
  disabled = false,
  hints = [],
  showFeedback = false,
  isCorrect = false,
  inputRefs,
  className,
}) {
  return (
    <span
      className={cn(
        "inline-flex align-middle shadow-sm rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800",
        className,
      )}
    >
      {values.map((val, index) => {
        const isHint = hints.includes(index);

        // Style Logic
        let bgClass = "bg-white dark:bg-gray-800";
        let textClass = "text-gray-800 dark:text-white";

        if (isHint) {
          bgClass = "bg-gray-100 dark:bg-gray-700";
          textClass = "text-gray-500 dark:text-gray-400";
        }

        if (showFeedback) {
          if (isCorrect) {
            bgClass = "bg-green-50 dark:bg-green-900/30";
            textClass = "text-green-700 dark:text-green-400";
          } else {
            bgClass = "bg-red-50 dark:bg-red-900/30";
            textClass = "text-red-700 dark:text-red-400";
          }
        }

        return (
          <input
            key={index}
            ref={(el) => {
              if (inputRefs && inputRefs.current) {
                inputRefs.current[index] = el;
              }
            }}
            type="text"
            maxLength={1}
            value={val}
            onChange={(e) => onChange(index, e.target.value)}
            onKeyDown={(e) => onKeyDown(index, e)}
            onPaste={(e) => onPaste && onPaste(index, e)}
            onFocus={() => onFocus && onFocus(index)}
            disabled={disabled || isHint}
            readOnly={isHint}
            className={cn(
              "w-8 h-10 md:w-10 md:h-12",
              "text-center text-lg md:text-xl font-semibold uppercase",
              "border-r border-gray-200 dark:border-gray-700 last:border-r-0",
              "focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500 focus:z-10 relative",
              "transition-colors duration-200",
              bgClass,
              textClass,
              isHint ? "cursor-default select-none" : "cursor-text",
            )}
          />
        );
      })}
    </span>
  );
}
