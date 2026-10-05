"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ImageEvaluationRequestGate } from "../lib/writeImageInput";
import { requestTopicEvaluation, type TopicEvaluation, type TopicRequest } from "../lib/topicEvaluationRequest";

export type { TopicEvaluation, TopicSummary } from "../lib/topicEvaluationRequest";

export function useTopicEvaluation() {
  const gate = useRef(new ImageEvaluationRequestGate());
  const [evaluation, setEvaluation] = useState<TopicEvaluation | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const requests = gate.current;
    return () => requests.reset();
  }, []);

  const evaluate = useCallback(async (params: TopicRequest) => {
    const request = gate.current.begin();
    if (!request) return null;
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await requestTopicEvaluation(params, request.signal);
      if (!gate.current.isCurrent(request)) return null;
      setEvaluation(result);
      return result;
    } catch (cause) {
      if (!gate.current.isCurrent(request)) return null;
      setError(cause instanceof Error ? cause.message : "Topic feedback is unavailable. Please try again.");
      return null;
    } finally {
      if (gate.current.isCurrent(request)) setIsSubmitting(false);
      gate.current.finish(request);
    }
  }, []);
  const resetEvaluation = useCallback(() => {
    gate.current.reset();
    setEvaluation(null);
    setIsSubmitting(false);
    setError(null);
  }, []);
  return { evaluation, isSubmitting, error, evaluate, resetEvaluation };
}
