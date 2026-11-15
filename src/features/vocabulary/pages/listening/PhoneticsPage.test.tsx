import { beforeEach, expect, it, vi } from "vitest";

const harness = vi.hoisted(() => ({
  states: [] as unknown[], stateIndex: 0,
  refs: [] as Array<{ current: unknown }>, refIndex: 0,
}));
vi.mock("react", () => ({
  default: { Fragment: Symbol.for("react.fragment") },
  useState(initial: unknown) {
    const index = harness.stateIndex++;
    if (!(index in harness.states)) harness.states[index] = initial;
    return [harness.states[index], (value: unknown) => {
      harness.states[index] = typeof value === "function"
        ? (value as (previous: unknown) => unknown)(harness.states[index]) : value;
    }];
  },
  useRef(initial: unknown) {
    const index = harness.refIndex++;
    if (!(index in harness.refs)) harness.refs[index] = { current: initial };
    return harness.refs[index];
  },
  useEffect() {},
  useCallback(callback: unknown) { return callback; },
}));
vi.mock("@/hooks/useExerciseTimer", () => ({ useExerciseTimer: () => ({ timerString: "0:20", resetTimer: vi.fn() }) }));
vi.mock("@/services/vocabularyApi", () => ({ fetchPracticeQuestions: vi.fn() }));
vi.mock("@/services/aiPracticeApi", () => ({ translateText: vi.fn() }));
vi.mock("@/components/layout/PracticeGameLayout", () => ({ default: () => null }));
vi.mock("@/components/ui/PracticeOptions", () => ({ default: () => null }));
vi.mock("@/features/vocabulary/components/shared/AudioPlayer", () => ({ default: () => null }));

import PhoneticsPage from "./PhoneticsPage";
import PracticeOptions from "@/components/ui/PracticeOptions";
import AudioPlayer from "@/features/vocabulary/components/shared/AudioPlayer";

type TestNode = { type?: unknown; props?: Record<string, unknown> };
function find(node: unknown, predicate: (candidate: TestNode) => boolean): TestNode | undefined {
  if (!node || typeof node !== "object") return undefined;
  const candidate = node as TestNode;
  if (predicate(candidate)) return candidate;
  const children = candidate.props?.children;
  for (const child of Array.isArray(children) ? children.flat(Infinity) : [children]) {
    const match = find(child, predicate);
    if (match) return match;
  }
}

function render() {
  harness.stateIndex = 0;
  harness.refIndex = 0;
  return PhoneticsPage();
}

beforeEach(() => {
  harness.states = [false, [{
    id: "PH1", prompt: "oiseau", instruction: "Choose from Options",
    explanation: "Oiseau is the word you heard.",
    options: [{ text: "Oiseau", en: "Bird" }, { text: "Chat", en: "Cat" }], correctIndex: 0,
  }], 0, null, [], false, false, "", false, 0];
  harness.refs = [];
});

it("uses the Read and Select options and allows changing a silent selection", () => {
  const options = find(render(), node => node.type === PracticeOptions);
  expect(options?.props?.className).toContain("sm:grid-cols-2");
  (options?.props?.onSelect as (index: number) => void)(1);
  expect(harness.states[3]).toBe(1);
  (find(render(), node => node.type === PracticeOptions)?.props?.onSelect as (index: number) => void)(0);
  expect(harness.states[3]).toBe(0);

  const layout = find(render(), node => typeof node.type === "function" && node.props?.instructionEn === "Choose from Options");
  (layout?.props?.onNext as () => void)();
  expect(harness.states[5]).toBe(true);
  expect(harness.states[6]).toBe(true);
  expect(find(render(), node => node.type === PracticeOptions)?.props?.showFeedback).toBe(true);
});

it("keeps the normal and slow audio player available during feedback", () => {
  harness.states[5] = true;
  const tree = render();
  expect(find(tree, node => node.type === AudioPlayer)?.props?.text).toBe("oiseau");
  expect(find(tree, node => node.type === AudioPlayer)?.props?.pausable).toBe(true);
  expect(find(tree, node => node.type === PracticeOptions)?.props?.correctIndex).toBe(0);
});

it("replaces the submitted option with its saved translation and restores it on the next click", () => {
  harness.states[5] = true;
  const currentOptions = () => find(render(), node => node.type === PracticeOptions)?.props;
  const option = (name: string, index: number) =>
    (currentOptions()?.renderLabel as (text: string, index: number) => TestNode)(name, index);
  const action = () => (currentOptions()?.renderAction as (text: string, index: number) => TestNode)("Oiseau", 0);
  expect(option("Oiseau", 0).props?.children).toBe("Oiseau");
  (action().props?.onClick as () => void)();
  expect(option("Oiseau", 0).props?.children).toBe("Bird");
  expect(action().props?.isLoading).toBeUndefined();
  (action().props?.onClick as () => void)();
  expect(option("Oiseau", 0).props?.children).toBe("Oiseau");
});
