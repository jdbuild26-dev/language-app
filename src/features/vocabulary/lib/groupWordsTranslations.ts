type Row = Record<string, unknown>;

export function parseGroupWords(value: unknown, preserveEmpty = false): string[] {
  if (Array.isArray(value)) return value.map(String).map((word) => word.trim()).filter((word) => preserveEmpty || Boolean(word));
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed)) return parseGroupWords(parsed, preserveEmpty);
  } catch {
    // Legacy rows can use delimited text instead of JSON arrays.
  }
  return value.split(/[|,]/).map((word) => word.trim()).filter((word) => preserveEmpty || Boolean(word));
}

function flatten(row: Row): Row {
  return { ...(row.content as Row || {}), ...row };
}

function sourceWords(row: Row, answer: boolean): string[] {
  return parseGroupWords(answer ? row.correctGroup ?? row.CorrectGroup ?? row.CorrectAnswer : row.otherWords ?? row.OtherWords ?? row.Options);
}

export function withGroupTranslations(rows: Row[], localRows: Row[], learningLang: string, knownLang: string): Row[] {
  const useLocal = learningLang.toLowerCase() === "fr" && knownLang.toLowerCase() === "en";
  return rows.map((original) => {
    const row = flatten(original);
    const signature = (item: Row) => JSON.stringify([sourceWords(item, true).slice().sort(), sourceWords(item, false).slice().sort()]);
    const local = useLocal ? localRows.find((candidate) => signature(candidate) === signature(row)) : undefined;
    const translations = (answer: boolean) => {
      const saved = parseGroupWords(answer ? row.correctGroup_EN ?? row.CorrectGroup_EN : row.otherWords_EN ?? row.OtherWords_EN, true);
      const localWords = local ? sourceWords(local, answer) : [];
      const localTranslations = local ? parseGroupWords(answer ? local.correctGroup_EN ?? local.CorrectGroup_EN : local.otherWords_EN ?? local.OtherWords_EN, true) : [];
      return sourceWords(row, answer).map((word, index) => saved[index]?.trim() || localTranslations[localWords.indexOf(word)] || "");
    };
    return { ...row, correctGroup_EN: translations(true), otherWords_EN: translations(false) };
  });
}

export async function loadGroupTranslationRows(): Promise<Row[]> {
  const response = await fetch("/mock-data/csv/group_words.csv");
  if (!response.ok) return [];
  const Papa = await import("papaparse");
  return Papa.parse(await response.text(), { header: true, skipEmptyLines: true }).data as Row[];
}
