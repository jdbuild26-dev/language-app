"use client";

import { useState } from "react";
import { Sparkles, Loader2, ChevronDown, ChevronUp, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import TranslationExplainButton from "@/components/ui/TranslationExplainButton";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface WritingTranslateResultProps {
  sourceSentence: string;
  userAnswer: string;
  acceptableAnswers: string[];
  /** CEFR level from the question data — defaults to A1 */
  level?: string;
  /** Called once the LLM result is back so the page can update isCorrect */
  onResult?: (isCorrect: boolean, correctAnswer: string) => void;
}

interface EvalResult {
  is_correct: boolean;
  correct_answer: string;
  alternates: string[] | null;
  level: string;
  is_lower_level: boolean;
  wrong_subject?: any;
  wrong_verb?: any;
  missing_article?: any;
  incorrect_structure?: any;
}

/**
 * Single "Check & Explain" button for the Writing Translate exercise.
 *
 * A1/A2 — shows: ✓/✗ result + alternate phrasings + collapsible 4-panel explain
 * B1/B2+ — shows: ✓/✗ result + 4-panel TranslationExplainButton directly (no alternates)
 *
 * One LLM call covers both validation and explanation.
 */
export default function WritingTranslateResult({
  sourceSentence,
  userAnswer,
  acceptableAnswers,
  level = "A1",
  onResult,
}: WritingTranslateResultProps) {
  const [result, setResult] = useState<EvalResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAlternates, setShowAlternates] = useState(false);
  const [called, setCalled] = useState(false);

  const isLowerLevel = ["A1", "A2"].includes(level.toUpperCase());

  const handleCheck = async () => {
    if (called) return; // already fetched
    setIsLoading(true);
    setCalled(true);

    try {
      const res = await fetch(`${API_URL}/api/practice/evaluate-translation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_sentence: sourceSentence,
          user_answer: userAnswer,
          acceptable_answers: acceptableAnswers,
          level,
        }),
      });

      if (!res.ok) throw new Error("Failed");
      const data: EvalResult = await res.json();
      setResult(data);
      onResult?.(data.is_correct, data.correct_answer);
    } catch {
      // Fallback: do local check
      const normalize = (s: string) =>
        s.toLowerCase().replace(/[.,!?;:'"«»]/g, "").replace(/\s+/g, " ").trim();
      const localCorrect = acceptableAnswers.some(
        (a) => normalize(a) === normalize(userAnswer)
      );
      const fallback: EvalResult = {
        is_correct: localCorrect,
        correct_answer: acceptableAnswers[0] || "",
        alternates: null,
        level,
        is_lower_level: isLowerLevel,
      };
      setResult(fallback);
      onResult?.(localCorrect, fallback.correct_answer);
    } finally {
      setIsLoading(false);
    }
  };

  // Before check
  if (!called && !isLoading) {
    return (
      <button
        onClick={handleCheck}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-sky-500 hover:bg-sky-600 text-white shadow-md transition-all hover:scale-105 active:scale-95"
      >
        <Sparkles className="w-4 h-4" />
        Check &amp; Explain
      </button>
    );
  }

  // Loading
  if (isLoading) {
    return (
      <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 py-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        Checking your answer...
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="w-full space-y-4">
      {/* Result badge */}
      <div className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl border",
        result.is_correct
          ? "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700"
          : "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700"
      )}>
        {result.is_correct
          ? <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
          : <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
        }
        <div className="flex-1">
          <p className={cn(
            "font-bold text-sm",
            result.is_correct ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200"
          )}>
            {result.is_correct ? "Correct!" : "Not quite right"}
          </p>
          {!result.is_correct && result.correct_answer && (
            <p className="text-xs text-red-700 dark:text-red-300 mt-0.5">
              <span className="font-semibold">Correct: </span>{result.correct_answer}
            </p>
          )}
        </div>
      </div>

      {/* A1/A2 — alternates list */}
      {result.is_lower_level && result.alternates && result.alternates.length > 0 && (
        <div className="rounded-xl border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-900/20 overflow-hidden">
          <button
            onClick={() => setShowAlternates((p) => !p)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-sky-800 dark:text-sky-200 hover:bg-sky-100 dark:hover:bg-sky-900/40 transition-colors"
          >
            <span>Other ways to say this</span>
            {showAlternates ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showAlternates && (
            <ul className="px-4 pb-3 space-y-1.5">
              {result.alternates.map((alt, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-sky-900 dark:text-sky-100">
                  <span className="text-sky-400 mt-0.5">•</span>
                  <span className="font-medium">{alt}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* B1/B2+ — 4-panel breakdown rendered inline using TranslationExplainButton data */}
      {!result.is_lower_level && (
        <TranslationExplainButton
          sourceSentence={sourceSentence}
          correctAnswer={result.correct_answer}
          userAnswer={userAnswer}
          isCorrect={result.is_correct}
          // Pre-load the result so no second API call is made
          preloadedAnalysis={result}
        />
      )}

      {/* A1/A2 — also offer the explain panel (collapsible, separate from alternates) */}
      {result.is_lower_level && !result.is_correct && (
        <TranslationExplainButton
          sourceSentence={sourceSentence}
          correctAnswer={result.correct_answer}
          userAnswer={userAnswer}
          isCorrect={result.is_correct}
          preloadedAnalysis={result}
        />
      )}
    </div>
  );
}
