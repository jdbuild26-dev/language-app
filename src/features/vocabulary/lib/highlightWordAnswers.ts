export function normalizeHighlightWord(word: string): string {
  return word
    .replace(/[\u2018\u2019\u201A\u201B\u02BC\u02C8`]/g, "'")
    .replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "")
    .toLowerCase();
}

export function parseHighlightAnswers(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(parseHighlightAnswers);
  if (typeof value !== "string") return [];
  const text = value.trim();
  if (!text) return [];
  if (text.startsWith("[")) {
    try {
      return parseHighlightAnswers(JSON.parse(text));
    } catch {
      // Continue with delimited text when the JSON is malformed.
    }
  }
  const words = text.split(/[|,;\s]+/).map(normalizeHighlightWord).filter(Boolean);
  const statedCount = Number(words[0]);
  return Number.isInteger(statedCount) && statedCount > 0 && statedCount === words.length - 1
    ? words.slice(1)
    : words;
}

export function gradeHighlightSelection(words: string[], answers: string[], selected: ReadonlySet<number>) {
  const targets = new Set(answers);
  const correctIndices = new Set(words.flatMap((word, index) =>
    targets.has(normalizeHighlightWord(word)) ? [index] : [],
  ));
  const isCorrect = correctIndices.size > 0 && correctIndices.size === selected.size &&
    [...correctIndices].every((index) => selected.has(index));
  return { correctIndices, isCorrect };
}
