import { getCorrectedPassageParts, type CorrectedPassagePart } from "./correctedPassage";

type WritingAnswer = { correct_fr: string; correct_en?: string };

/** Resolve completed words without depending on learner input or translated word order. */
export function getWritingCompletedPassage(
  passage: string,
  answers: Record<string, WritingAnswer>,
  language: "fr" | "en",
): CorrectedPassagePart[] | null {
  if (/\[\d+\]/.test(passage)) {
    return getCorrectedPassageParts(passage, Object.fromEntries(
      Object.entries(answers).map(([id, answer]) => [id, { ...answer, correct: answer.correct_fr }]),
    ), language);
  }

  // Plain translations have no IDs: require exact whole-word matches and unambiguous counts.
  const counts = new Map<string, number>();
  for (const answer of Object.values(answers)) {
    const word = (language === "fr" ? answer.correct_fr : answer.correct_en)?.trim();
    if (!word) continue;
    const key = word.toLocaleLowerCase();
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  const ranges: { start: number; end: number }[] = [];
  for (const [word, count] of counts) {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const matches = [...passage.matchAll(new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`, "giu"))];
    if (matches.length !== count) continue;
    ranges.push(...matches.map(match => ({ start: match.index!, end: match.index! + match[0].length })));
  }
  ranges.sort((a, b) => a.start - b.start);
  if (ranges.length === 0 && Object.keys(answers).length > 0) return null;
  const parts: CorrectedPassagePart[] = [];
  let position = 0;
  for (const range of ranges) {
    if (range.start < position) return null;
    if (range.start > position) parts.push({ text: passage.slice(position, range.start), answer: false });
    parts.push({ text: passage.slice(range.start, range.end), answer: true });
    position = range.end;
  }
  if (position < passage.length) parts.push({ text: passage.slice(position), answer: false });
  return parts;
}
