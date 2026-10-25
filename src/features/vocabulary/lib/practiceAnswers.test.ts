import { readFileSync } from "node:fs";
import Papa from "papaparse";
import { expect, it } from "vitest";
import { frenchWordAnswer, multiSelectIndices, splitAudioBlankSentence } from "./practiceAnswers";

it.each([
  [true, true], [false, false], ["True", true], ["False", false],
  [" TRUE ", true], [" false ", false], ["Yes", true], ["No", false],
  ["oui", true], ["non", false], [1, true], [0, false],
])("normalizes French-word value %s to boolean %s", (value, expected) => {
  expect(frenchWordAnswer(value)).toBe(expected);
});

it("uses legacy answer aliases when the primary value is absent and preserves explicit false", () => {
  expect(frenchWordAnswer(undefined, "Yes")).toBe(true);
  expect(frenchWordAnswer("", "oui")).toBe(true);
  expect(frenchWordAnswer(false, "Yes")).toBe(false);
});

it("scores both Yes and No using the actual French-word CSV", () => {
  const csv = readFileSync(new URL("../../../../public/mock-data/csv/is_french_word.csv", import.meta.url), "utf8");
  const rows = Papa.parse<Record<string, string>>(csv, { header: true, skipEmptyLines: true }).data;
  expect(rows.some(row => row.isFrench === "False")).toBe(true);
  for (const row of rows) expect(frenchWordAnswer(row.isFrench)).toBe(row.correctAnswer === "Yes");
});

it.each(["___", "____", "_____"])("consumes the entire %s Audio FITB blank", marker => {
  expect(splitAudioBlankSentence(`Le ${marker} dort.`)).toEqual(["Le ", " dort."]);
});

it("preserves plain text and every mixed blank", () => {
  expect(splitAudioBlankSentence("Le ___ et le ____ jouent.")).toEqual(["Le ", " et le ", " jouent."]);
  expect(splitAudioBlankSentence("A_B sans blanc.")).toEqual(["A_B sans blanc."]);
});

it.each(["1|3", "1,3", "[1,3]", '["1","3"]', [1, 3], ["1", "3"]])("normalizes one-based multi-select indices %j", value => {
  expect(multiSelectIndices(value, 6)).toEqual([0, 2]);
});

it("removes duplicates and invalid indices without changing the one-based contract", () => {
  expect(multiSelectIndices([1, 1, 0, -1, 7, "2x", 2.5, null, "", 6], 6)).toEqual([0, 5]);
  expect(multiSelectIndices(undefined, 6)).toEqual([]);
});
