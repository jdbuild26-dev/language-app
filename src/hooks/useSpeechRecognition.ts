"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

// Minimal type definition for the Web Speech API (not always present in TS DOM lib)
type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function getSpeechRecognitionAPI(): (new () => SpeechRecognitionInstance) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: new () => SpeechRecognitionInstance; webkitSpeechRecognition?: new () => SpeechRecognitionInstance };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export default function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { learningLang } = useLanguage();

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const latestTranscript = useRef("");
  const listening = useRef(false);
  const stopping = useRef(false);
  const hasInterim = useRef(false);
  const captureError = useRef<string | null>(null);
  const pendingStop = useRef<{ resolve: (value: string) => void; reject: (error: Error) => void; timer: ReturnType<typeof setTimeout>; promise: Promise<string> } | null>(null);
  const finishStop = useCallback((failure?: string) => {
    if (pendingStop.current) {
      clearTimeout(pendingStop.current.timer);
      if (failure) pendingStop.current.reject(new Error(failure));
      else pendingStop.current.resolve(latestTranscript.current);
      pendingStop.current = null;
    }
  }, []);

  useEffect(() => {
    const SpeechRecognitionAPI = getSpeechRecognitionAPI();

    if (!SpeechRecognitionAPI) {
      queueMicrotask(() => setError("Speech recognition is not supported in this browser."));
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;

    // Map language code to likely locale
    const localeMap: Record<string, string> = {
      fr: "fr-FR",
      en: "en-GB",
      es: "es-ES",
      de: "de-DE",
      it: "it-IT",
      pt: "pt-PT",
      ru: "ru-RU",
      zh: "zh-CN",
      ja: "ja-JP",
      ko: "ko-KR",
    };
    recognition.lang = localeMap[learningLang] || `${learningLang}-${learningLang.toUpperCase()}`;

    recognition.onstart = () => {
      listening.current = true;
      stopping.current = false;
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event) => {
      let fullTranscript = "";
      hasInterim.current = false;
      for (let i = 0; i < event.results.length; i++) {
        const chunk = event.results[i][0].transcript;
        if (fullTranscript && chunk && !/\s$/.test(fullTranscript) && !/^\s|^[.,!?;:]/.test(chunk)) fullTranscript += " ";
        fullTranscript += chunk;
        if (!event.results[i].isFinal) hasInterim.current = true;
      }
      latestTranscript.current = fullTranscript;
      setTranscript(fullTranscript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setError(`Error: ${event.error}`);
      captureError.current = "Speech capture failed. Please record your answer again.";
      listening.current = false;
      stopping.current = false;
      setIsListening(false);
      finishStop(captureError.current);
    };

    recognition.onend = () => {
      listening.current = false;
      stopping.current = false;
      setIsListening(false);
      if (hasInterim.current && !captureError.current) {
        captureError.current = "Speech capture did not finish. Please record your answer again.";
        setError(captureError.current);
      }
      finishStop(captureError.current ?? undefined);
    };

    return () => {
      recognition.onstart = null;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      try { recognition.stop(); } catch { /* Recognition may already be stopped. */ }
      listening.current = false;
      finishStop("Speech capture was cancelled.");
    };
  }, [learningLang, finishStop]);

  const resetTranscript = useCallback(() => {
    finishStop("Speech capture was cancelled.");
    latestTranscript.current = "";
    hasInterim.current = false;
    captureError.current = null;
    setTranscript("");
  }, [finishStop]);

  const startListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (recognition && !listening.current) {
      latestTranscript.current = "";
      captureError.current = null;
      hasInterim.current = false;
      setTranscript("");
      try {
        recognition.start();
      } catch (err) {
        console.error("Failed to start recognition:", err);
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (recognition && listening.current && !stopping.current) {
      stopping.current = true;
      try { recognition.stop(); } catch {
        captureError.current = "Speech capture failed. Please record your answer again.";
        setError(captureError.current);
        finishStop(captureError.current);
      }
    }
  }, [finishStop]);

  const stopAndReadTranscript = useCallback(async (): Promise<string> => {
    const recognition = recognitionRef.current;
    if (pendingStop.current) return pendingStop.current.promise;
    if (captureError.current) throw new Error(captureError.current);
    if (!recognition || !listening.current) return latestTranscript.current;
    let resolve!: (value: string) => void;
    let reject!: (error: Error) => void;
    const promise = new Promise<string>((done, fail) => { resolve = done; reject = fail; });
    pendingStop.current = { resolve, reject, promise, timer: setTimeout(() => {
      captureError.current = "Speech capture timed out. Please record your answer again.";
      setError(captureError.current);
      finishStop(captureError.current);
    }, 10000) };
    try { if (!stopping.current) { stopping.current = true; recognition.stop(); } } catch {
      captureError.current = "Speech capture failed. Please record your answer again.";
      setError(captureError.current);
      finishStop(captureError.current);
    }
    return promise;
  }, [finishStop]);

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    resetTranscript,
    stopAndReadTranscript,
  };
}
