import { afterEach, beforeEach, expect, it, vi } from "vitest";
const harness = vi.hoisted(() => ({ effects: [] as (() => void | (() => void))[], cleanup: [] as (() => void)[] }));
vi.mock("react", () => ({ useState: (value: unknown) => [value, vi.fn()], useRef: (value: unknown) => ({ current: value }), useCallback: (value: unknown) => value, useEffect: (effect: () => void | (() => void)) => harness.effects.push(effect) }));
import { usePracticeRecording } from "./usePracticeRecording";
class Recorder {
  static current: Recorder;
  state = "inactive"; mimeType = "audio/webm";
  ondataavailable: ((event: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null; onerror: (() => void) | null = null;
  constructor() { Recorder.current = this; }
  start() { this.state = "recording"; }
  stop() { this.state = "inactive"; queueMicrotask(() => { this.ondataavailable?.({ data: new Blob(["recording"]) }); this.onstop?.(); }); }
}
const trackStop = vi.fn();
const getUserMedia = vi.fn();
const createURL = vi.fn(() => "blob:recording"); const revokeURL = vi.fn();
function RecordingHarness(limit = 2) {
  const onStop = vi.fn(); const hook = usePracticeRecording(limit, onStop);
  harness.effects.splice(0).forEach(effect => { const cleanup = effect(); if (cleanup) harness.cleanup.push(cleanup); });
  return { hook, onStop };
}
beforeEach(() => {
  vi.useFakeTimers(); vi.clearAllMocks();
  getUserMedia.mockResolvedValue({ getTracks: () => [{ stop: trackStop }] });
  vi.stubGlobal("navigator", { mediaDevices: { getUserMedia } }); vi.stubGlobal("MediaRecorder", Recorder);
  vi.stubGlobal("URL", { createObjectURL: createURL, revokeObjectURL: revokeURL });
});
afterEach(() => { harness.cleanup.splice(0).forEach(cleanup => cleanup()); vi.useRealTimers(); vi.unstubAllGlobals(); });
it("automatically stops at the limit, releases the microphone and creates replay audio", async () => {
  const { hook, onStop } = RecordingHarness(); await hook.start();
  await vi.advanceTimersByTimeAsync(2000);
  expect(Recorder.current.state).toBe("inactive"); expect(onStop).toHaveBeenCalledOnce();
  expect(trackStop).toHaveBeenCalledOnce(); expect(createURL).toHaveBeenCalledOnce();
});
it("waits for recorded audio before stop resolves and revokes it on Next/reset", async () => {
  const { hook } = RecordingHarness(); await hook.start(); await hook.stop();
  expect(createURL).toHaveBeenCalledOnce(); hook.reset(); expect(revokeURL).toHaveBeenCalledWith("blob:recording");
});
it("discards a recording on unmount without retaining replay audio", async () => {
  const { hook } = RecordingHarness(); await hook.start();
  harness.cleanup.splice(0).forEach(cleanup => cleanup()); await Promise.resolve();
  expect(trackStop).toHaveBeenCalledOnce(); expect(createURL).not.toHaveBeenCalled();
});
it("releases a delayed permission stream after reset instead of starting a recording", async () => {
  let resolve!: (value: unknown) => void;
  getUserMedia.mockReturnValue(new Promise(value => { resolve = value; }));
  const { hook } = RecordingHarness(); const start = hook.start(); hook.reset();
  resolve({ getTracks: () => [{ stop: trackStop }] }); await expect(start).resolves.toBe(false);
  expect(trackStop).toHaveBeenCalledOnce(); expect(createURL).not.toHaveBeenCalled();
});
it("handles denied microphone permission without creating audio", async () => {
  getUserMedia.mockRejectedValue(new DOMException("Denied", "NotAllowedError"));
  const { hook } = RecordingHarness(); await expect(hook.start()).resolves.toBe(false); expect(createURL).not.toHaveBeenCalled();
});


it("monitors the recording stream and closes monitoring on Stop", async () => {
  const disconnect = vi.fn(); const close = vi.fn().mockResolvedValue(undefined);
  const wave = vi.fn((data: Uint8Array) => data.fill(150));
  const frequency = vi.fn((data: Uint8Array) => data.fill(100));
  const analyser = { fftSize: 256, frequencyBinCount: 128, getByteTimeDomainData: wave, getByteFrequencyData: frequency, disconnect };
  const connect = vi.fn();
  class Context {
    createMediaStreamSource = vi.fn(() => ({ connect, disconnect }));
    createAnalyser = vi.fn(() => analyser);
    resume = vi.fn().mockResolvedValue(undefined); close = close;
  }
  vi.stubGlobal("AudioContext", Context);
  const { hook } = RecordingHarness(); await hook.start(); await vi.advanceTimersByTimeAsync(160);
  expect(wave).toHaveBeenCalled(); expect(frequency).toHaveBeenCalled();
  expect(connect).toHaveBeenCalledWith(analyser);
  await hook.stop(); expect(close).toHaveBeenCalledOnce(); expect(disconnect).toHaveBeenCalledTimes(2);
  wave.mockClear(); await vi.advanceTimersByTimeAsync(200); expect(wave).not.toHaveBeenCalled();
});
it("keeps recording usable when live audio monitoring is unsupported", async () => {
  class Context { constructor() { throw new Error("Unavailable"); } }
  vi.stubGlobal("AudioContext", Context);
  const { hook } = RecordingHarness(); await expect(hook.start()).resolves.toBe(true);
  await hook.stop(); expect(createURL).toHaveBeenCalledOnce();
});
