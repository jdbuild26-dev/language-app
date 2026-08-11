import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StoryDisplayData } from "../types";

const audioSpeeds = [0.75, 1, 1.25, 1.5, 2];

function formatAudioTime(seconds: number) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function estimateAudioDuration(text: string | undefined, speed: number) {
  if (!text) return 0;
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(2, (wordCount * 0.48) / speed);
}

export function useStoryAudio(story: StoryDisplayData | null, activeNoteId: number | undefined) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioIndex, setAudioIndex] = useState(0);
  const [activeAudioLineIndex, setActiveAudioLineIndex] = useState<number | null>(null);
  const [audioElapsed, setAudioElapsed] = useState(0);
  const [isSequencePlaying, setIsSequencePlaying] = useState(false);
  const [autoAdvanceFromIndex, setAutoAdvanceFromIndex] = useState<number | null>(null);
  const [speedIndex, setSpeedIndex] = useState(1);

  const audioTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioStartedAtRef = useRef(0);
  const audioDurationRef = useRef(0);
  const isStoppingAudioRef = useRef(false);

  const currentSpeed = audioSpeeds[speedIndex];
  const audioLines = useMemo(
    () => story?.lines.map((line, lineIndex) => ({ ...line, lineIndex })).filter((line) => line.text) ?? [],
    [story],
  );
  const audioText = audioLines.length > 0 ? audioLines[audioIndex]?.text : story?.monologue;
  const audioDurations = useMemo(
    () => audioLines.map((line) => estimateAudioDuration(line.text, currentSpeed)),
    [audioLines, currentSpeed],
  );
  const monologueDuration = useMemo(() => estimateAudioDuration(story?.monologue, currentSpeed), [story?.monologue, currentSpeed]);
  const totalAudioDuration = audioDurations.length > 0 ? audioDurations.reduce((sum, duration) => sum + duration, 0) : monologueDuration;
  const elapsedBeforeCurrentLine = audioDurations.slice(0, audioIndex).reduce((sum, duration) => sum + duration, 0);
  const totalAudioElapsed = audioDurations.length > 0 ? Math.min(totalAudioDuration, elapsedBeforeCurrentLine + audioElapsed) : Math.min(totalAudioDuration, audioElapsed);
  const progress = totalAudioDuration > 0 ? Math.min(100, (totalAudioElapsed / totalAudioDuration) * 100) : 0;

  const clearAudioTimer = useCallback(() => {
    if (audioTimerRef.current) {
      clearInterval(audioTimerRef.current);
      audioTimerRef.current = null;
    }
  }, []);

  const speakAudio = useCallback((text: string | undefined, lineIndex: number | null = null, advanceFromIndex: number | null = null) => {
    if (!text || typeof window === "undefined" || !window.speechSynthesis) return;
    clearAudioTimer();
    isStoppingAudioRef.current = true;
    window.speechSynthesis.cancel();
    isStoppingAudioRef.current = false;

    const utterance = new SpeechSynthesisUtterance(text);
    const duration = estimateAudioDuration(text, currentSpeed);
    utterance.lang = "fr-FR";
    utterance.rate = currentSpeed;
    audioDurationRef.current = duration;
    audioStartedAtRef.current = Date.now();
    utterance.onend = () => {
      clearAudioTimer();
      if (isStoppingAudioRef.current) {
        isStoppingAudioRef.current = false;
        return;
      }
      setAudioElapsed(duration);
      if (advanceFromIndex !== null) {
        setAutoAdvanceFromIndex(advanceFromIndex);
        return;
      }
      setIsPlaying(false);
      setIsSequencePlaying(false);
      setActiveAudioLineIndex(null);
    };
    utterance.onerror = () => {
      clearAudioTimer();
      setIsPlaying(false);
      setIsSequencePlaying(false);
      setActiveAudioLineIndex(null);
    };

    window.speechSynthesis.speak(utterance);
    setAudioElapsed(0);
    setActiveAudioLineIndex(lineIndex);
    setIsPlaying(true);
    audioTimerRef.current = setInterval(() => {
      const elapsed = (Date.now() - audioStartedAtRef.current) / 1000;
      setAudioElapsed(Math.min(audioDurationRef.current, elapsed));
    }, 200);
  }, [clearAudioTimer, currentSpeed]);

  const stopAudio = useCallback((resetElapsed = true) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    isStoppingAudioRef.current = true;
    window.speechSynthesis.cancel();
    clearAudioTimer();
    setIsPlaying(false);
    setIsSequencePlaying(false);
    setAutoAdvanceFromIndex(null);
    setActiveAudioLineIndex(null);
    if (resetElapsed) setAudioElapsed(0);
  }, [clearAudioTimer]);

  const handlePlayPause = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (isPlaying) {
      stopAudio(false);
      return;
    }
    setIsSequencePlaying(audioLines.length > 0);
    speakAudio(audioText, audioLines.length > 0 ? audioLines[audioIndex]?.lineIndex ?? null : null, audioLines.length > 0 ? audioIndex : null);
  }, [audioIndex, audioLines, audioText, isPlaying, speakAudio, stopAudio]);

  const playFromStart = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    setAudioIndex(0);
    setAudioElapsed(0);
    setAutoAdvanceFromIndex(null);

    if (audioLines.length === 0) {
      setIsSequencePlaying(false);
      speakAudio(story?.monologue);
      return;
    }

    setIsSequencePlaying(true);
    speakAudio(audioLines[0]?.text, audioLines[0]?.lineIndex ?? null, 0);
  }, [audioLines, speakAudio, story?.monologue]);

  const handleAudioStep = useCallback((direction: -1 | 1) => {
    if (audioLines.length === 0) {
      setIsSequencePlaying(false);
      speakAudio(story?.monologue);
      return;
    }
    const nextIndex = Math.min(Math.max(audioIndex + direction, 0), audioLines.length - 1);
    setAudioIndex(nextIndex);
    setIsSequencePlaying(true);
    speakAudio(audioLines[nextIndex]?.text, audioLines[nextIndex]?.lineIndex ?? null, nextIndex);
  }, [audioIndex, audioLines, speakAudio, story?.monologue]);

  const handleSpeakLine = useCallback((index: number, text: string) => {
    const nextAudioIndex = audioLines.findIndex((line) => line.lineIndex === index);
    if (nextAudioIndex !== -1) setAudioIndex(nextAudioIndex);
    setIsSequencePlaying(false);
    speakAudio(text, index);
  }, [audioLines, speakAudio]);

  const seekAudio = useCallback((percentage: number) => {
    if (totalAudioDuration <= 0) return;
    const targetElapsed = Math.min(totalAudioDuration, Math.max(0, (percentage / 100) * totalAudioDuration));
    if (audioLines.length === 0) {
      setAudioElapsed(targetElapsed);
      return;
    }

    let accumulated = 0;
    let targetIndex = audioLines.length - 1;
    for (let index = 0; index < audioDurations.length; index += 1) {
      if (targetElapsed <= accumulated + audioDurations[index]) {
        targetIndex = index;
        break;
      }
      accumulated += audioDurations[index];
    }

    const wasPlaying = isPlaying;
    const wasSequencePlaying = isSequencePlaying;
    const targetLine = audioLines[targetIndex];
    setAudioIndex(targetIndex);
    setAudioElapsed(Math.max(0, targetElapsed - accumulated));
    if (wasPlaying && targetLine?.text) {
      speakAudio(targetLine.text, targetLine.lineIndex, wasSequencePlaying ? targetIndex : null);
    } else {
      stopAudio(false);
      setAudioIndex(targetIndex);
      setAudioElapsed(Math.max(0, targetElapsed - accumulated));
    }
  }, [audioDurations, audioLines, isPlaying, isSequencePlaying, speakAudio, stopAudio, totalAudioDuration]);

  useEffect(() => {
    if (autoAdvanceFromIndex === null) return;
    setAutoAdvanceFromIndex(null);
    if (!isSequencePlaying) return;
    const nextIndex = autoAdvanceFromIndex + 1;
    if (nextIndex >= audioLines.length) {
      setIsPlaying(false);
      setIsSequencePlaying(false);
      setActiveAudioLineIndex(null);
      return;
    }
    setAudioIndex(nextIndex);
    speakAudio(audioLines[nextIndex]?.text, audioLines[nextIndex]?.lineIndex ?? null, nextIndex);
  }, [audioLines, autoAdvanceFromIndex, isSequencePlaying, speakAudio]);

  useEffect(() => {
    setAudioIndex(0);
    setAudioElapsed(0);
    stopAudio();
  }, [activeNoteId, stopAudio]);

  useEffect(() => () => {
    stopAudio();
  }, [stopAudio]);

  return {
    activeAudioLineIndex,
    durationTime: formatAudioTime(totalAudioDuration),
    elapsedTime: formatAudioTime(totalAudioElapsed),
    handleAudioStep,
    handlePlayPause,
    handleSpeakLine,
    playFromStart,
    seekAudio,
    isPlaying,
    progress,
    setSpeedIndex,
    speed: currentSpeed,
    speedCount: audioSpeeds.length,
  };
}
