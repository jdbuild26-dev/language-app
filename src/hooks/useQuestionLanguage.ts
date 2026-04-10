/**
 * useQuestionLanguage
 *
 * Determines which language to show the heading/question in, based on CEFR level:
 *   A1–A2  → show in knownLang   (learner needs scaffolding)
 *   B1+    → show in learningLang (learner should understand the target language)
 *
 * The passage / options / main content is ALWAYS in learningLang — this hook
 * only governs the heading and question text.
 *
 * Usage:
 *   const { showQuestionInKnown, pickQuestion, pickHeading } = useQuestionLanguage(level);
 *
 *   pickQuestion(question_fr, question_en)  → returns the right string
 *   pickHeading(heading_fr, heading_en)     → returns the right string
 */

import { useLanguage } from "@/contexts/LanguageContext";

const BEGINNER_LEVELS = new Set(["a1", "a2"]);

function normLevel(level: string | undefined | null): string {
  return (level || "").toLowerCase().trim().replace(/\s+/g, "").substring(0, 2);
}

export function useQuestionLanguage(level?: string | null) {
  const { learningLang = "fr", knownLang = "en" } = useLanguage() as {
    learningLang?: string;
    knownLang?: string;
  };

  // A1/A2 → show question in known language (e.g. English)
  // B1+   → show question in learning language (e.g. French)
  const showQuestionInKnown = BEGINNER_LEVELS.has(normLevel(level));

  /**
   * Pick the right string for a heading or question.
   * @param learningLangText  e.g. the French version
   * @param knownLangText     e.g. the English version
   * @param fallback          optional fallback if both are empty
   */
  function pick(
    learningLangText: string | undefined | null,
    knownLangText: string | undefined | null,
    fallback = "",
  ): string {
    const primary = showQuestionInKnown ? knownLangText : learningLangText;
    const secondary = showQuestionInKnown ? learningLangText : knownLangText;
    return primary?.trim() || secondary?.trim() || fallback;
  }

  /**
   * The "other" language text — used as the translation target for the
   * translate button (always the opposite of what's currently shown).
   */
  function pickTranslation(
    learningLangText: string | undefined | null,
    knownLangText: string | undefined | null,
  ): string {
    const translation = showQuestionInKnown ? learningLangText : knownLangText;
    return translation?.trim() || "";
  }

  return {
    showQuestionInKnown,
    learningLang,
    knownLang,
    pick,
    pickTranslation,
  };
}
