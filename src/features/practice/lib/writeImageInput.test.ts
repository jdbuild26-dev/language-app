import { describe, expect, it } from "vitest";
import { ImageEvaluationRequestGate, imageSamples, imageCharacterLimit, insertImageAccent } from "./writeImageInput";

describe("image input limits", () => {
  it("skips blank and non-text samples while keeping saved text", () => {
    expect(imageSamples([" First ", "", null, 7, "Second", "Third"])).toEqual([" First ", "Second"]);
    expect(imageSamples(null)).toEqual([]);
  });
  it("bounds the exercise limit and rejects invalid configuration", () => {
    expect(imageCharacterLimit(6000)).toBe(5000);
    for (const value of [0, -1, 1.5, null, "20", NaN]) expect(imageCharacterLimit(value)).toBe(1000);
  });
  it("blocks accents at the limit but allows replacing selected text", () => {
    expect(insertImageAccent("abcd", 4, 4, "é", 4)).toBe("abcd");
    expect(insertImageAccent("abcd", 1, 2, "é", 4)).toBe("aécd");
    expect(insertImageAccent("abc", 3, 3, "é", 4)).toBe("abcé");
  });
});

describe("image feedback request lifecycle", () => {
  it("rejects a late result even if fetch ignores cancellation", async () => {
    const gate = new ImageEvaluationRequestGate();
    const old = gate.begin()!;
    let resolve!: () => void;
    const pending = new Promise<void>((done) => { resolve = done; });
    const result = pending.then(() => gate.isCurrent(old));
    gate.reset();
    const current = gate.begin()!;
    resolve();
    expect(await result).toBe(false);
    expect(old.signal.aborted).toBe(true);
    gate.finish(old);
    expect(gate.isCurrent(current)).toBe(true);
  });
  it("prevents duplicate submissions and releases completed requests", () => {
    const gate = new ImageEvaluationRequestGate();
    const request = gate.begin()!;
    expect(gate.begin()).toBeNull();
    gate.finish(request);
    expect(gate.begin()).not.toBeNull();
  });
});
