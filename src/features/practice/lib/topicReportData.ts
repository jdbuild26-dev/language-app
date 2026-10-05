import type { EnhancedAnalysisData } from "../components/EnhancedFeedbackView";
import type { TopicEvaluation } from "../hooks/useTopicEvaluation";
import { stripReportHeading as stripHeading } from "./reportHeading";

const labels = {
  task_completion_content_coverage: "Task Completion & Content Coverage",
  relevant_detail_development: "Relevant Detail & Development",
  clarity_coherence: "Clarity & Coherence",
  grammar_control: "Grammar Control", vocabulary_control: "Vocabulary Control",
  range_expression: "Range & Expression",
};

export function topicReportData(evaluation: TopicEvaluation): EnhancedAnalysisData {
  const speech = evaluation.report_type === "speak_topic";
  const summary = evaluation.overall_session_analysis.summary;
  const cleanSummary = {
    ...summary,
    task_objective_achievement: stripHeading(summary.task_objective_achievement, ["Task & Objective Achievement"]),
    overall_performance: stripHeading(summary.overall_performance,
      ["Overall Writing/Speaking Performance", "Overall Writing Performance", "Overall Speaking Performance"]),
    what_the_learner_did_well: stripHeading(summary.what_the_learner_did_well, ["What the Learner Did Well"]),
    what_could_have_been_better: stripHeading(summary.what_could_have_been_better, ["What Could Have Been Better"]),
  };
  return {
    report_kind: evaluation.report_type, learning_language: evaluation.learning_language,
    overall_score: evaluation.overall_score, cefr_level: evaluation.cefr_level,
    vocab_diversity: 0, grammar_diversity: 0,
    executive_summary: cleanSummary.task_objective_achievement,
    improved_version: evaluation.improved_version,
    topic_session_summary: cleanSummary,
    grammar_language_feedback: evaluation.grammar_analysis.overall_language_feedback,
    corrected_response_segments: evaluation.grammar_analysis.corrected_response_segments,
    grammar_correction_table: evaluation.grammar_analysis.correction_table,
    sample_descriptions: evaluation.sample_answers,
    parameters: Object.entries(evaluation.overall_session_analysis.ratings).map(([key, value]) => ({
      name: key === "range_expression" ? `${speech ? "Spoken" : "Written"} Range & Expression` : labels[key as keyof typeof labels],
      score: value * 10, tooltip: `${value} out of 10`,
    })),
  };
}
