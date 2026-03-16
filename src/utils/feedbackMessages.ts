/**
 * Utility for generating varied feedback messages
 * Mimics Duolingo's encouraging and varied feedback system
 */

const correctMessages = [
  "Great job!",
  "Excellent!",
  "Perfect!",
  "Nice work!",
  "Well done!",
  "Fantastic!",
  "Amazing!",
  "You got it!",
  "Brilliant!",
  "Outstanding!",
];

const incorrectMessages = [
  "Incorrect",
  "Not quite",
  "Try again",
  "Almost there",
  "Keep trying",
  "Not this time",
];

/**
 * Get a random correct feedback message
 * @returns {string} A random positive feedback message
 */
export function getCorrectMessage() {
  return correctMessages[Math.floor(Math.random() * correctMessages.length)];
}

/**
 * Get a random incorrect feedback message
 * @returns {string} A random encouraging incorrect message
 */
export function getIncorrectMessage() {
  return incorrectMessages[
    Math.floor(Math.random() * incorrectMessages.length)
  ];
}

/**
 * Get feedback message based on correctness
 * @param {boolean} isCorrect - Whether the answer was correct
 * @returns {string} Appropriate feedback message
 */
export function getFeedbackMessage(isCorrect) {
  return isCorrect ? getCorrectMessage() : getIncorrectMessage();
}
