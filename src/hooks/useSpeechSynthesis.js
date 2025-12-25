import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Custom hook for Web Speech API Text-to-Speech functionality.
 * Provides French pronunciation for language learning.
 *
 * @returns {Object} TTS controls and state
 */
export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState([]);
  const [frenchVoice, setFrenchVoice] = useState(null);
  const utteranceRef = useRef(null);

  // Check browser support and load voices
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      setIsSupported(true);

      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);

        // Find the best French voice
        // Priority: fr-FR > fr-CA > any fr-* voice
        const frFR = availableVoices.find((v) => v.lang === "fr-FR");
        const frCA = availableVoices.find((v) => v.lang === "fr-CA");
        const anyFrench = availableVoices.find((v) => v.lang.startsWith("fr"));

        setFrenchVoice(frFR || frCA || anyFrench || null);
      };

      // Load voices immediately if available
      loadVoices();

      // Chrome loads voices asynchronously
      window.speechSynthesis.onvoiceschanged = loadVoices;

      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);

  /**
   * Speak the given text
   * @param {string} text - Text to speak
   * @param {string} lang - Language code (default: 'fr-FR')
   */
  const speak = useCallback(
    (text, lang = "fr-FR") => {
      if (!isSupported || !text) return;

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.85; // Slightly slower for learning
      utterance.pitch = 1;
      utterance.volume = 1;

      // Use French voice if available
      if (frenchVoice && lang.startsWith("fr")) {
        utterance.voice = frenchVoice;
      }

      // Event handlers
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event.error);
        setIsSpeaking(false);
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [isSupported, frenchVoice]
  );

  /**
   * Stop any ongoing speech
   */
  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isSupported]);

  return {
    speak,
    stop,
    isSpeaking,
    isSupported,
    voices,
    frenchVoice,
  };
}

export default useSpeechSynthesis;
