export type SpeakImageQuestion = {
  id: string; heading_fr: string; heading_en: string;
  instruction_box_fr: string; instruction_box_en: string;
  sample_answers_fr: string[]; sample_answers_en: string[];
  image_url: string; timeLimitSeconds: number; level: string;
};
const object = (value: unknown): Record<string, unknown> => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
const text = (value: unknown) => typeof value === "string" ? value : "";
const strings = (value: unknown): string[] => Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && Boolean(item.trim())) : [];

export function normalizeSpeakImageExercises(data: unknown): SpeakImageQuestion[] {
  if (!Array.isArray(data)) return [];
  return data.flatMap(raw => {
    const item = object(raw), content = { ...item, ...object(item.content) };
    if (item.Category && item.Category !== "main") return [];
    if (!text(content.image_url ?? content.Image)) return [];
    const config = object(item.config);
    const time = config.timeLimitSeconds ?? content.timeLimitSeconds ?? item.TimeLimitSeconds;
    return [{ id: text(item.id), heading_fr: text(content.heading_fr), heading_en: text(content.heading_en),
      instruction_box_fr: text(content.instruction_box_fr) || "Décrivez l'image",
      instruction_box_en: text(content.instruction_box_en) || "Describe the image",
      sample_answers_fr: strings(content.sample_answers_fr), sample_answers_en: strings(content.sample_answers_en),
      image_url: text(content.image_url ?? content.Image), timeLimitSeconds: typeof time === "number" && time > 0 ? time : 60,
      level: text(item.level ?? item.Level) }];
  });
}
export function speakImageAvailability(question: SpeakImageQuestion): string | null {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(question.id)) return "This exercise must be saved before AI feedback is available.";
  if (question.sample_answers_fr.length < 2) return "This exercise needs two saved sample descriptions.";
  if (!/^(A1|A2|B1|B2|C1|C2)$/.test(question.level)) return "This exercise needs a CEFR level.";
  return null;
}
