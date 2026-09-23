"use client";

import { memo, useMemo, useState } from "react";
import { Languages, PenLine, Loader2 } from "lucide-react";
import AudioPlayer from "@/features/ai-practice/components/chat/AudioPlayer";
import { CorrectionText } from "./GrammarCorrection";
import type { CorrectionResult } from "@/services/aiPracticeApi";
import { translateText } from "@/services/aiPracticeApi";

interface MessageBubbleMessage {
  id: string;
  sender: "ai" | "user";
  text: string;
  timestamp?: string;
  correction?: string | null;
  correction_result?: CorrectionResult | null;
  translation?: string | null;
  autoPlay?: boolean;
  usage?: { input_tokens: number; output_tokens: number; total_tokens: number; estimated_cost_usd: number };
}

// ---------------------------------------------------------------------------
// Inline diff: word-level comparison of original vs correction
// ---------------------------------------------------------------------------
function buildDiff(original: string, corrected: string) {
  const origWords = original.trim().split(/\s+/);
  const corrWords = corrected.trim().split(/\s+/);

  // Simple LCS-based diff
  const m = origWords.length;
  const n = corrWords.length;

  // Build LCS table
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (origWords[i - 1].toLowerCase() === corrWords[j - 1].toLowerCase()) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to get diff tokens
  type Token = { type: "same" | "removed" | "added"; word: string };
  const tokens: Token[] = [];
  let i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && origWords[i - 1].toLowerCase() === corrWords[j - 1].toLowerCase()) {
      tokens.unshift({ type: "same", word: corrWords[j - 1] });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      tokens.unshift({ type: "added", word: corrWords[j - 1] });
      j--;
    } else {
      tokens.unshift({ type: "removed", word: origWords[i - 1] });
      i--;
    }
  }
  return tokens;
}

const InlineDiff = memo(function InlineDiff({ original, corrected }: { original: string; corrected: string }) {
  const tokens = useMemo(() => buildDiff(original, corrected), [original, corrected]);
  return (
    <p className="text-sm leading-relaxed">
      {tokens.map((tok, idx) => {
        if (tok.type === "same") {
          return <span key={idx}>{tok.word} </span>;
        }
        if (tok.type === "removed") {
          return (
            <span key={idx} className="line-through text-red-400 dark:text-red-400 opacity-70 mr-0.5">
              {tok.word}{" "}
            </span>
          );
        }
        // added
        return (
          <span key={idx} className="text-emerald-600 dark:text-emerald-400 font-medium mr-0.5">
            {tok.word}{" "}
          </span>
        );
      })}
    </p>
  );
});

// Reuse translations while the learner stays in the current browser session.
// The promise cache also prevents duplicate requests when two bubbles have the
// same text and language pair.
const translationCache = new Map<string, Promise<string>>();

function getCachedTranslation(text: string, targetLanguage: string) {
  const cacheKey = `${targetLanguage}:${text}`;
  const cached = translationCache.get(cacheKey);
  if (cached) return cached;

  const request = translateText(text, targetLanguage)
    .then((result) => result.translation)
    .catch((error) => {
      translationCache.delete(cacheKey);
      throw error;
    });
  translationCache.set(cacheKey, request);
  return request;
}

