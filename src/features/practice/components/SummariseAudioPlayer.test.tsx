import { afterEach, beforeEach, expect, it, vi } from "vitest";

const hooks = vi.hoisted(() => ({
  values: [] as unknown[], deps: [] as (unknown[] | undefined)[], cursor: 0,
  effects: [] as (() => void | (() => void))[], cleanup: [] as (() => void)[],
}));
vi.mock("react", async importOriginal => ({
  ...await importOriginal<typeof import("react")>(),
  useState(initial: unknown) {
    const index = hooks.cursor++;
    if (!(index in hooks.values)) hooks.values[index] = initial;
    return [hooks.values[index], (next: unknown) => {
      hooks.values[index] = typeof next === "function" ? next(hooks.values[index]) : next;
    }];
  },
  useRef(initial: unknown) {
    const index = hooks.cursor++;
    return hooks.values[index] ??= { current: initial };
  },
  useCallback(callback: unknown, deps: unknown[]) {
    const index = hooks.cursor++;
    if (!hooks.deps[index] || deps.some((value, i) => value !== hooks.deps[index]![i])) {
      hooks.deps[index] = deps;
      hooks.values[index] = callback;
    }
    return hooks.values[index];
  },
  useEffect(effect: () => void | (() => void), deps: unknown[]) {
    const index = hooks.cursor++;
    if (!hooks.deps[index] || deps.some((value, i) => value !== hooks.deps[index]![i])) {
      hooks.deps[index] = deps;
      hooks.effects.push(effect);
    }
  },
}));
vi.mock("../../../components/ui/AudioWaveform", () => ({ default: "waveform" }));
import SummariseAudioPlayer from "./SummariseAudioPlayer";

class Utterance {
  text: string;
  rate = 1;
  onstart?: () => void;
  onend?: () => void;
  constructor(text: string) { this.text = text; }
}
const spoken: Utterance[] = [];
const synth = {
  speaking: false, paused: false,
  getVoices: () => [],
  speak: vi.fn((utterance: Utterance) => {
    spoken.push(utterance);
    synth.speaking = true;
    utterance.onstart?.();
  }),
  cancel: vi.fn(() => { synth.speaking = false; }),
  pause: vi.fn(() => { synth.paused = true; }),
  resume: vi.fn(() => { synth.paused = false; }),
};
const passage = "Bonjour et bienvenue dans cette émission. " + "Les élèves prennent des notes. ".repeat(20);
type Node = { type?: unknown; props?: Record<string, unknown> };
function nodes(tree: unknown): Node[] {
  if (!tree || typeof tree !== "object") return [];
  const node = tree as Node;
  return [node, ...[node.props?.children].flat(Infinity).flatMap(nodes)];
}
function render(disabled = false, text = passage) {
  hooks.cursor = 0;
  const tree = SummariseAudioPlayer({ text, lang: "fr-FR", disabled });
  hooks.effects.splice(0).forEach(effect => {
    const cleanup = effect();
    if (cleanup) hooks.cleanup.push(cleanup);
  });
  return tree;
}
function click(label: string) {
  const button = nodes(render()).find(node => node.props?.["aria-label"] === label);
  expect(button).toBeDefined();
  (button!.props!.onClick as () => void)();
}
beforeEach(() => {
  vi.useFakeTimers();
  hooks.values = []; hooks.deps = []; hooks.cursor = 0;
  hooks.effects = []; hooks.cleanup = [];
  spoken.length = 0;
  synth.speaking = false; synth.paused = false;
  vi.clearAllMocks();
  vi.stubGlobal("window", { speechSynthesis: synth });
  vi.stubGlobal("SpeechSynthesisUtterance", Utterance);
  render(); render();
});
afterEach(() => {
  hooks.cleanup.forEach(cleanup => cleanup());
  vi.clearAllTimers(); vi.useRealTimers(); vi.unstubAllGlobals();
});

it("stays silent after pause, even when old speech ends or keep-alive time passes", () => {
  click("Play passage"); vi.advanceTimersByTime(50); render();
  vi.advanceTimersByTime(1000);
  const first = spoken[0];
  click("Pause passage"); render();
  const resumes = synth.resume.mock.calls.length;
  first.onend?.();
  vi.advanceTimersByTime(12000);
  expect(spoken).toHaveLength(1);
  expect(synth.resume).toHaveBeenCalledTimes(resumes);
  expect(nodes(render()).some(node => node.props?.["aria-label"] === "Resume passage")).toBe(true);
  click("Resume passage"); vi.advanceTimersByTime(50);
  expect(spoken).toHaveLength(2);
  expect(spoken[1].text).not.toBe(first.text);
  expect(nodes(render()).find(node => node.type === "waveform")?.props?.progress).toBeGreaterThan(0);
});

it("cancels pending playback when paused before the speech engine starts", () => {
  click("Play passage"); render(); click("Pause passage");
  vi.advanceTimersByTime(12000);
  expect(spoken).toHaveLength(0);
});

it("retains slow speed for play, seek and replay without starting while idle", () => {
  click("Slow playback"); render(); vi.advanceTimersByTime(1000);
  expect(spoken).toHaveLength(0);
  click("Play passage"); vi.advanceTimersByTime(50); render();
  expect(spoken[0].rate).toBe(0.55);
  const waveform = nodes(render()).find(node => node.type === "waveform")!;
  (waveform.props!.onSeek as (value: number) => void)(50);
  render(); vi.advanceTimersByTime(12000);
  expect(spoken).toHaveLength(1);
  click("Play passage"); vi.advanceTimersByTime(50); render();
  expect(spoken[1].rate).toBe(0.55);
  click("Replay passage"); vi.advanceTimersByTime(50);
  expect(spoken[2].rate).toBe(0.55);
  expect(spoken[2].text).toBe(spoken[0].text);
});

it("stops playback during evaluation and resets position and speed for a new passage", () => {
  click("Slow playback"); click("Play passage"); vi.advanceTimersByTime(50); render();
  render(true);
  spoken[0].onend?.(); vi.advanceTimersByTime(12000);
  expect(spoken).toHaveLength(1);
  render(false, "Un nouveau passage.");
  const tree = render(false, "Un nouveau passage.");
  expect(nodes(tree).find(node => node.type === "waveform")?.props?.progress).toBe(0);
  expect(nodes(tree).find(node => node.props?.["aria-label"] === "Slow playback")?.props?.["aria-pressed"]).toBe(false);
});

it("changes speed near the current word while playing and remains silent when paused", () => {
  click("Play passage"); vi.advanceTimersByTime(1050); render();
  click("Slow playback"); vi.advanceTimersByTime(50); render();
  expect(spoken[1].rate).toBe(0.55);
  expect(spoken[1].text).not.toBe(spoken[0].text);
  click("Pause passage"); render();
  click("Slow playback"); vi.advanceTimersByTime(12000); render();
  expect(spoken).toHaveLength(2);
  click("Resume passage"); vi.advanceTimersByTime(50);
  expect(spoken[2].rate).toBe(0.9);
});

it("cancels queued speech on unmount", () => {
  click("Play passage"); vi.advanceTimersByTime(50); render();
  hooks.cleanup.splice(0).forEach(cleanup => cleanup());
  spoken[0].onend?.(); vi.advanceTimersByTime(12000);
  expect(spoken).toHaveLength(1);
});
