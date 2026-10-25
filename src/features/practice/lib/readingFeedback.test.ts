import { describe, expect, it } from "vitest";
import { getReadingFeedbackTone } from "./readingFeedback";

describe("reading answer feedback", () => {
  it("reports an error when none of the six answers are correct", () => {
    expect(getReadingFeedbackTone(0, 6)).toBe("error");
  });
  it.each([3, 4])("reports a partial result for %i correct answers out of six", (correctCount) => {
    expect(getReadingFeedbackTone(correctCount, 6)).toBe("partial");
  });
  it("reports success when all six answers are correct", () => {
    expect(getReadingFeedbackTone(6, 6)).toBe("success");
  });
  it.each([
    [0, 0], [1, 0], [-1, 6], [7, 6], [1.5, 6], [1, 6.5],
    [NaN, 6], [1, Infinity], [Infinity, Infinity],
  ])("does not show success or partial feedback for invalid counts %s/%s", (correctCount, totalCount) => {
    expect(getReadingFeedbackTone(correctCount, totalCount)).toBe("error");
  });
});
