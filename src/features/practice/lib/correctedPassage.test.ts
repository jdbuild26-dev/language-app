import { expect, it } from "vitest";
import { getCorrectedPassageParts } from "./correctedPassage";

it("fills translated blanks with correct answers, not learner selections", () => {
  expect(getCorrectedPassageParts("She opens her [2] ____ beside the [1] ____.", {
    "1": { correct: "table", correct_en: "desk" },
    "2": { correct: "carnet", correct_en: "notebook" },
  }, "en")).toEqual([
    { text: "She opens her ", answer: false }, { text: "notebook", answer: true },
    { text: " beside the ", answer: false }, { text: "desk", answer: true },
    { text: ".", answer: false },
  ]);
});

it("supports French translations and dashed or marker-only blanks", () => {
  expect(getCorrectedPassageParts("Son [1] --- est [2].", {
    "1": { correct: "bag", correct_fr: "sac" }, "2": { correct: "green", correct_fr: "vert" },
  }, "fr")?.filter(part => part.answer).map(part => part.text)).toEqual(["sac", "vert"]);
});

it("does not substitute an original-language answer when its translation is missing", () => {
  expect(getCorrectedPassageParts("Her [1] ____.", { "1": { correct: "carnet" } }, "en")).toBeNull();
});
