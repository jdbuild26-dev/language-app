"use client";

import { useMemo } from "react";
import EnhancedFeedbackView, { type EnhancedAnalysisData } from "@/features/practice/components/EnhancedFeedbackView";
import type { WriteImageEvaluation } from "@/features/practice/hooks/useWriteImageEvaluation";
import { normalizeWriteImageSummary } from "./writeImageSummary";

type Props = {
  evaluation: WriteImageEvaluation & { report_type?: "speak_image"; learning_language?: string };
  mode?: "writing" | "speaking";
  userText: string;
  onContinue: () => void;
};

const ratingLabels: { key: keyof WriteImageEvaluation["overall_session_analysis"]["ratings"]; label: string }[] = [
  { key: "image_relevance", label: "Image relevance" },
  { key: "general_image_accuracy", label: "General image accuracy" },
  { key: "relevant_detail_and_development", label: "Relevant detail and development" },
  { key: "descriptive_effectiveness", label: "Descriptive effectiveness" },
  { key: "interpretation_and_inference", label: "Interpretation and inference" },
  { key: "content_coherence", label: "Content coherence" },
];

export default function WriteImageFeedbackResult({ evaluation, userText, onContinue, mode = "writing" }: Props) {
  const analysis: EnhancedAnalysisData = useMemo(() => ({
    report_kind: evaluation.report_type,
    learning_language: evaluation.learning_language,
    overall_score: evaluation.overall_score,
    cefr_level: evaluation.cefr_level,
    vocab_diversity: 0,
    grammar_diversity: 0,
    executive_summary: normalizeWriteImageSummary(evaluation.overall_session_analysis.summary).overall_description,
    improved_version: evaluation.improved_version,
    detailed_tweaks: evaluation.grammar_analysis.correction_table,
    overall_session_summary: normalizeWriteImageSummary(evaluation.overall_session_analysis.summary),
    grammar_language_feedback: evaluation.grammar_analysis.overall_language_feedback,
    corrected_response_segments: evaluation.grammar_analysis.corrected_response_segments,
    grammar_correction_table: evaluation.grammar_analysis.correction_table,
    overall_content_score: evaluation.overall_content_score,
    sample_descriptions: evaluation.sample_descriptions,
    parameters: ratingLabels.map(({ key, label }) => ({
      name: label,
      score: evaluation.overall_session_analysis.ratings[key] * 10,
      tooltip: `${evaluation.overall_session_analysis.ratings[key]} out of 10`,
    })),
  }), [evaluation]);

  return (
    <EnhancedFeedbackView
      isOpen
      onClose={onContinue}
      data={analysis}
      mode={mode}
      userText={userText}
      onContinue={onContinue}
    />
  );
}
