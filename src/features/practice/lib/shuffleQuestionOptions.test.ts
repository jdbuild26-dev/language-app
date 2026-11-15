import { expect, test } from "vitest";
import { shuffleQuestionOptions } from "./shuffleQuestionOptions";
import { getComprehensionQuestionView } from "./comprehensionLanguage";

const question = {
  question: "Choose",
  options: ["FR correct", "FR second", "FR third", "FR fourth"],
  options_fr: ["FR correct", "FR second", "FR third", "FR fourth"],
  options_en: ["EN correct", "EN second", "EN third", "EN fourth"],
  correctIndex: 0,
};

test("moves the correct answer while retaining bilingual pairs and the source data", () => {
  const original = structuredClone(question);
  const shuffled = shuffleQuestionOptions(question, () => 0);
  expect(shuffled.correctIndex).toBe(3);
  expect(shuffled.options[shuffled.correctIndex]).toBe("FR correct");
  expect(shuffled.options_en[shuffled.correctIndex]).toBe("EN correct");
  shuffled.options_fr.forEach((option, index) => {
    expect(shuffled.options_en[index]).toBe(option.replace("FR", "EN"));
  });
  expect(question).toEqual(original);
});

test("tracks duplicate labels by index and supports monolingual options", () => {
  const shuffled = shuffleQuestionOptions({ options: ["same", "same", "other"], options_en: ["first", "second", "third"], correctIndex: 1 }, () => 0);
  expect(shuffled.options_en[shuffled.correctIndex]).toBe("second");
  const mono = shuffleQuestionOptions({ options: ["correct", "wrong"], correctIndex: 0 }, () => 0);
  expect(mono).toEqual({ options: ["wrong", "correct"], correctIndex: 1 });
});

test("submitted shuffled choices translate together with their question without changing scoring", () => {
  const shuffled = shuffleQuestionOptions({ ...question, question_fr: "Choisissez", question_en: "Choose" }, () => 0);
  const state = { learningLang: "fr", showQuestionInKnown: true, submitted: true, translated: false };
  const french = getComprehensionQuestionView(shuffled, state);
  const english = getComprehensionQuestionView(shuffled, { ...state, translated: true });
  expect(french.question).toBe("Choisissez");
  expect(english.question).toBe("Choose");
  expect(french.options[shuffled.correctIndex]).toBe("FR correct");
  expect(english.options[shuffled.correctIndex]).toBe("EN correct");
});
