export type DiagramLocale = {
  heading: string;
  title: string;
  passage: string;
  question: string;
  answers: string[];
  distractors: string[];
};

type Source = Record<string, unknown>;

function stringValue(...values: unknown[]): string {
  return values.find(value => typeof value === "string" && value.trim()) as string || "";
}

function stringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed: unknown = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
    } catch { /* CSV fields may use pipe separators. */ }
    return value.split("|").map(part => part.trim()).filter(Boolean);
  }
  return [];
}

function firstStringArray(...values: unknown[]): string[] {
  for (const value of values) {
    const parsed = stringArray(value);
    if (parsed.length > 0) return parsed;
  }
  return [];
}

/** Read locale keyed backend content and language suffixed CSV fields. */
export function readDiagramLocales(item: Source, content: Source): Record<string, DiagramLocale> {
  const supplied = content.localized && typeof content.localized === "object"
    ? content.localized as Record<string, Source>
    : {};
  const codes = new Set(Object.keys(supplied).map(code => code.toLowerCase()));
  for (const source of [item, content]) {
    for (const key of Object.keys(source)) {
      const match = key.match(/^(?:heading|passage_title|title|passage|question|answers|distractors)_([a-z]{2,3})$/i)
        || key.match(/^(?:Heading|Passage Title|Complete Paragraph|Question)_([A-Z]{2,3})$/i);
      if (match) codes.add(match[1].toLowerCase());
    }
  }
  const locales: Record<string, DiagramLocale> = {};
  for (const code of codes) {
    const entry = supplied[code] || {};
    const suffix = code.toUpperCase();
    locales[code] = {
      heading: stringValue(entry.heading, content[`heading_${code}`], item[`heading_${code}`], item[`Heading_${suffix}`], item[`instruction_${code}`], item[`instruction${code[0].toUpperCase()}${code.slice(1)}`]),
      title: stringValue(content[`passage_title_${code}`], item[`passage_title_${code}`], item[`Passage Title_${suffix}`], entry.title, content[`title_${code}`], item[`title_${code}`]),
      passage: stringValue(entry.passage, content[`passage_${code}`], item[`passage_${code}`], item[`Complete Paragraph_${suffix}`]),
      question: stringValue(entry.question, content[`question_${code}`], item[`question_${code}`], item[`Question_${suffix}`]),
      answers: firstStringArray(entry.answers, content[`answers_${code}`], item[`answers_${code}`]),
      distractors: firstStringArray(entry.distractors, content[`distractors_${code}`], item[`distractors_${code}`]),
    };
  }
  return locales;
}

export type LocalizedDiagramQuestion = {
  correct?: string;
  correct_by_lang?: Record<string, string>;
  [key: string]: unknown;
};

export function diagramAnswer(question: LocalizedDiagramQuestion, language: string): string {
  if (question.correct_by_lang) return stringValue(question.correct_by_lang[language]);
  return stringValue(question[`correct_${language}`], question.correct);
}

export function diagramAnswerTranslation(
  answer: string | undefined,
  questions: LocalizedDiagramQuestion[],
  sourceLanguage: string,
  targetLanguage: string,
  locales?: Record<string, DiagramLocale>,
): string | undefined {
  if (!answer) return undefined;
  const normalize = (value: string) => value.trim().normalize("NFC").toLocaleLowerCase();
  const matches = questions
    .filter(question => normalize(diagramAnswer(question, sourceLanguage)) === normalize(answer))
    .map(question => diagramAnswer(question, targetLanguage))
    .filter(Boolean);
  const sourceDistractors = locales?.[sourceLanguage]?.distractors;
  const targetDistractors = locales?.[targetLanguage]?.distractors;
  if (sourceDistractors && targetDistractors && sourceDistractors.length === targetDistractors.length) {
    sourceDistractors.forEach((value, index) => {
      if (normalize(value) === normalize(answer) && targetDistractors[index]?.trim()) {
        matches.push(targetDistractors[index]);
      }
    });
  }
  return new Set(matches.map(normalize)).size === 1 ? matches[0] : undefined;
}
