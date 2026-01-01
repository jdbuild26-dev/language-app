import { useState } from "react";
import { Languages, Shuffle, Check, Loader2 } from "lucide-react";
import AudioPlayer from "./AudioPlayer";
import { translateText } from "../../../../services/aiPracticeApi";

export default function MessageBubble({ message }) {
  const [showTranslation, setShowTranslation] = useState(false);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [translation, setTranslation] = useState(message.translation || null);
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = async () => {
    if (showTranslation) {
      setShowTranslation(false);
      return;
    }

    if (translation) {
      setShowTranslation(true);
      return;
    }

    try {
      setIsTranslating(true);
      const result = await translateText(message.text);
      setTranslation(result.translation);
      setShowTranslation(true);
    } catch (error) {
      console.error("Translation failed:", error);
      setTranslation("Translation unavailable. Please try again.");
      setShowTranslation(true);
    } finally {
      setIsTranslating(false);
    }
  };

  const isAI = message.sender === "ai";

  return (
    <div className={`flex ${isAI ? "justify-start" : "justify-end"} mb-4`}>
      <div className={`max-w-[80%] ${isAI ? "order-1" : "order-1"}`}>
        {/* Message Bubble */}
        <div
          className={`rounded-2xl px-4 py-3 ${
            isAI
              ? "bg-sky-50 dark:bg-sky-900/20 text-sky-800 dark:text-sky-100 rounded-tl-sm"
              : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200 rounded-tr-sm"
          }`}
        >
          <p className="text-sm leading-relaxed">{message.text}</p>

          {/* Correction (inside bubble for user messages) */}
          {!isAI && message.correction && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-700">
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 mt-0.5" />
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                  {message.correction}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Translation (toggleable) */}
        {showTranslation && translation && (
          <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
            <p className="text-sm text-amber-800 dark:text-amber-300">
              {translation}
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
                {isTranslating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Languages className="w-4 h-4" />
                )}
              </button>
            </>
          )}

          {/* User Messages: Translate + Alternatives */}
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
                {isTranslating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Languages className="w-4 h-4" />
                )}
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
