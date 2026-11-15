/** Resolve the counterpart of the displayed text, never a different prompt in the exchange. */
export function getStoredTranslation(text: string, value: unknown, fallbackLang = "fr") {
  const record = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const clean = (value: unknown) => typeof value === "string" ? value.trim() : "";
  const displayed = text.trim();
  for (const field of ["prompt", "questionText", "question", "speakerText", "text"]) {
    const generic = clean(record[field]);
    const fr = clean(record[`${field}_fr`]) || (fallbackLang === "fr" ? generic : "");
    const en = clean(record[`${field}_en`]) || (fallbackLang === "en" ? generic : "");
    if (displayed && displayed === fr && en) return { sourceLang: "fr", translation: en };
    if (displayed && displayed === en && fr) return { sourceLang: "en", translation: fr };
  }
  // Even without a counterpart, use the actual stored source language for the fallback request.
  for (const field of ["prompt", "questionText", "question", "speakerText", "text"]) {
    for (const language of ["fr", "en"]) {
      if (displayed && displayed === clean(record[`${field}_${language}`])) {
        return { sourceLang: language, translation: undefined };
      }
    }
  }
  return { sourceLang: fallbackLang, translation: undefined };
}
