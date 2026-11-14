"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ImageEvaluationRequestGate } from "../lib/writeImageInput";
import type { WriteImageCorrection, WriteImageSegment } from "./useWriteImageEvaluation";

export const dataRatings = {
  task_completion_and_relevance: "Task Completion & Relevance",
  data_accuracy: "Data Accuracy",
  comparisons_and_trends: "Comparisons & Trends",
  interpretation_and_reasoning: "Interpretation & Reasoning",
  argument_and_justification: "Argument & Justification",
  relevant_detail_and_development: "Relevant Detail & Development",
  content_coherence: "Content Coherence",
} as const;

export type DataEvaluation = {
  source_exercise_id: string;
  cefr_level: string;
  overall_score: number;
  overall_session_analysis: {
    overall_content_assessment: string;
    what_the_learner_did_well: string[];
    data_inaccuracies: { learner_statement: string; issue: string; correct_interpretation: string }[];
    missing_or_underdeveloped_analysis: string;
    how_the_learner_can_improve: string[];
    ratings: Record<keyof typeof dataRatings, { score: string | number; justification: string }>;
  };
  grammar_analysis: {
    overall_language_feedback: string;
    corrected_response_segments: WriteImageSegment[];
    correction_table: WriteImageCorrection[];
    data_suggestions: Pick<WriteImageCorrection, "original" | "explanation" | "alternatives">[];
  };
};

const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const unavailable = "Data feedback is unavailable. Please try again.";

export function useWriteAnalysisEvaluation() {
  const gate = useRef(new ImageEvaluationRequestGate());
  const [evaluation, setEvaluation] = useState<DataEvaluation | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const requests = gate.current;
    return () => requests.reset();
  }, []);

  const evaluate = useCallback(async (exerciseId: string, learnerResponse: string) => {
    const request = gate.current.begin();
    if (!request) return null;
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`${api}/api/practice/evaluate-write-analysis`, {
        method: "POST", headers: { "Content-Type": "application/json" }, signal: request.signal,
        body: JSON.stringify({ exercise_id: exerciseId, learner_response: learnerResponse }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(typeof body?.detail === "string" ? body.detail : unavailable);
      }
      const result: DataEvaluation = await response.json();
      if (!gate.current.isCurrent(request)) return null;
      if (result.source_exercise_id?.toLowerCase() !== exerciseId.toLowerCase() ||
          !result.overall_session_analysis || !result.grammar_analysis || !Number.isFinite(result.overall_score)) {
        throw new Error(unavailable);
      }
      setEvaluation(result);
      return result;
    } catch (cause) {
      if (gate.current.isCurrent(request)) setError(cause instanceof Error && !(cause instanceof TypeError) ? cause.message : unavailable);
      return null;
    } finally {
      if (gate.current.isCurrent(request)) setIsSubmitting(false);
      gate.current.finish(request);
    }
  }, []);

  const reset = useCallback(() => {
    gate.current.reset();
    setEvaluation(null);
    setError(null);
    setIsSubmitting(false);
  }, []);

  return { evaluation, isSubmitting, error, evaluate, reset };
}
