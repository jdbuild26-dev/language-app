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
  const props = { option: { text: "Oiseau" }, selected: true, correct: true, onSelect, onPlay };
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
  expect(translated.props.children[1].props.children).toBe("Bird");
});
