import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * CustomSelect — a fully-styleable dropdown replacing native <select>.
 *
 * Props:
 *  options      - string[]
 *  value        - string | ""
 *  onChange     - (value: string) => void
 *  placeholder  - string
 *  disabled     - boolean
 *  isCorrect    - boolean  (feedback state)
 *  isWrong      - boolean  (feedback state)
 *  feedbackMode - boolean  (show option-level feedback colors)
 *  correctValue - string   (correct option when feedbackMode is true)
 *  className    - string   (extra class for the wrapper; use `[&>button]:...` for trigger styles)
 */
/**
 * @param {Object} props
 * @param {string[]} props.options
 * ...other props
 */
// @ts-ignore
export default function CustomSelect({
  options = [],
  value = "",
  onChange,
  placeholder = "Select…",
  disabled = false,
  isCorrect = false,
  isWrong = false,
  feedbackMode = false,
  correctValue = "",
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const triggerTextColor = isCorrect
    ? "#15803d"
    : isWrong
      ? "#dc2626"
      : value
        ? undefined
        : "#94a3b8";

  return (
    <div ref={ref} className={cn("relative w-full", className)}>
      {/* Trigger */}
      <motion.button
        type="button"
        onClick={() => !disabled && setOpen((v) => !v)}
        className={cn(
          "w-full h-12 flex items-center justify-between px-3 pr-8 rounded-lg border text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30",
          "bg-white dark:bg-slate-900",
          "border-slate-200 dark:border-slate-700",
          isCorrect &&
            "border-green-600 bg-green-50 text-green-800 dark:border-green-500 dark:bg-green-900/30 dark:text-green-300",
          isWrong && "border-red-500 text-red-700 dark:text-red-400",
          !isCorrect && !isWrong && open && "border-blue-500",
          disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer",
        )}
        style={triggerTextColor ? { color: triggerTextColor } : undefined}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={cn(!value && "text-slate-400")}>
          {value || placeholder}
        </span>

        {/* Arrow */}
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: open ? "#3b82f6" : "#94a3b8" }}
        >
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
            <path
              d="M1 1L5 5L9 1"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.span>
      </motion.button>

      {/* Dropdown list */}
      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -6, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -4, scaleY: 0.97 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-0 right-0 mt-2 rounded-xl overflow-hidden z-50 py-2 shadow-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            style={{ transformOrigin: "top" }}
          >
            {options.map((opt, i) => {
              const isSelected = opt === value;
              const isHovered = hoveredIndex === i;
              const isCorrectOption =
                feedbackMode && Boolean(correctValue) && opt === correctValue;
              const isWrongSelectedOption =
                feedbackMode &&
                Boolean(value) &&
                Boolean(correctValue) &&
                value !== correctValue &&
                opt === value;

              const optionTextColor = isWrongSelectedOption
                ? "#991b1b"
                : isCorrectOption
                  ? "#14532d"
                  : isSelected
                    ? "#1d4ed8"
                    : isHovered
                      ? "#1e293b"
                      : "#475569";

              return (
                <motion.li
                  key={opt}
                  role="option"
                  aria-selected={isSelected}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: i * 0.03,
                    duration: 0.15,
                    ease: "easeOut",
                  }}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => {
                    onChange(opt);
                    setOpen(false);
                  }}
                  className={cn(
                    "relative mx-1.5 flex items-center justify-between px-3 py-2.5 mt-1 rounded-lg cursor-pointer text-sm font-medium select-none border",
                    isWrongSelectedOption
                      ? "border-red-300 dark:border-red-700"
                      : isCorrectOption
                        ? "border-green-300 dark:border-green-700"
                        : "border-transparent",
                  )}
                  style={{ color: optionTextColor }}
                >
                  {/* Hover bg */}
                  <AnimatePresence>
                    {isHovered && !isSelected && (
                      <motion.span
                        layoutId="custom-select-hover"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.12 }}
                        className="absolute inset-0 rounded-lg bg-slate-100 dark:bg-slate-800"
                      />
                    )}
                  </AnimatePresence>

                  {/* Selected bg */}
                  {isSelected && (
                    <motion.span
                      layoutId="selectedBg"
                      className={cn(
                        "absolute inset-0 rounded-lg",
                        isWrongSelectedOption
                          ? "bg-red-200 dark:bg-red-900/45"
                          : isCorrectOption
                            ? "bg-green-200 dark:bg-green-900/45"
                            : "bg-blue-100 dark:bg-blue-900/30",
                      )}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    />
                  )}

                  {feedbackMode && isCorrectOption && !isSelected && (
                    <span className="absolute inset-0 rounded-lg bg-green-100 dark:bg-green-900/30" />
                  )}

                  <span className="relative">{opt}</span>

                  {/* Checkmark */}
                  {isSelected && (
                    <motion.span
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="relative"
                      style={{
                        color: isWrongSelectedOption
                          ? "#dc2626"
                          : feedbackMode && isCorrectOption
                            ? "#15803d"
                            : "#2563eb",
                      }}
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                      >
                        <path
                          d="M2 6.5L4.5 9L10 3"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </motion.span>
                  )}
                </motion.li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
