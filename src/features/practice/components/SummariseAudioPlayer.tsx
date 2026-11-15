"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Turtle } from "lucide-react";
import AudioWaveform from "../../../components/ui/AudioWaveform";
import { useTextToSpeech } from "../../../hooks/useTextToSpeech";
import { cn } from "../../../lib/utils";

export default function SummariseAudioPlayer({ text, lang, disabled = false }: { text: string; lang: string; disabled?: boolean }) {
  const { speak, cancel, isSpeaking } = useTextToSpeech();
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);
  const [starting, setStarting] = useState(false);
  const [paused, setPaused] = useState(false);
  const [rate, setRate] = useState(0.9);
  const [playbackError, setPlaybackError] = useState("");
  const isPlaying = !disabled && (starting || (isSpeaking && !paused));
  const setPosition = (position: number) => {
    progressRef.current = Math.max(0, Math.min(100, position));
    setProgress(progressRef.current);
  };

  useEffect(() => {
    cancel();
    setPosition(0);
    // Reset the UI alongside cancellation of the external speech engine.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStarting(false);
    setPaused(false);
    setRate(0.9);
    setPlaybackError("");
  }, [text, lang, cancel]);

  useEffect(() => {
    if (disabled) {
      cancel();
      // Submission stops the external speech engine and its pending start state.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStarting(false);
      setPaused(false);
    }
  }, [disabled, cancel]);

  const startAudio = (speed = rate, position = progressRef.current) => {
    if (disabled || !text) return;
    if (!window.speechSynthesis) {
      setPlaybackError("Audio playback is unavailable on this device.");
      return;
    }
    const requested = Math.floor((Math.max(0, Math.min(100, position)) / 100) * text.length);
    const insideWord = requested > 0 && /\S/.test(text[requested] || "") && /\S/.test(text[requested - 1]);
    const nextSpace = insideWord ? text.slice(requested).search(/\s/) : 0;
    const wordEnd = nextSpace < 0 ? text.length : requested + nextSpace;
    const nextWord = text.slice(wordEnd).search(/\S/);
    const offset = nextWord < 0 ? text.length : wordEnd + nextWord;
    if (offset >= text.length) {
      cancel();
      setStarting(false);
      setPaused(false);
      setPosition(100);
      return;
    }
    setPosition((offset / text.length) * 100);
    setPlaybackError("");
    setPaused(false);
    setStarting(true);
    speak(text.slice(offset), lang, speed, {
      onStart: () => setStarting(false),
      onProgress: (index, total) => setPosition(Math.min(99, ((offset + (index / Math.max(1, total)) * (text.length - offset)) / text.length) * 100)),
      onEnd: () => { setStarting(false); setPaused(false); setPosition(100); },
      onError: () => { setStarting(false); setPaused(false); setPlaybackError("Audio playback failed. Please try again."); },
    });
  };

  const togglePlayback = () => {
    if (isPlaying) {
      // Invalidate queued chunks and keep-alive work; native pause can restart speech.
      cancel();
      setStarting(false);
      setPaused(true);
    } else {
      startAudio(rate, progressRef.current >= 100 ? 0 : progressRef.current);
    }
  };
  const toggleSlow = () => {
    const nextRate = rate === 0.55 ? 0.9 : 0.55;
    setRate(nextRate);
    if (isPlaying) startAudio(nextRate);
  };
  const smallButton = "flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600 transition-colors hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-rose-900/30 dark:text-rose-300 dark:hover:bg-rose-900/50";

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div className="flex items-center justify-center gap-3 sm:gap-5">
        <button type="button" disabled={disabled || !text} onClick={() => startAudio(rate, 0)} aria-label="Replay passage" title="Replay" className={smallButton}>
          <RotateCcw className="h-5 w-5" aria-hidden="true" />
        </button>
        <button type="button" disabled={disabled || !text} onClick={togglePlayback} aria-label={isPlaying ? "Pause passage" : paused ? "Resume passage" : "Play passage"} title={isPlaying ? "Pause" : paused ? "Resume" : "Play"} className="flex h-20 w-20 items-center justify-center rounded-full bg-rose-500 text-white shadow-md transition-transform hover:scale-105 hover:bg-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-50">
          {isPlaying ? <Pause className="h-9 w-9" aria-hidden="true" /> : <Play className="h-9 w-9" aria-hidden="true" />}
        </button>
        <button type="button" disabled={disabled || !text} onClick={toggleSlow} aria-label="Slow playback" aria-pressed={rate === 0.55} title={rate === 0.55 ? "Switch to normal speed" : "Switch to slow speed"} className={cn(smallButton, rate === 0.55 && "bg-rose-600 text-white hover:bg-rose-700 dark:bg-rose-600 dark:text-white dark:hover:bg-rose-700")}>
          <Turtle className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>
      <div className="flex w-full items-center rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5 dark:border-slate-700 dark:bg-slate-900">
        <AudioWaveform tone="rose" progress={progress} isPlaying={isPlaying} showSeekHandle className={cn("focus-within:!outline-rose-500", disabled && "pointer-events-none opacity-60")} onSeek={position => {
          if (disabled) return;
          cancel();
          setStarting(false);
          setPaused(false);
          setPosition(position);
        }} />
      </div>
      {playbackError && <p role="status" className="text-base text-red-600 dark:text-red-400">{playbackError}</p>}
    </div>
  );
}
