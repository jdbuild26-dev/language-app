import { expect, it } from "vitest";
import { getWritingCompletedPassage } from "./writingCompletedPassage";

it("reveals the correct French words by blank ID and preserves word spacing", () => {
  expect(getWritingCompletedPassage("Elle ouvre son [2] ____ près du [1] ____.", {
    "1": { correct_fr: "bureau", correct_en: "desk" },
    "2": { correct_fr: "carnet", correct_en: "notebook" },
  }, "fr")).toEqual([
    { text: "Elle ouvre son ", answer: false },
    { text: "carnet", answer: true },
    { text: " près du ", answer: false },
    { text: "bureau", answer: true },
    { text: ".", answer: false },
  ]);
});

it("uses numbered English markers even when translated word order changes", () => {
  expect(getWritingCompletedPassage("A [2] ____ is beside a [1] ____.", {
    "1": { correct_fr: "bureau", correct_en: "desk" },
    "2": { correct_fr: "carnet", correct_en: "notebook" },
  }, "en")?.filter(part => part.answer).map(part => part.text)).toEqual(["notebook", "desk"]);
});

it("does not guess highlights from missing translations, partial words or ambiguous occurrences", () => {
  expect(getWritingCompletedPassage("Her notebook.", { "1": { correct_fr: "carnet" } }, "en")).toBeNull();
  expect(getWritingCompletedPassage("Notebooks.", { "1": { correct_fr: "carnet", correct_en: "book" } }, "en")).toBeNull();
  expect(getWritingCompletedPassage("A book beside a book.", { "1": { correct_fr: "livre", correct_en: "book" } }, "en")).toBeNull();
});

it("preserves casing and punctuation and highlights repeated answers when every occurrence is a blank", () => {
  expect(getWritingCompletedPassage("Books, then books!", {
    "1": { correct_fr: "livres", correct_en: "books" },
    "2": { correct_fr: "livres", correct_en: "books" },
  }, "en")).toEqual([
    { text: "Books", answer: true }, { text: ", then ", answer: false },
    { text: "books", answer: true }, { text: "!", answer: false },
  ]);
});

it("highlights supplied English answers in a completed translation, including reordered phrases", () => {
  expect(getWritingCompletedPassage("A notebook is beside the desk.", {
    "1": { correct_fr: "bureau", correct_en: "desk" },
    "2": { correct_fr: "carnet", correct_en: "notebook" },
  }, "en")).toEqual([
    { text: "A ", answer: false }, { text: "notebook", answer: true },
    { text: " is beside the ", answer: false }, { text: "desk", answer: true },
    { text: ".", answer: false },
  ]);
});

it("keeps known English answer highlights when another answer mapping is missing", () => {
  expect(getWritingCompletedPassage("A notebook beside a desk.", {
    "1": { correct_fr: "carnet", correct_en: "notebook" },
    "2": { correct_fr: "bureau" },
  }, "en")).toEqual([
    { text: "A ", answer: false }, { text: "notebook", answer: true },
    { text: " beside a desk.", answer: false },
  ]);
});
