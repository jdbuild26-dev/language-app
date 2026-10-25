/** Normalization at the Vocabulary CSV/API boundary. Index fields are one-based. */
export function frenchWordAnswer(value: unknown, fallback?: unknown): boolean {
  const parse = (candidate: unknown): boolean | undefined => {
    if (typeof candidate === "boolean") return candidate;
    if (candidate === 1 || candidate === 0) return candidate === 1;
    if (typeof candidate !== "string") return undefined;
    const text = candidate.trim().toLowerCase();
    if (["yes", "oui", "true", "1"].includes(text)) return true;
    if (["no", "non", "false", "0"].includes(text)) return false;
    return undefined;
  };
  return parse(value) ?? parse(fallback) ?? false;
}

export function splitAudioBlankSentence(sentence: string): string[] {
  return sentence.split(/_{3,}/);
}

export function multiSelectIndices(value: unknown, optionCount: number): number[] {
  let values: unknown = value;
  if (typeof values === "string") {
    const text = values.trim();
    if (text.startsWith("[")) {
      try { values = JSON.parse(text); } catch { return []; }
    } else values = text.split(/[|,]+/);
  }
  if (!Array.isArray(values)) values = values == null ? [] : [values];
  const indices = (values as unknown[]).flatMap(part => {
    if (typeof part !== "number" && typeof part !== "string") return [];
    if (typeof part === "string" && !/^\d+$/.test(part.trim())) return [];
    const number = Number(part);
    return Number.isInteger(number) && number >= 1 && number <= optionCount ? [number - 1] : [];
  });
  return [...new Set(indices)];
}
