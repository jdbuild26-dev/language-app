import { useState, useEffect, useCallback, useRef } from "react";

// Global array to prevent garbage collection of utterances
// This is a known bug in Chrome/browsers where the utterance is GC'd while speaking
// causing the onend event to never fire and audio to cut off.
const activeUtterances = [];

export const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState([]);
  const syntaxRef = useRef(window.speechSynthesis);

  useEffect(() => {
    const updateVoices = () => {
      const availableVoices = syntaxRef.current.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
      }
    };

    updateVoices();

    // Some browsers need a little time to load voices
    if (syntaxRef.current.onvoiceschanged !== undefined) {
      syntaxRef.current.onvoiceschanged = updateVoices;
    }

    // Fallback retry if voices are empty
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
  }, []);

  const cancel = useCallback(() => {
    if (syntaxRef.current) {
      syntaxRef.current.cancel();
    }
    // Clear our strong references
    activeUtterances.length = 0;

    setIsSpeaking(false);
    setIsPaused(false);
  }, []);

  const speak = useCallback(
    (text, lang = "fr-FR", rate = 0.9, options = {}) => {
      // Cancel previous speech to avoid overlapping
      cancel();

      if (!text) return;

      const utterance = new SpeechSynthesisUtterance(text);

      // Store reference to prevent GC
      activeUtterances.push(utterance);

      // Try to find a specific voice for the language
      // If voices aren't loaded yet, try to get them again
      let currentVoices = voices;
      if (currentVoices.length === 0) {
        currentVoices = syntaxRef.current.getVoices();
      }

      const voice =
        currentVoices.find((v) => v.lang === lang) ||
        currentVoices.find((v) => v.lang.startsWith(lang.split("-")[0]));

      if (voice) {
        utterance.voice = voice;
      }

      utterance.lang = lang;
      utterance.rate = rate;

      const cleanup = () => {
        const index = activeUtterances.indexOf(utterance);
        if (index > -1) {
          activeUtterances.splice(index, 1);
        }
      };

      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
        if (options.onStart) options.onStart();
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
        cleanup();
        if (options.onEnd) options.onEnd();
      };

      utterance.onerror = (event) => {
        // Ignore interrupted errors caused by canceling previous speech
        if (event.error === "interrupted" || event.error === "canceled") {
          cleanup();
          return;
        }

        console.error("TTS Error:", event);
        setIsSpeaking(false);
        setIsPaused(false);
        cleanup();
        if (options.onError) options.onError(event);
      };

      if (options.onBoundary) {
        utterance.onboundary = options.onBoundary;
      }

      // Small delay to ensure browser is ready (helps with "cutting off" at start)
      setTimeout(() => {
        syntaxRef.current.speak(utterance);
      }, 10);
    },
    [voices, cancel],
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
    stop: cancel, // Alias for backward compatibility
    pause,
    resume,
    isSpeaking,
    isPaused,
    voices,
  };
};
