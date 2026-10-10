"use client";

import { cn } from "@/lib/utils";

type WordTileBuilderProps = {
  selectedWords: string[];
  wordBankSlots: (string | null)[];
  showFeedback: boolean;
  isCorrect: boolean;
  onWordSelect: (word: string, slotIndex: number) => void;
  onWordRemove: (word: string, index: number) => void;
};

const tileClass = "practice-type-content px-4 py-2.5 xl:px-6 xl:py-3.5 rounded-2xl border font-sans font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 motion-reduce:transition-none";

export default function WordTileBuilder({
  selectedWords,
  wordBankSlots,
  showFeedback,
  isCorrect,
  onWordSelect,
  onWordRemove,
}: WordTileBuilderProps) {
  return (
    <div className="w-full max-w-7xl border-t border-slate-200 py-5 dark:border-slate-700 xl:py-8">
      <div className="flex min-h-16 w-full flex-wrap items-center justify-center gap-2 px-1 xl:min-h-[92px] xl:gap-3" role="group" aria-label="Your answer">
        {selectedWords.map((word, index) => (
          <button
            key={`selected-${index}`}
            type="button"
            onClick={() => onWordRemove(word, index)}
            disabled={showFeedback}
            aria-label={`Remove ${word} from answer`}
            className={cn(
              tileClass,
              showFeedback && isCorrect
                ? "border-emerald-400 bg-emerald-100 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                : showFeedback
                  ? "border-red-400 bg-red-100 text-red-700 dark:border-red-700 dark:bg-red-950/40 dark:text-red-300"
                  : "border-slate-300 bg-white text-slate-700 hover:border-blue-400 active:scale-95 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200",
            )}
          >
            {word}
          </button>
        ))}
        {!showFeedback && <span className="h-10 w-[2px] rounded-full bg-slate-500 animate-caret-blink dark:bg-slate-300" aria-hidden="true" />}
      </div>

      <div className="mt-4 flex w-full flex-wrap justify-center gap-2 border-t border-slate-200 px-1 pt-4 dark:border-slate-700 xl:mt-6 xl:gap-3 xl:pt-6" role="group" aria-label="Word bank">
        {wordBankSlots.map((word, index) =>
          word === null ? (
            <div
              key={`ghost-${index}`}
              className="practice-type-content select-none rounded-2xl border border-dashed border-slate-300 bg-slate-100 px-4 py-2.5 font-semibold text-transparent dark:border-slate-600 dark:bg-slate-800/40 xl:px-6 xl:py-3.5"
              aria-hidden="true"
            >
              &nbsp;&nbsp;&nbsp;&nbsp;
            </div>
          ) : (
            <button
              key={`available-${index}`}
              type="button"
              onClick={() => onWordSelect(word, index)}
              disabled={showFeedback}
              aria-label={`Add ${word} to answer`}
              className={cn(
                tileClass,
                "border-slate-300 bg-slate-50 text-slate-700 hover:border-slate-500 hover:bg-slate-100 active:scale-95 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700",
                showFeedback && "cursor-not-allowed bg-slate-100 text-slate-600 dark:bg-slate-800/70 dark:text-slate-300",
              )}
            >
              {word}
            </button>
          ),
        )}
      </div>
    </div>
  );
}
