import { beforeEach, expect, it, vi } from "vitest";

const harness = vi.hoisted(() => ({
  states: [] as unknown[],
  stateIndex: 0,
  speak: vi.fn(),
}));

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
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/components/layout/PracticeGameLayout", () => ({ default: () => null }));
vi.mock("@/components/ui/TranslateButton", () => ({ TranslateButton: () => null }));
vi.mock("@/hooks/useExerciseTimer", () => ({ useExerciseTimer: () => ({ timerString: "0:00", resetTimer: vi.fn() }) }));
vi.mock("@/hooks/useTextToSpeech", () => ({ useTextToSpeech: () => ({ speak: harness.speak }) }));
vi.mock("@/contexts/LanguageContext", () => ({ useLanguage: () => ({ learningLang: "fr", knownLang: "en" }) }));
vi.mock("@/utils/feedbackMessages", () => ({ getFeedbackMessage: () => "Correct" }));
vi.mock("@/services/vocabularyApi", () => ({ fetchPracticeQuestions: vi.fn() }));

import OddOneOutGamePage from "./OddOneOutGamePage";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";

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

beforeEach(() => {
  harness.speak.mockReset();
  harness.stateIndex = 0;
  const chair = { text: "Chaise", en: "Chair" };
  const run = { text: "Courir", en: "Run" };
  harness.states = [[{
    id: "1", words: [chair, run], correctAnswer: "Courir", reason: "Courir est un verbe",
    instructionFr: "Trouvez l'intrus", instructionEn: "Odd one out", localizedInstruction: "Odd one out", type: "Odd One Out",
  }], false, null, 0, chair, true, 0, false, true, false, "Time's up!", new Set()];
});

it("replays a result card without changing the submitted choice or feedback", () => {
  const tree = OddOneOutGamePage();
  const chair = find(tree, (node) => node.type === "button" &&
    typeof node.props?.["aria-label"] === "string" && node.props["aria-label"].startsWith("Play Chaise"));
  expect(chair).toBeDefined();
  expect(chair?.props?.disabled).toBeUndefined();
  (chair?.props?.onClick as () => void)();
  expect(harness.speak).toHaveBeenCalledWith("Chaise", "fr-FR");
  expect(harness.states[4]).toEqual({ text: "Chaise", en: "Chair" });
  expect(harness.states[5]).toBe(true);
  expect(harness.states[8]).toBe(true);
});

it("puts the explanation directly in the footer without a duplicate answer row", () => {
  const layout = find(OddOneOutGamePage(), node => node.type === PracticeGameLayout);
  expect((layout?.props?.feedbackChildren as TestNode).props?.children).toBe("Courir est un verbe");
  expect(layout?.props?.correctAnswer).toBeUndefined();
});

it("keeps useful answer guidance when no explanation is supplied", () => {
  (harness.states[0] as Array<{ reason: string }>)[0].reason = "";
  const layout = find(OddOneOutGamePage(), node => node.type === PracticeGameLayout);
  expect((layout?.props?.feedbackChildren as TestNode).props?.children).toBe("Courir is the odd one out.");
});

it("replays the original French even when a submitted card shows English", () => {
  harness.states[11] = new Set([1]);
  const tree = OddOneOutGamePage();
  const correctCard = find(tree, node => node.type === "button" &&
    node.props?.["aria-label"] === "Play Courir, correct answer");
  expect(correctCard?.props?.disabled).toBeUndefined();
  (correctCard?.props?.onClick as () => void)();
  expect(harness.speak).toHaveBeenCalledWith("Courir", "fr-FR");
  expect(harness.states[5]).toBe(true);
});
