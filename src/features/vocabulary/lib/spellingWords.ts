export type SpellingWord = {
  id?: string;
  english: string;
  forms?: Array<{ word?: string; gender?: string }>;
  wrongSpelling?: string | null;
};

export type PreparedSpellingWord = SpellingWord & {
  forms: Array<{ word: string; gender?: string }>;
  wrongSpelling: string;
};

function makeMisspelling(answer: string, validAnswers: Set<string>): string {
  const letters = Array.from(answer);
  for (let index = letters.length - 2; index >= 0; index--) {
    if (letters[index] === letters[index + 1]) continue;
    const candidate = [...letters];
    [candidate[index], candidate[index + 1]] = [candidate[index + 1], candidate[index]];
    const typo = candidate.join("");
    if (!validAnswers.has(typo.toLocaleLowerCase())) return typo;
  }

  return `${answer}${letters.at(-1)}`;
}

/** Use authored mistakes when available; otherwise make a prompt from a real answer. */
export function prepareSpellingWords(words: SpellingWord[]): PreparedSpellingWord[] {
  return words.flatMap((word) => {
    const forms = word.forms?.filter((form): form is { word: string; gender?: string } =>
      typeof form.word === "string" && form.word.trim().length > 0,
    ) || [];
    if (forms.length === 0) return [];
    const answers = forms.map((form) => form.word.trim());

    const validAnswers = new Set(answers.map((answer) => answer.toLocaleLowerCase()));
    const supplied = typeof word.wrongSpelling === "string" ? word.wrongSpelling.trim() : "";
    const wrongSpelling = supplied && !validAnswers.has(supplied.toLocaleLowerCase())
      ? supplied
      : makeMisspelling(answers[0], validAnswers);

    return [{ ...word, forms, wrongSpelling }];
  });
}
