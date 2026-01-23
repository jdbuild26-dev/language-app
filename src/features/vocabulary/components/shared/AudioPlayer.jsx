import React from "react";
import { useTextToSpeech } from "../../../../hooks/useTextToSpeech";
import { Volume2 } from "lucide-react";

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
          w-24 h-24 md:w-32 md:h-32 rounded-3xl flex items-center justify-center shadow-lg transition-all transform active:scale-95
          ${
            isSpeaking
              ? "bg-blue-100 text-blue-600 ring-4 ring-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:ring-blue-800"
              : "bg-sky-400 hover:bg-sky-500 text-white dark:bg-sky-600 dark:hover:bg-sky-500"
          }
        `}
        title="Play Audio"
      >
        <Volume2
          className={`w-10 h-10 md:w-14 md:h-14 ${isSpeaking ? "animate-pulse" : ""}`}
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
          {/* Turtle Icon SVG */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-6 h-6 md:w-7 md:h-7"
          >
            <path d="M12 10a6 6 0 0 0-6 6h12a6 6 0 0 0-6-6Z" />
            <path d="M6.168 16c.157 2.275 2.505 4.07 5.832 4.07s5.675-1.795 5.832-4.07" />
            <path d="m11 20-.996 1.157a2 2 0 0 0 1.992 0l-.996-1.157Z" />
            <path d="M17.5 13.5c1.1-1.1 2.25-1 3.5-1 1.104 0 2 .896 2 2s-2 2.5-2 2.5v2.5h-2c-1 0-1.25-.75-1.5-1.5" />
            <path d="M6.5 13.5c-1.1-1.1-2.25-1-3.5-1-1.104 0-2 .896-2 2s2 2.5 2 2.5v2.5h2c1 0 1.25-.75 1.5-1.5" />
            <path d="M12 10V6.5a2.5 2.5 0 0 1 5 0v3.5" />
          </svg>
        </button>
      )}
    </div>
  );
}
