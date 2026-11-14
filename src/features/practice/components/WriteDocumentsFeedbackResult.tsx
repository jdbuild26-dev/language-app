"use client";

import EnhancedFeedbackView from "./EnhancedFeedbackView";
import { documentRatings, type WriteDocumentsEvaluation } from "../hooks/useWriteDocumentsEvaluation";

type Props = {
  evaluation: WriteDocumentsEvaluation;
  userText: string;
  samples: string[];
  sampleLanguage: "French" | "English";
  onContinue: () => void;
};

export default function WriteDocumentsFeedbackResult({ evaluation, userText, samples, sampleLanguage, onContinue }: Props) {
  const { summary, ratings } = evaluation.overall_session_analysis;
  const grammar = evaluation.grammar_analysis;

  return (
    <EnhancedFeedbackView
      isOpen
      onClose={onContinue}
      onContinue={onContinue}
      mode="writing"
      userText={userText}
      data={{
        report_kind: "write_documents",
        learning_language: sampleLanguage,
        overall_score: evaluation.overall_score,
        cefr_level: evaluation.cefr_level,
        vocab_diversity: 0,
        grammar_diversity: 0,
        executive_summary: summary.task_and_objective_achievement,
        improved_version: "",
        topic_session_summary: {
          task_objective_achievement: summary.task_and_objective_achievement,
          overall_performance: summary.overall_writing_performance,
          what_the_learner_did_well: summary.what_the_learner_did_well,
          what_could_have_been_better: summary.what_could_have_been_better,
          how_the_learner_can_improve: summary.how_the_learner_can_improve,
        },
        parameters: documentRatings.map(([key, name]) => {
          const rating = Number(ratings[key]);
          return { name, score: rating * 10, tooltip: `${rating} out of 10` };
        }),
        grammar_language_feedback: grammar.overall_language_feedback,
        corrected_response_segments: grammar.corrected_response_segments,
        document_grammar: grammar,
        sample_descriptions: samples,
      }}
    />
  );
}
