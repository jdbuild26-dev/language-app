import React from "react";

const NUMBER_WORDS = [
  "zéro",
  "un",
  "deux",
  "trois",
  "quatre",
  "cinq",
  "six",
  "sept",
  "huit",
  "neuf",
  "dix",
  "onze",
  "douze",
  "treize",
  "quatorze",
  "quinze",
  "seize",
  "vingt",
  "trente",
  "quarante",
  "cinquante",
  "soixante",
  "quatre-vingt",
  "cent",
  "mille",
  "million",
  "et",
  "-",
];

export default function WordBankArea({ onWordSelect }) {
  return (
    <div className="flex flex-col h-full max-h-[800px]">
      <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 shrink-0">
        Word Bank
      </h3>

      <div className="flex flex-wrap gap-2 overflow-y-auto pr-2 pb-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 content-start flex-1">
        {NUMBER_WORDS.map((word, index) => (
          <button
            key={`${word}-${index}`}
            onClick={() => onWordSelect(word)}
            className="bg-white dark:bg-slate-800 border-2 border-slate-200 outline-none dark:border-slate-700 hover:border-sky-400 dark:hover:border-sky-500 hover:text-sky-600 dark:hover:text-sky-400 text-slate-700 dark:text-slate-200 font-bold px-4 py-2.5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 active:scale-95 touch-manipulation text-lg sm:text-xl"
          >
            {word}
          </button>
        ))}
      </div>
    </div>
  );
}
