import { describe, expect, it } from "vitest";
import { choiceSentence } from "./choiceSentence";

describe("choiceSentence", () => {
  it("moves an inline English clue into the blank", () => {
    expect(choiceSentence("Le ____ (Cat) joue.", ["Chat"], [{ text: "Chat", en: "Cat" }])).toEqual({
      parts: ["Le ", " joue."], hints: ["Cat"],
    });
  });

  it("uses the stored English answer when the sentence has no inline clue", () => {
    expect(choiceSentence("Il va ____ cinéma.", ["au"], [{ text: "au", en: "to the" }])).toEqual({
      parts: ["Il va ", " cinéma."], hints: ["to the"],
    });
  });

  it("keeps multiple hints aligned with their blanks", () => {
    expect(choiceSentence("____ et ____.", ["chat", "chien"], [
      { text: "chat", en: "cat" }, { text: "chien", en: "dog" },
    ])).toEqual({ parts: ["", " et ", "."], hints: ["cat", "dog"] });
  });
});
