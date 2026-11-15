type LocalText = { text: string; translation: string; language: string };
export type ConversationOption = { id: string; label: LocalText };
export type ConversationTurn = {
  speaker: LocalText; speakerName: string; question: LocalText; options: ConversationOption[]; correctId: string;
};
export type RunningConversationData = {
  title: LocalText; objective: LocalText; turns: ConversationTurn[]; level: string;
  headingFr: string; headingEn: string;
};

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}

function rows(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed: unknown = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  }
  return [];
}

function firstText(...values: unknown[]): string {
  return values.find((value): value is string => typeof value === "string" && Boolean(value.trim()))?.trim() ?? "";
}

export function readRunningConversation(value: unknown, learning: string, known: string): RunningConversationData {
  const item = record(value);
  const content = { ...item, ...record(item.content) };
  const sourceLanguage = firstText(item.learning_lang, item.LearningLang, "fr").toLowerCase();
  const localized = (values: Record<string, string>, fallback = "", fallbackLanguage = sourceLanguage): LocalText => {
    const preferred = values[learning] || (fallbackLanguage === learning ? fallback : "");
    if (preferred) return { text: preferred, translation: values[known] || (fallbackLanguage === known ? fallback : ""), language: learning };
    const counterpart = values[known] || (fallbackLanguage === known ? fallback : "");
    if (counterpart) return { text: counterpart, translation: "", language: known };
    const language = values.fr ? "fr" : values.en ? "en" : fallbackLanguage;
    return { text: values[language] || fallback, translation: "", language };
  };
  const textFields = (row: Record<string, unknown>, keys: string[], fallback = "", fallbackLanguage = sourceLanguage) => {
    const languages = [...new Set([learning, known, "fr", "en"])];
    const values = Object.fromEntries(languages.map(language => [
      language, firstText(...keys.flatMap(key => [row[`${key}_${language}`], row[`${key}_${language.toUpperCase()}`]])),
    ]));
    return localized(values, fallback, fallbackLanguage);
  };

  let exchanges = rows(content.exchanges ?? content.Exchanges);
  if (!exchanges.length) {
    exchanges = Object.keys(content).filter(key => /^Exchange_\d+_(FR|EN)$/.test(key))
      .map(key => Number(key.split("_")[1])).filter((id, i, all) => all.indexOf(id) === i)
      .sort((a, b) => a - b)
      .map(id => ({ speakerText_fr: content[`Exchange_${id}_FR`], speakerText_en: content[`Exchange_${id}_EN`], speaker: content[`Exchange_${id}_Speaker`] }));
  }

  const turns = exchanges.map(record)
    .map((exchange, index) => ({ exchange, order: Number(exchange.turnId ?? exchange.order ?? index) }))
    .sort((a, b) => a.order - b.order)
    .map(({ exchange }) => {
      const options = rows(exchange.options).map((value, index) => {
        const option = record(value);
        return {
          id: String(option.id ?? option.value ?? option.index ?? index),
          label: textFields(option, ["text"], firstText(option.text, option.label, value)),
          order: Number(option.order ?? option.index ?? index),
        };
      }).sort((a, b) => a.order - b.order).filter(option => option.label.text);
      const correctId = exchange.correctOptionId ?? options[Number(exchange.correctIndex ?? 0)]?.id;
      return {
        speaker: textFields(exchange, ["speakerText"], firstText(exchange.speakerText, exchange.speakerAudio)),
        speakerName: firstText(exchange.speaker, exchange.Speaker),
        question: textFields(exchange, ["questionText"], firstText(exchange.questionText)),
        options,
        correctId: String(correctId ?? ""),
      };
    }).filter(turn => turn.speaker.text || turn.question.text || turn.options.length);
  const title = textFields(content, ["passage_title", "title", "Passage Title", "Scenario Title"], firstText(content.title), "en");
  const rawObjective = textFields(content, ["objectives", "objective"], firstText(content.objectives, content.objective));
  // Older records sometimes contain adjacent objective phrases without separators.
  const separateObjectives = (value: string) => value.replace(/(\p{Ll})(\p{Lu}\p{Ll})/gu, "$1, $2");
  const objective = {
    ...rawObjective,
    text: separateObjectives(rawObjective.text),
    translation: separateObjectives(rawObjective.translation),
  };
  const context = textFields(content, ["context"], firstText(content.scenario), "en");
  return {
    title, objective: objective.text ? objective : context, turns,
    level: firstText(item.Level, item.level, "B1"),
    headingFr: firstText(content.heading_fr, content.Heading_FR, content.instructionFr),
    headingEn: firstText(content.heading_en, content.Heading_EN, content.instructionEn),
  };
}
