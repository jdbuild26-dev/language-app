"use client";

import { useState } from "react";

/**
 * Shared hook for translate-button functionality used across practice pages.
 * Fetches once, caches, toggles on repeat clicks, and resets when `resetKey` changes.
 *
 * Usage:
 *   const { displayText, isTranslating, toggle } = useTranslateText(sourceText, learningLang);
 *   <button onClick={toggle}>...</button>
 *   <span>{displayText}</span>
 */
export function useTranslateText(sourceText: string, learningLang: string) {
  const [translated, setTranslated] = useState("");
  const [showTranslation, setShowTranslation] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  const targetLang = learningLang === "fr" ? "en" : "fr";

  const toggle = async () => {
    if (!sourceText) return;

    if (showTranslation) {
      setShowTranslation(false);
      return;
    }

    if (translated) {
      setShowTranslation(true);
      return;
    }

    try {
      setIsTranslating(true);
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: sourceText, target_lang: targetLang }),
      });
      if (!res.ok) throw new Error("Translation failed");
      const data = (await res.json()) as { translation?: string };
      setTranslated(data.translation || "");
      setShowTranslation(true);
    } catch {
      setTranslated("");
      setShowTranslation(false);
    } finally {
      setIsTranslating(false);
    }
  };

  const reset = () => {
    setTranslated("");
    setShowTranslation(false);
    setIsTranslating(false);
  };

  const displayText = showTranslation && translated ? translated : sourceText;

  return { displayText, isTranslating, showTranslation, toggle, reset };
}
