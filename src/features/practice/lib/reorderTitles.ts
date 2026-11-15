function text(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

export function readReorderTitles(item: Record<string, any>) {
  const content = item.content || item;
  const title = (lang: "fr" | "en") => {
    const suffix = lang.toUpperCase();
    return text(
      content.localized?.[lang]?.title, item.localized?.[lang]?.title,
      content[`passage_title_${lang}`], item[`passage_title_${lang}`],
      content[`title_${lang}`], item[`title_${lang}`],
      content[`Passage Title_${suffix}`], item[`Passage Title_${suffix}`],
      content[`Context Title_${suffix}`], item[`Context Title_${suffix}`],
    );
  };
  return {
    title_fr: title("fr"),
    title_en: title("en"),
    title: text(content.title, item.title, content.ContextTitle, item.ContextTitle),
  };
}
