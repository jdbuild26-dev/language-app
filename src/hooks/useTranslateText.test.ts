import { afterEach, beforeEach, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ values: [] as unknown[], cursor: 0 }));
vi.mock("react", () => ({
  useState(initial: unknown) {
    const index = state.cursor++;
    if (!(index in state.values)) state.values[index] = initial;
    return [state.values[index], (value: unknown) => { state.values[index] = value; }];
  },
}));
import { useTranslateText } from "./useTranslateText";

function render(stored?: string) {
  state.cursor = 0;
  return useTranslateText("Bonjour", "fr", stored);
}
beforeEach(() => {
  state.values = [];
  vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ translation: "Hello" }))));
});
afterEach(() => vi.unstubAllGlobals());

it("uses the supplied translation without a request or loading state and toggles back", async () => {
  await render("Hello").toggle();
  expect(fetch).not.toHaveBeenCalled();
  expect(render("Hello")).toMatchObject({ displayText: "Hello", isTranslating: false });
  await render("Hello").toggle();
  expect(render("Hello").displayText).toBe("Bonjour");
});

it("accepts an unchanged stored translation without unnecessarily requesting it", async () => {
  await render("Bonjour").toggle();
  expect(fetch).not.toHaveBeenCalled();
});

it("fetches only when stored text is missing and reuses the fetched translation", async () => {
  await render().toggle();
  expect(fetch).toHaveBeenCalledOnce();
  expect(render().displayText).toBe("Hello");
  await render().toggle();
  await render().toggle();
  expect(fetch).toHaveBeenCalledOnce();
});

it("sends the displayed source language when requesting the missing translation", async () => {
  state.cursor = 0;
  await useTranslateText("Hello", "en").toggle();
  expect(fetch).toHaveBeenCalledWith("/api/translate", expect.objectContaining({
    body: JSON.stringify({ text: "Hello", source_lang: "en", target_lang: "fr" }),
  }));
});
