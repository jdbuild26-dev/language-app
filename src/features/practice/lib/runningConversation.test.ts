import { describe, expect, it } from "vitest";
import { readRunningConversation } from "./runningConversation";

describe("Running Conversation content", () => {
  it("keeps authored questions and option translations attached to their original answers", () => {
    const [turn] = readRunningConversation({ content: { exchanges: [{
      speaker: "Camille", speakerText: "Salut", speakerText_en: "Hi",
      questionText: "Que dites-vous ?", questionText_en: "What do you say?",
      correctOptionId: "b",
      options: [{ id: "a", text_fr: "Non", text_en: "No" }, { id: "b", text: "Bonjour", text_en: "Hello" }],
    }] } }, "fr", "en").turns;
    expect(turn.speakerName).toBe("Camille");
    expect(turn.question).toEqual({ text: "Que dites-vous ?", translation: "What do you say?", language: "fr" });
    expect(turn.options.find(option => option.id === turn.correctId)?.label)
      .toEqual({ text: "Bonjour", translation: "Hello", language: "fr" });
  });

  it("does not substitute a translated scenario for a missing objective translation", () => {
    const conversation = readRunningConversation({
      objectives_fr: "Comparer les options", context_en: "You are shopping",
    }, "fr", "en");
    expect(conversation.objective).toEqual({ text: "Comparer les options", translation: "", language: "fr" });
  });

  it("tracks the actual language of legacy context and dialogue", () => {
    const conversation = readRunningConversation({
      scenario: "You meet a friend", Exchange_1_FR: "Salut", Exchange_1_Speaker: "Camille",
    }, "de", "en");
    expect(conversation.objective.language).toBe("en");
    expect(conversation.turns[0].speaker).toEqual({ text: "Salut", translation: "", language: "fr" });
    expect(conversation.turns[0].speakerName).toBe("Camille");
  });
});
