import { describe, expect, it } from "vitest";
import { topicEvaluationInputs } from "./topicEvaluationInputs";

describe("topic evaluation language roles", () => {
  it("sends the learning and known instructions and every cover point separately", () => {
    const result = topicEvaluationInputs({
      main_instruction_fr: "Decrivez votre ville.", main_instruction_en: "Describe your city.",
      topic_bullets_fr: ["Transport", "Loisirs"], topic_bullets_en: ["Transport", "Leisure"],
    }, "fr", "en");
    expect(result).toEqual({
      learning_language: "fr", known_language: "en",
      main_instruction_ll: "Decrivez votre ville.", main_instruction_kl: "Describe your city.",
      topics_to_cover_ll: ["Transport", "Loisirs"], topics_to_cover_kl: ["Transport", "Leisure"],
    });
  });
  it("keeps selected language roles without substituting missing translations", () => {
    const result = topicEvaluationInputs({
      main_instruction_fr: "Beschreiben Sie Ihre Stadt.", main_instruction_en: "",
      topic_bullets_fr: ["Freizeit"], topic_bullets_en: [],
    }, "de", "fr");
    expect(result.learning_language).toBe("de");
    expect(result.known_language).toBe("fr");
    expect(result.main_instruction_ll).toBe("Beschreiben Sie Ihre Stadt.");
    expect(result.main_instruction_kl).toBe("");
    expect(result.topics_to_cover_kl).toEqual([]);
  });
});
