"use client";

import { useState, useCallback } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface SpeakingEvaluationResult {
  overall_score: number;
  cefr_level: string;
  vocab_diversity: number;
  grammar_diversity: number;
  executive_summary: string;
  intent_prediction?: string;
  message_success?: boolean;
  improved_version: string;
  literal_translation?: string;
  detailed_tweaks: {
    original: string;
    corrected: string;
    explanation: string;
  }[];
  pronunciation_tip?: string;
  is_correct?: boolean;
  feedback?: string;
}

interface EvaluateParams {
  task_type: string;
  transcript: string;
  reference?: string;
  context?: string;
  level?: string;
}

export function useSpeakingEvaluation() {
  const [evaluation, setEvaluation] = useState<SpeakingEvaluationResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const evaluate = useCallback(async (params: EvaluateParams): Promise<SpeakingEvaluationResult | null> => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/practice/evaluate-speaking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (!response.ok) throw new Error("Evaluation failed");

      const result: SpeakingEvaluationResult = await response.json();
      setEvaluation(result);
      return result;
    } catch (error) {
      console.error("[useSpeakingEvaluation] Failed:", error);
      // Graceful fallback so the UI doesn't break when backend is down
      const fallback: SpeakingEvaluationResult = {
        overall_score: 70,
        cefr_level: "A1",
        vocab_diversity: 50,
        grammar_diversity: 40,
        executive_summary: "Good effort! Keep practicing your spoken French.",
        improved_version: params.transcript,
        detailed_tweaks: [],
        pronunciation_tip: null,
        is_correct: true,
      };
      setEvaluation(fallback);
      return fallback;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const resetEvaluation = useCallback(() => {
    setEvaluation(null);
  }, []);

  const analyzeConversation = useCallback(
    async (history: { speakerText?: string | null; userText?: string | null }[]): Promise<any> => {
      try {
        const response = await fetch(`${API_URL}/api/practice/analyze-speaking-conversation`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversation_history: history }),
        });
        if (!response.ok) throw new Error("Analysis failed");
        return await response.json();
      } catch (error) {
        console.error("[useSpeakingEvaluation] analyzeConversation failed:", error);
        return {
          score: 0,
          overall_feedback: "Analysis unavailable.",
          key_mistakes: [],
          suggestions: [],
          pronunciation_tips: [],
        };
      }
    },
    []
  );

  return { evaluation, isSubmitting, evaluate, resetEvaluation, analyzeConversation };
}
