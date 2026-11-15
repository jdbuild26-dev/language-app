import { buildPracticeDropdownOptions } from "./practiceDropdownOptions";

type Source = Record<string, unknown>;

export type ImageLabel = {
  id: number;
  name: string;
  names: Record<string, string>;
  options: string[];
  optionTranslations?: Record<string, string[]>;
};

export type ImageLabelLocale = {
  heading: string;
  title: string;
  question: string;
  wordBank: string[];
};

export type ImageLabellingExercise = {
  external_id: string;
  level: string;
  localized: Record<string, ImageLabelLocale>;
  image: string;
  items: ImageLabel[];
  timeLimitSeconds: number;
};

/** Keep the question translation paired with the text actually shown. */
export function getImageLabellingQuestionView(
  questions: Record<string, string | undefined>,
  learningLanguage: string,
  knownLanguage: string,
  showQuestionInKnown: boolean,
  showTranslation: boolean,
) {
  const learning = questions[learningLanguage]?.trim() || "";
  const known = questions[knownLanguage]?.trim() || "";
  const standardQuestions: Record<string, string> = {
    fr: "Associez chaque numéro à la bonne étiquette.",
    en: "Match each number with the correct label.",
  };
  const useStandardFallback = new Set([learningLanguage, knownLanguage]).size === 2
    && [learningLanguage, knownLanguage].every(code => code === "fr" || code === "en")
    && (!learning || learning === standardQuestions[learningLanguage])
    && (!known || known === standardQuestions[knownLanguage]);
  const fallback = useStandardFallback ? standardQuestions : {};
  const sourceLanguage = showQuestionInKnown ? knownLanguage : learningLanguage;
  const targetLanguage = showQuestionInKnown ? learningLanguage : knownLanguage;
  const source = (showQuestionInKnown ? known || learning : learning || known)
    || fallback[sourceLanguage] || "Question unavailable.";
  const target = (showQuestionInKnown ? learning : known) || fallback[targetLanguage] || "";
  const canTranslate = Boolean(target && target !== source);
  const translated = showTranslation && canTranslate;
  return { question: translated ? target : source, canTranslate, translated };
}

function record(value: unknown): Source {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Source : {};
}

function firstText(...values: unknown[]): string {
  return values.find(value => typeof value === "string" && value.trim()) as string || "";
}

function array(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function strings(value: unknown): string[] {
  return array(value).map(String).map(text => text.trim()).filter(Boolean);
}

function firstArray(...values: unknown[]): unknown[] {
  for (const value of values) {
    const parsed = array(value);
    if (parsed.length) return parsed;
  }
  return [];
}

function firstStrings(...values: unknown[]): string[] {
  for (const value of values) {
    const parsed = strings(value);
    if (parsed.length) return parsed;
  }
  return [];
}

/** Normalize API and bundled CSV image labels without assuming a language pair. */
export function readImageLabellingExercise(
  value: unknown,
  learningLanguage: string,
  knownLanguage: string,
): ImageLabellingExercise {
  const item = record(value);
  const content = Object.keys(record(item.content)).length ? record(item.content) : item;
  const config = record(item.config);
  const sourceLanguage = firstText(item.learning_lang, item.LearningLang, learningLanguage).toLowerCase();
  const codes = new Set([learningLanguage.toLowerCase(), knownLanguage.toLowerCase(), sourceLanguage]);
  const supplied = record(content.localized);
  Object.keys(supplied).forEach(code => codes.add(code.toLowerCase()));
  for (const key of [...Object.keys(content), ...Object.keys(item)]) {
    const match = key.match(/^(?:heading|passage_title|title|question|word_bank)_([a-z]{2,3})$/i);
    if (match) codes.add(match[1].toLowerCase());
  }

  const localized: Record<string, ImageLabelLocale> = {};
  for (const code of codes) {
    const entry = record(supplied[code]);
    const suffix = code.toUpperCase();
    localized[code] = {
      heading: firstText(entry.heading, content[`heading_${code}`], item[`heading_${code}`], item[`Heading_${suffix}`], item[`instruction_${code}`], item[`Instruction_${suffix}`]),
      title: firstText(entry.title, content[`passage_title_${code}`], item[`passage_title_${code}`], item[`Passage Title_${suffix}`], content[`title_${code}`], item[`title_${code}`]),
      question: firstText(entry.question, content[`question_${code}`], item[`question_${code}`], item[`Question_${suffix}`]),
      wordBank: firstStrings(entry.word_bank, content[`word_bank_${code}`], item[`word_bank_${code}`]),
    };
  }

  const rawItems = firstArray(content.items, item.items, content[`items_${sourceLanguage}`], item[`items_${sourceLanguage}`]);
  const itemRecords = rawItems.map(record);
  const namesByItem = itemRecords.map(raw => {
    const suppliedNames = record(raw.name_by_lang);
    return Object.fromEntries([...codes].map(code => [
      code,
      firstText(suppliedNames[code], raw[`name_${code}`], code === sourceLanguage ? raw.name : undefined),
    ])) as Record<string, string>;
  });

  const labels = itemRecords.map((raw, index) => {
    const names = namesByItem[index];
    const correct = names[learningLanguage.toLowerCase()];
    const sourceOptions = record(raw.options_by_lang);
    const choices = strings(sourceOptions[learningLanguage.toLowerCase()] || raw[`options_${learningLanguage.toLowerCase()}`] || raw.options);
    const fallbackPool = [
      ...choices,
      ...localized[learningLanguage.toLowerCase()].wordBank,
      ...namesByItem.map(entry => entry[learningLanguage.toLowerCase()]),
    ];
    const pool = new Set(choices.filter(Boolean)).size >= 4 ? choices : fallbackPool;
    return {
      id: Number(raw.id || index + 1),
      name: correct,
      names,
      optionTranslations: Object.fromEntries([...codes].flatMap(code => {
        const options = array(sourceOptions[code] ?? raw[`options_${code}`]);
        // A complete authored row contains the correct label followed by three paired distractors.
        if (options.length !== 4 || options[0] !== names[code]
          || !options.every((option): option is string => typeof option === "string" && Boolean(option.trim()))
          || new Set(options).size !== options.length) return [];
        return [[code, options]];
      })),
      options: buildPracticeDropdownOptions(correct, pool, 4),
    };
  }).filter(label => label.name);

  return {
    external_id: firstText(item.external_id, item.ExerciseID),
    level: firstText(item.Level, item.level),
    localized,
    image: firstText(content.image, item.image, item.imageUrl),
    items: labels,
    timeLimitSeconds: Number(config.timeLimitSeconds || item.timeLimitSeconds || 120),
  };
}

export function findImageLabelTranslation(
  answer: string | undefined,
  labels: ImageLabel[],
  sourceLanguage: string,
  targetLanguage: string,
  selectedRow?: ImageLabel,
): string | undefined {
  if (!answer) return undefined;
  const normalize = (value: string) => value.trim().normalize("NFC").toLocaleLowerCase();
  const matches = labels
    .filter(label => normalize(label.names[sourceLanguage] || "") === normalize(answer))
    .map(label => label.names[targetLanguage])
    .filter(Boolean);
  if (!matches.length && selectedRow) {
    const source = selectedRow.optionTranslations?.[sourceLanguage];
    const target = selectedRow.optionTranslations?.[targetLanguage];
    const index = source?.findIndex(option => normalize(option) === normalize(answer)) ?? -1;
    if (index >= 0 && target?.[index]) return target[index];
  }
  return new Set(matches.map(normalize)).size === 1 ? matches[0] : undefined;
}
