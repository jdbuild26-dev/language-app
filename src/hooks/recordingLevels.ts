/** Noise-gated microphone volume and five frequency bands, normalized to 0–1. */
export function recordingLevels(wave: Uint8Array, frequencies: Uint8Array) {
  const energy = wave.reduce((sum, value) => sum + ((value - 128) / 128) ** 2, 0);
  const volume = Math.min(1, Math.max(0, (Math.sqrt(energy / Math.max(1, wave.length)) - 0.015) * 5));
  const bands = [0, 1, 2, 3, 4].map(band => {
    const start = Math.floor(band * frequencies.length / 5);
    const end = Math.floor((band + 1) * frequencies.length / 5);
    let peak = 0;
    for (let i = start; i < end; i++) peak = Math.max(peak, frequencies[i]);
    return volume > 0 ? peak / 255 : 0;
  });
  return { volume, bands };
}
