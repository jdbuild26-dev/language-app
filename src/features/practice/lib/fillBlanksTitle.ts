type Source = Record<string, unknown>;

/** Prefer the CSV passage title over older generic title fields. */
export function readFillBlanksPassageTitle(item: Source, content: Source, language: string): string {
  const code = language.toLowerCase();
  const localized = content.localized && typeof content.localized === "object"
    ? content.localized as Record<string, { title?: unknown }>
    : {};
  const values = [
    content[`Passage Title_${code.toUpperCase()}`],
    item[`Passage Title_${code.toUpperCase()}`],
    localized[code]?.title,
    content[`passage_title_${code}`],
    item[`passage_title_${code}`],
    content[`title_${code}`],
    item[`title_${code}`],
  ];
  return values.find(value => typeof value === "string" && value.trim()) as string || "";
}
