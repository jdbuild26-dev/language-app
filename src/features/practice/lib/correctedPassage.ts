type BlankAnswer = { correct: string; correct_fr?: string; correct_en?: string };
export type CorrectedPassagePart = { text: string; answer: boolean };

/** Match numbered blank markers by ID, independently of word order in translation. */
export function getCorrectedPassageParts(
  passage: string,
  answers: Record<string, BlankAnswer>,
  targetLang: string,
): CorrectedPassagePart[] | null {
  const parts: CorrectedPassagePart[] = [];
  const markers = /\[(\d+)\][ \t]*(?:_{2,}|-{2,})?/g;
  let position = 0;
  for (const match of passage.matchAll(markers)) {
    if (match.index! > position) parts.push({ text: passage.slice(position, match.index), answer: false });
    const entry = answers[match[1]];
    const translated = targetLang === "fr" ? entry?.correct_fr : entry?.correct_en;
    if (!translated?.trim()) return null;
    parts.push({ text: translated.trim(), answer: true });
    position = match.index! + match[0].length;
  }
  if (position < passage.length) parts.push({ text: passage.slice(position), answer: false });
  return parts;
}
