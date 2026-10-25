"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type TranslationState = {
  key: string; translated: string; showTranslation: boolean;
  isTranslating: boolean; error: string | null;
};
const emptyState = (key: string): TranslationState => ({
  key, translated: "", showTranslation: false, isTranslating: false, error: null,
});
type Pending = { controller: AbortController; timer: ReturnType<typeof setTimeout>; reject: (error: Error) => void };

/**
 * Shared hook for translate-button functionality used across practice pages.
 * Uses supplied bilingual text immediately; otherwise fetches once and caches.
 * Call reset when the displayed exercise changes.
 *
 * Usage:
 *   const { displayText, isTranslating, toggle } = useTranslateText(sourceText, learningLang);
 *   <button onClick={toggle}>...</button>
 *   <span>{displayText}</span>
 */
export function useTranslateText(sourceText: string, learningLang: string, storedTranslation?: string, targetLanguage?: string) {
  const targetLang = targetLanguage || (learningLang === "fr" ? "en" : "fr");
  const key = JSON.stringify([sourceText, learningLang, storedTranslation, targetLang]);
  const [state, setState] = useState(() => emptyState(key));
  const pending = useRef<Pending | null>(null);
  const cancel = useCallback(() => {
    const request = pending.current;
    pending.current = null;
    if (!request) return;
    clearTimeout(request.timer);
    request.reject(new Error("Translation cancelled."));
    request.controller.abort();
  }, []);
  useEffect(() => {
    setState(emptyState(key));
    return cancel;
  }, [key, cancel]);
  // Do not render another question's cache, even before its effect runs.
  const current = state.key === key ? state : emptyState(key);
  const reset = useCallback(() => { cancel(); setState(emptyState(key)); }, [cancel, key]);

  const toggle = async () => {
    if (!sourceText || pending.current) return;
    if (current.showTranslation) {
      setState({ ...current, showTranslation: false, error: null });
      return;
    }
    const saved = storedTranslation?.trim() || current.translated;
    if (saved) {
      setState({ ...current, translated: saved, showTranslation: true, error: null });
      return;
    }
    const controller = new AbortController();
    let reject!: (error: Error) => void;
    const cancelled = new Promise<never>((_, fail) => { reject = fail; });
    const request: Pending = { controller, reject, timer: setTimeout(() => {
      reject(new Error("Translation timed out. Try again."));
      controller.abort();
    }, 10000) };
    pending.current = request;
    setState({ ...emptyState(key), isTranslating: true });
    try {
      const translated = await Promise.race([(async () => {
        const response = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: sourceText, source_lang: learningLang, target_lang: targetLang }),
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Translation unavailable. Try again.");
        const data = await response.json() as { translation?: unknown };
        if (typeof data.translation !== "string" || !data.translation.trim()) throw new Error("Translation unavailable. Try again.");
        return data.translation.trim();
      })(), cancelled]);
      if (pending.current === request) setState({ ...emptyState(key), translated, showTranslation: true });
    } catch (error) {
      if (pending.current === request) setState({ ...emptyState(key), error:
        error instanceof Error && error.message.includes("timed out") ? error.message : "Translation unavailable. Try again.",
      });
    } finally {
      clearTimeout(request.timer);
      if (pending.current === request) pending.current = null;
    }
  };
  return {
    displayText: current.showTranslation ? current.translated : sourceText,
    isTranslating: current.isTranslating, showTranslation: current.showTranslation,
    error: current.error, toggle, reset,
  };
}
