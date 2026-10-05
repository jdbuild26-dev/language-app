import { imageCharacterLimit } from "./writeImageInput";

export type TopicQuestion = {
  id: string;
  title_fr: string; title_en: string;
  heading_fr: string; heading_en: string;
  main_instruction_fr: string; main_instruction_en: string;
  topic_bullets_fr: string[]; topic_bullets_en: string[];
  instruction_box_fr: string; instruction_box_en: string;
  sample_answers_fr: string[]; sample_answers_en: string[];
  timeLimitSeconds: number; charLimit: number; level: string;
};
const object = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
const text = (value: unknown) => typeof value === "string" ? value : "";
const strings = (value: unknown): string[] => Array.isArray(value)
  ? value.filter((item): item is string => typeof item === "string" && Boolean(item.trim())) : [];

export function normalizeTopicExercises(data: unknown, mode: "write" | "speak"): TopicQuestion[] {
  if (!Array.isArray(data)) return [];
  return data.flatMap((raw) => {
    const item = object(raw);
    const c = { ...item, ...object(item.content) };
    if (item.Category && item.Category !== "main") return [];
    if (!text(c.main_instruction_fr) && !text(c.main_instruction_en) && !text(c.prompt)) return [];
    const config = { ...object(item.config), ...item };
    const time = config.timeLimitSeconds ?? config.TimeLimitSeconds;
    return [{
      id: text(item.id),
      title_fr: text(c.title_fr ?? c.passage_title_fr ?? c.topic),
      title_en: text(c.title_en ?? c.passage_title_en ?? c.englishTopic),
      heading_fr: text(c.heading_fr), heading_en: text(c.heading_en),
      main_instruction_fr: text(c.main_instruction_fr ?? c.prompt),
      main_instruction_en: text(c.main_instruction_en),
      topic_bullets_fr: strings(c.topic_bullets_fr), topic_bullets_en: strings(c.topic_bullets_en),
      instruction_box_fr: text(c.instruction_box_fr), instruction_box_en: text(c.instruction_box_en),
      sample_answers_fr: strings(c.sample_answers_fr), sample_answers_en: strings(c.sample_answers_en),
      timeLimitSeconds: typeof time === "number" && time > 0 ? time : mode === "write" ? 360 : 60,
      charLimit: imageCharacterLimit(config.maxHighlightChars ?? config.charLimit),
      level: text(item.level ?? item.Level),
    }];
  });
}
export function topicAvailability(question: TopicQuestion): string | null {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(question.id)) {
    return "This topic must be imported and saved before AI feedback is available.";
  }
  if (!question.main_instruction_fr.trim() || !question.main_instruction_en.trim()) {
    return "This topic needs instructions in both the learning and known languages.";
  }
  if (!/^(A1|A2|B1|B2|C1|C2)$/.test(question.level)) return "This topic needs a CEFR level.";
  return null;
}
