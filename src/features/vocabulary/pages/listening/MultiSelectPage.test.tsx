import { beforeEach, expect, it, vi } from "vitest";

const harness = vi.hoisted(() => ({ states: [] as unknown[], stateIndex: 0, speak: vi.fn(), onExpire: null as null | (() => void) }));
vi.mock("react", () => ({
  useState(initial: unknown) {
    const index = harness.stateIndex++;
    if (!(index in harness.states)) harness.states[index] = initial;
    return [harness.states[index], (value: unknown) => {
      harness.states[index] = typeof value === "function"
        ? (value as (previous: unknown) => unknown)(harness.states[index])
        : value;
    }];
  },
  useEffect() {},
  useCallback(callback: unknown) { return callback; },
}));
vi.mock("@/hooks/useExerciseTimer", () => ({ useExerciseTimer: ({ onExpire }: { onExpire: () => void }) => {
  harness.onExpire = onExpire;
  return { timerString: "0:15", resetTimer: vi.fn() };
} }));
vi.mock("@/hooks/useTextToSpeech", () => ({ useTextToSpeech: () => ({ speak: harness.speak }) }));
vi.mock("@/services/vocabularyApi", () => ({ fetchPracticeQuestions: vi.fn() }));
vi.mock("@/components/layout/PracticeGameLayout", () => ({ default: () => null }));
vi.mock("@/features/vocabulary/components/shared/AudioPlayer", () => ({ default: () => null }));
vi.mock("./MultiSelectOption", () => ({ default: () => null }));
vi.mock("@/hooks/useTranslateText", () => ({ useTranslateText: vi.fn() }));

import MultiSelectPage from "./MultiSelectPage";
import MultiSelectOption from "./MultiSelectOption";

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

function option(): TestNode | undefined {
  harness.stateIndex = 0;
  return find(MultiSelectPage(), (node) => node.type === MultiSelectOption &&
    (node.props?.option as { text?: string })?.text === "Oiseau");
}

beforeEach(() => {
  harness.speak.mockReset();
  harness.onExpire = null;
  harness.states = [false, [{
    id: "WH009", instruction: "Select what you hear", sentenceFr: "Un oiseau vole.", sentenceEn: "A bird flies.",
    audioText: "Un oiseau vole.", options: [{ text: "Lion", en: "Lion" }, { text: "Oiseau", en: "Bird" }], correctIndices: [1],
  }], 0, [], false, 0, false];
});

it("selects silently before submit and replays the option after submit", () => {
  const before = option();
  expect(before?.props?.submitted).toBe(false);
  (before?.props?.onSelect as () => void)();
  expect(harness.states[3]).toEqual([1]);
  expect(harness.speak).not.toHaveBeenCalled();

  harness.states[4] = true;
  const after = option();
  expect(after?.props?.submitted).toBe(true);
  (after?.props?.onPlay as () => void)();
  expect(harness.speak).toHaveBeenCalledWith("Oiseau", "fr-FR");
  expect(harness.states[3]).toEqual([1]);
});

it("allows continuing after the timer submits an unanswered question", () => {
  harness.states[4] = true;
  harness.stateIndex = 0;
  expect(MultiSelectPage().props.isSubmitEnabled).toBe(true);
});

it("shows correctness after Check and stays on the question until Continue", () => {
  harness.states[3] = [0];
  harness.stateIndex = 0;
  const before = MultiSelectPage();
  expect(before.props.showFeedback).toBe(false);
  before.props.onNext();

  harness.stateIndex = 0;
  const after = MultiSelectPage();
  expect(after.props.showFeedback).toBe(true);
  expect(after.props.isCorrect).toBe(false);
  expect(after.props.feedbackMessage).toBeTruthy();
  expect(harness.states[2]).toBe(0);
  expect(option()?.props?.submitted).toBe(true);

  harness.onExpire?.();
  expect(harness.states[2]).toBe(0);
  after.props.onNext();
  expect(harness.states[6]).toBe(true);
});

it("does not let a stale timer callback advance a checked question", () => {
  const firstQuestion = (harness.states[1] as Array<{ id: string }>)[0];
  harness.states[1] = [firstQuestion, { ...firstQuestion, id: "WH010" }];
  harness.stateIndex = 0;
  MultiSelectPage();
  const expiredBeforeCheck = harness.onExpire;
  expiredBeforeCheck?.();
  harness.stateIndex = 0;
  MultiSelectPage();
  harness.onExpire?.();
  expect(harness.states[2]).toBe(0);
  expect(harness.states[4]).toBe(true);
});
