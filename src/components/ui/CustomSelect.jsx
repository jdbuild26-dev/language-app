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
  const [openUpwards, setOpenUpwards] = useState(false);
  const ref = useRef(null);
  const listRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Determine if it should open upwards to avoid clipping
  useEffect(() => {
    if (open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      // If less than 220px below but there is more space above, open upwards
      if (spaceBelow < 220 && spaceAbove > spaceBelow) {
        setOpenUpwards(true);
      } else {
        setOpenUpwards(false);
      }
    }
  }, [open]);

  // Scroll hovered item into view automatically when using keyboard (if added later) or initially
  useEffect(() => {
    if (open && hoveredIndex !== null && listRef.current) {
      const list = listRef.current;
      const item = list.children[hoveredIndex];
      if (item) {
        const itemTop = item.offsetTop;
        const itemBottom = itemTop + item.offsetHeight;
        const listScrollTop = list.scrollTop;
        const listHeight = list.clientHeight;
        
        if (itemTop < listScrollTop) {
          list.scrollTop = itemTop;
        } else if (itemBottom > listScrollTop + listHeight) {
          list.scrollTop = itemBottom - listHeight;
        }
      }
    }
  }, [hoveredIndex, open]);


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
          "w-full min-h-[2.5rem] py-2 flex items-center justify-between px-3 pr-8 rounded-lg border font-sans text-sm md:text-base leading-snug font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30",
          "bg-white dark:bg-slate-900",
          "border-slate-200 dark:border-slate-700 shadow-sm",
          isCorrect &&
            "border-green-600 bg-green-50 text-green-800 dark:border-green-500 dark:bg-green-900/30 dark:text-green-300",
          isWrong && "border-red-500 text-red-700 dark:text-red-400",
          !isCorrect && !isWrong && open && "border-blue-500 ring-2 ring-blue-500/20",
          disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer",
        )}
        style={triggerTextColor ? { color: triggerTextColor } : undefined}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={cn("text-left break-words", !value && "text-slate-400")}>
          {value || placeholder}
        </span>

        {/* Arrow */}
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
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
            ref={listRef}
            role="listbox"
            initial={{ opacity: 0, y: openUpwards ? 6 : -6, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: openUpwards ? 4 : -4, scaleY: 0.97 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "absolute left-0 right-0 rounded-xl overflow-y-auto custom-scrollbar z-[100] py-1.5 shadow-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 max-h-60",
              openUpwards ? "bottom-full mb-2 origin-bottom" : "top-full mt-2 origin-top"
            )}
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
                    delay: Math.min(i * 0.02, 0.2), // cap animation delay so long lists don't take forever
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
                    "relative mx-1.5 flex items-center justify-between px-3 py-2 mt-0.5 rounded-lg cursor-pointer font-sans text-sm md:text-base leading-snug font-medium select-none border whitespace-normal break-words",
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

                  <span className="relative z-10 block pr-6">{opt}</span>

                  {/* Checkmark */}
                  {isSelected && (
                    <motion.span
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-10"
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
