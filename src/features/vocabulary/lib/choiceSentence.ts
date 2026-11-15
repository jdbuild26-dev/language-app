type Choice = { text: string; en?: string };

/** Move an inline English clue into its blank, or use the answer's stored translation. */
export function choiceSentence(question: string, answers: string[], options: Choice[]) {
  const parts: string[] = [];
  const hints: string[] = [];
  const blank = /_{2,}(?:\s*\(([^)]+)\))?/g;
  let previousEnd = 0;
  let match: RegExpExecArray | null;

  while ((match = blank.exec(question))) {
    parts.push(question.slice(previousEnd, match.index));
    const answer = answers[hints.length];
    hints.push(match[1]?.trim() || options.find((option) => option.text === answer)?.en?.trim() || "");
    previousEnd = blank.lastIndex;
  }

  parts.push(question.slice(previousEnd));
  return { parts, hints };
}
