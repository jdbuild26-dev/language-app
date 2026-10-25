export type ReadingFeedbackTone = "success" | "partial" | "error";

export function getReadingFeedbackTone(
  correctCount: number,
  totalCount: number,
): ReadingFeedbackTone {
  if (
    !Number.isInteger(correctCount) ||
    !Number.isInteger(totalCount) ||
    totalCount <= 0 ||
    correctCount < 0 ||
    correctCount > totalCount
  ) {
    return "error";
  }
  if (correctCount === totalCount) return "success";
  return correctCount > 0 && correctCount < totalCount ? "partial" : "error";
}
