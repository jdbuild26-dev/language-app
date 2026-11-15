import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";

const harness = vi.hoisted(() => ({
  speak: vi.fn(),
  languages: { languagesReady: true, learningLang: "fr", knownLang: "en" },
  states: [] as unknown[], refs: [] as Array<{ current: unknown }>, effects: [] as Array<{ deps: unknown[]; cleanup?: () => void }>,
  pending: [] as Array<() => void>, stateIndex: 0, refIndex: 0, effectIndex: 0,
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
  useEffect(effect: () => void | (() => void), deps: unknown[]) {
    const index = harness.effectIndex++;
    const previous = harness.effects[index];
    if (!previous || deps.some((value, position) => !Object.is(value, previous.deps[position]))) {
      harness.pending.push(() => {
        previous?.cleanup?.();
        harness.effects[index] = { deps, cleanup: effect() || undefined };
      });
    }
  },
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("next/link", () => ({ default: () => null }));
vi.mock("@/components/ui/button", () => ({ Button: () => null }));
vi.mock("@/contexts/LanguageContext", () => ({ useLanguage: () => harness.languages }));
vi.mock("@/hooks/useTextToSpeech", () => ({ useTextToSpeech: () => ({ speak: harness.speak }) }));
vi.mock("@/hooks/useTranslateText", () => ({ useTranslateText: (text: string) => ({ displayText: text, showTranslation: false, isTranslating: false, reset: vi.fn(), toggle: vi.fn() }) }));
vi.mock("@/hooks/useExerciseTimer", () => ({ useExerciseTimer: () => ({ timerString: "0:10", resetTimer: vi.fn() }) }));
vi.mock("@/services/vocabularyApi", () => ({ fetchPracticeQuestions: vi.fn() }));
vi.mock("@/services/aiPracticeApi", () => ({ translateText: vi.fn() }));
vi.mock("@/components/layout/PracticeGameLayout", () => ({ default: () => null }));
vi.mock("@/components/ui/PracticeOptions", () => ({ default: () => null }));

import ChooseOptionGamePage from "./ChooseOptionGamePage";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import PracticeOptions from "@/components/ui/PracticeOptions";
import PracticeOptionCard from "@/components/ui/PracticeOptionCard";
import { fetchPracticeQuestions } from "@/services/vocabularyApi";
import { translateText } from "@/services/aiPracticeApi";

type Node = { type?: unknown; props?: Record<string, unknown> };
function find(node: unknown, predicate: (candidate: Node) => boolean): Node | undefined {
  if (!node || typeof node !== "object") return undefined;
  const candidate = node as Node;
  if (predicate(candidate)) return candidate;
  const children = candidate.props?.children;
  for (const child of Array.isArray(children) ? children.flat(Infinity) : [children]) {
    const match = find(child, predicate);
    if (match) return match;
  }
}
function render() {
  harness.stateIndex = harness.refIndex = harness.effectIndex = 0;
  const page = ChooseOptionGamePage();
  const tree = page.props.learningLang ? page.type(page.props) : page;
  harness.pending.splice(0).forEach(effect => effect());
  return tree;
}
async function mount() {
  for (let attempt = 0; attempt < 8; attempt++) { render(); await Promise.resolve(); }
}

beforeEach(() => {
  harness.languages = { languagesReady: true, learningLang: "fr", knownLang: "en" };
  vi.mocked(fetchPracticeQuestions).mockReset();
  harness.speak.mockClear();
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, text: async () => readFileSync("public/mock-data/csv/choose_options.csv", "utf8") }));
  vi.mocked(translateText).mockReset();
  vi.mocked(translateText).mockResolvedValue({ text: "Ces", translation: "These" });
  harness.states = []; harness.refs = []; harness.effects = []; harness.pending = [];
  vi.mocked(fetchPracticeQuestions).mockResolvedValue({ data: [{
    ExerciseID: "FB005", Question: "____ enfants jouent dehors.",
    Option1: "Ces", Option1_EN: "These", Option2: "Ce", Option2_EN: "This",
    Option3: "Cette", Option3_EN: "This", Option4: "Cet", Option4_EN: "This",
    eval_CorrectAnswer: "Ces", "Complete sentence": "Ces enfants jouent dehors.",
  }] });
});

afterEach(() => vi.unstubAllGlobals());

it("waits for the profile language pair before requesting questions", async () => {
  harness.languages = { languagesReady: false, learningLang: "fr", knownLang: "en" };
  expect(find(render(), node => node.type === PracticeGameLayout)).toBeUndefined();
  expect(fetchPracticeQuestions).not.toHaveBeenCalled();

  harness.languages = { languagesReady: true, learningLang: "fr", knownLang: "es" };
  await mount();

  expect(fetchPracticeQuestions).toHaveBeenCalledExactlyOnceWith("choose_options", {
    apiOnly: true, learningLang: "fr", knownLang: "es",
  });
  expect(find(render(), node => node.type === PracticeGameLayout)).toBeDefined();
});

