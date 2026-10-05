/** Remove an AI-repeated section label while keeping the feedback body intact. */
export function stripReportHeading(text: string, headings: string[]): string {
  const escaped = headings.map(heading => heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const prefix = new RegExp(`^\\s*(?:#{1,6}\\s*)?(?:\\*\\*)?(?:${escaped.join("|")})(?:\\*\\*)?(?=\\s|[:—–-]|$)\\s*[:—–-]?\\s*(?:\\*\\*)?\\s*`, "i");
  return text.replace(prefix, "");
}
