type QuestionOptions = {
  options: string[];
  options_fr?: string[];
  options_en?: string[];
  correctIndex: number;
};

/** Shuffle by original index so translations, duplicate labels, and scoring stay paired. */
export function shuffleQuestionOptions<T extends QuestionOptions>(question: T, random = Math.random): T {
  const count = Math.max(question.options.length, question.options_fr?.length ?? 0, question.options_en?.length ?? 0);
  const order = Array.from({ length: count }, (_, index) => index);
  for (let index = count - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1));
    [order[index], order[other]] = [order[other], order[index]];
  }
  const reorder = (options: string[]) => options.length ? order.map(index => options[index] ?? "") : [];
  return {
    ...question,
    options: reorder(question.options),
    ...(question.options_fr ? { options_fr: reorder(question.options_fr) } : {}),
    ...(question.options_en ? { options_en: reorder(question.options_en) } : {}),
    correctIndex: order.indexOf(question.correctIndex),
  };
}
