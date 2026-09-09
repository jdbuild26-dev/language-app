"use client";

import { useState } from "react";
import { ArrowLeft, CheckCircle2, Languages, User } from "lucide-react";
import Link from "next/link";

// Level badge colors
const levelColors = {
  A1: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  A2: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  B1: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  B2: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  C1: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  C2: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
};

const levelLabels: Record<string, string> = {
  A1: "Beginner",
  A2: "Elementary",
  B1: "Intermediate",
  B2: "Upper Intermediate",
  C1: "Advanced",
  C2: "Mastery",
};

interface ChatHeaderProps {
  scenario: any;
  onEndSession: () => void;
  remainingTurns?: number | null;
  isCompleted?: boolean;
}

export default function ChatHeader({ scenario, onEndSession, remainingTurns, isCompleted = false }: ChatHeaderProps) {
  const [showEnglish, setShowEnglish] = useState(false);
  // Guard against null scenario during initial load
  if (!scenario) return (
    <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 px-4 py-3 h-14" />
  );

  const levelColor = levelColors[scenario?.level] || levelColors.A1;

  return (
    <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 px-4 py-3">
      <div className="max-w-5xl mx-auto">
        {/* Top row: Back button + CEFR level */}
        <div className="flex items-center justify-between mb-2">
          <Link
            href="/ai-practice/scenarios/chats"
            className="flex items-center gap-2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </Link>

          <div className="flex items-center gap-2">
            {/* Level Badge */}
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-semibold ${levelColor}`}
            >
              {scenario.level}
            </span>

            <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-700 dark:bg-sky-900/30 dark:text-sky-400">
              {levelLabels[scenario.level] || scenario.level}
            </span>
          </div>

          {isCompleted ? (
            <span className="ml-auto inline-flex min-h-9 items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Completed
            </span>
          ) : (
            <button
              onClick={onEndSession}
              className="text-sm font-medium text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors"
            >
              End Session
            </button>
          )}
        </div>

        {/* Title */}
        <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
          {showEnglish && scenario.titleEn ? scenario.titleEn : scenario.title}
        </h1>

        {(scenario.learnerInstruction || scenario.instructionEn) && (
          <p className="text-sm text-gray-500 dark:text-slate-400 flex items-start gap-2 mt-2">
            <User className="w-4 h-4 mt-0.5 flex-shrink-0 text-sky-500" />
            <span>{showEnglish ? scenario.instructionEn : scenario.learnerInstruction}</span>
          </p>
        )}
        <div className="mt-2 flex items-center justify-between gap-3">
          {scenario.instructionEn && scenario.learnerInstruction !== scenario.instructionEn ? (
            <button
              type="button"
              onClick={() => setShowEnglish((current) => !current)}
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold text-sky-700 hover:bg-sky-50 active:scale-[0.97] dark:text-sky-300 dark:hover:bg-sky-950/50"
            >
              <Languages className="h-3.5 w-3.5" />
              {showEnglish ? "Show original" : "Translate to English"}
            </button>
          ) : <span />}
          {typeof remainingTurns === "number" && (
            <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">
              {remainingTurns} chat{remainingTurns === 1 ? "" : "s"} remaining
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