function correctedInlineToPlainText(text: string) {
  return text
    .replace(/~~[\s\S]*?~~/g, "")
    .replace(/\*\*([\s\S]*?)\*\*/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

// ---------------------------------------------------------------------------
// MessageBubble
// ---------------------------------------------------------------------------
export default function MessageBubble({
  message,
  learningLanguage = "fr",
  translationLanguage = "en",
  correctionDisplay = "inline",
  audioText,
  onRequestCorrection,
}: {
  message: MessageBubbleMessage;
  learningLanguage?: string;
  translationLanguage?: string;
  correctionDisplay?: "inline" | "below";
  audioText?: string;
  onRequestCorrection?: () => Promise<CorrectionResult>;
}) {
  const [showTranslation, setShowTranslation] = useState(false);
  const [showCorrection, setShowCorrection] = useState(false);
  const [translation, setTranslation] = useState(message.translation || null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [correctionResult, setCorrectionResult] = useState(message.correction_result);
  const [isCorrecting, setIsCorrecting] = useState(false);
  const [correctionError, setCorrectionError] = useState<string | null>(null);

  const currentCorrection = correctionResult?.corrections[0];
  const canRequestCorrection = !!onRequestCorrection || !!correctionResult;

  const handleCorrection = async () => {
    if (isCorrecting) return;
    if (showCorrection) {
      setShowCorrection(false);
      return;
    }
    if (correctionResult || !onRequestCorrection) {
      setShowCorrection(true);
      return;
    }
    setIsCorrecting(true);
    setCorrectionError(null);
    try {
      setCorrectionResult(await onRequestCorrection());
      setShowCorrection(true);
    } catch {
      setCorrectionError("Correction unavailable. Please try again.");
    } finally {
      setIsCorrecting(false);
    }
  };

  const isAI = message.sender === "ai";
  const hasCorrection = !isAI && !!message.correction;
  const primaryText = message.text;
  // Usage is useful while testing prompt changes, but it is internal cost
  // information and must stay hidden in normal production learner builds.
  const showUsage = process.env.NEXT_PUBLIC_AI_PRACTICE_SHOW_USAGE === "true";

  const handleTranslate = async () => {
    if (showTranslation) { setShowTranslation(false); return; }
    if (translation) { setShowTranslation(true); return; }
    try {
      setIsTranslating(true);
      const translatedText = await getCachedTranslation(primaryText, translationLanguage);
      setTranslation(translatedText);
      setShowTranslation(true);
    } catch {
      setTranslation("Translation unavailable. Please try again.");
      setShowTranslation(true);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className={`flex ${isAI ? "justify-start" : "justify-end"} mb-3`}>
      <div className="max-w-[80%]">
        <div
          className={`rounded-2xl px-4 py-3 ${!isAI ? "ml-auto" : ""} ${
            isAI
              ? "bg-sky-50 dark:bg-sky-900/20 text-sky-800 dark:text-sky-100 rounded-tl-sm"
              : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200 rounded-tr-sm"
          }`}
        >
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
            {showCorrection && currentCorrection && correctionDisplay === "inline"
              ? <CorrectionText text={currentCorrection.corrected_inline} />
              : primaryText}
          </p>
        </div>

        {showCorrection && correctionDisplay === "below" && correctionResult && (
          <div className="mt-2 rounded-2xl rounded-tr-sm border border-slate-200 bg-white px-4 py-3 text-sm leading-relaxed text-slate-800 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" role="status">
            {currentCorrection
              ? <CorrectionText text={currentCorrection.corrected_inline} />
              : "No correction needed."}
          </div>
        )}

        {correctionError && <p role="alert" className="mt-2 text-sm text-red-700 dark:text-red-300">{correctionError}</p>}

        {showTranslation && translation && (
          <div className={`mt-2 rounded-2xl border border-amber-300 bg-amber-50/70 px-4 py-3 text-amber-800 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-200 ${
            isAI ? "rounded-tl-sm" : "ml-auto max-w-full rounded-tr-sm"
          }`}>
            <p className="text-sm leading-relaxed">{translation}</p>
          </div>
        )}

        {showCorrection && !correctionResult && hasCorrection && (
          <div className="mt-2 rounded-xl border border-emerald-100 bg-emerald-50/70 px-3 py-2.5 text-gray-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-slate-200">
            <InlineDiff original={message.text} corrected={message.correction!} />
          </div>
        )}

        {/* Action Buttons */}
        <div className={`mt-1 flex items-center gap-2 ${isAI ? "" : "justify-end"}`}>
          <AudioPlayer
            text={audioText || (currentCorrection ? correctedInlineToPlainText(currentCorrection.corrected_inline) : primaryText)}
            language={learningLanguage}
            autoPlay={isAI && message.autoPlay}
            autoPlayKey={`${message.id}-${message.timestamp || "greeting"}`}
          />
          <button
            onClick={handleTranslate}
            className={`p-1.5 rounded-lg transition-colors ${
              showTranslation
                ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                : "hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400"
            }`}
            title="Translate"
            aria-label="Translate message"
            disabled={isTranslating}
          >
            {isTranslating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Languages className="w-4 h-4" />}
          </button>

          {!isAI && (
            <>
              {(hasCorrection || canRequestCorrection) && <button
                onClick={handleCorrection}
                disabled={isCorrecting || (!hasCorrection && !canRequestCorrection)}
                className={`p-1.5 rounded-lg transition-colors ${
                  showCorrection
                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                    : (hasCorrection || canRequestCorrection)
                      ? "hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400"
                      : "cursor-not-allowed text-gray-300 dark:text-slate-600"
                }`}
                title={canRequestCorrection ? "Check correction" : hasCorrection ? "Show correction" : "No correction needed"}
                aria-label={canRequestCorrection ? "Check correction" : hasCorrection ? "Show correction" : "No correction needed"}
              >
                {isCorrecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <PenLine className="w-4 h-4" />}
              </button>}
            </>
          )}
        </div>

        {/* Timestamp */}
        <div className={`text-xs text-gray-400 dark:text-slate-500 mt-1 ${isAI ? "" : "text-right"}`}>
          {message.timestamp}
        </div>
        {showUsage && isAI && message.usage && (
          <div className="mt-1 text-[11px] text-violet-600 dark:text-violet-300">
            Test usage: {message.usage.input_tokens.toLocaleString()} in · {message.usage.output_tokens.toLocaleString()} out · {message.usage.total_tokens.toLocaleString()} total · ${message.usage.estimated_cost_usd.toFixed(5)}
          </div>
        )}
      </div>
    </div>
  );
}
