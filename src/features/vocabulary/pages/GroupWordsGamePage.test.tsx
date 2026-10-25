/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, expect, it, vi } from "vitest";

const harness = vi.hoisted(() => ({ states: [] as any[], refs: [] as any[], stateIndex: 0, refIndex: 0 }));
vi.mock("react", () => ({
  useState(initial: any) {
    const index = harness.stateIndex++;
    if (!(index in harness.states)) harness.states[index] = initial;
    return [harness.states[index], (next: any) => {
      harness.states[index] = typeof next === "function" ? next(harness.states[index]) : next;
    }];
  },
  useRef(initial: any) {
    const index = harness.refIndex++;
    return harness.refs[index] ??= { current: initial };
  },
  useEffect() {},
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/components/layout/PracticeGameLayout", () => ({ default: () => null }));
vi.mock("@/components/ui/TranslateButton", () => ({ TranslateButton: () => null }));
vi.mock("@/contexts/LanguageContext", () => ({ useLanguage: () => ({ learningLang: "fr", knownLang: "en" }) }));
vi.mock("@/hooks/useExerciseTimer", () => ({ useExerciseTimer: () => ({ timerString: "0:45", resetTimer: vi.fn() }) }));
vi.mock("@/hooks/useTextToSpeech", () => ({ useTextToSpeech: () => ({ speak: vi.fn(), cancel: vi.fn() }) }));
vi.mock("@/services/vocabularyApi", () => ({ fetchPracticeQuestions: vi.fn() }));
vi.mock("@/services/aiPracticeApi", () => ({ translateText: vi.fn() }));
import GroupWordsGamePage from "./GroupWordsGamePage";
import { TranslateButton } from "@/components/ui/TranslateButton";
import { translateText } from "@/services/aiPracticeApi";

function render(): any {
  harness.stateIndex = 0;
  harness.refIndex = 0;
  return GroupWordsGamePage();
}

function find(node: any, predicate: (node: any) => boolean): any {
  if (!node || typeof node !== "object") return undefined;
  if (predicate(node)) return node;
  const children = [node.props?.children, node.props?.action];
  for (const child of Array.isArray(children) ? children.flat(Infinity) : [children]) {
    const result = find(child, predicate);
    if (result) return result;
  }
}

function translationButton(tree = render()) {
  return find(tree, (node) => node.type === TranslateButton);
}

async function clickTranslate() {
  translationButton().props.onClick();
  await Promise.resolve();
  await Promise.resolve();
}

beforeEach(() => {
  vi.clearAllMocks();
  harness.refs = [];
  const question = { id: "GW-1", instructionFr: "Regrouper les mots", instructionEn: "Group words", words: [{ text: "cerise", isAnswer: true }], reason: "" };
  harness.states = [[question, { ...question, id: "GW-2", words: [{ text: "train", isAnswer: true }] }], false, null, 0, [], new Set(), {}, {}, true, false, 0, false, ""];
});

it("shows a translation control for words without saved translations only after submission", () => {
  expect(translationButton()).toBeDefined();
  harness.states[8] = false;
  expect(translationButton()).toBeUndefined();
});

it("uses the same backend service as Choose Options, displays the result, and caches toggles", async () => {
  vi.mocked(translateText).mockResolvedValue({ text: "cerise", translation: "cherry" });
  await clickTranslate();
  expect(translateText).toHaveBeenCalledWith("cerise", "en", expect.any(AbortSignal));
  expect(find(render(), (node) => node.type === "span" && node.props.children === "cherry")).toBeDefined();
  await clickTranslate();
  expect(find(render(), (node) => node.type === "span" && node.props.children === "cerise")).toBeDefined();
  await clickTranslate();
  expect(translateText).toHaveBeenCalledOnce();
  expect(translationButton().props["aria-pressed"]).toBe(true);
});

it("uses a saved translation immediately without a network request", async () => {
  harness.states[0][0].words[0].translation = "cherry";
  await clickTranslate();
  expect(translateText).not.toHaveBeenCalled();
  expect(find(render(), (node) => node.type === "span" && node.props.children === "cherry")).toBeDefined();
});

it("allows one-click retry after failure instead of toggling an untranslated word off", async () => {
  vi.mocked(translateText).mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce({ text: "cerise", translation: "cherry" });
  await clickTranslate();
  expect(translationButton().props["aria-pressed"]).toBe(false);
  expect(find(render(), (node) => node.props?.role === "status")).toBeDefined();
  await clickTranslate();
  expect(translateText).toHaveBeenCalledTimes(2);
  expect(find(render(), (node) => node.type === "span" && node.props.children === "cherry")).toBeDefined();
});

it("cancels pending translations when continuing and ignores a late response", async () => {
  let finish!: (result: { text: string; translation: string }) => void;
  vi.mocked(translateText).mockReturnValue(new Promise((resolve) => { finish = resolve; }));
  await clickTranslate();
  const signal = vi.mocked(translateText).mock.calls[0][2]!;
  render().props.onNext();
  expect(signal.aborted).toBe(true);
  finish({ text: "cerise", translation: "cherry" });
  await Promise.resolve();
  await Promise.resolve();
  expect(harness.states[3]).toBe(1);
  expect(find(render(), (node) => node.type === "span" && node.props.children === "train")).toBeDefined();
  expect(harness.states[5].size).toBe(0);
});
