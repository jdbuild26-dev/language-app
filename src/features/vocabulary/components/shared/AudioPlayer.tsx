"use client";

import React, { useState } from "react";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { Volume2, Turtle, Pause, Play } from "lucide-react";
import ListeningPlaybackButton from "@/components/ui/ListeningPlaybackButton";
import { cn } from "@/lib/utils";

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
  appearance = "vocabulary",
  controlSize = "default" as "default" | "large",
  externalPlaying = false,
  pausable = false,
}) {
  const { speak, pause, resume, isSpeaking, isPaused } = useTextToSpeech();
  const [playbackMode, setPlaybackMode] = useState<"normal" | "slow" | null>(null);
  const normalPlaying = (isSpeaking && !isPaused && playbackMode === "normal") || (externalPlaying && playbackMode === null);
  const slowPlaying = isSpeaking && !isPaused && playbackMode === "slow";

  const playbackState = pausable && isSpeaking ? (isPaused ? "paused" : "playing") : undefined;
  const normalLabel = playbackState === "paused" ? "Resume audio" : playbackState === "playing" ? "Pause audio" : "Play audio";
  const NormalIcon = playbackState === "paused" ? Play : playbackState === "playing" ? Pause : Volume2;

  const handlePlayNormal = () => {
    if (pausable && isSpeaking) {
      if (isPaused) resume();
      else pause();
      return;
    }
    setPlaybackMode("normal");
    speak(text, lang, 1.0);
  };

  const handlePlaySlow = () => {
    setPlaybackMode("slow");
    speak(text, lang, 0.75); // Slower rate for "turtle" mode
  };

  if (appearance === "main-practice") {
    return (
      <div className={`flex items-center gap-4 ${className}`}>
        <ListeningPlaybackButton mode="normal" size={controlSize} label={pausable ? normalLabel : "Play audio at normal speed"} playbackState={playbackState} onClick={handlePlayNormal} active={normalPlaying} />
        {showTurtle && <ListeningPlaybackButton mode="slow" size={controlSize} label="Play audio slowly" onClick={handlePlaySlow} active={slowPlaying} />}
      </div>
    );
  }

  return (
      <div className={cn("relative flex items-center justify-center gap-4 sm:gap-5", className)}>
        <button
          type="button"
          onClick={handlePlayNormal}
          aria-label={normalLabel}
          aria-pressed={normalPlaying}
          className={cn(
            "flex h-24 w-24 shrink-0 items-center justify-center rounded-full shadow-sm transition-[transform,box-shadow,background-color] hover:scale-[1.03] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-300",
            normalPlaying
              ? "bg-rose-100 text-rose-600 ring-4 ring-rose-200 shadow-lg"
              : "bg-gradient-to-br from-rose-300 to-rose-400 text-white",
          )}
        >
          <NormalIcon className={cn("h-11 w-11", normalPlaying && "motion-safe:animate-pulse")} aria-hidden="true" />
        </button>
        {showTurtle && (
          <button
            type="button"
            onClick={handlePlaySlow}
            aria-label="Play audio slowly"
            aria-pressed={slowPlaying}
            className={cn(
              "flex h-14 w-14 shrink-0 items-center justify-center rounded-full shadow-sm transition-[transform,box-shadow,background-color] hover:scale-[1.03] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-300",
              slowPlaying
                ? "bg-rose-100 text-rose-600 ring-4 ring-rose-200 shadow-lg"
                : "bg-gradient-to-br from-rose-300 to-rose-400 text-white",
            )}
          >
            <Turtle className={cn("h-7 w-7", slowPlaying && "motion-safe:animate-pulse")} aria-hidden="true" />
          </button>
        )}
      </div>
  );
}
