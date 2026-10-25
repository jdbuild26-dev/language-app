import { afterEach, beforeEach, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  values: [] as any[], cursor: 0,
  refs: [] as any[], refCursor: 0,
  effects: [] as any[], effectCursor: 0, pending: [] as (() => void)[],
  callbacks: [] as any[], callbackCursor: 0,
}));
vi.mock("react", () => ({
  useState(initial: unknown) {
    const index = state.cursor++;
    if (!(index in state.values)) state.values[index] = typeof initial === "function" ? initial() : initial;
    return [state.values[index], (value: any) => { state.values[index] = typeof value === "function" ? value(state.values[index]) : value; }];
  },
  useRef(initial: unknown) { return state.refs[state.refCursor++] ??= { current: initial }; },
  useCallback(callback: unknown, deps: unknown[]) {
    const index = state.callbackCursor++;
    const prev = state.callbacks[index];
    if (!prev || deps.some((dep, i) => !Object.is(dep, prev.deps[i]))) state.callbacks[index] = { callback, deps };
    return state.callbacks[index].callback;
  },
  useEffect(effect: () => void | (() => void), deps: unknown[]) {
    const index = state.effectCursor++;
    const prev = state.effects[index];
    if (!prev || deps.some((dep, i) => !Object.is(dep, prev.deps[i]))) {
      state.pending.push(() => { prev?.cleanup?.(); state.effects[index] = { deps, cleanup: effect() }; });
    }
  },
}));
import { useTranslateText } from "./useTranslateText";

function render(stored?: string, source = "Bonjour", language = "fr", target?: string) {
  state.cursor = 0;
  state.refCursor = state.effectCursor = state.callbackCursor = 0;
  // The mocked React state above is a deterministic hook test harness.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const result = useTranslateText(source, language, stored, target);
  state.pending.splice(0).forEach(effect => effect());
  return result;
}
beforeEach(() => {
  state.values = [];
  state.refs = []; state.effects = []; state.callbacks = []; state.pending = [];
  vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ translation: "Hello" }))));
});
afterEach(() => {
  state.effects.forEach(effect => effect?.cleanup?.());
  vi.useRealTimers(); vi.unstubAllGlobals();
});

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
  await render(undefined, "Hello", "en").toggle();
  expect(fetch).toHaveBeenCalledWith("/api/translate", expect.objectContaining({
    body: JSON.stringify({ text: "Hello", source_lang: "en", target_lang: "fr" }),
  }));
});

it("uses the requested target language for vocabulary translations", async () => {
  await render(undefined, "Bonjour", "fr", "de").toggle();
  expect(fetch).toHaveBeenCalledWith("/api/translate", expect.objectContaining({
    body: JSON.stringify({ text: "Bonjour", source_lang: "fr", target_lang: "de" }),
  }));
  expect(render(undefined, "Bonjour", "fr", "de").displayText).toBe("Hello");
  expect(render(undefined, "Bonjour", "fr", "es").displayText).toBe("Bonjour");
});

it("times out even when the transport ignores abort, keeps the source and permits retry", async () => {
  vi.useFakeTimers();
  vi.mocked(fetch).mockImplementationOnce(() => new Promise(() => {}));
  const pending = render().toggle();
  expect(render().isTranslating).toBe(true);
  await vi.advanceTimersByTimeAsync(10000);
  await pending;
  expect(render()).toMatchObject({ displayText: "Bonjour", isTranslating: false, showTranslation: false });
  expect(render().error).toMatch(/timed out/i);
  await render().toggle();
  expect(render()).toMatchObject({ displayText: "Hello", error: null });
});

it.each(["http", "empty", "invalid"])("exposes a retryable error for a %s response", async kind => {
  vi.mocked(fetch).mockResolvedValueOnce(kind === "http" ? new Response("", { status: 503 }) :
    new Response(kind === "empty" ? JSON.stringify({ translation: "  " }) : "bad-json"));
  await render().toggle();
  expect(render().displayText).toBe("Bonjour");
  expect(render().error).toBeTruthy();
  expect(render().isTranslating).toBe(false);
  await render().toggle();
  expect(render()).toMatchObject({ displayText: "Hello", error: null });
});

it("cancels on reset and ignores a late response", async () => {
  let resolve!: (response: Response) => void;
  vi.mocked(fetch).mockImplementationOnce(() => new Promise(done => { resolve = done; }));
  const pending = render().toggle();
  const signal = vi.mocked(fetch).mock.calls[0][1]?.signal;
  render().reset();
  expect(signal?.aborted).toBe(true);
  resolve(Response.json({ translation: "Late" })); await pending;
  expect(render()).toMatchObject({ displayText: "Bonjour", isTranslating: false, error: null });
});

it("does not apply a previous question's translation to a new source", async () => {
  let resolve!: (response: Response) => void;
  vi.mocked(fetch).mockImplementationOnce(() => new Promise(done => { resolve = done; }));
  const pending = render().toggle();
  render(undefined, "Bonsoir");
  resolve(Response.json({ translation: "Hello" })); await pending;
  expect(render(undefined, "Bonsoir")).toMatchObject({ displayText: "Bonsoir", isTranslating: false, showTranslation: false });
});

it("cancels on unmount and prevents duplicate requests while loading", async () => {
  vi.mocked(fetch).mockImplementation(() => new Promise(() => {}));
  const pending = render().toggle();
  const second = render().toggle();
  expect(fetch).toHaveBeenCalledOnce();
  state.effects.forEach(effect => effect?.cleanup?.());
  expect(vi.mocked(fetch).mock.calls[0][1]?.signal?.aborted).toBe(true);
  await Promise.all([pending, second]);
});
