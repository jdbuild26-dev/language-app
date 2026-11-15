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

test("Reading Comprehension starts in the learning language even for a beginner", () => {
  const state = {
    learningLang: "fr", knownLang: "en", showQuestionInKnown: true,
    submitted: false, translated: false, lockBeforeSubmit: true,
  };
  expect(getComprehensionQuestionView(question, state)).toMatchObject({
    question: question.question_fr, options: question.options_fr,
    canTranslate: false, translated: false,
  });
  expect(getComprehensionQuestionView(question, { ...state, submitted: true })).toMatchObject({
    question: question.question_fr, options: question.options_fr,
    canTranslate: true, translated: false,
  });
  expect(getComprehensionQuestionView(question, { ...state, submitted: true, translated: true })).toMatchObject({
    question: question.question_en, options: question.options_en,
    canTranslate: true, translated: true,
  });
});

test("Listening Passage translates only the question before submission and the full bundle afterward", () => {
  const state = {
    learningLang: "fr", knownLang: "en", showQuestionInKnown: true,
    submitted: false, translated: false, lockBeforeSubmit: true,
    questionOnlyBeforeSubmit: true,
  };
  expect(getComprehensionQuestionView(question, state)).toMatchObject({
    question: question.question_fr, options: question.options_fr, canTranslate: true,
  });
  expect(getComprehensionQuestionView(question, { ...state, translated: true })).toMatchObject({
    question: question.question_en, options: question.options_fr, translated: true,
  });
  expect(getComprehensionQuestionView(question, { ...state, submitted: true, translated: true })).toMatchObject({
    question: question.question_en, options: question.options_en, translated: true,
  });
});

test("Reading Comprehension never mixes an incomplete question with another language's options", () => {
  const state = {
    learningLang: "fr", knownLang: "en", showQuestionInKnown: true,
    submitted: false, translated: false, lockBeforeSubmit: true,
  };
  expect(getComprehensionQuestionView({ ...question, options_en: [] }, state)).toMatchObject({
    question: question.question_fr, options: question.options_fr, canTranslate: false,
  });
});

test("Reading Comprehension accepts a future language pair as complete bundles", () => {
  const data = {
    localized: {
      de: { question: "Was ist der Vorteil?", options: ["Schneller", "Klarer"] },
      es: { question: "¿Cuál es la ventaja?", options: ["Más rápido", "Más claro"] },
    },
  };
  const state = {
    learningLang: "de", knownLang: "es", showQuestionInKnown: false,
    submitted: false, translated: false, lockBeforeSubmit: true,
  };
  expect(getComprehensionQuestionView(data, state)).toMatchObject({
    question: data.localized.de.question, options: data.localized.de.options, canTranslate: false,
  });
  expect(getComprehensionQuestionView(data, { ...state, submitted: true, translated: true })).toMatchObject({
    question: data.localized.es.question, options: data.localized.es.options, translated: true,
  });
});
