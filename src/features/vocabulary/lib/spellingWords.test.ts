import { describe, expect, it } from "vitest";
import { prepareSpellingWords } from "./spellingWords";

describe("prepareSpellingWords", () => {
  it("keeps the activity populated when the API has no wrong spellings", () => {
    const words = prepareSpellingWords([
      { id: "1", english: "cat", forms: [{ word: "chat" }], wrongSpelling: "" },
    ]);

    expect(words).toHaveLength(1);
    expect(words[0].wrongSpelling).toBeTruthy();
    expect(words[0].wrongSpelling).not.toBe("chat");
  });

  it("prefers supplied spellings and skips words with no answer", () => {
    const words = prepareSpellingWords([
      { id: "1", english: "dog", forms: [{ word: "chien" }], wrongSpelling: "cheen" },
      { id: "2", english: "unknown", forms: [], wrongSpelling: "wrong" },
    ]);

    expect(words).toHaveLength(1);
    expect(words[0].wrongSpelling).toBe("cheen");
  });
});
