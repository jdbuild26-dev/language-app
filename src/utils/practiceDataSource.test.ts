import { afterEach, describe, expect, it, vi } from "vitest";
import { allowBundledPracticeCsv } from "./practiceDataSource";
import { loadMockCSV } from "./csvLoader";
import { fetchPracticeData } from "./practiceFetcher";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("bundled practice CSV policy", () => {
  it("keeps Main Practice fixtures out of production", () => {
    expect(allowBundledPracticeCsv("practice/reading/fill_blanks.csv", "production")).toBe(false);
    expect(allowBundledPracticeCsv("practice/listening/listen_type.csv", "production")).toBe(false);
    expect(allowBundledPracticeCsv("practice/writing/write_topic.csv", "production")).toBe(false);
    expect(allowBundledPracticeCsv("practice/speaking/speak_image.csv", "production")).toBe(false);
  });

  it("keeps local development fixtures and other practice collections available", () => {
    expect(allowBundledPracticeCsv("practice/reading/fill_blanks.csv", "development")).toBe(true);
    expect(allowBundledPracticeCsv("practice/grammar/four_options.csv", "production")).toBe(true);
  });

  it("does not request a bundled CSV after a production API failure", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const fetch = vi.fn().mockResolvedValue({ ok: false, status: 503, statusText: "Unavailable" });
    vi.stubGlobal("fetch", fetch);

    expect(await loadMockCSV("practice/reading/fill_blanks.csv")).toEqual([]);
    expect(await fetchPracticeData("listen_bubble")).toEqual([]);
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch.mock.calls.every(([url]) => !String(url).includes("/mock-data/"))).toBe(true);
  });

  it("filters Translate Typed development CSV rows by the selected tag", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const fetch = vi.fn()
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({ ok: true, text: async () => "Exercise Tag,Question\nTag_A,First\nTag_B,Second\nTag_A,Third\n" });
    vi.stubGlobal("fetch", fetch);
    const rows = await loadMockCSV("practice/writing/translate_typed.csv", { tag: "Tag_A" });
    expect(rows.map(row => row.Question)).toEqual(["First", "Third"]);
  });
});
