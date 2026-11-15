import { describe, expect, it } from "vitest";
import { gradeHighlightSelection, parseHighlightAnswers } from "./highlightWordAnswers";

describe("highlight word answers", () => {
  it("accepts one or several CSV answers", () => {
    expect(parseHighlightAnswers("noir")).toEqual(["noir"]);
    expect(parseHighlightAnswers("chien|chat")).toEqual(["chien", "chat"]);
    expect(parseHighlightAnswers("2|chien|chat")).toEqual(["chien", "chat"]);
    expect(parseHighlightAnswers('["chien", "chat"]')).toEqual(["chien", "chat"]);
  });

  it("marks extra selections wrong even when the CSV has one answer", () => {
    const result = gradeHighlightSelection(["Le", "chat", "noir", "dort"], ["noir"], new Set([1, 2, 3]));
    expect(result.correctIndices).toEqual(new Set([2]));
    expect(result.isCorrect).toBe(false);
  });

  it("requires all correct words and no extras", () => {
    const words = ["Le", "chien", "et", "le", "chat", "dorment."];
    expect(gradeHighlightSelection(words, ["chien", "chat"], new Set([1, 4])).isCorrect).toBe(true);
    expect(gradeHighlightSelection(words, ["chien", "chat"], new Set([1])).isCorrect).toBe(false);
    expect(gradeHighlightSelection(words, ["chien", "chat"], new Set([1, 4, 5])).isCorrect).toBe(false);
  });
});
