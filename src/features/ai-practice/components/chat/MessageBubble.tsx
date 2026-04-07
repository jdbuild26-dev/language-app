"use client";

import { useState } from "react";
import { Languages, PenLine, Loader2 } from "lucide-react";
import AudioPlayer from "@/features/ai-practice/components/chat/AudioPlayer";
import { translateText } from "@/services/aiPracticeApi";

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

function InlineDiff({ original, corrected }: { original: string; corrected: string }) {
  const tokens = buildDiff(original, corrected);
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
}

// ---------------------------------------------------------------------------
// MessageBubble
// ---------------------------------------------------------------------------
export default function MessageBubble({ message }) {
  const [showTranslation, setShowTranslation] = useState(false);
  const [showCorrection, setShowCorrection] = useState(false);
  const [translation, setTranslation] = useState(message.translation || null);
  const [isTranslating, setIsTranslating] = useState(false);

  const isAI = message.sender === "ai";
  const hasCorrection = !isAI && !!message.correction;

  const handleTranslate = async () => {
    if (showTranslation) { setShowTranslation(false); return; }
    if (translation) { setShowTranslation(true); return; }
    try {
      setIsTranslating(true);
      const result = await translateText(message.text);
      setTranslation(result.translation);
      setShowTranslation(true);
    } catch {
      setTranslation("Translation unavailable. Please try again.");
      setShowTranslation(true);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className={`flex ${isAI ? "justify-start" : "justify-end"} mb-4`}>
      <div className="max-w-[80%]">
        {/* Message Bubble */}
        <div
          className={`rounded-2xl px-4 py-3 ${
            isAI
              ? "bg-sky-50 dark:bg-sky-900/20 text-sky-800 dark:text-sky-100 rounded-tl-sm"
              : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200 rounded-tr-sm"
          }`}
        >
          {/* Text — swap to diff view when correction is toggled */}
          {showCorrection && hasCorrection ? (
            <InlineDiff original={message.text} corrected={message.correction!} />
          ) : (
            <p className="text-sm leading-relaxed">{message.text}</p>
          )}
        </div>

        {/* Translation */}
        {showTranslation && translation && (
          <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
            <p className="text-sm text-amber-800 dark:text-amber-300">{translation}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className={`flex items-center gap-2 mt-2 ${isAI ? "" : "justify-end"}`}>
          {isAI && (
            <>
              <AudioPlayer text={message.text} autoPlay={message.autoPlay} />
              <button
                onClick={handleTranslate}
                className={`p-1.5 rounded-lg transition-colors ${
                  showTranslation
                    ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                    : "hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400"
                }`}
                title="Translate"
                disabled={isTranslating}
              >
                {isTranslating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Languages className="w-4 h-4" />}
              </button>
            </>
          )}

          {!isAI && (
            <>
              <button
                onClick={handleTranslate}
                className={`p-1.5 rounded-lg transition-colors ${
                  showTranslation
                    ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                    : "hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400"
                }`}
                title="Translate"
                disabled={isTranslating}
              >
                {isTranslating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Languages className="w-4 h-4" />}
              </button>

              {hasCorrection && (
                <button
                  onClick={() => setShowCorrection(!showCorrection)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    showCorrection
                      ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                      : "hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400"
                  }`}
                  title="Show correction"
                >
                  <PenLine className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>

        {/* Timestamp */}
        <div className={`text-xs text-gray-400 dark:text-slate-500 mt-1 ${isAI ? "" : "text-right"}`}>
          {message.timestamp}
        </div>
      </div>
    </div>
  );
}
