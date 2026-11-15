import { afterEach, beforeEach, expect, it, vi } from "vitest";

const harness = vi.hoisted(() => ({
  states: [] as unknown[],
  stateIndex: 0,
  refs: [] as Array<{ current: unknown }>,
  refIndex: 0,
}));

vi.mock("react", () => ({
  default: { Fragment: Symbol.for("react.fragment") },
  useState(initial: unknown) {
    const index = harness.stateIndex++;
    if (!(index in harness.states)) harness.states[index] = initial;
    return [harness.states[index], (value: unknown) => {
      harness.states[index] = typeof value === "function"
        ? (value as (previous: unknown) => unknown)(harness.states[index])
        : value;
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
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/hooks/useExerciseTimer", () => ({ useExerciseTimer: () => ({ timerString: "0:30", resetTimer: vi.fn() }) }));
vi.mock("@/hooks/useTextToSpeech", () => ({ useTextToSpeech: () => ({ speak: vi.fn(), isSpeaking: false }) }));
vi.mock("@/hooks/useTranslateText", () => ({ useTranslateText: () => ({ displayText: "La fille mange une pomme rouge.", showTranslation: false, isTranslating: false, reset: vi.fn() }) }));
vi.mock("@/services/vocabularyApi", () => ({ fetchPracticeQuestions: vi.fn() }));
vi.mock("@/components/layout/PracticeGameLayout", () => ({ default: () => null }));
vi.mock("@/features/vocabulary/components/shared/AudioPlayer", () => ({ default: () => null }));
vi.mock("@/features/practice/components/SpecialCharacterKeyboard", () => ({ default: () => null }));

import AudioFillBlankPage from "./AudioFillBlankPage";
import AudioPlayer from "@/features/vocabulary/components/shared/AudioPlayer";
import SpecialCharacterKeyboard from "@/features/practice/components/SpecialCharacterKeyboard";

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
  return AudioFillBlankPage();
}

beforeEach(() => {
  harness.states = [false, [{
    id: "FITB1", fullSentence: "La fille mange une pomme rouge.",
    fullSentenceEnglish: "The girl eats a red apple.",
    displaySentence: "La fille mange une ___ rouge.", answer: "pomme", answers: ["pomme"], instruction: "Fill the blank",
  }], 0, ["pomme"], [], false, false, "", 0, false];
  harness.refs = [];
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { callback(0); return 1; });
});

afterEach(() => vi.unstubAllGlobals());

it("inserts an accented character at the caret in the active blank", () => {
  const tree = render();
  const input = find(tree, node => node.type === "input");
  const keyboard = find(tree, node => node.type === SpecialCharacterKeyboard);
  expect(keyboard?.props?.learningLanguage).toBe("fr");
  const field = {
    value: "pomme", selectionStart: 2, selectionEnd: 4,
    focus: vi.fn(), setSelectionRange: vi.fn(),
  };
  (input?.props?.ref as (element: unknown) => void)(field);
  (input?.props?.onFocus as () => void)();
  (keyboard?.props?.onInsert as (character: string) => void)("é");
  expect(harness.states[3]).toEqual(["poée"]);
  expect(field.focus).toHaveBeenCalled();
  expect(field.setSelectionRange).toHaveBeenCalledWith(3, 3);
});

it("keeps slow playback after submission and hides the character keyboard", () => {
  harness.states[5] = true;
  const tree = render();
  expect(find(tree, node => node.type === AudioPlayer)?.props?.showTurtle).toBe(true);
  expect(find(tree, node => node.type === SpecialCharacterKeyboard)).toBeUndefined();
});

it("shows a supplied English clue inside the blank and replaces it with typed text", () => {
  const question = (harness.states[1] as Array<Record<string, unknown>>)[0];
  question.hints = ["apple"];
  harness.states[3] = [""];
  const input = find(render(), node => node.type === "input");
  expect(input?.props?.placeholder).toBe("apple");
  (input?.props?.onChange as (event: unknown) => void)({ target: { value: "pomme" } });
  expect(find(render(), node => node.type === "input")?.props?.value).toBe("pomme");
});

it("moves inline clues into the input without leaving underscores in the sentence", () => {
  const question = (harness.states[1] as Array<Record<string, unknown>>)[0];
  question.displaySentence = "La fille mange une ____ (apple) rouge.";
  const tree = render();
  expect(find(tree, node => node.type === "input")?.props?.placeholder).toBe("apple");
  expect(find(tree, node => node.type === "span" && node.props?.children === " rouge.")).toBeDefined();
});
