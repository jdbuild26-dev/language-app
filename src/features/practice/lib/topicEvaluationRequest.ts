import type { WriteImageCorrection, WriteImageSegment } from "../hooks/useWriteImageEvaluation";

export type TopicSummary = {
  task_objective_achievement: string;
  overall_performance: string;
  what_the_learner_did_well: string;
  what_could_have_been_better: string;
  how_the_learner_can_improve: string[];
};
export type TopicEvaluation = {
  report_type: "write_topic" | "speak_topic";
  overall_session_analysis: {
    summary: TopicSummary;
    ratings: Record<"task_completion_content_coverage" | "relevant_detail_development" | "clarity_coherence" |
      "grammar_control" | "vocabulary_control" | "range_expression", number>;
  };
  grammar_analysis: { overall_language_feedback: string; corrected_response_segments: WriteImageSegment[];
    correction_table: WriteImageCorrection[] };
  overall_score: number;
  cefr_level: string;
  learning_language: string;
  known_language: string;
  sample_answers: string[];
  improved_version: string;
  source_exercise_id: string;
  prompt_version: string;
};
export type TopicRequest = { mode: "write" | "speak"; exercise_id: string; learner_response: string };

export async function requestTopicEvaluation(params: TopicRequest, signal: AbortSignal): Promise<TopicEvaluation> {
  const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const speech = params.mode === "speak";
  const response = await fetch(`${api}/api/practice/evaluate-${speech ? "speaking" : "writing"}`, {
    method: "POST", headers: { "Content-Type": "application/json" }, signal,
    body: JSON.stringify({ task_type: "topic", exercise_id: params.exercise_id,
      [speech ? "transcript" : "user_text"]: params.learner_response }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error([404, 409, 422].includes(response.status) && typeof body?.detail === "string" ? body.detail :
      "Topic feedback is unavailable. Please try again.");
  }
  const result: TopicEvaluation = await response.json();
  if (result.source_exercise_id !== params.exercise_id || result.report_type !== `${params.mode}_topic`) {
    throw new Error("Feedback does not match this exercise. Please try again.");
  }
  if (!result.overall_session_analysis || !result.grammar_analysis || !Number.isFinite(result.overall_score)) {
    throw new Error("Topic feedback is incomplete. Please try again.");
  }
  return result;
}
