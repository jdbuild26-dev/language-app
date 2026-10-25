import { readFileSync } from "node:fs";
import { afterEach, expect, it, vi } from "vitest";
import { fetchMatchPairsData } from "./vocabularyApi";

afterEach(() => vi.unstubAllGlobals());

it("loads match cards from the current multi-pair CSV fallback", async () => {
  const csv = 'ExerciseID,Level,pairs\nG2-001,A1,"[{""id"":1,""left"":""Dog"",""right"":""Chien""},{""id"":2,""left"":""Cat"",""right"":""Chat""}]"\n';
  const fetchMock = vi.fn()
    .mockResolvedValueOnce({ ok: false, status: 404 })
    .mockResolvedValueOnce({ ok: true, text: async () => csv });
  vi.stubGlobal("fetch", fetchMock);

  const pairs = await fetchMatchPairsData();

  expect(pairs).toHaveLength(2);
  expect(pairs).toEqual(expect.arrayContaining([
    expect.objectContaining({ english: "Dog", french: "Chien" }),
    expect.objectContaining({ english: "Cat", french: "Chat" }),
  ]));
});

it("uses the real local pairs when the API has no exercises", async () => {
  const csv = readFileSync(new URL("../../public/mock-data/csv/match_pairs.csv", import.meta.url), "utf8");
  vi.stubGlobal("fetch", vi.fn()
    .mockResolvedValueOnce({ ok: true, json: async () => [] })
    .mockResolvedValueOnce({ ok: true, text: async () => csv }));

  const pairs = await fetchMatchPairsData();

  expect(pairs.length).toBeGreaterThanOrEqual(4);
  expect(pairs.every((pair) => pair.id && pair.french && pair.english)).toBe(true);
});
