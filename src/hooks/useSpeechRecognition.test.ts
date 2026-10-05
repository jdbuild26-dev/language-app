import { afterEach, beforeEach, expect, it, vi } from "vitest";

const harness = vi.hoisted(() => ({ effects: [] as (() => void | (() => void))[], cleanup: [] as (() => void)[] }));
vi.mock("react", () => ({
  useState: (value: unknown) => [value, vi.fn()],
  useRef: (value: unknown) => ({ current: value }),
  useCallback: (value: unknown) => value,
  useEffect: (effect: () => void | (() => void)) => harness.effects.push(effect),
}));
vi.mock("@/contexts/LanguageContext", () => ({ useLanguage: () => ({ learningLang: "fr" }) }));
import useSpeechRecognition from "./useSpeechRecognition";

class Recognition {
  static current: Recognition;
  onstart?: () => void; onend?: () => void;
  onerror?: (event: { error: string }) => void;
  onresult?: (event: { results: { 0: { transcript: string }; isFinal: boolean }[] }) => void;
  constructor() { Recognition.current = this; }
  start() { this.onstart?.(); }
  stop = vi.fn();
  result(text: string, isFinal = true) { this.onresult?.({ results: [{ 0: { transcript: text }, isFinal }] }); }
}
function SpeechCaptureHarness() {
  const hook = useSpeechRecognition();
  harness.effects.splice(0).forEach(effect => { const cleanup = effect(); if (cleanup) harness.cleanup.push(cleanup); });
  hook.startListening();
  return { hook, recognition: Recognition.current };
}
beforeEach(() => { vi.useFakeTimers(); vi.stubGlobal("window", { SpeechRecognition: Recognition }); });
afterEach(() => { harness.cleanup.splice(0).forEach(cleanup => cleanup()); vi.useRealTimers(); vi.unstubAllGlobals(); });

it("waits for recognition end instead of submitting a truncated interim transcript", async () => {
  const { hook, recognition } = SpeechCaptureHarness();
  recognition.result("Je vois", false);
  const settled = vi.fn();
  const promise = hook.stopAndReadTranscript();
  promise.then(settled, settled);
  await vi.advanceTimersByTimeAsync(1600);
  expect(settled).not.toHaveBeenCalled();
  recognition.result("Je vois une pharmacie."); recognition.onend?.();
  await expect(promise).resolves.toBe("Je vois une pharmacie.");
});

it("rejects capture failures instead of evaluating interim words", async () => {
  const { hook, recognition } = SpeechCaptureHarness(); recognition.result("Je vois", false);
  const promise = hook.stopAndReadTranscript();
  const check = expect(promise).rejects.toThrow();
  recognition.onerror?.({ error: "network" });
  await check;
});

it("times out with an error instead of scoring partial speech", async () => {
  const { hook, recognition } = SpeechCaptureHarness(); recognition.result("Je vois", false);
  const promise = hook.stopAndReadTranscript();
  const check = expect(promise).rejects.toThrow("timed out");
  await vi.advanceTimersByTimeAsync(10000);
  await check;
});

it("does not accept an interim tail when recognition ends", async () => {
  const { hook, recognition } = SpeechCaptureHarness(); recognition.result("Je vois", false);
  const check = expect(hook.stopAndReadTranscript()).rejects.toThrow("did not finish");
  recognition.onend?.(); await check;
});

it("keeps finalized text after manual stop and does not stop twice", async () => {
  const { hook, recognition } = SpeechCaptureHarness(); recognition.result("Deux personnes.");
  hook.stopListening();
  const promise = hook.stopAndReadTranscript();
  expect(recognition.stop).toHaveBeenCalledTimes(1);
  recognition.onend?.();
  await expect(promise).resolves.toBe("Deux personnes.");
});

it("cancels pending capture when the exercise resets", async () => {
  const { hook } = SpeechCaptureHarness();
  const check = expect(hook.stopAndReadTranscript()).rejects.toThrow("cancelled");
  hook.resetTranscript(); await check;
});

it("separates recognition chunks without merging words", async () => {
  const { hook, recognition } = SpeechCaptureHarness();
  recognition.onresult?.({ results: [
    { 0: { transcript: "Je vois un bureau." }, isFinal: true },
    { 0: { transcript: "Deux personnes travaillent." }, isFinal: true },
  ] });
  recognition.onend?.();
  await expect(hook.stopAndReadTranscript()).resolves.toBe("Je vois un bureau. Deux personnes travaillent.");
});
