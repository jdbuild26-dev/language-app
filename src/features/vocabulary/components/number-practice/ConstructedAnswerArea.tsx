"use client";

import { Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ConstructedAnswerArea({
  selectedWords,
  expectedLength,
  onRemoveWord,
  onClear,
  result,
}: {
  selectedWords: string[];
  expectedLength: number;
  onRemoveWord: (index: number) => void;
  onClear: () => void;
  result: boolean | null;
}) {
  return (
    <section aria-label="Your answer">
      <div lang="fr" className={cn(
        "flex min-h-40 flex-wrap content-start items-start gap-2 rounded-2xl border-2 border-neutral-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 sm:p-5 lg:min-h-64",
        result === true && "border-emerald-400 dark:border-emerald-600",
        result === false && "border-red-400 dark:border-red-600",
      )}>
        {selectedWords.map((word, index) => (
          <button
            key={`${index}-${word}`}
            type="button"
            aria-label={`Remove ${word}`}
            disabled={result !== null}
            onClick={() => onRemoveWord(index)}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-base font-semibold text-slate-800 hover:border-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 disabled:pointer-events-none dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          >
            {word}
            {result === null && <X className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />}
          </button>
        ))}
      </div>
      <div className="flex min-h-8 items-center justify-between gap-3 pt-1.5">
        {selectedWords.length > 0 && result === null && (
          <button type="button" onClick={onClear} className="inline-flex items-center gap-1.5 rounded px-1 py-1 text-sm font-semibold text-slate-600 hover:text-red-700 focus-visible:outline focus-visible:outline-sky-500 dark:text-slate-300">
            <Trash2 className="h-4 w-4" aria-hidden="true" /> Clear
          </button>
        )}
        <span aria-label={`${selectedWords.length} of ${expectedLength} tiles selected`} className="ml-auto tabular-nums text-slate-800 dark:text-slate-100">
          {selectedWords.length}/{expectedLength}
        </span>
      </div>
    </section>
  );
}
