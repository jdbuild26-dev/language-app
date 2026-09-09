"use client";

import { useEffect, useState } from "react";
import { Languages, Play, X } from "lucide-react";

interface Props {
  scenario: {
    title: string;
    titleEn?: string;
    topic?: string;
    level: string;
    learnerInstruction?: string;
    instructionEn?: string;
    learning_lang?: string;
  };
  onStart: () => void;
  onClose: () => void;
}

const levelLabels: Record<string, string> = {
  A1: "Beginner",
  A2: "Elementary",
  B1: "Intermediate",
  B2: "Upper Intermediate",
  C1: "Advanced",
  C2: "Mastery",
};

export default function ConversationPreviewModal({ scenario, onStart, onClose }: Props) {
  const [showEnglish, setShowEnglish] = useState(false);
  const canTranslate = Boolean(
    scenario.instructionEn &&
    scenario.learnerInstruction &&
    scenario.instructionEn !== scenario.learnerInstruction
  );

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative max-h-[calc(100vh-2rem)] w-full max-w-3xl overflow-y-auto rounded-2xl bg-[#fdf8e8] shadow-2xl dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="conversation-preview-title"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close conversation preview"
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-[color,background-color,transform] duration-150 hover:bg-black/5 hover:text-slate-900 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header banner */}
        <div className="rounded-t-2xl bg-[#f5e9a0] px-8 py-6 pr-16 dark:bg-amber-200">
          <h2 id="conversation-preview-title" className="mb-1 text-2xl font-bold tracking-[-0.02em] text-slate-800">Conversation practice</h2>
          <p className="text-base text-slate-600">
            In this lesson you will put your words into use in a roleplay practice.
          </p>
        </div>

        <div className="px-8 py-7">
          {/* Scenario card */}
          <div className="flex min-h-[19rem] flex-col rounded-xl border border-slate-100 bg-white p-7 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <p className="text-sm font-semibold text-sky-700 dark:text-sky-300">
            {scenario.level} – {levelLabels[scenario.level] || scenario.level}
          </p>
          <h3 className="mt-1 min-h-8 text-xl font-bold text-slate-900 dark:text-white">
            {scenario.title}
          </h3>

          {scenario.learnerInstruction && (
            <div className="mt-4 min-h-[7rem]">
              <p className="text-lg leading-8 text-slate-700 dark:text-slate-200">{scenario.learnerInstruction}</p>
            </div>
          )}

          {showEnglish && scenario.instructionEn && (
            <div className="mt-4 rounded-xl border border-sky-100 bg-sky-50/70 px-5 py-4 dark:border-sky-900/50 dark:bg-sky-950/30">
              {scenario.titleEn && scenario.titleEn !== scenario.title && (
                <p className="mb-1 font-semibold text-slate-900 dark:text-white">{scenario.titleEn}</p>
              )}
              <p className="text-base leading-7 text-slate-700 dark:text-slate-200">{scenario.instructionEn}</p>
            </div>
          )}

          {canTranslate && (
            <button
              type="button"
              onClick={() => setShowEnglish((current) => !current)}
              aria-pressed={showEnglish}
              className="mt-auto inline-flex w-fit items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-sky-700 transition-[color,background-color,transform] duration-150 hover:bg-sky-50 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:text-sky-300 dark:hover:bg-sky-950/50"
            >
              <Languages className="h-4 w-4" />
              {showEnglish ? "Hide translation" : "Translate to English"}
            </button>
          )}
          </div>

          {/* Start button */}
          <div className="flex justify-center pt-5">
            <button
              onClick={onStart}
              className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#f5c518] px-8 py-3 text-base font-bold text-slate-900 shadow-md transition-[background-color,box-shadow,transform] duration-150 hover:bg-[#e6b800] hover:shadow-lg active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
            >
              <Play className="h-4 w-4 fill-current" />
              Start conversation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
