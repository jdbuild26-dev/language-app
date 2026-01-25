import React from "react";
import { useTextToSpeech } from "../../../../hooks/useTextToSpeech";
import { Volume2, Turtle } from "lucide-react";

/**
 * Reusable AudioPlayer component with standard and slow playback options.
 * @param {string} text - The text to speak.
 * @param {string} className - Optional container class names.
 * @param {string} lang - Language code (default: "fr-FR").
 * @param {boolean} showTurtle - Whether to show the slow playback button (default: true).
 */
export default function AudioPlayer({
  text,
  className = "",
  lang = "fr-FR",
  showTurtle = true,
}) {
  const { speak, isSpeaking } = useTextToSpeech();

  const handlePlayNormal = () => {
    speak(text, lang, 0.9);
  };

  const handlePlaySlow = () => {
    speak(text, lang, 0.5); // Slower rate for "turtle" mode
  };

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* Main Volume Button - Increased size as per user request */}
      <button
        onClick={handlePlayNormal}
        className={`
          w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center shadow-lg transition-all transform active:scale-95
          ${
            isSpeaking
              ? "bg-blue-100 text-blue-600 ring-4 ring-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:ring-blue-800"
              : "bg-sky-400 hover:bg-sky-500 text-white dark:bg-sky-600 dark:hover:bg-sky-500"
          }
        `}
        title="Play Audio"
      >
        <Volume2
          className={`w-8 h-8 md:w-10 md:h-10 ${isSpeaking ? "animate-pulse" : ""}`}
        />
      </button>

      {/* Turtle Button (Slow Mode) */}
      {showTurtle && (
        <button
          onClick={handlePlaySlow}
          className="
            w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center shadow-md transition-all transform active:scale-95
            bg-sky-500 hover:bg-sky-600 text-white dark:bg-sky-600 dark:hover:bg-sky-500
          "
          title="Slow Playback"
        >
          <Turtle className="w-6 h-6 md:w-7 md:h-7" />
        </button>
      )}
    </div>
  );
}
