import { beforeEach, expect, it, vi } from "vitest";

const harness = vi.hoisted(() => ({ states: [] as unknown[], index: 0, speak: vi.fn() }));
vi.mock("react", () => ({
  default: { Fragment: Symbol.for("react.fragment") },
  useState(initial: unknown) {
    const index = harness.index++;
    if (!(index in harness.states)) harness.states[index] = initial;
    return [harness.states[index], (value: unknown) => {
      harness.states[index] = typeof value === "function"
        ? (value as (previous: unknown) => unknown)(harness.states[index]) : value;
    }];
  },
  useEffect() {},
  useCallback(callback: unknown) { return callback; },
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/hooks/useTextToSpeech", () => ({ useTextToSpeech: () => ({ speak: harness.speak }) }));
vi.mock("@/hooks/useExerciseTimer", () => ({ useExerciseTimer: () => ({ timerString: "0:10", resetTimer: vi.fn() }) }));
vi.mock("@/services/vocabularyApi", () => ({ fetchPracticeQuestions: vi.fn() }));
vi.mock("@/components/layout/PracticeGameLayout", () => ({ default: () => null }));

import IsThisFrenchWordPage from "./IsThisFrenchWordPage";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";

type TestNode = { type?: unknown; props?: Record<string, unknown> };
function all(node: unknown, predicate: (candidate: TestNode) => boolean): TestNode[] {
  if (!node || typeof node !== "object") return [];
  const candidate = node as TestNode;
  const children = candidate.props?.children;
  return [
    ...(predicate(candidate) ? [candidate] : []),
    ...(Array.isArray(children) ? children.flat(Infinity) : [children]).flatMap(child => all(child, predicate)),
  ];
}
function render() {
  harness.index = 0;
  return IsThisFrenchWordPage();
}

beforeEach(() => {
  harness.speak.mockReset();
  harness.states = [[{ id: "F1", word: "glopster", isFrench: false, explanation: "Glopster is not used in French." }], 0, null, false, false, "", 0, false, false];
});

it("shows one prompt and icon choices, then places the explanation below Incorrect in the footer", () => {
  const before = render();
  const layout = all(before, node => node.type === PracticeGameLayout)[0];
  const choices = all(before, node => node.type === "button" && typeof node.props?.["aria-pressed"] === "boolean");
  expect(all(before, node => node.type === "h2")).toHaveLength(0);
  expect(choices).toHaveLength(2);
  expect(choices.map(choice => choice.props?.["aria-label"])).toEqual([
    "Yes, this is a French word", "No, this is not a French word",
  ]);
  expect(choices.map(choice => choice.props?.children).flat(Infinity).some(child => child === "Yes" || child === "No")).toBe(false);
  expect(layout.props?.showSubmitButton).toBe(false);

  (choices[0].props?.onClick as () => void)();
  const after = render();
  const feedbackLayout = all(after, node => node.type === PracticeGameLayout)[0];
  expect(feedbackLayout.props?.showSubmitButton).toBe(true);
  expect(feedbackLayout.props?.showFeedback).toBe(true);
  expect(feedbackLayout.props?.feedbackMessage).toBe("Incorrect");
  expect((feedbackLayout.props?.feedbackChildren as TestNode).props?.children).toBe("Glopster is not used in French.");
  const feedbackChoices = all(after, node => node.type === "button" && typeof node.props?.["aria-pressed"] === "boolean");
  expect(feedbackChoices[0].props?.className).toContain("border-red-500");
  expect(feedbackChoices[1].props?.className).toContain("border-green-500");
});

it("shows Correct followed directly by the explanation", () => {
  harness.states[0] = [{ id: "F2", word: "merci", isFrench: true, explanation: "Merci means thank you." }];
  const yes = all(render(), node => node.type === "button" && node.props?.["aria-label"] === "Yes, this is a French word")[0];
  (yes.props?.onClick as () => void)();
  const layout = all(render(), node => node.type === PracticeGameLayout)[0];
  expect(layout.props?.feedbackMessage).toBe("Correct");
  expect((layout.props?.feedbackChildren as TestNode).props?.children).toBe("Merci means thank you.");
});
