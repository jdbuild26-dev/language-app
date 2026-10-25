import { expect, it, vi } from "vitest";

vi.mock("react", () => ({
  useRef: () => ({ current: null }),
  useState: (initial: unknown) => [initial, vi.fn()],
  useEffect: () => {},
}));

import SpeakingRecordingControls from "./SpeakingRecordingControls";

function replayButton(audioUrl: string | null, isRecording = false, isStarting = false, disabled = false) {
  const tree = SpeakingRecordingControls({
    recording: { audioUrl, isRecording, isStarting, soundLevel: 0, frequencyBands: [0, 0, 0, 0, 0], remainingSeconds: 60, error: null } as any,
    startListening: vi.fn(),
    resetTranscript: vi.fn(),
    disabled,
  });
  return tree.props.children[0].props.children[1].props.children;
}

it("keeps recording replay inactive until captured audio is finalized", () => {
  const before = replayButton(null);
  expect(before.props.disabled).toBe(true);

  const during = replayButton(null, true);
  expect(during.props.disabled).toBe(true);

  const after = replayButton("blob:recording");
  expect(after.props.disabled).toBe(false);

  expect(replayButton("blob:recording", true).props.disabled).toBe(true);
  expect(replayButton("blob:recording", false, true).props.disabled).toBe(true);
  expect(replayButton("blob:recording", false, false, true).props.disabled).toBe(true);
});
