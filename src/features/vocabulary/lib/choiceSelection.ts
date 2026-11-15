export function selectChoice<T extends { text: string }>(current: T[], option: T, answerCount: number): T[] {
  if (answerCount === 1) return [option];
  if (current.some((selected) => selected.text === option.text)) {
    return current.filter((selected) => selected.text !== option.text);
  }
  return current.length < answerCount ? [...current, option] : current;
}
