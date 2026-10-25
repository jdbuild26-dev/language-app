import { expect, it } from "vitest";
import { getStoredTranslation } from "./storedTranslation";

it("resolves stored question, speaker and prompt counterparts", () => {
  for (const field of ["prompt", "questionText", "question", "speakerText", "text"]) {
    expect(getStoredTranslation("Bonjour", { [field]: "Bonjour", [`${field}_en`]: "Hello" }))
      .toEqual({ sourceLang: "fr", translation: "Hello" });
  }
});
it("matches normalized prompts back to their original bilingual question fields", () => {
  expect(getStoredTranslation("Bonjour", { prompt: "Bonjour", questionText: "Bonjour", questionText_en: "Hello" }))
    .toEqual({ sourceLang: "fr", translation: "Hello" });
});
it("uses the displayed English source and its French counterpart", () => {
  expect(getStoredTranslation("Hello", { prompt: "Hello", prompt_fr: "Bonjour", prompt_en: "Hello" }))
    .toEqual({ sourceLang: "en", translation: "Bonjour" });
});
it("does not substitute an unrelated speaker translation for a question", () => {
  expect(getStoredTranslation("Bonjour", { prompt: "Bonjour", speakerText: "Merci", speakerText_en: "Thanks" }))
    .toEqual({ sourceLang: "fr", translation: undefined });
});
it("accepts identical stored text and trims surrounding whitespace", () => {
  expect(getStoredTranslation(" Orange ", { prompt: "Orange", prompt_en: " Orange " }).translation).toBe("Orange");
});
it("identifies English-only data for the fallback request", () => {
  expect(getStoredTranslation("Hello", { questionText_en: "Hello" }))
    .toEqual({ sourceLang: "en", translation: undefined });
});
