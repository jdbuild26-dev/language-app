import { afterEach, describe, expect, it, vi } from "vitest";
import { createAnswerPairTranslation, findBilingualAnswer } from "./answerPairTranslation";

describe("answer pair translation", () => {
  afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });
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
});
