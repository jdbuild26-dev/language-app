"use client";

import { useState } from "react";
import { Sparkles, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ExplainButtonProps {
  correctAnswer: string;
  userAnswer?: string;
  questionContext?: string;
  isCorrect?: boolean;
}

/**
 * Reusable "Explain" button for practice exercises.
 * Calls /api/practice/explain and shows an LLM-generated explanation inline.
 *
 * Usage — drop into FeedbackBanner's children prop:
 *   <FeedbackBanner ...>
 *     <ExplainButton correctAnswer={...} userAnswer={...} />
 *   </FeedbackBanner>
 */
export default function ExplainButton({
  correctAnswer,
  userAnswer = "",
  questionContext = "",
  isCorrect = false,
}: ExplainButtonProps) {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleExplain = async () => {
    if (explanation) {
      // Already fetched — just toggle visibility
      setIsOpen((prev) => !prev);
      return;
    }

    setIsLoading(true);
    setIsOpen(true);

    try {
      const res = await fetch(`${API_URL}/api/practice/explain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          correct_answer: correctAnswer,
          user_answer: userAnswer,
          question_context: questionContext,
        }),
      });

      if (!res.ok) throw new Error("Failed to fetch explanation");
      const data = await res.json();
      setExplanation(data.explanation);
    } catch (err) {
      setExplanation("Sorry, couldn't load an explanation right now. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-6 pb-4">
      {/* Trigger button */}
      {!isOpen && (
        <button
          onClick={handleExplain}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all",
            "border shadow-sm hover:scale-105 active:scale-95",
            isCorrect
              ? "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 hover:bg-green-100"
              : "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-100",
          )}
        >
          <Sparkles className="w-4 h-4" />
          Explain
        </button>
      )}

      {/* Explanation panel */}
      {isOpen && (
        <div
          className={cn(
            "rounded-xl border p-4 text-sm leading-relaxed animate-in fade-in slide-in-from-bottom-2 duration-200",
            isCorrect
              ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-900 dark:text-green-100"
              : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100",
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2 flex-1">
              <Sparkles className={cn(
                "w-4 h-4 mt-0.5 shrink-0",
                isCorrect ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
              )} />
              {isLoading ? (
                <div className="flex items-center gap-2 text-sm opacity-70">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating explanation...
                </div>
              ) : (
                <p>{explanation}</p>
              )}
            </div>
            {!isLoading && (
              <button
                onClick={() => setIsOpen(false)}
                className="shrink-0 opacity-50 hover:opacity-100 transition-opacity"
                aria-label="Close explanation"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
