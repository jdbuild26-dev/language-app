"use client";

import { NUMBER_WORD_GROUPS } from "@/features/vocabulary/utils/numberToFrench";

export default function WordBankArea({ onWordSelect, disabled }: {
  onWordSelect: (word: string) => void;
  disabled: boolean;
}) {
  return (
    <section aria-label="French number word bank" lang="fr" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:p-6 lg:min-h-[32.5rem]">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5">
        {NUMBER_WORD_GROUPS.map((words) => (
          <div key={words[0]} className="flex content-start flex-wrap items-start gap-1.5 rounded-xl bg-slate-100/80 p-2 dark:bg-slate-800/70 xl:min-h-[22.5rem]">
            {words.map((word) => (
              <button
                key={word}
                type="button"
                disabled={disabled}
                aria-label={word === "-" ? "Trait d’union" : undefined}
                onClick={() => onWordSelect(word)}
                className="min-h-9 rounded-xl border border-slate-200 bg-white px-2.5 text-sm font-bold text-slate-800 shadow-sm hover:border-sky-500 hover:text-sky-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 active:scale-95 disabled:cursor-default disabled:opacity-65 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              >
                {word}
              </button>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
