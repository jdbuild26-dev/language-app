"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ImageEvaluationRequestGate } from "../lib/writeImageInput";
import type { WriteImageSegment } from "./useWriteImageEvaluation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const unavailable = "Document feedback is unavailable. Please try again.";

export const documentRatings = [
  ["task_completion_and_content_coverage", "Task Completion & Content Coverage"],
  ["relevant_detail_and_development", "Relevant Detail & Development"],
  ["clarity_and_coherence", "Clarity & Coherence"],
  ["grammar_control", "Grammar Control"],
  ["vocabulary_control", "Vocabulary Control"],
  ["written_range_and_expression", "Written Range & Expression"],
  ["document_appropriateness_and_structure", "Document Appropriateness & Structure"],
] as const;

type Suggestion = {
  original: string;
  explanation: string;
  alternatives: { text: string; translation: string }[];
};

export type WriteDocumentsEvaluation = {
  source_exercise_id: string;
  overall_score: number;
  cefr_level: string;
  overall_session_analysis: {
    summary: {
      task_and_objective_achievement: string;
      overall_writing_performance: string;
      what_the_learner_did_well: string;
      what_could_have_been_better: string;
      how_the_learner_can_improve: string[];
    };
    ratings: Record<(typeof documentRatings)[number][0], string | number>;
  };
  grammar_analysis: {
    overall_language_feedback: string;
    corrected_response_segments: WriteImageSegment[];
    correction_table: (Suggestion & { number: number; corrected: string })[];
    register_suggestions: Suggestion[];
  };
};

export function useWriteDocumentsEvaluation() {
  const gate = useRef(new ImageEvaluationRequestGate());
  useEffect(() => {
    const requests = gate.current;
    return () => requests.reset();
  }, []);

  const [evaluation, setEvaluation] = useState<WriteDocumentsEvaluation | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const evaluate = useCallback(async (exerciseId: string, learnerResponse: string) => {
    const request = gate.current.begin();
    if (!request) return null;

    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/practice/evaluate-write-documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exercise_id: exerciseId, learner_response: learnerResponse }),
        signal: request.signal,
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(typeof body?.detail === "string" ? body.detail : unavailable);
      }
      const result: WriteDocumentsEvaluation = await response.json();
      if (!gate.current.isCurrent(request)) return null;
      if (result.source_exercise_id.toLowerCase() !== exerciseId.toLowerCase()) {
        throw new Error("Feedback does not match this exercise. Please try again.");
      }
      setEvaluation(result);
      return result;
    } catch (cause) {
      if (gate.current.isCurrent(request)) setError(cause instanceof TypeError ? unavailable : cause instanceof Error ? cause.message : unavailable);
      return null;
    } finally {
      if (gate.current.isCurrent(request)) setIsSubmitting(false);
      gate.current.finish(request);
    }
  }, []);

  const resetEvaluation = useCallback(() => {
    gate.current.reset();
    setIsSubmitting(false);
    setEvaluation(null);
    setError(null);
  }, []);

  return { evaluation, error, isSubmitting, evaluate, resetEvaluation };
}
