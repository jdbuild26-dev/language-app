import { afterEach, beforeEach, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({ states: [] as any[], refs: [] as any[], effects: [] as any[], callbacks: [] as any[], pending: [] as any[], s: 0, r: 0, e: 0, c: 0 }));
vi.mock("react", () => ({
  useState(initial: any) {
    const i = h.s++; if (!(i in h.states)) h.states[i] = initial;
    return [h.states[i], (value: any) => { h.states[i] = typeof value === "function" ? value(h.states[i]) : value; }];
  },
  useRef(initial: any) { return h.refs[h.r++] ??= { current: initial }; },
  useCallback(callback: any, deps: any[]) {
    const i = h.c++, previous = h.callbacks[i];
    if (!previous || deps.some((value, j) => !Object.is(value, previous.deps[j]))) h.callbacks[i] = { callback, deps };
    return h.callbacks[i].callback;
  },
  useEffect(effect: any, deps: any[]) {
    const i = h.e++, previous = h.effects[i];
    if (!previous || deps.some((value, j) => !Object.is(value, previous.deps[j]))) h.pending.push(() => {
      previous?.cleanup?.(); h.effects[i] = { deps, cleanup: effect() };
    });
  },
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/components/layout/PracticeGameLayout", () => ({ default: () => null }));
vi.mock("@/components/ui/TranslateButton", () => ({ TranslateButton: () => null }));
vi.mock("@/hooks/useTranslateText", () => ({ useTranslateText: (text: string) => ({ displayText: text, showTranslation: false, isTranslating: false, error: null, reset: vi.fn(), toggle: vi.fn() }) }));
vi.mock("@/contexts/LanguageContext", () => ({ useLanguage: () => ({ learningLang: "fr" }) }));
vi.mock("@/services/vocabularyApi", () => ({
  fetchVocabulary: vi.fn(async () => ({ words: [{ id: "1", english: "cat", forms: [{ word: "chat" }] }] })),
  fetchRepeatSentenceData: vi.fn(async () => [{ id: "1", completeSentence: "chat", completeSentenceEn: "cat" }]),
}));
vi.mock("@/utils/textComparison", () => ({ calculateSimilarity: vi.fn((text: string, reference: string) => text === reference ? 1 : 0) }));
import VocabularyRepeatPage from "./VocabularyRepeatPage";
import { calculateSimilarity } from "@/utils/textComparison";

class Recorder {
  static current: Recorder;
  state = "inactive"; mimeType = "audio/webm";
  onstop?: () => void; ondataavailable?: (event: { data: Blob }) => void;
  constructor() { Recorder.current = this; }
  start() { this.state = "recording"; }
  stop() { this.state = "inactive"; this.ondataavailable?.({ data: new Blob(["audio"]) }); this.onstop?.(); }
}
class Recognition {
  static current: Recognition;
  static failStart = false;
  onstart?: () => void; onend?: () => void; onerror?: (event: { error: string }) => void;
  onresult?: (event: { results: any[] }) => void;
  constructor() { Recognition.current = this; }
  start() { if (Recognition.failStart) throw new Error("unavailable"); this.onstart?.(); }
  stop() {}
  result(text: string, isFinal = true) { this.onresult?.({ results: [Object.assign([{ transcript: text }], { isFinal })] }); }
}
function render(mode: "word" | "sentence" = "word"): any {
  h.s = h.r = h.e = h.c = 0;
  const tree = VocabularyRepeatPage({ mode });
  h.pending.splice(0).forEach(effect => effect());
  return tree;
}
function find(node: any, match: (node: any) => boolean): any {
  if (!node || typeof node !== "object") return undefined;
  if (match(node)) return node;
  for (const child of [node.props?.children].flat(Infinity)) { const result = find(child, match); if (result) return result; }
}
async function begin(mode: "word" | "sentence" = "word") {
  render(mode); await Promise.resolve(); await Promise.resolve();
  await find(render(mode), node => node.props?.["aria-label"] === "Start recording").props.onClick();
}
function stop(mode: "word" | "sentence" = "word") {
  find(render(mode), node => node.props?.["aria-label"] === "Stop recording").props.onClick();
}
function expectNotScored(mode: "word" | "sentence" = "word") {
  const tree = render(mode);
  expect(tree.props.showFeedback).toBe(false);
  expect(tree.props.score).toBe(0);
  expect(find(tree, node => node.props?.role === "alert")).toBeDefined();
}
beforeEach(() => {
  h.states = []; h.refs = []; h.effects = []; h.callbacks = []; h.pending = [];
  Recognition.failStart = false; vi.clearAllMocks(); vi.useFakeTimers();
  vi.stubGlobal("window", { SpeechRecognition: Recognition });
  vi.stubGlobal("navigator", { mediaDevices: { getUserMedia: vi.fn(async () => ({ getTracks: () => [{ stop: vi.fn() }] })) } });
  vi.stubGlobal("MediaRecorder", Recorder);
  vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:recording");
  vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
});
afterEach(() => { h.effects.forEach(effect => effect?.cleanup?.()); vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

it("does not score unavailable recognition as an incorrect answer and keeps replay", async () => {
  vi.stubGlobal("window", {}); await begin(); stop();
  await render().props.onNext(); expectNotScored();
  expect(find(render(), node => node.props?.["aria-label"] === "Replay your recording").props.disabled).toBe(false);
});
it("does not score recognition startup failures", async () => {
  Recognition.failStart = true; await begin(); stop();
  await render().props.onNext(); expectNotScored();
});
it("does not score capture errors even if some recognized text exists", async () => {
  await begin(); Recognition.current.result("chat"); Recognition.current.onerror?.({ error: "network" }); stop(); Recognition.current.onend?.();
  await render().props.onNext(); expectNotScored();
});
it("does not score empty or unfinished recognition as incorrect", async () => {
  await begin(); Recognition.current.result("chat", false); stop(); Recognition.current.onend?.();
  await render().props.onNext(); expectNotScored();
});
it("does not score a recording with no recognized speech", async () => {
  await begin(); stop(); Recognition.current.onend?.();
  await render().props.onNext(); expectNotScored();
});
it("waits for final recognition before evaluating a stopped recording", async () => {
  await begin(); Recognition.current.result("ch", false); stop();
  const submission = render().props.onNext();
  expect(render().props.showFeedback).toBe(false);
  Recognition.current.result("chat"); Recognition.current.onend?.();
  await submission;
  expect(render().props).toMatchObject({ showFeedback: true, isCorrect: true, score: 1 });
});
it.each(["word", "sentence"] as const)("scores a finalized wrong %s answer normally", async mode => {
  await begin(mode); Recognition.current.result("chien"); stop(mode); Recognition.current.onend?.();
  await render(mode).props.onNext();
  expect(render(mode).props).toMatchObject({ showFeedback: true, isCorrect: false, score: 0 });
});
it("does not score an evaluator failure as an incorrect answer", async () => {
  await begin(); Recognition.current.result("chat"); stop(); Recognition.current.onend?.();
  vi.mocked(calculateSimilarity).mockImplementationOnce(() => { throw new Error("failed"); });
  await render().props.onNext(); expectNotScored();
});
it("does not score a non-finite evaluation result", async () => {
  await begin(); Recognition.current.result("chat"); stop(); Recognition.current.onend?.();
  vi.mocked(calculateSimilarity).mockReturnValueOnce(NaN);
  await render().props.onNext(); expectNotScored();
});
it("does not allow a stale Submit handler to score an answer twice", async () => {
  await begin(); Recognition.current.result("chat"); stop(); Recognition.current.onend?.();
  const submit = render().props.onNext;
  await submit(); await submit();
  expect(render().props.score).toBe(1);
});

it.each(["word", "sentence"] as const)("makes %s translation available only after submission", async mode => {
  await begin(mode);
  expect(render(mode).props.preserveFooterHeightOnFeedback).toBe(true);
  expect(render(mode).props.showInstructionTranslateButton).toBe(false);
  expect(find(render(mode), node => node.props?.["aria-label"] === "Show English")).toBeUndefined();
  Recognition.current.result("chat"); stop(mode); Recognition.current.onend?.();
  await render(mode).props.onNext();
  expect(render(mode).props.showInstructionTranslateButton).toBe(true);
  expect(find(render(mode), node => node.props?.["aria-label"] === "Show English").props.onClick).toBeTypeOf("function");
});
