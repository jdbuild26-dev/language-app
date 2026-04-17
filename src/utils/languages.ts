/**
 * Utility to map language codes to full names.
 */
export const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  fr: "French",
  de: "German",
  hi: "Hindi",
  es: "Spanish",
  it: "Italian",
  pt: "Portuguese",
  ru: "Russian",
  zh: "Chinese",
  ja: "Japanese",
  ko: "Korean",
};

/**
 * Get the full name of a language from its code.
 * Falls back to uppercase code if not found.
 */
export function getLangName(code: string): string {
  if (!code) return "Unknown Language";
  const normalized = code.toLowerCase();
  return LANGUAGE_NAMES[normalized] || code.toUpperCase();
}
