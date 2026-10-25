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

it("uses shared accessible controls with neither playback mode active initially", () => {
  for (const control of controls()) {
    expect(control.type).toBe(ListeningPlaybackButton);
    const button = ListeningPlaybackButton(control.props);
    expect(button.props["aria-pressed"]).toBe(false);
  }
});

it("highlights only the playing control and preserves both playback rates", () => {
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

it("preserves the existing showTurtle behavior", () => {
  expect(controls(false)).toHaveLength(1);
});

it("gives the pink controls the blue speaker's active color and pulse", () => {
  const pinkControls = () => AudioPlayer({ text: "Bonjour" }).props.children.filter(Boolean);
  expect(pinkControls()[0].props.className).toContain("h-24 w-24");
  expect(pinkControls()[1].props.className).toContain("h-14 w-14");
  pinkControls()[0].props.onClick();
  state.speaking = true;
  expect(state.speak).toHaveBeenLastCalledWith("Bonjour", "fr-FR", 1);
  expect(pinkControls()[0].props["aria-pressed"]).toBe(true);
  expect(pinkControls()[1].props["aria-pressed"]).toBe(false);
  expect(pinkControls()[0].props.className).toContain("bg-rose-100");
  expect(pinkControls()[0].props.children.props.className).toContain("animate-pulse");

  pinkControls()[1].props.onClick();
  expect(state.speak).toHaveBeenLastCalledWith("Bonjour", "fr-FR", 0.75);
  expect(pinkControls()[1].props["aria-pressed"]).toBe(true);
  expect(pinkControls()[1].props.className).toContain("bg-rose-100");
  expect(pinkControls()[1].props.children.props.className).toContain("animate-pulse");

  state.speaking = false;
  expect(pinkControls()[0].props["aria-pressed"]).toBe(false);
  expect(pinkControls()[1].props["aria-pressed"]).toBe(false);
  expect(pinkControls()[1].props.className).toContain("from-rose-300");
});

it("marks the pink speaker active during the fill-in-blank page's automatic playback", () => {
  const buttons = AudioPlayer({ text: "Bonjour", externalPlaying: true }).props.children.filter(Boolean);
  expect(buttons[0].props["aria-pressed"]).toBe(true);
  expect(buttons[0].props.className).toContain("bg-rose-100");
  expect(buttons[1].props["aria-pressed"]).toBe(false);
});
