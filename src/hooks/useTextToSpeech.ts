"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// Global array to prevent garbage collection of utterances
// This is a known bug in Chrome/browsers where the utterance is GC'd while speaking
// causing the onend event to never fire and audio to cut off.
const activeUtterances: SpeechSynthesisUtterance[] = [];

// Chrome has a bug where speechSynthesis stops after ~15s.
// Keep-alive: pause+resume every 10s while speaking.
let keepAliveInterval: ReturnType<typeof setInterval> | null = null;

function startKeepAlive(synth: SpeechSynthesis) {
  stopKeepAlive();
  keepAliveInterval = setInterval(() => {
    if (synth.speaking && !synth.paused) {
      synth.pause();
      synth.resume();
    }
  }, 10000);
}

function stopKeepAlive() {
  if (keepAliveInterval !== null) {
    clearInterval(keepAliveInterval);
    keepAliveInterval = null;
  }
}

export const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const syntaxRef = useRef(typeof window !== "undefined" ? window.speechSynthesis : null);
  const requestIdRef = useRef(0);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const clearProgress = useCallback(() => {
    if (progressIntervalRef.current !== null) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!syntaxRef.current) return;

    const updateVoices = () => {
      if (!syntaxRef.current) return;
      const availableVoices = syntaxRef.current.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
      }
    };

    updateVoices();

    if (syntaxRef.current.onvoiceschanged !== undefined) {
      syntaxRef.current.onvoiceschanged = updateVoices;
    }

    const intervalId = setInterval(() => {
      if (voices.length === 0) {
        updateVoices();
      } else {
        clearInterval(intervalId);
      }
    }, 500);

    return () => {
      clearInterval(intervalId);
      cancel();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const cancel = useCallback(() => {
    requestIdRef.current += 1;
    clearProgress();
    if (syntaxRef.current) {
      syntaxRef.current.cancel();
    }
    stopKeepAlive();
    activeUtterances.length = 0;
    setIsSpeaking(false);
    setIsPaused(false);
  }, [clearProgress]);

  const speak = useCallback(
    (text: string, lang = "fr-FR", rate = 0.9, options: {
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (e: SpeechSynthesisErrorEvent) => void;
      onBoundary?: (e: SpeechSynthesisEvent) => void;
      onProgress?: (characterIndex: number, totalCharacters: number) => void;
    } = {}) => {
      if (!syntaxRef.current) return;
      const requestId = ++requestIdRef.current;
      clearProgress();

      // Cancel any previous speech
      syntaxRef.current.cancel();
      // Some engines retain the native paused flag after canceling a request.
      syntaxRef.current.resume();
      stopKeepAlive();
      activeUtterances.length = 0;

      if (!text) return;

      // Chrome bug: long text with accented chars can cut off.
      // Workaround: split on sentence boundaries and queue utterances.
      const chunks = splitIntoChunks(text);
      const totalCharacters = chunks.reduce((total, chunk) => total + chunk.length, 0);
      const chunkOffsets = chunks.map((_, index) =>
        chunks.slice(0, index).reduce((total, chunk) => total + chunk.length, 0),
      );
      const currentVoices = voices.length > 0 ? voices : syntaxRef.current.getVoices();
      const voice =
        currentVoices.find((v) => v.lang === lang) ||
        currentVoices.find((v) => v.lang.startsWith(lang.split("-")[0]));

      const speakChunk = (idx: number) => {
        if (requestIdRef.current !== requestId) return;
        if (idx >= chunks.length) {
          stopKeepAlive();
          setIsSpeaking(false);
          setIsPaused(false);
          if (options.onEnd) options.onEnd();
          return;
        }

        const utterance = new SpeechSynthesisUtterance(chunks[idx]);
        activeUtterances.push(utterance);

        if (voice) utterance.voice = voice;
        utterance.lang = lang;
        utterance.rate = rate;
        let chunkPosition = 0;

        if (options.onBoundary || options.onProgress) {
          utterance.onboundary = (event) => {
            if (requestIdRef.current !== requestId) return;
            options.onBoundary?.(event);
            chunkPosition = Math.max(chunkPosition, event.charIndex);
            options.onProgress?.(chunkOffsets[idx] + chunkPosition, totalCharacters);
          };
        }

        utterance.onstart = () => {
          if (requestIdRef.current !== requestId) return;
          setIsSpeaking(true);
          setIsPaused(false);
          if (options.onProgress) {
            clearProgress();
            let lastTick = Date.now();
            options.onProgress(chunkOffsets[idx], totalCharacters);
            // Speech voices do not consistently emit word boundaries. Interpolate
            // between events; pause with the engine and finish only on real onend.
            progressIntervalRef.current = setInterval(() => {
              const now = Date.now();
              const elapsedSeconds = (now - lastTick) / 1000;
              lastTick = now;
              if (requestIdRef.current !== requestId || syntaxRef.current?.paused) return;
              chunkPosition = Math.max(chunkPosition, Math.min(chunks[idx].length * 0.95, chunkPosition + elapsedSeconds * 14 * rate));
              options.onProgress?.(chunkOffsets[idx] + chunkPosition, totalCharacters);
            }, 100);
          }
          if (idx === 0 && options.onStart) options.onStart();
        };

        utterance.onend = () => {
          if (requestIdRef.current !== requestId) return;
          clearProgress();
          options.onProgress?.(chunkOffsets[idx] + chunks[idx].length, totalCharacters);
          const i = activeUtterances.indexOf(utterance);
          if (i > -1) activeUtterances.splice(i, 1);
          speakChunk(idx + 1);
        };

        utterance.onerror = (event) => {
          if (requestIdRef.current !== requestId) return;
          clearProgress();
          const i = activeUtterances.indexOf(utterance);
          if (i > -1) activeUtterances.splice(i, 1);
          const silentErrors = ["interrupted", "canceled", "synthesis-failed", "audio-busy"];
          if (silentErrors.includes(event.error)) {
            // If interrupted/canceled, don't continue the chain
            stopKeepAlive();
            setIsSpeaking(false);
            if (options.onError) options.onError(event);
            return;
          }
          console.warn("TTS Error:", event.error || "unknown");
          setIsSpeaking(false);
          setIsPaused(false);
          stopKeepAlive();
          if (options.onError) options.onError(event);
        };

        syntaxRef.current!.speak(utterance);
      };

      // Small delay to ensure browser is ready
      setTimeout(() => {
        if (!syntaxRef.current || requestIdRef.current !== requestId) return;
        speakChunk(0);
        startKeepAlive(syntaxRef.current);
      }, 50);
    },
    [voices, clearProgress],
  );

  const pause = useCallback(() => {
    if (syntaxRef.current && isSpeaking && !isPaused) {
      syntaxRef.current.pause();
      setIsPaused(true);
    }
  }, [isSpeaking, isPaused]);

  const resume = useCallback(() => {
    if (syntaxRef.current && isPaused) {
      syntaxRef.current.resume();
      setIsPaused(false);
    }
  }, [isPaused]);

  return {
    speak,
    cancel,
    stop: cancel,
    pause,
    resume,
    isSpeaking,
    isPaused,
    voices,
  };
};

/**
 * Split text into chunks at sentence boundaries to work around
 * Chrome's Web Speech API bug that cuts off long utterances.
 * Keeps chunks under ~200 chars.
 */
function splitIntoChunks(text: string, maxLen = 200): string[] {
  if (text.length <= maxLen) return [text];

  const chunks: string[] = [];
  // Split on sentence-ending punctuation first
  const sentences = text.split(/(?<=[.!?])\s+/);
  let current = "";

  for (const sentence of sentences) {
    if ((current + " " + sentence).trim().length <= maxLen) {
      current = current ? current + " " + sentence : sentence;
    } else {
      if (current) chunks.push(current.trim());
      // If a single sentence is still too long, split on commas
      if (sentence.length > maxLen) {
        const parts = sentence.split(/,\s*/);
        let sub = "";
        for (const part of parts) {
          if ((sub + ", " + part).length <= maxLen) {
            sub = sub ? sub + ", " + part : part;
          } else {
            if (sub) chunks.push(sub.trim());
            sub = part;
          }
        }
        if (sub) current = sub;
        else current = "";
      } else {
        current = sentence;
      }
    }
  }
  if (current) chunks.push(current.trim());
  return chunks.filter(Boolean);
}
