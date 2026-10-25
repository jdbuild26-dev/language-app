import { afterEach, beforeEach, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({ states: [] as any[], refs: [] as any[], effects: [] as any[], pending: [] as any[], s: 0, r: 0, e: 0, resetTimer: vi.fn() }));
vi.mock("react", () => ({
  default: { Fragment: Symbol.for("react.fragment") },
  useState(initial: any) {
    const i = h.s++; if (!(i in h.states)) h.states[i] = initial;
    return [h.states[i], (value: any) => { h.states[i] = typeof value === "function" ? value(h.states[i]) : value; }];
  },
  useRef(initial: any) { return h.refs[h.r++] ??= { current: initial }; },
  useEffect(effect: any, deps: any[]) {
    const i = h.e++, prior = h.effects[i];
    if (!prior || deps.some((value, index) => !Object.is(value, prior.deps[index]))) h.pending.push(() => {
      prior?.cleanup?.(); h.effects[i] = { deps, cleanup: effect() };
    });
  },
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/hooks/usePracticeExit", () => ({ usePracticeExit: () => vi.fn() }));
vi.mock("@/hooks/useExerciseTimer", () => ({ useExerciseTimer: () => ({ timerString: "0:30", resetTimer: h.resetTimer }) }));
vi.mock("@/hooks/useTextToSpeech", () => ({ useTextToSpeech: () => ({ speak: vi.fn(), isSpeaking: false }) }));
vi.mock("@/hooks/useTranslateText", () => ({ useTranslateText: (text: string) => ({ displayText: text, showTranslation: false, isTranslating: false, error: null, toggle: vi.fn() }) }));
vi.mock("@/services/vocabularyApi", () => ({ fetchPracticeQuestions: vi.fn() }));
vi.mock("@/components/layout/PracticeGameLayout", () => ({ default: () => null }));
vi.mock("@/components/ui/FeedbackBanner", () => ({ default: () => null }));
import TypingFillInBlankPage from "./TypingFillInBlankPage";
import { fetchPracticeQuestions } from "@/services/vocabularyApi";
import AudioPlayer from "@/features/vocabulary/components/shared/AudioPlayer";
import { TranslateButton } from "@/components/ui/TranslateButton";

function render(): any {
  h.s = h.r = h.e = 0;
  const tree = TypingFillInBlankPage(); h.pending.splice(0).forEach(effect => effect()); return tree;
}
function all(node: any, predicate: (node: any) => boolean): any[] {
  if (Array.isArray(node)) return node.flatMap(child => all(child, predicate));
  if (!node || typeof node !== "object") return [];
  return [...(predicate(node) ? [node] : []), ...all(node.props?.children, predicate)];
}
async function mount() { for (let i = 0; i < 8; i++) { render(); await Promise.resolve(); } }
beforeEach(() => {
  h.states = []; h.refs = []; h.effects = []; h.pending = []; vi.useFakeTimers();
  vi.mocked(fetchPracticeQuestions).mockResolvedValue({ data: [{ ExerciseID: "W1", hints: ["bakery", "bread"], blanks: ["boulangerie", "pain"], displayParts: ["Je vais à la ", " pour acheter du ", "."], fullText: "Je vais à la boulangerie pour acheter du pain." }] });
});
afterEach(() => { h.effects.forEach(effect => effect.cleanup?.()); vi.clearAllTimers(); vi.useRealTimers(); });

it("associates English hints with inputs and locks answers after submission", async () => {
  await mount();
  const fields = () => all(render(), node => node.type === "input");
  const clues = () => all(render(), node => node.type === "label");
  expect(clues().map(node => node.props.children)).toEqual(["bakery", "bread"]);
  expect(clues()[0].props.htmlFor).toBe(fields()[0].props.id);
  expect(fields()[0].props["aria-describedby"]).toBe(clues()[0].props.id);
  expect(fields()[0].props.placeholder).toBe("bakery");
  expect(all(render(), node => node.type === AudioPlayer)[0].props.showTurtle).toBe(true);
  expect(all(render(), node => node.type === TranslateButton)).toHaveLength(0);
  fields()[0].props.onChange({ target: { value: "boulangerie" } });
  expect(fields()[0].props.value).toBe("boulangerie");
  fields()[1].props.onChange({ target: { value: "pain" } });
  expect(clues().map(node => node.props.children)).toEqual(["bakery", "bread"]);
  all(render(), node => typeof node.props?.onNext === "function")[0].props.onNext();
  expect(all(render(), node => typeof node.props?.onNext === "function")[0].props.showSubmitButton).toBe(true);
  expect(fields().every(field => field.props.disabled)).toBe(true);
  expect(clues()).toHaveLength(2);
  expect(all(render(), node => node.type === AudioPlayer)[0].props.showTurtle).toBe(false);
  expect(all(render(), node => node.type === TranslateButton)).toHaveLength(1);
  expect(all(render(), node => node.props?.lang === "fr").map(node => node.props.children)).toContain(
    all(render(), node => node.type === AudioPlayer)[0].props.text,
  );
});
