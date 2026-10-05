"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ImageEvaluationRequestGate } from "../lib/writeImageInput";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type WriteImageSummary = {
  overall_description: string;
  what_the_learner_did_well: string;
  what_was_missing_or_could_have_been_better: string;
  how_the_learner_can_improve: string[];
};

type ContentRatings = Record<
  | "image_relevance"
  | "general_image_accuracy"
  | "relevant_detail_and_development"
  | "descriptive_effectiveness"
  | "interpretation_and_inference"
  | "content_coherence",
  number
>;

export type WriteImageCorrection = {
  number: number;
  original: string;
  corrected: string;
  explanation: string;
};

export type WriteImageSegment =
  | { type: "unchanged"; text: string; number?: null; original?: null; corrected?: null }
  | { type: "correction"; number: number; original: string; corrected: string; text?: null };

export type WriteImageEvaluation = {
  overall_score: number;
  overall_content_score: number;
  cefr_level: string;
  sample_descriptions: string[];
  source_exercise_id: string;
  source_updated_at?: string | null;
  overall_session_analysis: { summary: WriteImageSummary; ratings: ContentRatings };
  grammar_analysis: {
    overall_language_feedback: string;
    corrected_response_segments: WriteImageSegment[];
    correction_table: WriteImageCorrection[];
  };
  summary: WriteImageSummary;
  ratings: ContentRatings;
  suggested_corrections: WriteImageCorrection[];
  improved_version: string;
};

type EvaluateParams = {
  exercise_id: string;
  learner_response: string;
};

export function useWriteImageEvaluation() {
  const gate = useRef(new ImageEvaluationRequestGate());
  useEffect(() => {
    const requests = gate.current;
    return () => requests.reset();
  }, []);
  const [evaluation, setEvaluation] = useState<WriteImageEvaluation | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const evaluate = useCallback(async (params: EvaluateParams) => {
    const request = gate.current.begin();
    if (!request) return null;
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/practice/evaluate-write-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
        signal: request.signal,
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(response.status === 422 && typeof body?.detail === "string"
          ? body.detail : "Image feedback is unavailable. Please try again.");
      }
      const result: WriteImageEvaluation = await response.json();
      if (!gate.current.isCurrent(request)) return null;
      if (result.source_exercise_id !== params.exercise_id) throw new Error("Feedback does not match this exercise. Please try again.");
      setEvaluation(result);
      return result;
    } catch (cause) {
      if (!gate.current.isCurrent(request)) return null;
      setError(cause instanceof Error ? cause.message : "Image feedback is unavailable. Please try again.");
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

  return { evaluation, isSubmitting, error, evaluate, resetEvaluation };
}
