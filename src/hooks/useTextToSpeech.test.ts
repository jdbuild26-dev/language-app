import { afterEach, expect, it, vi } from "vitest";

const harness = vi.hoisted(() => ({ cleanups: [] as Array<() => void> }));
vi.mock("react", () => ({
  useState: (initial: unknown) => [initial, vi.fn()],
  useRef: (initial: unknown) => ({ current: initial }),
  useCallback: (callback: unknown) => callback,
  useEffect: (effect: () => void | (() => void)) => {
    const cleanup = effect();
    if (cleanup) harness.cleanups.push(cleanup);
  },
}));

import { useTextToSpeech } from "./useTextToSpeech";

afterEach(() => {
  harness.cleanups.splice(0).forEach((cleanup) => cleanup());
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

it("keeps one speaker playing when another speech hook unmounts", () => {
  vi.useFakeTimers();
  const synth = {
    getVoices: () => [{ lang: "fr-FR" }],
    cancel: vi.fn(), resume: vi.fn(), speak: vi.fn(),
    speaking: true, paused: false, onvoiceschanged: null,
  };
  vi.stubGlobal("window", { speechSynthesis: synth });
  vi.stubGlobal("SpeechSynthesisUtterance", class { constructor(public text: string) {} });

  const selectedOption = useTextToSpeech();
  useTextToSpeech();
  selectedOption.speak("Bonjour", "fr-FR");
  vi.advanceTimersByTime(50);
  expect(synth.speak).toHaveBeenCalledOnce();
  const cancelsBeforeFeedback = synth.cancel.mock.calls.length;

  harness.cleanups[1](); // A different hook instance leaves during feedback.
  expect(synth.cancel).toHaveBeenCalledTimes(cancelsBeforeFeedback);

  selectedOption.cancel();
  expect(synth.cancel).toHaveBeenCalledTimes(cancelsBeforeFeedback + 1);
});
