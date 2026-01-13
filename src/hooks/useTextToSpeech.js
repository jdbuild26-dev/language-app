import { useState, useEffect, useCallback, useRef } from "react";

export const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState([]);
  const syntaxRef = useRef(window.speechSynthesis);
  const utteranceRef = useRef(null);

  useEffect(() => {
    const updateVoices = () => {
      setVoices(syntaxRef.current.getVoices());
    };

    updateVoices();
    if (syntaxRef.current.onvoiceschanged !== undefined) {
      syntaxRef.current.onvoiceschanged = updateVoices;
    }

    return () => {
      cancel();
    };
  }, []);

  const speak = useCallback(
    (text, lang = "fr-FR", rate = 0.9) => {
      cancel();

      if (!text) return;

      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;

      // Try to find a specific voice for the language
      const voice =
        voices.find((v) => v.lang === lang) ||
        voices.find((v) => v.lang.startsWith(lang.split("-")[0]));

      if (voice) {
        utterance.voice = voice;
      }

      utterance.lang = lang;
      utterance.rate = rate; // Slightly slower than default for learning

      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };

      utterance.onerror = (event) => {
        console.error("TTS Error:", event);
        setIsSpeaking(false);
        setIsPaused(false);
      };

      syntaxRef.current.speak(utterance);
    },
    [voices]
  );

  const cancel = useCallback(() => {
    if (syntaxRef.current) {
      syntaxRef.current.cancel();
    }
    setIsSpeaking(false);
    setIsPaused(false);
  }, []);

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
    pause,
    resume,
    isSpeaking,
    isPaused,
    voices,
  };
};
