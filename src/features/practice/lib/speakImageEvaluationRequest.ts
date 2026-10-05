import type { WriteImageEvaluation } from "../hooks/useWriteImageEvaluation";

export type SpeakImageEvaluation = WriteImageEvaluation & {
  report_type: "speak_image";
  learning_language: string;
  known_language: string;
  prompt_version: string;
};
export type SpeakImageRequest = { exercise_id: string; transcript: string };

export async function requestSpeakImageEvaluation(params: SpeakImageRequest, signal: AbortSignal): Promise<SpeakImageEvaluation> {
  const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const response = await fetch(`${api}/api/practice/evaluate-speak-image`, {
    method: "POST", headers: { "Content-Type": "application/json" }, signal, body: JSON.stringify(params),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error([404, 409, 422].includes(response.status) && typeof body?.detail === "string"
      ? body.detail : "Image feedback is unavailable. Please try again.");
  }
  const result: SpeakImageEvaluation = await response.json();
  if (result.report_type !== "speak_image" || result.source_exercise_id !== params.exercise_id) {
    throw new Error("Feedback does not match this exercise. Please try again.");
  }
  if (!result.overall_session_analysis || !result.grammar_analysis || !Number.isFinite(result.overall_score)) {
    throw new Error("Image feedback is incomplete. Please try again.");
  }
  return result;
}
