import { describe, expect, it } from "vitest";
import { normalizeWriteImageSummary } from "./writeImageSummary";

const summary = {
  overall_description: "The learner describes an office.",
  what_the_learner_did_well: "They mention the computers and windows.",
  what_was_missing_or_could_have_been_better: "The layout needs more detail.",
  how_the_learner_can_improve: ["Describe the desks.", "Mention visible objects.", "Describe the atmosphere."],
};

describe("normalizeWriteImageSummary", () => {
  it("removes matching French sections from older combined summaries", () => {
    const combined = `${summary.overall_description} Points forts: ${summary.what_the_learner_did_well} Points à améliorer: ${summary.what_was_missing_or_could_have_been_better} Comment progresser: Décrire la scène.`;
    expect(normalizeWriteImageSummary({ ...summary, overall_description: combined })).toEqual(summary);
  });
  it("removes a repeated report from the description without changing the other sections", () => {
    const combined = `${summary.overall_description}\nWhat the Learner Did Well: ${summary.what_the_learner_did_well}\nWhat Was Missing or Could Have Been Better: ${summary.what_was_missing_or_could_have_been_better}\nHow the Learner Can Improve 1. Describe the desks. 2. Mention visible objects. 3. Describe the atmosphere.`;
    expect(normalizeWriteImageSummary({ ...summary, overall_description: combined })).toEqual(summary);
  });

  it("preserves an already structured description", () => {
    expect(normalizeWriteImageSummary(summary)).toBe(summary);
  });

  it("does not remove text when the embedded sections differ from the structured fields", () => {
    const different = { ...summary, overall_description: `${summary.overall_description} What the Learner Did Well Another observation. What Was Missing or Could Have Been Better Another gap. How the Learner Can Improve Another tip.` };
    expect(normalizeWriteImageSummary(different)).toBe(different);
  });
});
