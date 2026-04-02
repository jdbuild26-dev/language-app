"use client";

import { useState } from "react";
import { Sparkles, Loader2, X, User, BookOpen, AlignLeft, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface TranslationExplainButtonProps {
  sourceSentence: string;
  correctAnswer: string;
  userAnswer: string;
  isCorrect: boolean;
  /** If provided, skips the API call and renders immediately */
  preloadedAnalysis?: any;
}

interface Section {
  found: boolean;
  student_used?: string;
  correct_subject?: string;
  correct_verb?: string;
  verb_origin?: string;
  noun?: string;
  correct_article?: string;
  gender_note?: string;
  student_structure?: string;
  correct_structure?: string;
  explanation?: string;
  note?: string;
}

interface AnalysisData {
  is_correct: boolean;
  alternates?: string[];
  wrong_subject?: Section | null;
  wrong_verb?: Section | null;
  missing_article?: Section | null;
  incorrect_structure?: Section | null;
}

const SECTION_CONFIG = [
  {
    key: "wrong_subject" as const,
    icon: User,
    label: "Wrong Subject",
    color: {
      bg: "bg-red-50 dark:bg-red-900/20",
      border: "border-red-200 dark:border-red-800",
      icon: "text-red-500",
      badge: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300",
      number: "bg-red-500 text-white",
    },
    correctColor: {
      bg: "bg-green-50 dark:bg-green-900/20",
      border: "border-green-200 dark:border-green-800",
      icon: "text-green-500",
      badge: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300",
      number: "bg-green-500 text-white",
    },
  },
  {
    key: "wrong_verb" as const,
    icon: BookOpen,
    label: "Wrong Verb",
    color: {
      bg: "bg-orange-50 dark:bg-orange-900/20",
      border: "border-orange-200 dark:border-orange-800",
      icon: "text-orange-500",
      badge: "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300",
      number: "bg-orange-500 text-white",
    },
    correctColor: {
      bg: "bg-green-50 dark:bg-green-900/20",
      border: "border-green-200 dark:border-green-800",
      icon: "text-green-500",
      badge: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300",
      number: "bg-green-500 text-white",
    },
  },
  {
    key: "missing_article" as const,
    icon: AlignLeft,
    label: "Missing Article",
    color: {
      bg: "bg-purple-50 dark:bg-purple-900/20",
      border: "border-purple-200 dark:border-purple-800",
      icon: "text-purple-500",
      badge: "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300",
      number: "bg-purple-500 text-white",
    },
    correctColor: {
      bg: "bg-green-50 dark:bg-green-900/20",
      border: "border-green-200 dark:border-green-800",
      icon: "text-green-500",
      badge: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300",
      number: "bg-green-500 text-white",
    },
  },
  {
    key: "incorrect_structure" as const,
    icon: LayoutGrid,
    label: "Incorrect Structure",
    color: {
      bg: "bg-blue-50 dark:bg-blue-900/20",
      border: "border-blue-200 dark:border-blue-800",
      icon: "text-blue-500",
      badge: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
      number: "bg-blue-500 text-white",
    },
    correctColor: {
      bg: "bg-green-50 dark:bg-green-900/20",
      border: "border-green-200 dark:border-green-800",
      icon: "text-green-500",
      badge: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300",
      number: "bg-green-500 text-white",
    },
  },
];

function SectionCard({
  config,
  section,
  index,
  isCorrect,
}: {
  config: typeof SECTION_CONFIG[0];
  section: Section;
  index: number;
  isCorrect: boolean;
}) {
  const colors = isCorrect ? config.correctColor : config.color;
  const Icon = config.icon;

  return (
    <div className={cn("rounded-xl border p-4 flex flex-col gap-2", colors.bg, colors.border)}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className={cn("w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0", colors.number)}>
          {index + 1}
        </span>
        <Icon className={cn("w-4 h-4 shrink-0", colors.icon)} />
        <span className="font-bold text-sm text-gray-900 dark:text-white">{config.label}</span>
      </div>

      {/* Content */}
      <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1.5 pl-1">
        {config.key === "wrong_subject" && (
          <>
            {section.student_used && (
              <p><span className="font-mono line-through text-red-500">{section.student_used}</span> → <span className="font-mono font-bold text-green-600 dark:text-green-400">{section.correct_subject}</span></p>
            )}
            <p>{section.explanation}</p>
          </>
        )}

        {config.key === "wrong_verb" && (
          <>
            {section.verb_origin && (
              <p className="text-xs italic opacity-70">{section.verb_origin}</p>
            )}
            {section.student_used && (
              <p><span className="font-mono line-through text-red-500">{section.student_used}</span> → <span className="font-mono font-bold text-green-600 dark:text-green-400">{section.correct_verb}</span></p>
            )}
            <p>{section.explanation}</p>
          </>
        )}

        {config.key === "missing_article" && (
          <>
            {section.noun && (
              <div className="flex items-center gap-2">
                <span className="text-red-500 font-mono line-through">{section.noun}</span>
                <span className="text-gray-400">→</span>
                <span className="font-mono font-bold text-green-600 dark:text-green-400">{section.correct_article}</span>
              </div>
            )}
            {section.gender_note && (
              <ul className="list-disc list-inside text-xs opacity-80 space-y-0.5">
                {section.gender_note.split(",").map((note, i) => (
                  <li key={i}>{note.trim()}</li>
                ))}
              </ul>
            )}
            <p>{section.explanation}</p>
          </>
        )}

        {config.key === "incorrect_structure" && (
          <>
            {section.student_structure && (
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide opacity-60">Your structure</p>
                <p className="font-mono text-red-500">{section.student_structure}</p>
                <p className="text-xs font-semibold uppercase tracking-wide opacity-60 mt-1">Correct structure</p>
                <p className="font-mono text-green-600 dark:text-green-400">{section.correct_structure}</p>
              </div>
            )}
            <p>{section.note}</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function TranslationExplainButton({
  sourceSentence,
  correctAnswer,
  userAnswer,
  isCorrect,
  preloadedAnalysis,
}: TranslationExplainButtonProps) {
  const [analysis, setAnalysis] = useState<AnalysisData | null>(preloadedAnalysis ?? null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(!!preloadedAnalysis);

  const handleExplain = async () => {
    if (analysis) {
      setIsOpen((prev) => !prev);
      return;
    }

    setIsLoading(true);
    setIsOpen(true);

    try {
      const res = await fetch(`${API_URL}/api/practice/explain-translation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_sentence: sourceSentence,
          correct_answer: correctAnswer,
          user_answer: userAnswer,
        }),
      });

      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setAnalysis(data);
    } catch {
      // Fallback — show a simple error state
      setAnalysis({
        is_correct: isCorrect,
        wrong_subject: { found: false, explanation: "Analysis unavailable. Please try again." },
        wrong_verb: { found: false, explanation: "" },
        missing_article: { found: false, explanation: "" },
        incorrect_structure: { found: false, note: "" },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const buttonColor = isCorrect
    ? "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 hover:bg-green-100"
    : "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-100";

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-6 pb-4">
      {/* Trigger */}
      {!isOpen && (
        <button
          onClick={handleExplain}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border shadow-sm hover:scale-105 active:scale-95",
            buttonColor,
          )}
        >
          <Sparkles className="w-4 h-4" />
          Explain the Answer
        </button>
      )}

      {/* Panel */}
      {isOpen && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
          {/* Panel header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-500" />
              <span className="font-bold text-sm text-gray-900 dark:text-white">
                {isCorrect ? "Great job! Here's why it's correct:" : "Here's what went wrong:"}
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="opacity-50 hover:opacity-100 transition-opacity"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center gap-3 py-6 justify-center text-gray-500 dark:text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Analysing your answer...</span>
            </div>
          ) : analysis ? (
            <div className="space-y-4">
              {analysis.alternates && analysis.alternates.length > 0 && (
                <div className="rounded-xl border bg-blue-50 dark:bg-blue-900/20 border-blue-200 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-blue-500" />
                    <span className="font-bold text-sm text-gray-900 dark:text-white">Other correct ways to say this:</span>
                  </div>
                  <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300">
                    {analysis.alternates.map((alt, idx) => (
                      <li key={idx}>{alt}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {SECTION_CONFIG.map((config, i) => {
                  const sectionData = analysis[config.key];
                  if (!sectionData) return null;
                  
                  return (
                    <SectionCard
                      key={config.key}
                      config={config}
                      section={sectionData}
                      index={i}
                      isCorrect={!sectionData.found}
                    />
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
