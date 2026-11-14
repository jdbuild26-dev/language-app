"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { getSpecialCharacters, getSpecialCharacterLanguageName, getSpecialCharacterLanguages } from "../lib/specialCharacters";

export default function SpecialCharacterKeyboard({ learningLanguage, onInsert, disabled = false, className }: {
  learningLanguage: string;
  onInsert: (character: string) => void;
  disabled?: boolean;
  className?: string;
}) {
  const initialLanguage = learningLanguage.toLowerCase().split("-")[0];
  const [language, setLanguage] = useState(getSpecialCharacters(initialLanguage).length ? initialLanguage : "fr");
  const characters = getSpecialCharacters(language);
  const name = getSpecialCharacterLanguageName(language);

  return (
    <div className={cn("mx-auto flex w-full max-w-[760px] flex-col items-start gap-2 sm:flex-row sm:items-start", className)}>
      <label className="flex h-10 shrink-0 items-center sm:w-[130px] sm:justify-end">
        <select
          aria-label="Special character language"
          value={language}
          onChange={event => setLanguage(event.currentTarget.value)}
          className="h-10 w-28 shrink-0 rounded-xl border border-slate-300 bg-white px-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        >
          {getSpecialCharacterLanguages().map(option => <option key={option.code} value={option.code}>{option.name}</option>)}
        </select>
      </label>
      <div className="flex min-w-0 flex-wrap justify-start gap-1.5" aria-label={`${name} character keys`}>
        {characters.map(character => (
          <button
            key={character}
            type="button"
            disabled={disabled}
            onMouseDown={event => event.preventDefault()}
            onClick={() => onInsert(character)}
            aria-label={`Insert ${character}`}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-base font-semibold text-slate-900 transition-colors hover:border-sky-300 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            {character}
          </button>
        ))}
      </div>
    </div>
  );
}
