// @ts-check

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * @typedef {import("./PracticeOptions.d.ts").PracticeOptionsProps} PracticeOptionsProps
 */

const PRACTICE_OPTION_TEXT_CLASS =
  "font-sans text-base md:text-md font-medium leading-8 md:leading-9";

/**
 * PracticeOptions — reusable animated MCQ options list.
 *
 * Props:
 *  options        — array of option values (strings or anything)
 *  selectedOption — currently selected index (null = none)
 *  correctIndex   — index of the correct answer
 *  showFeedback   — whether feedback state is active
 *  onSelect       — (index) => void
 *  className      — extra classes for the wrapper div
 *  itemClassName  — extra classes for each button
 *  showCheckIcon  — show CheckCircle2 on correct option when feedback shown
 *  renderLabel    — (option, index) => ReactNode  — custom option content
 *  renderSuffix   — (option, index) => ReactNode  — appended after label
 */
/**
 * @param {PracticeOptionsProps} props
 */
export default function PracticeOptions({
  options = [],
  selectedOption,
  correctIndex,
  showFeedback,
  onSelect,
  className = "",
  itemClassName = "",
  showCheckIcon = false,
  renderLabel,
  renderSuffix,
}) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {options.map((option, index) => {
        const isSelected = selectedOption === index;
        const isCorrect = showFeedback && index === correctIndex;
        const isWrong = showFeedback && isSelected && index !== correctIndex;
        const isMuted = showFeedback && !isSelected && index !== correctIndex;
        const optionStateClass = isCorrect
          ? "border-emerald-500 bg-emerald-50 shadow-[0_0_0_3px_rgba(52,211,153,0.15)] dark:border-emerald-400 dark:bg-emerald-950/30"
          : isWrong
            ? "border-red-400 bg-red-50 shadow-[0_0_0_3px_rgba(248,113,113,0.15)] dark:border-red-400 dark:bg-red-950/30"
            : isSelected
              ? "border-blue-500 bg-sky-50 shadow-[0_0_0_3px_rgba(59,130,246,0.12)] dark:border-blue-400 dark:bg-blue-950/30"
              : "border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800";
        const dotClass = isCorrect
          ? "border-emerald-500 bg-emerald-500 dark:border-emerald-400 dark:bg-emerald-400"
          : isWrong
            ? "border-red-400 bg-red-400 dark:border-red-400 dark:bg-red-400"
            : isSelected
              ? "border-blue-500 bg-blue-500 dark:border-blue-400 dark:bg-blue-400"
              : "border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900";
        const labelClass = isCorrect
          ? "text-emerald-700 dark:text-emerald-300"
          : isWrong
            ? "text-red-600 dark:text-red-300"
            : isSelected
              ? "text-blue-600 dark:text-blue-300"
              : "text-slate-700 dark:text-slate-200";

        return (
          <motion.button
            key={index}
            onClick={() => !showFeedback && onSelect?.(index)}
            disabled={showFeedback}
            whileHover={!showFeedback && !isSelected ? { scale: 1.01 } : {}}
            whileTap={!showFeedback ? { scale: 0.985 } : {}}
            transition={{ duration: 0.22 }}
            className={cn(
              "w-full py-3.5 px-4 rounded-2xl text-left flex items-center gap-3 border-2 transition-[background-color,border-color,color,opacity,box-shadow]",
              PRACTICE_OPTION_TEXT_CLASS,
              isMuted && "opacity-40",
              showFeedback && "cursor-default",
              itemClassName,
              optionStateClass,
            )}
          >
            {/* Radio dot / check icon */}
            {showCheckIcon && isCorrect ? (
              <CheckCircle2 className="w-5 h-5 pt-2 text-emerald-500 shrink-0" />
            ) : (
              <motion.span
                transition={{ duration: 0.2 }}
                className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                  dotClass,
                )}
              >
                <AnimatePresence>
                  {(isSelected || isCorrect || isWrong) && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ duration: 0.15, ease: "backOut" }}
                      className="w-2 h-2 rounded-full bg-white block"
                    />
                  )}
                </AnimatePresence>
              </motion.span>
            )}

            {/* Label */}
            <span
              className={cn(
                "leading-relaxed flex-1 flex flex-col min-w-0",
                labelClass,
              )}
            >
              {renderLabel ? renderLabel(option, index) : option}
            </span>

            {/* Suffix (e.g. audio button) */}
            {renderSuffix && renderSuffix(option, index)}
          </motion.button>
        );
      })}
    </div>
  );
}
