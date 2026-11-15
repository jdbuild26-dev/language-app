type Question = {
  question?: string;
  question_fr?: string;
  question_en?: string;
  options?: string[];
  options_fr?: string[];
  options_en?: string[];
  localized?: Record<string, { question?: string; options?: string[] }>;
};

type DisplayState = {
  learningLang: string;
  knownLang?: string;
  showQuestionInKnown: boolean;
  submitted: boolean;
  translated: boolean;
  lockBeforeSubmit?: boolean;
  questionOnlyBeforeSubmit?: boolean;
};

export function getComprehensionQuestionView(question: Question, state: DisplayState) {
  if (state.lockBeforeSubmit) {
    const knownLang = state.knownLang || (state.learningLang === "fr" ? "en" : "fr");
    const bundle = (language: string) => {
      const data = question.localized?.[language];
      const legacy = question as Record<string, unknown>;
      const text = data?.question?.trim() || String(legacy[`question_${language}`] || "").trim();
      const options = data?.options?.length ? data.options : legacy[`options_${language}`];
      return {
        question: text,
        options: Array.isArray(options) ? options.map(String) : [],
      };
    };
    const complete = (value: ReturnType<typeof bundle>) => Boolean(value.question)
      && value.options.length > 0 && value.options.every(option => Boolean(option.trim()));
    const learning = bundle(state.learningLang);
    const known = bundle(knownLang);
    const preferred = learning;
    const alternate = known;
    const source = complete(preferred) ? preferred : complete(alternate) ? alternate : preferred;
    const target = source === preferred ? alternate : preferred;
    const canTranslate = state.submitted
      ? complete(source) && complete(target) && source.options.length === target.options.length
      : Boolean(state.questionOnlyBeforeSubmit && source.question && target.question && source.question !== target.question);
    const translated = state.translated && canTranslate;
    const shown = translated
      ? state.submitted ? target : { question: target.question, options: source.options }
      : source;
    return {
      question: shown.question || "Question unavailable.",
      options: shown.options,
      canTranslate,
      translated,
    };
  }

  if (state.submitted) {
    const learningFrench = state.learningLang !== "en";
    const french = {
      question: question.question_fr?.trim() || "",
      options: question.options_fr?.length ? question.options_fr : learningFrench ? question.options || [] : [],
    };
    const english = {
      question: question.question_en?.trim() || question.question?.trim() || "",
      options: question.options_en?.length ? question.options_en : !learningFrench ? question.options || [] : [],
    };
    const complete = (bundle: typeof french) => Boolean(bundle.question)
      && bundle.options.length > 0 && bundle.options.every(option => Boolean(option.trim()));
    const preferred = learningFrench ? french : english;
    const alternate = learningFrench ? english : french;
    // When only one complete language exists, keep that entire bundle together.
    const source = complete(preferred) ? preferred : complete(alternate) ? alternate : preferred;
    const target = source === preferred ? alternate : preferred;
    const canTranslate = complete(source) && complete(target) && source.options.length === target.options.length;
    const translated = state.translated && canTranslate;
    const shown = translated ? target : source;
    return {
      question: shown.question || (learningFrench ? "Question indisponible." : "Question unavailable."),
      options: shown.options,
      canTranslate,
      translated,
    };
  }

  const questionText = (state.showQuestionInKnown ? question.question_en : question.question_fr)
    || question.question || question.question_fr || question.question_en || "";
  const translatedQuestionText = state.showQuestionInKnown ? question.question_fr : question.question_en;
  const options = (state.learningLang === "fr" ? question.options_fr : question.options_en)?.length
    ? (state.learningLang === "fr" ? question.options_fr : question.options_en)!
    : question.options || [];
  const canTranslateQuestion = Boolean(translatedQuestionText && translatedQuestionText !== questionText);
  const canTranslate = canTranslateQuestion;
  const translated = state.translated && canTranslate;
  return {
    question: translated && canTranslateQuestion ? translatedQuestionText! : questionText,
    options,
    canTranslate,
    translated,
  };
}
