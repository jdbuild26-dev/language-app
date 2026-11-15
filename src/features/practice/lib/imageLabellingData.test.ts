import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import Papa from "papaparse";
import { findImageLabelTranslation, getImageLabellingQuestionView, readImageLabellingExercise } from "./imageLabellingData";

describe("Image Labelling question translation", () => {
  it("translates the built-in question when an older exercise has no question fields", () => {
    const exercise = readImageLabellingExercise({
      learning_lang: "fr",
      items: [{ id: 1, name_fr: "arbre", name_en: "tree" }],
    }, "fr", "en");
    const questions = Object.fromEntries(Object.entries(exercise.localized).map(([code, locale]) => [code, locale.question]));
    const original = getImageLabellingQuestionView(questions, "fr", "en", true, false);
    const translated = getImageLabellingQuestionView(questions, "fr", "en", true, true);
    expect(original).toMatchObject({ question: "Match each number with the correct label.", canTranslate: true });
    expect(translated).toMatchObject({ question: "Associez chaque numéro à la bonne étiquette.", translated: true });
  });

  it("translates a stored standard English question when its French field is missing", () => {
    expect(getImageLabellingQuestionView(
      { en: "Match each number with the correct label.", fr: "" }, "fr", "en", true, true,
    )).toMatchObject({ question: "Associez chaque numéro à la bonne étiquette.", canTranslate: true });
  });

  it("does not offer a button when only one custom question exists", () => {
    expect(getImageLabellingQuestionView({ fr: "Nommez les objets", en: "" }, "fr", "en", true, false))
      .toMatchObject({ question: "Nommez les objets", canTranslate: false });
  });

  it("switches a future language pair only when both questions are supplied", () => {
    const questions = { de: "Ordne die Zahlen zu", es: "Relaciona los números" };
    expect(getImageLabellingQuestionView(questions, "de", "es", true, true))
      .toMatchObject({ question: questions.de, canTranslate: true, translated: true });
  });
});

describe("readImageLabellingExercise", () => {
  it("looks up a saved distractor before the display options are shuffled", () => {
    const { items } = readImageLabellingExercise({ items: [{
      id: 1, name_fr: "clé", name_en: "key",
      options_by_lang: { fr: ["clé", "télévision", "montre", "sac"], en: ["key", "television", "watch", "bag"] },
    }] }, "fr", "en");
    expect(findImageLabelTranslation("télévision", items, "fr", "en", items[0])).toBe("television");
  });
  it("uses the stored question and each row's correct answer plus three distractors", () => {
    const exercise = readImageLabellingExercise({
      learning_lang: "fr",
      content: {
        localized: {
          fr: { question: "Nommez les huit éléments" },
          en: { question: "Name the eight items" },
        },
        items: [
          { id: 1, name_by_lang: { fr: "éclair", en: "lightning" }, options_by_lang: { fr: ["éclair", "nuage", "pluie", "vent"] } },
          { id: 2, name_by_lang: { fr: "route", en: "road" }, options_by_lang: { fr: ["route", "champ", "ville", "pont"] } },
        ],
      },
    }, "fr", "en");
    expect(exercise.localized.fr.question).toBe("Nommez les huit éléments");
    for (const label of exercise.items) {
      expect(label.options).toHaveLength(4);
      expect(new Set(label.options).size).toBe(4);
      expect(label.options).toContain(label.name);
    }
    expect(exercise.items[0].options).toEqual(expect.arrayContaining(["nuage", "pluie", "vent"]));
  });

  it("supports another language pair and an older shared word bank", () => {
    const exercise = readImageLabellingExercise({
      LearningLang: "de",
      Heading_DE: "Beschrifte das Bild",
      Question_DE: "Ordne die Zahlen zu",
      items_de: JSON.stringify([
        { id: 1, name_de: "Blitz", name_es: "relámpago" },
        { id: 2, name_de: "Straße", name_es: "carretera" },
      ]),
      word_bank_de: JSON.stringify(["Blitz", "Straße", "Wolke", "Regen"]),
    }, "de", "es");
    expect(exercise.localized.de.question).toBe("Ordne die Zahlen zu");
    expect(exercise.items[0].options).toHaveLength(4);
    expect(exercise.items[0].options).toContain("Blitz");
  });

  it("reads the bundled CSV with four options for every label", () => {
    const csv = readFileSync(new URL("../../../../public/mock-data/practice/reading/image_labelling.csv", import.meta.url), "utf8");
    const rows = Papa.parse<Record<string, string>>(csv, { header: true, skipEmptyLines: true }).data;
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      const exercise = readImageLabellingExercise(row, "fr", "en");
      expect(exercise.localized.fr.question).toBe(row.question_fr);
      expect(exercise.items.length).toBeGreaterThan(0);
      for (const label of exercise.items) {
        expect(label.options).toHaveLength(4);
        expect(new Set(label.options).size).toBe(4);
        expect(label.options).toContain(label.name);
      }
    }
  });
});
