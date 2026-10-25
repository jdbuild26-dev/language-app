// @ts-check

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import PracticeOptionCard from "./PracticeOptionCard";
import { cn } from "@/lib/utils";

/**
 * @typedef {import("./PracticeOptions.d.ts").PracticeOptionsProps} PracticeOptionsProps
 */

const PRACTICE_OPTION_TEXT_CLASS =
  "practice-type-content font-medium text-slate-700 dark:text-slate-200";

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
 *  renderAction   — (option, index) => ReactNode  — separate action beside the option button
 */
/**
 * @param {PracticeOptionsProps} props
 */
export default function PracticeOptions({
  options = [],
  selectedOption,
  correctIndex,
  selectedIndices,
  correctIndices,
  showFeedback,
  onSelect,
  className = "",
  itemClassName = "",
  showCheckIcon = false,
  renderLabel,
  renderSuffix,
  renderAction,
}) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {options.map((option, index) => {
        const isSelected = selectedIndices ? selectedIndices.includes(index) : selectedOption === index;
        const isCorrectIndex = correctIndices ? correctIndices.includes(index) : index === correctIndex;
        const isCorrect = showFeedback && isCorrectIndex;
        const isWrong = showFeedback && isSelected && !isCorrectIndex;
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
            : "text-slate-700 dark:text-slate-200";

        const optionButton = (
          <PracticeOptionCard
            key={index}
            variant="row"
            selected={isSelected}
            correct={isCorrectIndex}
            submitted={showFeedback}
            onSelect={() => onSelect?.(index)}
            className={itemClassName}
            action={renderAction?.(option, index)}
          >
            {/* Radio dot / check icon */}
            {showCheckIcon && isCorrect ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
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
          </PracticeOptionCard>
        );

        return optionButton;
      })}
    </div>
  );
}
