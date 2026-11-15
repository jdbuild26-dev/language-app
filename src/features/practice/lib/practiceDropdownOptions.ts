/** Pick one correct answer and distinct alternatives from an exercise pool. */
export function buildPracticeDropdownOptions(
  correctAnswer: string,
  availableAnswers: string[],
  count = 5,
  random: () => number = Math.random,
): string[] {
  const correct = correctAnswer.trim();
  if (!correct) return [];

  const alternatives = [...new Set(availableAnswers.map(answer => answer.trim()))]
    .filter(answer => answer && answer !== correct);

  for (let index = alternatives.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1));
    [alternatives[index], alternatives[other]] = [alternatives[other], alternatives[index]];
  }

  const options = [correct, ...alternatives.slice(0, count - 1)];
  for (let index = options.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1));
    [options[index], options[other]] = [options[other], options[index]];
  }
  return options;
}
