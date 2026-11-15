import { afterEach, describe, expect, it, vi } from "vitest";
import { createAnswerPairTranslation, findBilingualAnswer } from "./answerPairTranslation";

describe("answer pair translation", () => {
  afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });
  it("switches stored translations synchronously without loading or a network request", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    const pair = createAnswerPairTranslation({ wrong: "orange", correct: "carotte", wrongTranslation: "orange", correctTranslation: "carrot", targetLang: "en" });
    const snapshots: boolean[] = [];
    pair.subscribe(() => snapshots.push(pair.getSnapshot().loading));
    const pending = pair.toggle();
    expect(pair.getSnapshot()).toMatchObject({ wrong: "orange", correct: "carrot", translated: true, loading: false });
    expect(snapshots).toEqual([false]);
    expect(fetch).not.toHaveBeenCalled();
    await pending;
    await pair.toggle();
    expect(pair.getSnapshot()).toMatchObject({ wrong: "orange", correct: "carotte", translated: false, loading: false });
  });
  it("does not start loading when a stored-only row is missing a translation", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    const pair = createAnswerPairTranslation({
      wrong: "lampe", correct: "bac", correctTranslation: "bin", targetLang: "en", storedOnly: true,
    });
    expect(pair.canTranslate).toBe(false);
    await pair.toggle();
    expect(pair.getSnapshot()).toMatchObject({ wrong: "lampe", correct: "bac", translated: false, loading: false });
    expect(fetch).not.toHaveBeenCalled();
  });
  it("toggles supplied wrong and correct translations together and restores originals", async () => {
    const pair = createAnswerPairTranslation({
      wrong: "lampe", correct: "bac", wrongTranslation: "lamp", correctTranslation: "bin", targetLang: "en",
    });
    await pair.toggle();
    expect(pair.getSnapshot()).toMatchObject({ wrong: "lamp", correct: "bin", translated: true, loading: false });
    await pair.toggle();
    expect(pair.getSnapshot()).toMatchObject({ wrong: "lampe", correct: "bac", translated: false });
  });
  it("keeps both originals until missing API translation arrives, then switches the pair", async () => {
    let finish!: (value: Response) => void;
    vi.stubGlobal("fetch", () => new Promise<Response>(resolve => { finish = resolve; }));
    const pair = createAnswerPairTranslation({ wrong: "lampe", correct: "bac", correctTranslation: "bin", targetLang: "en" });
    const loading = pair.toggle();
    expect(pair.getSnapshot()).toMatchObject({ wrong: "lampe", correct: "bac", loading: true, translated: false });
    finish(new Response(JSON.stringify({ translation: "lamp" })));
    await loading;
    expect(pair.getSnapshot()).toMatchObject({ wrong: "lamp", correct: "bin", loading: false, translated: true });
  });
  it("keeps supplied translation through failure and allows a complete retry", async () => {
    let available = false;
    vi.stubGlobal("fetch", async () => available
      ? new Response(JSON.stringify({ translation: "lamp" })) : new Response("offline", { status: 503 }));
    const pair = createAnswerPairTranslation({ wrong: "lampe", correct: "bac", correctTranslation: "bin", targetLang: "en" });
    await pair.toggle();
    expect(pair.getSnapshot()).toMatchObject({ wrong: "lampe", correct: "bac", translated: false, error: "Translation unavailable. Try again." });
    available = true;
    await pair.toggle();
    expect(pair.getSnapshot()).toMatchObject({ wrong: "lamp", correct: "bin", translated: true, error: "" });
  });
  it("cancels and restores originals on leaving the row even if an old response arrives", async () => {
    let finish!: (value: Response) => void;
    vi.stubGlobal("fetch", () => new Promise<Response>(resolve => { finish = resolve; }));
    const pair = createAnswerPairTranslation({ correct: "bac", targetLang: "en" });
    const pending = pair.toggle();
    pair.cancel();
    finish(new Response(JSON.stringify({ translation: "bin" })));
    await pending;
    expect(pair.getSnapshot()).toMatchObject({ correct: "bac", translated: false, loading: false, error: "" });
  });
  it("stops loading after ten seconds and allows retry rather than hanging", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("fetch", () => new Promise<Response>(() => {}));
    const pair = createAnswerPairTranslation({ correct: "bac", targetLang: "en" });
    const pending = pair.toggle();
    await vi.advanceTimersByTimeAsync(10_000);
    await pending;
    expect(pair.getSnapshot()).toMatchObject({ correct: "bac", translated: false, loading: false, error: "Translation unavailable. Try again." });
  });
  it("ignores repeated clicks during loading and supports a correct-only row", async () => {
    let finish!: (value: Response) => void;
    vi.stubGlobal("fetch", () => new Promise<Response>(resolve => { finish = resolve; }));
    const pair = createAnswerPairTranslation({ correct: "bin", targetLang: "fr" });
    const pending = pair.toggle();
    await pair.toggle();
    finish(new Response(JSON.stringify({ translation: "bac" })));
    await pending;
    expect(pair.getSnapshot()).toMatchObject({ correct: "bac", wrong: undefined, translated: true, loading: false });
    await pair.toggle();
    expect(pair.getSnapshot()).toMatchObject({ correct: "bin", translated: false });
  });
  it("finds wrong-answer bilingual data by matching text in either language", () => {
    const pairs = [{ fr: "bac", en: "bin" }, { fr: "lampe", en: "lamp" }];
    expect(findBilingualAnswer("lampe", pairs, "fr")).toBe("lamp");
    expect(findBilingualAnswer("bin", pairs, "en")).toBe("bac");
    expect(findBilingualAnswer("papier", pairs, "fr")).toBeUndefined();
  });
  it("uses a complete stored pair despite casing, whitespace or an earlier incomplete entry", () => {
    expect(findBilingualAnswer(" Carotte ", [{ fr: "carotte" }, { fr: "carotte", en: "carrot" }], "fr")).toBe("carrot");
    expect(findBilingualAnswer("CARROT", [{ fr: "carotte", en: "carrot" }], "en")).toBe("carotte");
    expect(findBilingualAnswer("livre", [{ fr: "livre", en: "book" }, { fr: "livre", en: "pound" }], "fr")).toBeUndefined();
  });
});
