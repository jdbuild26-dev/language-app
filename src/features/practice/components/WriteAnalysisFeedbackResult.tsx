"use client";

import EnhancedFeedbackView from "./EnhancedFeedbackView";
import { dataRatings, type DataEvaluation } from "../hooks/useWriteAnalysisEvaluation";

export default function WriteAnalysisFeedbackResult({ evaluation, response, onContinue }: {
  evaluation: DataEvaluation;
  response: string;
  onContinue: () => void;
}) {
  const summary = evaluation.overall_session_analysis;
  const grammar = evaluation.grammar_analysis;

  return <EnhancedFeedbackView isOpen onClose={onContinue} onContinue={onContinue} mode="writing" userText={response}
    data={{
      report_kind: "write_analysis",
      overall_score: evaluation.overall_score,
      cefr_level: evaluation.cefr_level,
      vocab_diversity: 0,
      grammar_diversity: 0,
      executive_summary: summary.overall_content_assessment,
      improved_version: "",
      data_session_summary: summary,
      parameters: (Object.keys(dataRatings) as (keyof typeof dataRatings)[]).map(key => {
        const { score, justification } = summary.ratings[key];
        const value = Number(score);
        return { name: dataRatings[key], score: value * 10, tooltip: `${value} out of 10`, justification };
      }),
      grammar_language_feedback: grammar.overall_language_feedback,
      corrected_response_segments: grammar.corrected_response_segments,
      grammar_correction_table: grammar.correction_table,
      data_suggestions: grammar.data_suggestions,
    }}
  />;
}