it("reads the stored English clue when the backend omits option translations", async () => {
  vi.mocked(fetchPracticeQuestions).mockResolvedValueOnce({ data: [{
    ExerciseID: "FB005", Question: "____ enfants jouent dehors.",
    Option1: "Ces", Option2: "Ce", Option3: "Cette", Option4: "Cet", CorrectAnswer: "Ces",
  }] });
  await mount();
  const blank = find(render(), node => node.type === "span" && String(node.props?.className).includes("min-w-24"));
  expect((blank?.props?.children as Node).props?.children).toBe("These");
  expect(translateText).not.toHaveBeenCalled();
});

it("preserves stored top-level translations when options are nested in content", async () => {
  vi.mocked(fetchPracticeQuestions).mockResolvedValueOnce({ data: [{
    ExerciseID: "FB005", Option1_EN: "These", Option2_EN: "This",
    content: { Question: "____ enfants jouent dehors.", Option1: "Ces", Option2: "Cette" },
    evaluation: { CorrectAnswer: "Ces" },
  }] });
  vi.mocked(fetch).mockResolvedValueOnce({ ok: false } as Response);
  await mount();
  const blank = find(render(), node => node.type === "span" && String(node.props?.className).includes("min-w-24"));
  expect((blank?.props?.children as Node).props?.children).toBe("These");
});

it("shows the English hint and fills the blank when an option is selected", async () => {
  await mount();
  const before = render();
  const blank = find(before, node => node.type === "span" && String(node.props?.className).includes("min-w-24"));
  expect((blank?.props?.children as Node).props?.children).toBe("These");

  const options = find(before, node => node.type === PracticeOptions);
  const index = (options?.props?.options as string[]).indexOf("Cette");
  (options?.props?.onSelect as (index: number) => void)(index);
  const after = render();
  expect(find(after, node => node.type === "span" && String(node.props?.className).includes("min-w-24"))?.props?.children).toBe("Cette");
  expect(find(after, node => node.type === PracticeGameLayout)?.props?.isSubmitEnabled).toBe(true);
});

it("reads the correct answer from a nested API row", async () => {
  vi.mocked(fetchPracticeQuestions).mockResolvedValueOnce({ data: [{
    external_id: "FB005", instruction_fr: "Choisissez le mot correct",
    content: {
      Question: "____ enfants jouent dehors.", Option1: "Ces", Option1_EN: "These",
      Option2: "Cette", Option2_EN: "This", "Complete sentence": "Ces enfants jouent dehors.",
    },
    evaluation: { CorrectAnswer: "Ces" },
  }] });
  await mount();
  const page = render();
  const blank = find(page, node => node.type === "span" && String(node.props?.className).includes("min-w-24"));
  expect((blank?.props?.children as Node).props?.children).toBe("These");
  const options = find(page, node => node.type === PracticeOptions);
  const index = (options?.props?.options as string[]).indexOf("Ces");
  (options?.props?.onSelect as (index: number) => void)(index);
  expect(find(render(), node => node.type === PracticeGameLayout)?.props?.isSubmitEnabled).toBe(true);
});

it("uses a correct-option index when no answer text is supplied", async () => {
  vi.mocked(fetchPracticeQuestions).mockResolvedValueOnce({ data: [{
    ExerciseID: "FB005", Question: "____ enfants jouent dehors.",
    Option1: "Ces", Option1_EN: "These", Option2: "Cette", Option2_EN: "This", CorrectOptionIndex: "1",
  }] });
  await mount();
  const page = render();
  const blank = find(page, node => node.type === "span" && String(node.props?.className).includes("min-w-24"));
  expect((blank?.props?.children as Node).props?.children).toBe("These");
});

it("uses the French instruction when French is the learning language", async () => {
  await mount();
  const layout = find(render(), node => node.type === PracticeGameLayout);
  expect(layout?.props?.localizedInstruction).toBe("Complétez la phrase avec le mot correct");
  expect(layout?.props?.instructionEn).toBe("Complete the sentence with the correct word");
});

it("plays the right-clicked option after submission without changing the answer", async () => {
  await mount();
  const initial = render();
  const options = find(initial, node => node.type === PracticeOptions);
  const labels = options?.props?.options as string[];
  (options?.props?.onSelect as (index: number) => void)(labels.indexOf("Ces"));
  const layout = find(render(), node => node.type === PracticeGameLayout);
  (layout?.props?.onNext as () => void)();

  const submitted = find(render(), node => node.type === PracticeOptions);
  const play = submitted?.props?.onSubmittedPlay as (index: number) => void;
  const card = PracticeOptionCard({
    children: "Cette", submitted: true, playOnContextMenu: true,
    onSubmittedPlay: () => play(labels.indexOf("Cette")),
  });
  const preventDefault = vi.fn();
  card.props.onContextMenu({ preventDefault });

  expect(preventDefault).toHaveBeenCalledOnce();
  expect(harness.speak).toHaveBeenLastCalledWith("Cette", "fr");
  const after = find(render(), node => node.type === PracticeOptions);
  expect(after?.props?.selectedIndices).toEqual([labels.indexOf("Ces")]);
});
