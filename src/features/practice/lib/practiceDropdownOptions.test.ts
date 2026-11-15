import { describe, expect, it } from "vitest";
import { buildPracticeDropdownOptions } from "./practiceDropdownOptions";

describe("buildPracticeDropdownOptions", () => {
  it("uses question answers when the separate answers list is empty", () => {
    const answers = ["piétons", "rue", "feux", "éclairage", "conducteurs", "sécurité"];
    const options = buildPracticeDropdownOptions("éclairage", [...answers, "orage", "soleil"], 5, () => 0);

    expect(options).toHaveLength(5);
    expect(new Set(options).size).toBe(5);
    expect(options).toContain("éclairage");
    expect(options.every(option => [...answers, "orage", "soleil"].includes(option))).toBe(true);
  });

  it("does not repeat duplicate answers or invent missing options", () => {
    expect(buildPracticeDropdownOptions("rue", ["rue", "ville", "ville"], 5, () => 0)).toEqual(["ville", "rue"]);
  });
});
