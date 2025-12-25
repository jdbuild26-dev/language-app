import { useState } from "react";
import { Languages, Shuffle, Check } from "lucide-react";
import AudioPlayer from "./AudioPlayer";

export default function MessageBubble({ message }) {
  const [showTranslation, setShowTranslation] = useState(false);
  const [showAlternatives, setShowAlternatives] = useState(false);

  const isAI = message.sender === "ai";

  return (
    <div className={`flex ${isAI ? "justify-start" : "justify-end"} mb-4`}>
      <div className={`max-w-[80%] ${isAI ? "order-1" : "order-1"}`}>
        {/* Grammar Correction (only for AI messages responding to user errors) */}
        {isAI && message.correction && (
          <div className="mb-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <Check className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                Correction
              </span>
            </div>
            <p className="text-sm text-amber-800 dark:text-amber-300">
              {message.correction}
            </p>
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={`rounded-2xl px-4 py-3 ${
            isAI
              ? "bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white rounded-tl-sm"
              : "bg-sky-500 text-white rounded-tr-sm"
          }`}
        >
          <p className="text-sm leading-relaxed">{message.text}</p>
        </div>

        {/* Translation (toggleable) */}
        {showTranslation && message.translation && (
          <div className="mt-2 p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl">
            <p className="text-sm text-indigo-700 dark:text-indigo-300">
              {message.translation}
            </p>
          </div>
        )}

        {/* Alternatives (toggleable, for user messages) */}
        {!isAI && showAlternatives && message.alternatives && (
          <div className="mt-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-2">
            <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-2">
              Alternative ways to say this:
            </div>
            {message.alternatives.map((alt, index) => (
              <div
                key={index}
                className="text-sm text-emerald-800 dark:text-emerald-300"
              >
                {index + 1}. {alt}
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div
          className={`flex items-center gap-2 mt-2 ${
            isAI ? "" : "justify-end"
          }`}
        >
          {/* AI Messages: Audio + Translate */}
          {isAI && (
            <>
              <AudioPlayer />
              <button
                onClick={() => setShowTranslation(!showTranslation)}
                className={`p-1.5 rounded-lg transition-colors ${
                  showTranslation
                    ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                    : "hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400"
                }`}
                title="Translate"
              >
                <Languages className="w-4 h-4" />
              </button>
            </>
          )}

          {/* User Messages: Translate + Alternatives */}
          {!isAI && (
            <>
              <button
                onClick={() => setShowTranslation(!showTranslation)}
                className={`p-1.5 rounded-lg transition-colors ${
                  showTranslation
                    ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                    : "hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400"
                }`}
                title="Translate"
              >
                <Languages className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowAlternatives(!showAlternatives)}
                className={`p-1.5 rounded-lg transition-colors ${
                  showAlternatives
                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                    : "hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400"
                }`}
                title="Alternative phrasings"
              >
                <Shuffle className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Timestamp */}
        <div
          className={`text-xs text-gray-400 dark:text-slate-500 mt-1 ${
            isAI ? "" : "text-right"
          }`}
        >
          {message.timestamp}
        </div>
      </div>
    </div>
  );
}
