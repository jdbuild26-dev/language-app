import { expect, it } from "vitest";
import { recordingLevels } from "./recordingLevels";
it("keeps silence and microphone noise still", () => {
  expect(recordingLevels(new Uint8Array(256).fill(128), new Uint8Array(128).fill(80))).toEqual({ volume: 0, bands: [0, 0, 0, 0, 0] });
  expect(recordingLevels(new Uint8Array(256).fill(129), new Uint8Array(128).fill(80)).volume).toBe(0);
});
it("reacts more strongly to louder speech", () => {
  const quiet = recordingLevels(new Uint8Array(256).fill(136), new Uint8Array(128).fill(40));
  const loud = recordingLevels(new Uint8Array(256).fill(155), new Uint8Array(128).fill(200));
  expect(loud.volume).toBeGreaterThan(quiet.volume); expect(loud.bands[0]).toBeGreaterThan(quiet.bands[0]);
  expect(loud.volume).toBeLessThanOrEqual(1);
});
it("separates frequency activity into five bars", () => {
  const frequencies = new Uint8Array(100); frequencies[45] = 255;
  expect(recordingLevels(new Uint8Array(256).fill(155), frequencies).bands).toEqual([0, 0, 1, 0, 0]);
});
