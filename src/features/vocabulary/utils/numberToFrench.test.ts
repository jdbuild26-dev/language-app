import { expect, it } from "vitest";
import { MAX_PRACTICE_NUMBER, NUMBER_WORD_GROUPS, numberToFrench, numberToFrenchTokens } from "./numberToFrench";

it("turns the six-digit prompt from Number Practice into selectable French tokens", () => {
  expect(numberToFrenchTokens(827_180)).toEqual([
    "huit", "cent", "vingt", "-", "sept", "mille", "cent", "quatre-vingts",
  ]);
  expect(numberToFrench(827_180)).toBe("huit cent vingt-sept mille cent quatre-vingts");
});

it.each([
  [0, "zéro"],
  [71, "soixante et onze"],
  [280, "deux cent quatre-vingts"],
  [80_000, "quatre-vingt mille"],
  [200_000, "deux cent mille"],
  [1_000_000, "un million"],
  [80_000_000, "quatre-vingts millions"],
  [MAX_PRACTICE_NUMBER, "quatre-vingt-dix-neuf millions neuf cent quatre-vingt-dix-neuf mille neuf cent quatre-vingt-dix-neuf"],
])("spells %i and offers every required tile", (number, answer) => {
  expect(numberToFrench(number)).toBe(answer);
  expect(NUMBER_WORD_GROUPS.flat()).toEqual(expect.arrayContaining(numberToFrenchTokens(number)));
});

it("rejects values outside the supported input range", () => {
  expect(numberToFrenchTokens(-1)).toEqual([]);
  expect(numberToFrenchTokens(1.5)).toEqual([]);
  expect(numberToFrenchTokens(MAX_PRACTICE_NUMBER + 1)).toEqual([]);
});
