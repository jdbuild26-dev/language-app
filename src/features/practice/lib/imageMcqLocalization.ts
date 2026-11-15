export type ImageMcqLocale = {
  heading: string;
  question: string;
  options: string[];
};

type Source = Record<string, unknown>;

function text(...values: unknown[]): string {
  return values.find(value => typeof value === "string" && value.trim()) as string || "";
}

function options(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
  } catch { /* Older CSVs use pipe separated options. */ }
  return value.split("|").map(option => option.trim()).filter(Boolean);
}

function firstOptions(...values: unknown[]): string[] {
  for (const value of values) {
    const parsed = options(value);
    if (parsed.length) return parsed;
  }
  return [];
}

/** Accepts both locale keyed API content and language suffixed CSV columns. */
export function readImageMcqLocales(item: Source, content: Source): Record<string, ImageMcqLocale> {
  const supplied = content.localized && typeof content.localized === "object"
    ? content.localized as Record<string, Source>
    : {};
  const codes = new Set(Object.keys(supplied).map(code => code.toLowerCase()));
  for (const source of [item, content]) {
    for (const key of Object.keys(source)) {
      const match = key.match(/^(?:heading|instruction|question|options)_([a-z]{2,3})$/i);
      if (match) codes.add(match[1].toLowerCase());
    }
  }

  const locales: Record<string, ImageMcqLocale> = {};
  for (const code of codes) {
    const entry = supplied[code] || {};
    const suffix = code.toUpperCase();
    locales[code] = {
      heading: text(entry.heading, content[`heading_${code}`], item[`heading_${code}`], item[`Heading_${suffix}`], item[`instruction_${code}`], item[`Instruction_${suffix}`], item[`instruction${code[0].toUpperCase()}${code.slice(1)}`]),
      question: text(entry.question, content[`question_${code}`], item[`question_${code}`], item[`Question_${suffix}`]),
      options: firstOptions(entry.options, content[`options_${code}`], item[`options_${code}`]),
    };
  }
  return locales;
}
