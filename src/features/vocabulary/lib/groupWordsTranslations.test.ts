import { readFileSync } from "node:fs";
import Papa from "papaparse";
import { expect, it } from "vitest";
import { parseGroupWords, withGroupTranslations } from "./groupWordsTranslations";

const local = Papa.parse(readFileSync(new URL("../../../../public/mock-data/csv/group_words.csv", import.meta.url), "utf8"), { header: true, skipEmptyLines: true }).data as Record<string, unknown>[];

it("keeps translation slots aligned while discarding empty source words", () => {
  expect(parseGroupWords('[" pomme ", "", " poire "]')).toEqual(["pomme", "poire"]);
  expect(parseGroupWords('[" apple ", "", " pear "]', true)).toEqual(["apple", "", "pear"]);
});

it("recovers all eight translations from the actual dataset for legacy API rows", () => {
  const row = { content: { correctGroup: ["cerise", "pomme", "raisin", "banane"], otherWords: ["soleil", "livre", "voiture", "chaise"] } };
  const [result] = withGroupTranslations([row], local, "FR", "EN");
  expect(result.correctGroup_EN).toEqual(["cherry", "apple", "grape", "banana"]);
  expect(result.otherWords_EN).toEqual(["sun", "book", "car", "chair"]);
});

it("preserves API translations and fills only missing entries", () => {
  const row = { ...local[0], CorrectGroup_EN: ["an apple", "", "grape", "cherry"] };
  expect(withGroupTranslations([row], local, "fr", "en")[0].correctGroup_EN).toEqual(["an apple", "banana", "grape", "cherry"]);
});

it("does not substitute an unrelated group's translations or the wrong target language", () => {
  const row = { correctGroup: ["inconnu"], otherWords: ["autre"] };
  expect(withGroupTranslations([row], local, "fr", "en")[0].correctGroup_EN).toEqual([""]);
  const untranslated = { correctGroup: JSON.parse(String(local[0].correctGroup)), otherWords: JSON.parse(String(local[0].otherWords)) };
  expect(withGroupTranslations([untranslated], local, "fr", "de")[0].correctGroup_EN).toEqual(["", "", "", ""]);
});
