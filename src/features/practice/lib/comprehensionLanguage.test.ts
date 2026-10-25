import { expect, test } from "vitest";
import { getComprehensionQuestionView } from "./comprehensionLanguage";

const question = {
  question_fr: "Pourquoi les avis semblent-ils utiles ?",
  question_en: "Why do reviews seem useful?",
  options_fr: ["Ils remplacent les produits.", "Ils donnent une impression de transparence."],
  options_en: ["They replace products.", "They give a sense of transparency."],
};

test("a beginner's submitted question and options share the same language and translate together", () => {
  const state = { learningLang: "fr", showQuestionInKnown: true, submitted: true, translated: false };
  expect(getComprehensionQuestionView(question, state)).toMatchObject({
    question: question.question_fr,
    options: question.options_fr,
    translated: false,
  });
  expect(getComprehensionQuestionView(question, { ...state, translated: true })).toMatchObject({
    question: question.question_en,
    options: question.options_en,
    translated: true,
  });
});

test("advanced questions translate with their options and can return to the original bundle", () => {
  const state = { learningLang: "fr", showQuestionInKnown: false, submitted: true, translated: true };
  expect(getComprehensionQuestionView(question, state)).toMatchObject({
    question: question.question_en, options: question.options_en, translated: true,
  });
  expect(getComprehensionQuestionView(question, { ...state, translated: false })).toMatchObject({
    question: question.question_fr, options: question.options_fr, translated: false,
  });
});

test("English learners see English submitted questions and translate the entire bundle into French", () => {
  const state = { learningLang: "en", showQuestionInKnown: false, submitted: true, translated: false };
  expect(getComprehensionQuestionView(question, state)).toMatchObject({
    question: question.question_en, options: question.options_en,
  });
  expect(getComprehensionQuestionView(question, { ...state, translated: true })).toMatchObject({
    question: question.question_fr, options: question.options_fr,
  });
});

test("before submission the beginner's question-only translation keeps the learning-language options", () => {
  const state = { learningLang: "fr", showQuestionInKnown: true, submitted: false, translated: false };
  expect(getComprehensionQuestionView(question, state)).toMatchObject({
    question: question.question_en, options: question.options_fr,
  });
  expect(getComprehensionQuestionView(question, { ...state, translated: true })).toMatchObject({
    question: question.question_fr, options: question.options_fr,
  });
});

test("an incomplete target option list cannot produce a partly translated submitted question", () => {
  const state = { learningLang: "fr", showQuestionInKnown: true, submitted: true, translated: true };
  for (const options_en of [["They replace products."], ["They replace products.", ""]]) {
    expect(getComprehensionQuestionView({ ...question, options_en }, state)).toMatchObject({
      question: question.question_fr, options: question.options_fr, canTranslate: false, translated: false,
    });
  }
});

test("missing question translations fall back to a complete single-language bundle", () => {
  expect(getComprehensionQuestionView({ ...question, question_fr: "" }, {
    learningLang: "fr", showQuestionInKnown: true, submitted: true, translated: true,
  })).toMatchObject({
    question: question.question_en, options: question.options_en, canTranslate: false, translated: false,
  });
});
