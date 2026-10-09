/** Shared, predictable feedback for exercises using English labels. */
export function getCorrectMessage() {
  return "Correct";
}

export function getIncorrectMessage() {
  return "Incorrect";
}

export function getFeedbackMessage(isCorrect) {
  return isCorrect ? getCorrectMessage() : getIncorrectMessage();
}
