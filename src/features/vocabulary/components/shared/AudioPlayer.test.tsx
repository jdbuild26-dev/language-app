import { beforeEach, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ mode: null as unknown, speaking: false, speak: vi.fn() }));
vi.mock("react", () => ({ useState: () => [state.mode, (value: unknown) => { state.mode = value; }] }));
vi.mock("@/hooks/useTextToSpeech", () => ({ useTextToSpeech: () => ({ speak: state.speak, isSpeaking: state.speaking }) }));
import AudioPlayer from "./AudioPlayer";
import ListeningPlaybackButton from "@/components/ui/ListeningPlaybackButton";

function controls(showTurtle = true) {
  return AudioPlayer({ text: "Bonjour", appearance: "main-practice", showTurtle }).props.children.filter(Boolean);
}
beforeEach(() => { state.mode = null; state.speaking = false; state.speak.mockReset(); });

it("highlights only the playing control and preserves both playback rates", () => {
  for (const control of controls()) {
    expect(control.type).toBe(ListeningPlaybackButton);
    expect(ListeningPlaybackButton(control.props).props["aria-pressed"]).toBe(false);
  }
  expect(controls(false)).toHaveLength(1);
  controls()[0].props.onClick(); state.speaking = true;
  expect(state.speak).toHaveBeenLastCalledWith("Bonjour", "fr-FR", 1);
  expect(controls().map(control => control.props.active)).toEqual([true, false]);
  controls()[1].props.onClick();
  expect(state.speak).toHaveBeenLastCalledWith("Bonjour", "fr-FR", 0.75);
  expect(controls().map(control => control.props.active)).toEqual([false, true]);
  const playing = ListeningPlaybackButton(controls()[1].props);
  expect(playing.props["aria-pressed"]).toBe(true);
  state.speaking = false;
  expect(controls().map(control => control.props.active)).toEqual([false, false]);
});

it("tracks which pink control is playing at each playback rate", () => {
  const pinkControls = () => AudioPlayer({ text: "Bonjour" }).props.children.filter(Boolean);
  pinkControls()[0].props.onClick();
  state.speaking = true;
  expect(state.speak).toHaveBeenLastCalledWith("Bonjour", "fr-FR", 1);
  expect(pinkControls()[0].props["aria-pressed"]).toBe(true);
  expect(pinkControls()[1].props["aria-pressed"]).toBe(false);
  pinkControls()[1].props.onClick();
  expect(state.speak).toHaveBeenLastCalledWith("Bonjour", "fr-FR", 0.75);
  expect(pinkControls()[1].props["aria-pressed"]).toBe(true);
  state.speaking = false;
  expect(pinkControls()[0].props["aria-pressed"]).toBe(false);
  expect(pinkControls()[1].props["aria-pressed"]).toBe(false);
});

it("marks the pink speaker active during the fill-in-blank page's automatic playback", () => {
  const buttons = AudioPlayer({ text: "Bonjour", externalPlaying: true }).props.children.filter(Boolean);
  expect(buttons[0].props["aria-pressed"]).toBe(true);
  expect(buttons[1].props["aria-pressed"]).toBe(false);
});
