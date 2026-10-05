"use client";
import EnhancedFeedbackView from "./EnhancedFeedbackView";
import type { TopicEvaluation } from "../hooks/useTopicEvaluation";

import { topicReportData } from "../lib/topicReportData";

export default function TopicFeedbackResult({ evaluation, userText, onContinue }: {
  evaluation: TopicEvaluation; userText: string; onContinue: () => void;
}) {
  return <EnhancedFeedbackView isOpen onClose={onContinue} onContinue={onContinue} userText={userText}
    mode={evaluation.report_type === "speak_topic" ? "speaking" : "writing"} data={topicReportData(evaluation)} />;
}
