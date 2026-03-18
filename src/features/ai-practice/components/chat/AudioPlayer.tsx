"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, Volume2 } from "lucide-react";

const SPEED_OPTIONS = ["0.5x", "0.7x", "0.8x", "1x"];

/** Returns a promise that resolves once voices are available. */
function waitForVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) return resolve(voices);
    window.speechSynthesis.addEventListener("voiceschanged", () => {
      resolve(window.speechSynthesis.getVoices());
    }, { once: true });
  });
}

export default function AudioPlayer({ text, autoPlay = false }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState("1x");
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const currentSpeedRef = useRef("1x");

  // Keep ref in sync so playAudio always uses latest speed
  useEffect(() => { currentSpeedRef.current = speed; }, [speed]);

  useEffect(() => {
    if (autoPlay && text) playAudio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, text]);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    };
  }, [text]);

  const playAudio = async () => {
    window.speechSynthesis.cancel();

    // Wait for voices so the engine is ready
    await waitForVoices();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "fr-FR";
    utterance.rate = parseFloat(currentSpeedRef.current.replace("x", ""));

    // Pick a French voice if available
    const voices = window.speechSynthesis.getVoices();
    const frVoice = voices.find((v) => v.lang.startsWith("fr"));
    if (frVoice) utterance.voice = frVoice;

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = (event) => {
      // "interrupted" fires when cancel() is called — not a real error
      if (event.error !== "interrupted" && event.error !== "canceled") {
        console.warn("Speech synthesis error:", event.error);
      }
      setIsPlaying(false);
    };

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      playAudio();
    }
  };

  const handleSpeedChange = (newSpeed: string) => {
    setSpeed(newSpeed);
    currentSpeedRef.current = newSpeed;
    setShowSpeedMenu(false);
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={togglePlay}
        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
        title={isPlaying ? "Stop" : "Play"}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 text-sky-500" />
        ) : (
          <Play className="w-4 h-4 text-gray-500 dark:text-slate-400" />
        )}
      </button>

      <div className="relative">
        <button
          onClick={() => setShowSpeedMenu(!showSpeedMenu)}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          title="Playback speed"
        >
          <Volume2 className="w-3.5 h-3.5" />
          {speed}
        </button>

        {showSpeedMenu && (
          <div className="absolute bottom-full left-0 mb-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 py-1 min-w-[60px] z-20">
            {SPEED_OPTIONS.map((option) => (
              <button
                key={option}
                onClick={() => handleSpeedChange(option)}
                className={`w-full px-3 py-1.5 text-xs text-left hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors ${
                  speed === option
                    ? "text-sky-500 font-semibold"
                    : "text-gray-600 dark:text-slate-300"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
