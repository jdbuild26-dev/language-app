import { beforeEach, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ showTranslation: false, toggle: vi.fn() }));
vi.mock("@/hooks/useTranslateText", () => ({ useTranslateText: () => ({
  displayText: state.showTranslation ? "Bird" : "Oiseau",
  showTranslation: state.showTranslation,
  isTranslating: false,
  error: null,
  toggle: state.toggle,
}) }));

import MultiSelectOption from "./MultiSelectOption";
import PracticeOptionCard from "@/components/ui/PracticeOptionCard";
import { TranslateButton } from "@/components/ui/TranslateButton";

beforeEach(() => { state.showTranslation = false; state.toggle.mockReset(); });

it("shows translation only after submission and keeps the card playable", () => {
  const onSelect = vi.fn();
  const onPlay = vi.fn();
  const props = { option: { text: "Oiseau", en: "Bird" }, selected: true, correct: true, onSelect, onPlay };
  const before = MultiSelectOption({ ...props, submitted: false });
  expect(before.props.action).toBe(false);

  const after = MultiSelectOption({ ...props, submitted: true });
  expect(after.type).toBe(PracticeOptionCard);
  expect(after.props.action.type).toBe(TranslateButton);
  after.props.action.props.onClick();
  expect(state.toggle).toHaveBeenCalledOnce();

  const card = PracticeOptionCard(after.props);
  const playButton = card.props.children[0];
  expect(playButton.props.disabled).toBe(false);
  playButton.props.onClick();
  expect(onPlay).toHaveBeenCalledOnce();
  expect(onSelect).not.toHaveBeenCalled();

  state.showTranslation = true;
  const translated = MultiSelectOption({ ...props, submitted: true });
  expect(translated.props.children.props.children).toBe("Bird");
  expect(translated.props.action.props.isLoading).toBeUndefined();
});

it("does not request a translation when an option has no saved counterpart", () => {
  const card = MultiSelectOption({
    option: { text: "Dax" }, selected: false, correct: false, submitted: true,
    onSelect: vi.fn(), onPlay: vi.fn(),
  });
  expect(card.props.action.props.disabled).toBe(true);
  card.props.action.props.onClick();
  expect(state.toggle).not.toHaveBeenCalled();
  expect(card.props.children.props.children).toBe("Dax");
});
